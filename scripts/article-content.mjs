import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import matter from 'gray-matter'

const scriptsDir = dirname(fileURLToPath(import.meta.url))
export const repositoryRoot = resolve(scriptsDir, '..')
export const docsDirectory = join(repositoryRoot, 'docs')
export const blogDirectory = join(docsDirectory, 'blog')
export const docsConfigPath = join(docsDirectory, 'docs.json')

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function currentShanghaiDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date())
}

function stringValue(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function stringList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean)
  return typeof value === 'string'
    ? value.split(',').map((item) => item.trim()).filter(Boolean)
    : []
}

function dateValue(value) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return stringValue(value).slice(0, 10)
}

export function normalizeArticle(input = {}) {
  const status = input.status === 'published' ? 'published' : 'draft'
  return {
    slug: stringValue(input.slug).trim(),
    title: stringValue(input.title).trim(),
    description: stringValue(input.description).trim(),
    category: stringValue(input.category, '行业观察').trim(),
    tags: stringList(input.tags),
    cover: stringValue(input.cover).trim(),
    author: stringValue(input.author, '速芯算力').trim(),
    publishedAt: dateValue(input.publishedAt),
    updatedAt: dateValue(input.updatedAt),
    status,
    featured: input.featured === true,
    body: stringValue(input.body).trim(),
  }
}

function validateArticle(article) {
  if (!slugPattern.test(article.slug)) {
    throw new Error('Slug 只能包含小写字母、数字和连字符')
  }
  if (!article.title) throw new Error('文章标题不能为空')
  if (!article.description) throw new Error('文章摘要不能为空')
  if (!article.body) throw new Error('文章正文不能为空')
}

function articleFilePath(slug) {
  if (!slugPattern.test(slug)) throw new Error('无效的文章 Slug')
  return join(blogDirectory, `${slug}.mdx`)
}

function articleFrontmatter(article) {
  return {
    title: article.title,
    description: article.description,
    category: article.category,
    tags: article.tags,
    ...(article.cover ? { cover: article.cover } : {}),
    author: article.author,
    ...(article.publishedAt ? { publishedAt: article.publishedAt } : {}),
    ...(article.updatedAt ? { updatedAt: article.updatedAt } : {}),
    status: article.status,
    featured: article.featured,
    mode: 'center',
  }
}

export async function readArticle(slug) {
  const source = await readFile(articleFilePath(slug), 'utf8')
  const parsed = matter(source)
  return normalizeArticle({ slug, ...parsed.data, body: parsed.content })
}

export async function listArticles() {
  await mkdir(blogDirectory, { recursive: true })
  const entries = await readdir(blogDirectory, { withFileTypes: true })
  const articles = await Promise.all(
    entries
      .filter((entry) => entry.isFile() && entry.name.endsWith('.mdx'))
      .map((entry) => readArticle(entry.name.slice(0, -4))),
  )

  return articles.sort((left, right) => {
    const leftDate = left.publishedAt || left.updatedAt || ''
    const rightDate = right.publishedAt || right.updatedAt || ''
    return rightDate.localeCompare(leftDate) || left.title.localeCompare(right.title, 'zh-CN')
  })
}

export async function syncDocsNavigation(articles) {
  const config = JSON.parse(await readFile(docsConfigPath, 'utf8'))
  const pages = config.navigation?.pages
  if (!Array.isArray(pages)) throw new Error('docs.json 缺少 navigation.pages')

  const publishedPages = articles
    .filter((article) => article.status === 'published')
    .map((article) => `blog/${article.slug}`)
  const blogGroup = pages.find((item) => item && item.group === '博客文章')
  if (blogGroup) {
    blogGroup.pages = publishedPages
  } else {
    pages.push({ group: '博客文章', pages: publishedPages })
  }

  await writeFile(docsConfigPath, `${JSON.stringify(config, null, 2)}\n`, 'utf8')
}

export async function writeArticle(input, previousSlug = '') {
  const now = currentShanghaiDate()
  const article = normalizeArticle({
    ...input,
    publishedAt: input.status === 'published' ? input.publishedAt || now : input.publishedAt,
    updatedAt: now,
  })
  validateArticle(article)
  await mkdir(blogDirectory, { recursive: true })

  const source = matter.stringify(`${article.body}\n`, articleFrontmatter(article))
  await writeFile(articleFilePath(article.slug), source, 'utf8')

  if (previousSlug && previousSlug !== article.slug && slugPattern.test(previousSlug)) {
    await rm(articleFilePath(previousSlug), { force: true })
  }

  const articles = await listArticles()
  await syncDocsNavigation(articles)
  return { article, articles }
}

export async function deleteArticle(slug) {
  await rm(articleFilePath(slug), { force: true })
  const articles = await listArticles()
  await syncDocsNavigation(articles)
  return articles
}

export async function buildPublicArticleIndex() {
  const articles = await listArticles()
  return articles
    .filter((article) => article.status === 'published')
    .map(({ body: _body, status: _status, ...article }) => ({
      ...article,
      path: `blog/${article.slug}`,
    }))
}
