import { type ChangeEvent, useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  FileVideo,
  HardDrive,
  Image,
  LoaderCircle,
  RefreshCw,
  Upload,
  X,
} from 'lucide-react'

import {
  listSiteMedia,
  type SiteMediaItem,
  uploadSiteImage,
  uploadSiteVideo,
} from './supabase'

type MediaKind = 'image' | 'video'

function resolveMediaPreviewUrl(value: string) {
  if (!value || /^(https?:|data:|blob:)/i.test(value) || typeof window === 'undefined') return value

  const cleanPath = value.replace(/^\.?\//, '')
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `https://cnmbdb.github.io/js-web/${cleanPath}`
  }

  return new URL(`../${cleanPath}`, window.location.href).href
}

function formatFileSize(size: number) {
  if (!size) return '未知大小'
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`
  return `${(size / 1024 / 1024).toFixed(1)} MB`
}

function formatMediaSource(source: SiteMediaItem['source']) {
  if (source === 'cloudflare') return 'Cloudflare R2 原始视频'
  if (source === 'github') return 'GitHub Release'
  if (source === 'project') return '项目素材'
  return '已上传'
}

export function MediaPickerField({
  className = '',
  kind,
  label,
  onChange,
  value,
}: {
  className?: string
  kind: MediaKind
  label: string
  onChange: (value: string) => void
  value: string
}) {
  const inputId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'library' | 'upload'>('library')
  const [mediaItems, setMediaItems] = useState<Array<SiteMediaItem>>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [libraryError, setLibraryError] = useState('')
  const [refreshVersion, setRefreshVersion] = useState(0)

  useEffect(() => {
    if (!isOpen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !isUploading) setIsOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen, isUploading])

  useEffect(() => {
    if (!isOpen || activeTab !== 'library') return undefined

    let active = true
    setIsLoading(true)
    setLibraryError('')
    listSiteMedia(kind)
      .then((items) => {
        if (active) setMediaItems(items)
      })
      .catch((error: Error) => {
        if (active) setLibraryError(`素材库读取失败：${error.message}`)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [activeTab, isOpen, kind, refreshVersion])

  const uploadLocal = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)
    setLibraryError('')
    try {
      const publicUrl = kind === 'image'
        ? await uploadSiteImage(file)
        : await uploadSiteVideo(file, setUploadProgress)
      onChange(publicUrl)
      setIsOpen(false)
      setActiveTab('library')
      setRefreshVersion((current) => current + 1)
    } catch (error) {
      setLibraryError(error instanceof Error ? error.message : '上传失败')
    } finally {
      setIsUploading(false)
    }
  }

  const selectMedia = (item: SiteMediaItem) => {
    onChange(item.publicUrl)
    setIsOpen(false)
  }

  const preview = value ? (
    kind === 'image' ? (
      <img alt={`${label}预览`} src={resolveMediaPreviewUrl(value)} />
    ) : (
      <video aria-label={`${label}预览`} muted playsInline preload="metadata" src={resolveMediaPreviewUrl(value)} />
    )
  ) : kind === 'image' ? (
    <Image aria-hidden="true" size={22} />
  ) : (
    <FileVideo aria-hidden="true" size={22} />
  )

  const dialog = isOpen && typeof document !== 'undefined'
    ? createPortal(
        <div
          className="media-picker-backdrop"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target && !isUploading) setIsOpen(false)
          }}
        >
          <section
            aria-label={`选择${kind === 'image' ? '图片' : '视频'}`}
            aria-modal="true"
            className="media-picker-dialog"
            role="dialog"
          >
            <header className="media-picker-head">
              <div>
                <span>MEDIA LIBRARY</span>
                <h2>选择{kind === 'image' ? '图片' : '视频'}</h2>
              </div>
              <button
                aria-label="关闭媒体选择器"
                className="media-picker-close"
                disabled={isUploading}
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <X size={18} />
              </button>
            </header>

            <div aria-label="媒体来源" className="media-picker-tabs" role="tablist">
              <button
                aria-selected={activeTab === 'library'}
                className={activeTab === 'library' ? 'active' : ''}
                onClick={() => setActiveTab('library')}
                role="tab"
                type="button"
              >
                <HardDrive size={16} />
                已有素材库
              </button>
              <button
                aria-selected={activeTab === 'upload'}
                className={activeTab === 'upload' ? 'active' : ''}
                onClick={() => setActiveTab('upload')}
                role="tab"
                type="button"
              >
                <Upload size={16} />
                本地新上传
              </button>
            </div>

            {activeTab === 'library' ? (
              <div className="media-library-panel" role="tabpanel">
                <div className="media-library-toolbar">
                  <span>{kind === 'image' ? '图片素材' : '视频素材'} · {mediaItems.length}</span>
                  <button
                    aria-label="刷新素材库"
                    disabled={isLoading}
                    onClick={() => setRefreshVersion((current) => current + 1)}
                    type="button"
                  >
                    <RefreshCw className={isLoading ? 'spin' : ''} size={15} />
                  </button>
                </div>
                {isLoading ? (
                  <div className="media-picker-state">
                    <LoaderCircle className="spin" size={18} />
                    正在读取素材库
                  </div>
                ) : null}
                {!isLoading && mediaItems.length === 0 ? (
                  <div className="media-picker-state">素材库中还没有{kind === 'image' ? '图片' : '视频'}</div>
                ) : null}
                {!isLoading && mediaItems.length > 0 ? (
                  <div className="media-library-grid">
                    {mediaItems.map((item) => (
                      <button
                        className={item.publicUrl === value ? 'media-library-item selected' : 'media-library-item'}
                        key={item.id}
                        onClick={() => selectMedia(item)}
                        type="button"
                      >
                        <span className="media-library-preview">
                          {item.kind === 'image' ? (
                            <img alt="" src={resolveMediaPreviewUrl(item.publicUrl)} />
                          ) : (
                            <video
                              aria-label={item.name}
                              muted
                              playsInline
                              preload="metadata"
                              src={resolveMediaPreviewUrl(item.publicUrl)}
                            />
                          )}
                        </span>
                        <span className="media-library-meta">
                          <strong title={item.name}>{item.name}</strong>
                          <small>{formatMediaSource(item.source)} · {formatFileSize(item.size)}</small>
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="media-upload-panel" role="tabpanel">
                <div className="media-upload-illustration">
                  {kind === 'image' ? <Image size={30} /> : <FileVideo size={30} />}
                </div>
                <strong>从本地选择{kind === 'image' ? '图片' : '视频'}</strong>
                <p>
                  {kind === 'image'
                    ? '支持 JPEG、PNG、WebP、GIF、AVIF，最大 10MB'
                    : '支持 MP4、WebM、MOV、OGG，Supabase 免费版最大 50MB；大视频可从 GitHub Release 素材库选择'}
                </p>
                <label className={isUploading ? 'media-local-upload disabled' : 'media-local-upload'} htmlFor={inputId}>
                  {isUploading ? <LoaderCircle className="spin" size={16} /> : <Upload size={16} />}
                  {isUploading ? `上传中 ${uploadProgress}%` : '选择本地文件'}
                </label>
                <input
                  accept={kind === 'image'
                    ? 'image/jpeg,image/png,image/webp,image/gif,image/avif'
                    : 'video/mp4,video/webm,video/quicktime,video/ogg'}
                  className="image-file-input"
                  disabled={isUploading}
                  id={inputId}
                  onChange={uploadLocal}
                  type="file"
                />
              </div>
            )}

            {libraryError ? <p className="media-picker-error" role="alert">{libraryError}</p> : null}
          </section>
        </div>,
        document.body,
      )
    : null

  return (
    <div className={`image-upload-field ${className}`.trim()}>
      <span className="image-upload-label">{label}</span>
      <div className="image-upload-body">
        <div className={`image-preview${kind === 'video' ? ' video-preview' : ''}`}>
          {preview}
        </div>
        <div className="image-upload-controls">
          <button
            className="image-upload-button"
            onClick={() => {
              setActiveTab('library')
              setLibraryError('')
              setIsOpen(true)
            }}
            type="button"
          >
            <HardDrive size={16} />
            选择媒体
          </button>
          <label className="image-url-field">
            <span>{kind === 'image' ? '图片' : '视频'} URL / 项目路径</span>
            <input
              onChange={(event) => onChange(event.target.value)}
              placeholder="从素材库选择，也可粘贴 https://..."
              value={value}
            />
          </label>
        </div>
      </div>
      {dialog}
    </div>
  )
}
