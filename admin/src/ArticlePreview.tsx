import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

import type { Article } from './articles'

function formatDate(value: string) {
  if (!value) return '尚未发布'
  return new Date(`${value}T00:00:00`).toLocaleDateString('zh-CN')
}

export default function ArticlePreview({ article }: { article: Article }) {
  return (
    <div className="article-preview-pane">
      {article.cover ? <img className="article-preview-cover" alt="" src={article.cover} /> : null}
      <span className="article-preview-category">{article.category}</span>
      <h1>{article.title || '未命名文章'}</h1>
      <p className="article-preview-description">{article.description || '尚未填写文章摘要'}</p>
      <div className="article-preview-meta">{article.author} · {formatDate(article.publishedAt || article.updatedAt)}</div>
      <div className="article-markdown">
        <Markdown remarkPlugins={[remarkGfm]}>{article.body}</Markdown>
      </div>
      {article.status === 'published' && article.slug ? (
        <a className="article-local-link" href={`http://localhost:3000/blog/${article.slug}`} rel="noreferrer" target="_blank">
          打开 Mintlify 本地页面
        </a>
      ) : null}
    </div>
  )
}
