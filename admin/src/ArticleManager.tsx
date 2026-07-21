import { type ChangeEvent, lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  CalendarDays,
  Check,
  Eye,
  FilePlus2,
  ImagePlus,
  LoaderCircle,
  Save,
  Search,
  Send,
  Trash2,
} from 'lucide-react'

import {
  type Article,
  type ArticleStatus,
  createEmptyArticle,
  loadArticles,
  removeArticle,
  saveArticle,
} from './articles'
import { uploadSiteImage } from './supabase'

const categoryOptions = ['行业观察', '投资人业务', '项目案例', '算力硬件与托管', '绿电园区共建', '企业AIGC应用', '跨境算力出海', '项目进展']
const ArticlePreview = lazy(() => import('./ArticlePreview'))

function formatDate(value: string) {
  if (!value) return '尚未发布'
  return new Date(`${value}T00:00:00`).toLocaleDateString('zh-CN')
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function sanitizeSlugInput(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/g, '')
}

function normalizeSlug(value: string) {
  return sanitizeSlugInput(value).replace(/-+$/g, '')
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

export function ArticleManager({ userEmail }: { userEmail: string }) {
  const [articles, setArticles] = useState<Array<Article>>([])
  const [selectedSlug, setSelectedSlug] = useState('')
  const [draft, setDraft] = useState<Article>(() => createEmptyArticle(userEmail))
  const [searchValue, setSearchValue] = useState('')
  const [view, setView] = useState<'edit' | 'preview'>('edit')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let active = true
    loadArticles()
      .then((nextArticles) => {
        if (!active) return
        setArticles(nextArticles)
        const first = nextArticles[0]
        if (first) {
          setSelectedSlug(first.slug)
          setDraft(first)
        }
      })
      .catch((error: Error) => {
        if (active) setErrorMessage(`读取文章失败：${error.message}`)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filteredArticles = useMemo(() => {
    const keyword = searchValue.trim().toLocaleLowerCase('zh-CN')
    if (!keyword) return articles
    return articles.filter((article) =>
      [article.title, article.description, article.category, article.tags.join(' ')]
        .join(' ')
        .toLocaleLowerCase('zh-CN')
        .includes(keyword),
    )
  }, [articles, searchValue])

  const updateDraft = <Key extends keyof Article>(key: Key, value: Article[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }))
    setMessage('')
    setErrorMessage('')
  }

  const updateTitle = (title: string) => {
    setDraft((current) => {
      const currentAutomaticSlug = createArticleSlug(current.title)
      const shouldUpdateSlug = !selectedSlug && (!current.slug || normalizeSlug(current.slug) === currentAutomaticSlug)
      return {
        ...current,
        title,
        slug: shouldUpdateSlug ? createArticleSlug(title) : current.slug,
      }
    })
    setMessage('')
    setErrorMessage('')
  }

  const selectArticle = (article: Article) => {
    setSelectedSlug(article.slug)
    setDraft(article)
    setView('edit')
    setMessage('')
    setErrorMessage('')
  }

  const startNewArticle = () => {
    setSelectedSlug('')
    setDraft(createEmptyArticle(userEmail))
    setView('edit')
    setMessage('正在创建新文章')
    setErrorMessage('')
  }

  const persist = async (status: ArticleStatus) => {
    setMessage('')
    setErrorMessage('')
    if (!draft.title.trim() || !draft.description.trim() || !draft.body.trim()) {
      setErrorMessage('请先填写文章标题、摘要和正文')
      return
    }

    const resolvedSlug = normalizeSlug(draft.slug) || createArticleSlug(draft.title)
    if (!slugPattern.test(resolvedSlug)) {
      setErrorMessage('Slug 生成失败，请在编辑页填写英文字母、数字或连字符')
      setView('edit')
      return
    }

    const conflictingArticle = articles.find((article) => article.slug === resolvedSlug && article.slug !== selectedSlug)
    if (conflictingArticle) {
      setErrorMessage(`文章链接 /blog/${resolvedSlug} 已被「${conflictingArticle.title}」使用，请修改 Slug`)
      setView('edit')
      return
    }

    const nextDraft = { ...draft, slug: resolvedSlug }
    setDraft(nextDraft)
    setIsSaving(true)
    try {
      const result = await saveArticle({ ...nextDraft, status }, selectedSlug)
      setArticles(result.articles)
      if (result.article) {
        setDraft(result.article)
        setSelectedSlug(result.article.slug)
      }
      if (result.warning) setErrorMessage(result.warning)
      setMessage(
        status === 'published'
          ? '文章已发布，Mintlify 部署已触发。'
          : import.meta.env.DEV
            ? '草稿已保存到本地 MDX。'
            : '草稿已保存到内容数据库。',
      )
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '保存文章失败')
    } finally {
      setIsSaving(false)
    }
  }

  const deleteCurrent = async () => {
    const deletionEffect = import.meta.env.DEV
      ? '本地 MDX 文件会被移除。'
      : '已发布文章会同步从 GitHub 和 Mintlify 下线。'
    if (!selectedSlug || !window.confirm(`确定删除“${draft.title}”吗？${deletionEffect}`)) return
    setIsSaving(true)
    setMessage('')
    setErrorMessage('')
    try {
      const result = await removeArticle(selectedSlug)
      setArticles(result.articles)
      const next = result.articles[0]
      setSelectedSlug(next?.slug || '')
      setDraft(next || createEmptyArticle(userEmail))
      setMessage('文章已删除。')
      if (result.warning) setErrorMessage(result.warning)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '删除文章失败')
    } finally {
      setIsSaving(false)
    }
  }

  const uploadCover = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    setErrorMessage('')
    try {
      updateDraft('cover', await uploadSiteImage(file))
      setMessage('封面已上传，保存文章后生效。')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '封面上传失败')
    } finally {
      event.target.value = ''
      setIsUploading(false)
    }
  }

  return (
    <section className="article-studio" aria-label="博客文章管理">
      <aside className="article-library panel">
        <div className="article-library-head">
          <div>
            <span>BLOG LIBRARY</span>
            <h2>博客文章</h2>
          </div>
          <button className="article-new-button" onClick={startNewArticle} type="button">
            <FilePlus2 size={16} /> 新建
          </button>
        </div>

        <label className="article-search">
          <Search size={15} />
          <input onChange={(event) => setSearchValue(event.target.value)} placeholder="搜索标题、分类、标签" value={searchValue} />
        </label>

        <div className="article-list">
          {isLoading ? (
            <div className="article-empty"><LoaderCircle className="spin" size={18} /> 正在读取 MDX</div>
          ) : null}
          {!isLoading && filteredArticles.length === 0 ? (
            <div className="article-empty">没有匹配的文章</div>
          ) : null}
          {filteredArticles.map((article) => (
            <button
              className={selectedSlug === article.slug ? 'article-list-item active' : 'article-list-item'}
              key={article.slug}
              onClick={() => selectArticle(article)}
              type="button"
            >
              <span className={`article-state ${article.status}`}>{article.status === 'published' ? '已发布' : '草稿'}</span>
              <strong>{article.title}</strong>
              <small>{article.category} · {formatDate(article.publishedAt || article.updatedAt)}</small>
            </button>
          ))}
        </div>
      </aside>

      <article className="article-editor panel">
        <div className="article-editor-head">
          <div>
            <span>{selectedSlug ? `docs/blog/${selectedSlug}.mdx` : 'NEW ARTICLE'}</span>
            <h2>{draft.title || '新文章'}</h2>
          </div>
          <div className="article-editor-actions">
            <div className="article-view-toggle" aria-label="编辑器视图">
              <button className={view === 'edit' ? 'active' : ''} onClick={() => setView('edit')} type="button"><Save size={14} /> 编辑</button>
              <button className={view === 'preview' ? 'active' : ''} onClick={() => setView('preview')} type="button"><Eye size={14} /> 预览</button>
            </div>
            <button className="ghost-button" disabled={isSaving} onClick={() => void persist('draft')} type="button">
              {isSaving ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />} 保存草稿
            </button>
            <button className="primary-button" disabled={isSaving} onClick={() => void persist('published')} type="button">
              {isSaving ? <LoaderCircle className="spin" size={15} /> : <Send size={15} />} 发布文章
            </button>
          </div>
        </div>

        {message ? <p className="article-message" role="status"><Check size={15} /> {message}</p> : null}
        {errorMessage ? <p className="article-message error" role="alert">{errorMessage}</p> : null}

        {view === 'edit' ? (
          <div className="article-edit-form">
            <label className="article-field span-2">
              <span>文章标题</span>
              <input onChange={(event) => updateTitle(event.target.value)} placeholder="输入文章标题" value={draft.title} />
            </label>
            <label className="article-field">
              <span>Slug</span>
              <input
                onBlur={() => updateDraft('slug', normalizeSlug(draft.slug) || createArticleSlug(draft.title))}
                onChange={(event) => updateDraft('slug', sanitizeSlugInput(event.target.value))}
                placeholder="留空时根据文章标题自动生成"
                value={draft.slug}
              />
              <small>{draft.slug ? `文章链接：/blog/${normalizeSlug(draft.slug)}` : '留空也可以，发布时会自动生成'}</small>
            </label>
            <label className="article-field">
              <span>分类</span>
              <select onChange={(event) => updateDraft('category', event.target.value)} value={draft.category}>
                {categoryOptions.map((category) => <option key={category}>{category}</option>)}
              </select>
            </label>
            <label className="article-field span-2">
              <span>文章摘要</span>
              <textarea onChange={(event) => updateDraft('description', event.target.value)} placeholder="用于资讯卡片、搜索和 SEO" rows={3} value={draft.description} />
            </label>
            <label className="article-field">
              <span>标签</span>
              <input onChange={(event) => updateDraft('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} placeholder="绿色算力, GPU托管" value={draft.tags.join(', ')} />
            </label>
            <label className="article-field">
              <span>作者</span>
              <input onChange={(event) => updateDraft('author', event.target.value)} value={draft.author} />
            </label>
            <label className="article-field">
              <span>发布日期</span>
              <div className="article-date-field"><CalendarDays size={16} /><input onChange={(event) => updateDraft('publishedAt', event.target.value)} type="date" value={draft.publishedAt} /></div>
            </label>
            <label className="article-featured">
              <input checked={draft.featured} onChange={(event) => updateDraft('featured', event.target.checked)} type="checkbox" />
              <span><strong>设为头条文章</strong><small>官网资讯列表优先展示</small></span>
            </label>
            <div className="article-cover-field span-2">
              <div className="article-cover-preview">
                {draft.cover ? <img alt="文章封面预览" src={draft.cover} /> : <ImagePlus size={28} />}
              </div>
              <div>
                <label className="article-field">
                  <span>封面图片 URL</span>
                  <input onChange={(event) => updateDraft('cover', event.target.value)} placeholder="https://..." value={draft.cover} />
                </label>
                <label className={isUploading ? 'article-upload disabled' : 'article-upload'}>
                  {isUploading ? <LoaderCircle className="spin" size={15} /> : <ImagePlus size={15} />}
                  {isUploading ? '上传中' : '从本机上传封面'}
                  <input accept="image/*" disabled={isUploading} onChange={uploadCover} type="file" />
                </label>
              </div>
            </div>
            <label className="article-field article-body-field span-2">
              <span>正文（Markdown / MDX）</span>
              <textarea onChange={(event) => updateDraft('body', event.target.value)} spellCheck={false} value={draft.body} />
            </label>
          </div>
        ) : (
          <Suspense fallback={<div className="article-empty"><LoaderCircle className="spin" size={18} /> 正在加载预览</div>}>
            <ArticlePreview article={draft} />
          </Suspense>
        )}

        <div className="article-editor-foot">
          <span>
            {import.meta.env.DEV
              ? '本地模式会直接更新 docs/blog 下的 MDX 文件'
              : '草稿保存到 Supabase，发布后同步 GitHub 并触发 Mintlify 部署'}
          </span>
          <button className="article-delete-button" disabled={!selectedSlug || isSaving} onClick={() => void deleteCurrent()} type="button"><Trash2 size={15} /> 删除文章</button>
        </div>
      </article>
    </section>
  )
}
