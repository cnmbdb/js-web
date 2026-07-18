import { supabase } from './supabase'

export type ArticleStatus = 'draft' | 'published'

export type Article = {
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

type ArticleResponse = {
  article?: Article
  articles: Array<Article>
  error?: string
}

export function createEmptyArticle(author = '速芯算力'): Article {
  return {
    slug: '',
    title: '',
    description: '',
    category: '行业观察',
    tags: [],
    cover: '',
    author,
    publishedAt: '',
    updatedAt: '',
    status: 'draft',
    featured: false,
    body: '在这里开始撰写文章正文。\n\n## 小标题\n\n补充具体内容。',
  }
}

async function localRequest(body?: Record<string, unknown>) {
  const response = await fetch('/__local/articles', {
    method: body ? 'POST' : 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const result = await response.json() as ArticleResponse
  if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`)
  return result
}

async function remoteRequest(body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke<ArticleResponse>('article-content', { body })
  if (error) throw error
  if (!data) throw new Error('文章服务没有返回数据')
  if (data.error) throw new Error(data.error)
  return data
}

export async function loadArticles() {
  if (import.meta.env.DEV) return (await localRequest()).articles
  return (await remoteRequest({ action: 'list' })).articles
}

export async function saveArticle(article: Article, previousSlug: string) {
  const payload = { action: 'save', article, previousSlug }
  return import.meta.env.DEV ? localRequest(payload) : remoteRequest(payload)
}

export async function removeArticle(slug: string) {
  const payload = { action: 'delete', slug }
  return import.meta.env.DEV ? localRequest(payload) : remoteRequest(payload)
}
