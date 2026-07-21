import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

import { createClient } from 'npm:@supabase/supabase-js@2.110.3'
import { corsHeaders } from 'npm:@supabase/supabase-js@2.110.3/cors'
import matter from 'npm:gray-matter@4.0.3'

type ArticleStatus = 'draft' | 'published'

type Article = {
  slug: string
  title: string
  description: string
  category: string
  tags: Array<string>
  cover: string
  author: string
  publishedAt: string
  updatedAt: string
  status: ArticleStatus
  featured: boolean
  body: string
}

type DraftRow = {
  slug: string
  title: string
  description: string
  category: string
  tags: Array<string>
  cover_url: string
  author: string
  published_at: string | null
  updated_at: string
  status: 'draft' | 'published' | 'failed'
  featured: boolean
  body_mdx: string
}

type PublishStage =
  | 'auth'
  | 'database'
  | 'github-read'
  | 'github-write'
  | 'github-delete'
  | 'navigation'
  | 'response'
  | 'validation'

class GitHubApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GitHubApiError'
    this.status = status
  }
}

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function normalizeSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function shortTitleHash(value: string) {
  let hash = 2166136261
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(36).slice(0, 6)
}

function createArticleSlug(title: string) {
  const normalizedTitle = title.trim()
  if (!normalizedTitle) return ''
  const asciiSlug = normalizeSlug(normalizedTitle)
  if (/[^\x00-\x7F]/.test(normalizedTitle)) {
    return `${asciiSlug || 'article'}-${shortTitleHash(normalizedTitle)}`
  }
  return asciiSlug
}

function json(value: unknown, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: jsonHeaders })
}

function fromRow(row: DraftRow): Article {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    category: row.category,
    tags: row.tags || [],
    cover: row.cover_url,
    author: row.author,
    publishedAt: row.published_at || '',
    updatedAt: row.updated_at.slice(0, 10),
    status: row.status === 'published' ? 'published' : 'draft',
    featured: row.featured,
    body: row.body_mdx,
  }
}

function encodeBase64(value: string) {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) binary += String.fromCharCode(bytes[index])
  return btoa(binary)
}

function decodeBase64(value: string) {
  const binary = atob(value.replaceAll('\n', ''))
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

function githubSettings() {
  const token = Deno.env.get('GITHUB_TOKEN') || ''
  const owner = Deno.env.get('GITHUB_OWNER') || ''
  const repository = Deno.env.get('GITHUB_REPO') || ''
  const branch = Deno.env.get('GITHUB_BRANCH') || 'main'
  if (!token || !owner || !repository) {
    throw new Error('尚未配置 GITHUB_TOKEN、GITHUB_OWNER 和 GITHUB_REPO')
  }
  return { token, owner, repository, branch }
}

async function githubRequest(path: string, init: RequestInit = {}) {
  const settings = githubSettings()
  const response = await fetch(`https://api.github.com/repos/${settings.owner}/${settings.repository}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${settings.token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...init.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new GitHubApiError(response.status, data.message || `GitHub HTTP ${response.status}`)
  return data
}

function publicErrorMessage(error: unknown) {
  if (error instanceof GitHubApiError) {
    if (error.status === 401) {
      return 'GitHub 发布凭据已失效，请更新 Supabase Edge Function 的 GITHUB_TOKEN'
    }
    if (error.status === 403) {
      return 'GitHub 拒绝发布请求，请确认 Token 对 cnmbdb/js-web 拥有 Contents: Read and write 权限，且未触发 API 限流'
    }
    if (error.status === 404) {
      return 'GitHub Token 无法访问目标仓库，请确认 Fine-grained Token 已授权 cnmbdb/js-web'
    }
    if (error.status === 409) {
      return 'GitHub 分支刚刚发生变化，请重新点击发布文章'
    }
    return `GitHub 发布失败（HTTP ${error.status}）：${error.message}`
  }
  return error instanceof Error ? error.message : '文章服务执行失败'
}

async function readGithubFile(path: string) {
  const { branch } = githubSettings()
  try {
    const data = await githubRequest(`/contents/${path}?ref=${encodeURIComponent(branch)}`)
    return { content: decodeBase64(data.content), sha: String(data.sha) }
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null
    throw error
  }
}

type GithubFileChange = {
  path: string
  content?: string
  delete?: boolean
}

async function commitGithubFiles(changes: Array<GithubFileChange>, message: string) {
  const settings = githubSettings()
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const encodedBranch = settings.branch.split('/').map(encodeURIComponent).join('/')
    const reference = await githubRequest(`/git/ref/heads/${encodedBranch}`)
    const parentSha = String(reference.object?.sha || '')
    if (!parentSha) throw new Error('GitHub 分支没有可用的 HEAD 提交')
    const parentCommit = await githubRequest(`/git/commits/${parentSha}`)
    const treeEntries = []

    for (const change of changes) {
      if (change.delete) {
        treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: null })
        continue
      }
      const blob = await githubRequest('/git/blobs', {
        method: 'POST',
        body: JSON.stringify({ content: encodeBase64(change.content || ''), encoding: 'base64' }),
      })
      treeEntries.push({ path: change.path, mode: '100644', type: 'blob', sha: String(blob.sha) })
    }

    const tree = await githubRequest('/git/trees', {
      method: 'POST',
      body: JSON.stringify({ base_tree: parentCommit.tree?.sha, tree: treeEntries }),
    })
    const commit = await githubRequest('/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message, tree: tree.sha, parents: [parentSha] }),
    })

    try {
      await githubRequest(`/git/refs/heads/${encodedBranch}`, {
        method: 'PATCH',
        body: JSON.stringify({ sha: commit.sha, force: false }),
      })
      return { commit }
    } catch (error) {
      if (!(error instanceof GitHubApiError) || ![409, 422].includes(error.status) || attempt === 3) throw error
    }
  }
  throw new Error('GitHub 批量提交失败')
}

function serializeArticle(article: Article) {
  return matter.stringify(`${article.body.trim()}\n`, {
    title: article.title,
    description: article.description,
    category: article.category,
    tags: article.tags,
    ...(article.cover ? { cover: article.cover } : {}),
    author: article.author,
    publishedAt: article.publishedAt,
    updatedAt: article.updatedAt,
    status: 'published',
    featured: article.featured,
    mode: 'center',
  })
}

function currentShanghaiDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date())
}

async function renderGithubNavigation(
  client: ReturnType<typeof createClient>,
  options: {
    removeSlugs?: Array<string>
    upsert?: { slug: string; published_at: string | null; updated_at: string }
  } = {},
) {
  const { data, error } = await client
    .from('article_drafts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
  if (error) throw error

  const removed = new Set(options.removeSlugs || [])
  const rows = (data || []).filter((row) => !removed.has(row.slug))
  if (options.upsert) {
    const existingIndex = rows.findIndex((row) => row.slug === options.upsert?.slug)
    if (existingIndex >= 0) rows.splice(existingIndex, 1)
    rows.push(options.upsert)
  }
  rows.sort((left, right) => {
    const rightPublished = Date.parse(right.published_at || right.updated_at || '') || 0
    const leftPublished = Date.parse(left.published_at || left.updated_at || '') || 0
    if (rightPublished !== leftPublished) return rightPublished - leftPublished
    return (Date.parse(right.updated_at || '') || 0) - (Date.parse(left.updated_at || '') || 0)
  })

  const current = await readGithubFile('docs/docs.json')
  if (!current) throw new Error('GitHub 仓库中缺少 docs/docs.json')
  const config = JSON.parse(current.content)
  const pages = config.navigation?.pages
  if (!Array.isArray(pages)) throw new Error('docs.json 缺少 navigation.pages')
  const blogPages = rows.map((row) => `blog/${row.slug}`)
  const group = pages.find((item: { group?: string }) => item?.group === '博客文章')
  if (group) group.pages = blogPages
  else pages.push({ group: '博客文章', pages: blogPages })
  return `${JSON.stringify(config, null, 2)}\n`
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  let action = ''
  let articleSlug = ''
  let stage: PublishStage = 'auth'

  try {
    const authorization = request.headers.get('Authorization') || ''
    const token = authorization.replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: '请先登录后台' }, 401)

    const publishableKeys = JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS') || '{}')
    const publishableKey = publishableKeys.default || Deno.env.get('SUPABASE_ANON_KEY') || ''
    const client = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      publishableKey,
      { global: { headers: { Authorization: authorization } } },
    )
    const { data: userData, error: userError } = await client.auth.getUser(token)
    if (userError || !userData.user) return json({ error: '登录状态无效' }, 401)

    const { data: membership, error: membershipError } = await client
      .from('site_admins')
      .select('user_id')
      .eq('user_id', userData.user.id)
      .maybeSingle()
    if (membershipError) throw membershipError
    if (!membership) return json({ error: '当前账号没有文章管理权限' }, 403)

    const body = await request.json()
    action = String(body.action || '')
    if (body.action === 'list') {
      stage = 'database'
      const { data, error } = await client.from('article_drafts').select('*').order('updated_at', { ascending: false })
      if (error) throw error
      return json({ articles: (data || []).map((row) => fromRow(row as DraftRow)) })
    }

    if (body.action === 'save') {
      stage = 'validation'
      const article = body.article as Article
      const previousSlug = String(body.previousSlug || '')
      if (!article) throw new Error('文章内容不完整')
      if (!article.title?.trim() || !article.description?.trim() || !article.body?.trim()) {
        throw new Error('标题、摘要和正文不能为空')
      }

      const resolvedSlug = normalizeSlug(article.slug || '') || createArticleSlug(article.title)
      articleSlug = resolvedSlug
      if (!slugPattern.test(resolvedSlug)) throw new Error('Slug 生成失败，请使用英文字母、数字和连字符')

      const today = currentShanghaiDate()
      const nextArticle: Article = {
        ...article,
        slug: resolvedSlug,
        status: article.status === 'published' ? 'published' : 'draft',
        publishedAt: article.status === 'published' ? article.publishedAt || today : article.publishedAt,
        updatedAt: today,
      }

      const previousArticleSlug = previousSlug || nextArticle.slug
      stage = 'database'
      const { data: previousArticle, error: previousArticleError } = await client
        .from('article_drafts')
        .select('status')
        .eq('slug', previousArticleSlug)
        .maybeSingle()
      if (previousArticleError) throw previousArticleError
      if (!previousSlug && previousArticle) {
        throw new Error(`Slug ${nextArticle.slug} 已被其他文章使用`)
      }
      if (previousSlug && previousSlug !== nextArticle.slug) {
        const { data: conflictingArticle, error: conflictingArticleError } = await client
          .from('article_drafts')
          .select('slug')
          .eq('slug', nextArticle.slug)
          .maybeSingle()
        if (conflictingArticleError) throw conflictingArticleError
        if (conflictingArticle) throw new Error(`Slug ${nextArticle.slug} 已被其他文章使用`)
      }

      let commitSha: string | null = null
      if (nextArticle.status === 'published' || previousArticle?.status === 'published') {
        stage = 'navigation'
        const updatedAt = new Date().toISOString()
        const navigationContent = await renderGithubNavigation(client, {
          removeSlugs: [previousArticleSlug, nextArticle.slug],
          ...(nextArticle.status === 'published'
            ? {
                upsert: {
                  slug: nextArticle.slug,
                  published_at: nextArticle.publishedAt || null,
                  updated_at: updatedAt,
                },
              }
            : {}),
        })
        const changes: Array<GithubFileChange> = []
        if (nextArticle.status === 'published') {
          changes.push({ path: `docs/blog/${nextArticle.slug}.mdx`, content: serializeArticle(nextArticle) })
        }
        if (
          previousArticle?.status === 'published'
          && (nextArticle.status !== 'published' || previousArticleSlug !== nextArticle.slug)
        ) {
          changes.push({ path: `docs/blog/${previousArticleSlug}.mdx`, delete: true })
        }
        changes.push({ path: 'docs/docs.json', content: navigationContent })

        stage = nextArticle.status === 'published' ? 'github-write' : 'github-delete'
        const result = await commitGithubFiles(
          changes,
          `${nextArticle.status === 'published' ? 'Publish' : 'Unpublish'} article: ${nextArticle.title}`,
        )
        commitSha = result.commit?.sha || null
      }

      stage = 'database'
      const { error } = await client.from('article_drafts').upsert({
        slug: nextArticle.slug,
        title: nextArticle.title,
        description: nextArticle.description,
        category: nextArticle.category,
        tags: nextArticle.tags,
        cover_url: nextArticle.cover,
        author: nextArticle.author,
        body_mdx: nextArticle.body,
        status: nextArticle.status,
        featured: nextArticle.featured,
        published_at: nextArticle.publishedAt || null,
        updated_at: new Date().toISOString(),
        updated_by: userData.user.id,
        published_commit_sha: commitSha,
        last_error: null,
      }, { onConflict: 'slug' })
      if (error) throw error

      if (previousSlug && previousSlug !== nextArticle.slug) {
        await client.from('article_drafts').delete().eq('slug', previousSlug)
      }

      stage = 'response'
      const { data: rows, error: listError } = await client.from('article_drafts').select('*').order('updated_at', { ascending: false })
      if (listError) throw listError
      return json({ article: nextArticle, articles: (rows || []).map((row) => fromRow(row as DraftRow)) })
    }

    if (body.action === 'delete') {
      stage = 'validation'
      const slug = String(body.slug || '')
      articleSlug = slug
      if (!slugPattern.test(slug)) throw new Error('Slug 格式不正确')
      stage = 'database'
      const { data: current, error: currentError } = await client.from('article_drafts').select('status').eq('slug', slug).maybeSingle()
      if (currentError) throw currentError
      if (current?.status === 'published') {
        stage = 'navigation'
        const navigationContent = await renderGithubNavigation(client, { removeSlugs: [slug] })
        stage = 'github-delete'
        await commitGithubFiles([
          { path: `docs/blog/${slug}.mdx`, delete: true },
          { path: 'docs/docs.json', content: navigationContent },
        ], `Delete article: ${slug}`)
      }
      stage = 'database'
      const { error } = await client.from('article_drafts').delete().eq('slug', slug)
      if (error) throw error
      stage = 'response'
      const { data: rows, error: listError } = await client.from('article_drafts').select('*').order('updated_at', { ascending: false })
      if (listError) throw listError
      return json({ articles: (rows || []).map((row) => fromRow(row as DraftRow)) })
    }

    return json({ error: '未知的文章操作' }, 400)
  } catch (error) {
    const message = publicErrorMessage(error)
    console.error(JSON.stringify({
      event: 'article-content-error',
      action,
      slug: articleSlug,
      stage,
      message,
    }))
    return json({ error: message, stage }, 400)
  }
})
