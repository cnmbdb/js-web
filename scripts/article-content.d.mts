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

export const repositoryRoot: string
export const docsDirectory: string
export const blogDirectory: string
export const docsConfigPath: string

export function normalizeArticle(input?: Partial<Article>): Article
export function readArticle(slug: string): Promise<Article>
export function listArticles(): Promise<Array<Article>>
export function syncDocsNavigation(articles: Array<Article>): Promise<void>
export function writeArticle(input: Partial<Article>, previousSlug?: string): Promise<{
  article: Article
  articles: Array<Article>
}>
export function deleteArticle(slug: string): Promise<Array<Article>>
export function buildPublicArticleIndex(): Promise<Array<Omit<Article, 'body' | 'status'> & { path: string }>>
