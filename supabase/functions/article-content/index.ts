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

const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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
  if (!response.ok) throw new Error(data.message || `GitHub HTTP ${response.status}`)
  return data
}

async function readGithubFile(path: string) {
  const { branch } = githubSettings()
  try {
    const data = await githubRequest(`/contents/${path}?ref=${encodeURIComponent(branch)}`)
    return { content: decodeBase64(data.content), sha: String(data.sha) }
  } catch (error) {
    if (error instanceof Error && error.message === 'Not Found') return null
    throw error
  }
}

async function writeGithubFile(path: string, content: string, message: string) {
  const settings = githubSettings()
  const current = await readGithubFile(path)
  return githubRequest(`/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: encodeBase64(content),
      branch: settings.branch,
      ...(current?.sha ? { sha: current.sha } : {}),
    }),
  })
}

async function deleteGithubFile(path: string, message: string) {
  const settings = githubSettings()
  const current = await readGithubFile(path)
  if (!current) return
  await githubRequest(`/contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha: current.sha, branch: settings.branch }),
  })
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

async function syncGithubNavigation(client: ReturnType<typeof createClient>) {
  const { data, error } = await client
    .from('article_drafts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('updated_at', { ascending: false })
  if (error) throw error

  const current = await readGithubFile('docs/docs.json')
  if (!current) throw new Error('GitHub 仓库中缺少 docs/docs.json')
  const config = JSON.parse(current.content)
  const pages = config.navigation?.pages
  if (!Array.isArray(pages)) throw new Error('docs.json 缺少 navigation.pages')
  const blogPages = (data || []).map((row) => `blog/${row.slug}`)
  const group = pages.find((item: { group?: string }) => item?.group === '博客文章')
  if (group) group.pages = blogPages
  else pages.push({ group: '博客文章', pages: blogPages })
  await writeGithubFile('docs/docs.json', `${JSON.stringify(config, null, 2)}\n`, 'Update Mintlify article navigation')
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

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
    if (body.action === 'list') {
      const { data, error } = await client.from('article_drafts').select('*').order('updated_at', { ascending: false })
      if (error) throw error
      return json({ articles: (data || []).map((row) => fromRow(row as DraftRow)) })
    }

    if (body.action === 'save') {
      const article = body.article as Article
      const previousSlug = String(body.previousSlug || '')
      if (!article || !slugPattern.test(article.slug)) throw new Error('Slug 格式不正确')
      if (!article.title?.trim() || !article.description?.trim() || !article.body?.trim()) {
        throw new Error('标题、摘要和正文不能为空')
      }

      const today = currentShanghaiDate()
      const nextArticle: Article = {
        ...article,
        status: article.status === 'published' ? 'published' : 'draft',
        publishedAt: article.status === 'published' ? article.publishedAt || today : article.publishedAt,
        updatedAt: today,
      }

      const previousArticleSlug = previousSlug || nextArticle.slug
      const { data: previousArticle, error: previousArticleError } = await client
        .from('article_drafts')
        .select('status')
        .eq('slug', previousArticleSlug)
        .maybeSingle()
      if (previousArticleError) throw previousArticleError

      let commitSha: string | null = null
      if (nextArticle.status === 'published') {
        const result = await writeGithubFile(
          `docs/blog/${nextArticle.slug}.mdx`,
          serializeArticle(nextArticle),
          `Publish article: ${nextArticle.title}`,
        )
        commitSha = result.commit?.sha || null
        if (previousSlug && previousSlug !== nextArticle.slug && slugPattern.test(previousSlug)) {
          await deleteGithubFile(`docs/blog/${previousSlug}.mdx`, `Rename article: ${previousSlug} to ${nextArticle.slug}`)
        }
      } else if (previousArticle?.status === 'published') {
        await deleteGithubFile(`docs/blog/${previousArticleSlug}.mdx`, `Unpublish article: ${previousArticleSlug}`)
      }

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
      if (nextArticle.status === 'published' || previousArticle?.status === 'published') {
        await syncGithubNavigation(client)
      }

      const { data: rows, error: listError } = await client.from('article_drafts').select('*').order('updated_at', { ascending: false })
      if (listError) throw listError
      return json({ article: nextArticle, articles: (rows || []).map((row) => fromRow(row as DraftRow)) })
    }

    if (body.action === 'delete') {
      const slug = String(body.slug || '')
      if (!slugPattern.test(slug)) throw new Error('Slug 格式不正确')
      const { data: current, error: currentError } = await client.from('article_drafts').select('status').eq('slug', slug).maybeSingle()
      if (currentError) throw currentError
      if (current?.status === 'published') await deleteGithubFile(`docs/blog/${slug}.mdx`, `Delete article: ${slug}`)
      const { error } = await client.from('article_drafts').delete().eq('slug', slug)
      if (error) throw error
      if (current?.status === 'published') await syncGithubNavigation(client)
      const { data: rows, error: listError } = await client.from('article_drafts').select('*').order('updated_at', { ascending: false })
      if (listError) throw listError
      return json({ articles: (rows || []).map((row) => fromRow(row as DraftRow)) })
    }

    return json({ error: '未知的文章操作' }, 400)
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : '文章服务执行失败' }, 400)
  }
})
