import {
  FunctionsFetchError,
  FunctionsHttpError,
  FunctionsRelayError,
} from '@supabase/supabase-js'

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
  stage?: string
}

const stageLabels: Record<string, string> = {
  auth: '登录校验',
  database: '内容数据库',
  'github-read': '读取 GitHub 仓库',
  'github-write': '写入 GitHub 文章',
  'github-delete': '删除 GitHub 旧文章',
  navigation: '更新 Mintlify 导航',
  response: '读取发布结果',
  validation: '文章校验',
}

function articleServiceMessage(payload: Partial<ArticleResponse>) {
  const message = payload.error || '文章服务执行失败'
  const stage = payload.stage ? stageLabels[payload.stage] || payload.stage : ''
  return stage ? `${message}（失败阶段：${stage}）` : message
}

async function functionErrorMessage(error: unknown) {
  if (error instanceof FunctionsHttpError) {
    try {
      const payload = await error.context.json() as Partial<ArticleResponse>
      return articleServiceMessage(payload)
    } catch {
      return `文章服务返回 HTTP ${error.context.status}，但响应内容无法解析`
    }
  }
  if (error instanceof FunctionsRelayError) return `文章发布网关异常：${error.message}`
  if (error instanceof FunctionsFetchError) return `无法连接文章发布服务：${error.message}`
  return error instanceof Error ? error.message : '文章服务执行失败'
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
  if (error) throw new Error(await functionErrorMessage(error))
  if (!data) throw new Error('文章服务没有返回数据')
  if (data.error) throw new Error(articleServiceMessage(data))
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
