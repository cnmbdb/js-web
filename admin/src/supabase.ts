import { createClient } from '@supabase/supabase-js'
import * as tus from 'tus-js-client'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyfgzgcqeasfcfgkzsyd.supabase.co'
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yoLWgA8eBMu6mjVgXfbP1g_VZW8PveY'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

export type SiteMediaItem = {
  id: string
  name: string
  path: string
  publicUrl: string
  kind: 'image' | 'video'
  createdAt: string
  size: number
  source: 'github' | 'project' | 'storage'
}

const imageExtensions = /\.(avif|gif|jpe?g|png|webp)$/i
const videoExtensions = /\.(mov|mp4|ogg|ogv|webm)$/i

const projectMediaFiles = [
  { name: '1496.MP4', kind: 'video', size: 26695252 },
  { name: 'case-1.png', kind: 'image', size: 170862 },
  { name: 'case-2.png', kind: 'image', size: 164360 },
  { name: 'case-3.png', kind: 'image', size: 156751 },
  { name: 'case-4.png', kind: 'image', size: 141424 },
  { name: 'case-5.png', kind: 'image', size: 167542 },
  { name: 'case-6.png', kind: 'image', size: 151145 },
  { name: 'case-7.png', kind: 'image', size: 158608 },
  { name: 'case-8.png', kind: 'image', size: 167015 },
  { name: 'certificates.png', kind: 'image', size: 243011 },
  { name: 'dashboard-panel.png', kind: 'image', size: 226783 },
  { name: 'factory-aerial.png', kind: 'image', size: 1652984 },
  { name: 'green-streaks.png', kind: 'image', size: 337400 },
  { name: 'grid-floor.png', kind: 'image', size: 661724 },
  { name: 'hero-chip.png', kind: 'image', size: 627353 },
  { name: 'logo-nav.png', kind: 'image', size: 18602 },
  { name: 'logo-suxin.png', kind: 'image', size: 19905 },
  { name: 'server-room.png', kind: 'image', size: 195630 },
  { name: 'team-portraits.png', kind: 'image', size: 85757 },
] satisfies Array<{ name: string; kind: 'image' | 'video'; size: number }>

const projectMediaItems = projectMediaFiles.map<SiteMediaItem>((file) => {
  const path = `assets/materials/${file.name}`
  return {
    id: `project:${path}`,
    name: file.name,
    path,
    publicUrl: path,
    kind: file.kind,
    createdAt: '',
    size: file.size,
    source: 'project',
  }
})

const githubReleaseMediaItems = [
  {
    id: 'github:media-assets/suxin-home-hero-640-20260727.mp4',
    name: 'suxin-home-hero-640-20260727.mp4',
    path: 'media-assets/suxin-home-hero-640-20260727.mp4',
    publicUrl: 'https://github.com/cnmbdb/js-web/releases/download/media-assets/suxin-home-hero-640-20260727.mp4',
    kind: 'video',
    createdAt: '2026-07-26T16:24:00Z',
    size: 14601607,
    source: 'github',
  },
] satisfies SiteMediaItem[]

export async function listSiteMedia(kind: 'image' | 'video') {
  const folders = ['content', 'content/videos']
  const folderResults = await Promise.all(
    folders.map(async (folder) => {
      const { data, error } = await supabase.storage
        .from('site-media')
        .list(folder, {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        })
      if (error) throw error
      return data.map((item) => ({ folder, item }))
    }),
  )

  const storageItems = folderResults
    .flat()
    .filter(({ item }) => item.id)
    .map(({ folder, item }): SiteMediaItem | null => {
      const mimeType = String(item.metadata?.mimetype || '')
      const isVideo = mimeType.startsWith('video/') || videoExtensions.test(item.name)
      const isImage = mimeType.startsWith('image/') || imageExtensions.test(item.name)
      if (!isVideo && !isImage) return null

      const path = `${folder}/${item.name}`
      const { data } = supabase.storage.from('site-media').getPublicUrl(path)
      return {
        id: item.id,
        name: item.name,
        path,
        publicUrl: data.publicUrl,
        kind: isVideo ? 'video' : 'image',
        createdAt: item.created_at || item.updated_at || '',
        size: Number(item.metadata?.size || 0),
        source: 'storage',
      }
    })
    .filter((item): item is SiteMediaItem => Boolean(item) && item.kind === kind)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))

  return [
    ...githubReleaseMediaItems.filter((item) => item.kind === kind),
    ...projectMediaItems.filter((item) => item.kind === kind),
    ...storageItems,
  ]
}

export async function loadPublishedSiteConfig() {
  const { data, error } = await supabase
    .from('site_configs')
    .select('config, published_at')
    .eq('id', 'main')
    .single()

  if (error) throw error

  return {
    sections: (data.config || {}) as Record<string, unknown>,
    publishedAt: data.published_at as string,
  }
}

export async function publishSiteConfig(sections: Record<string, unknown>, userId: string) {
  const publishedAt = new Date().toISOString()
  const { data, error } = await supabase
    .from('site_configs')
    .update({
      config: sections,
      published_at: publishedAt,
      updated_by: userId,
    })
    .eq('id', 'main')
    .select('published_at')
    .single()

  if (error) throw error
  return data.published_at as string
}

export async function uploadSiteImage(file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('请选择图片文件')
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error('图片不能超过 10MB')
  }

  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const path = `content/${Date.now()}-${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from('site-media')
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: false,
    })

  if (error) throw error

  const { data } = supabase.storage.from('site-media').getPublicUrl(path)
  return data.publicUrl
}

const siteVideoTypes = new Set([
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/ogg',
])

export async function uploadSiteVideo(
  file: File,
  onProgress?: (percentage: number) => void,
) {
  if (!siteVideoTypes.has(file.type)) {
    throw new Error('请选择 MP4、WebM、MOV 或 OGG 视频')
  }

  if (file.size > 50 * 1024 * 1024) {
    throw new Error('Supabase 免费版单个视频不能超过 50MB；更大视频请使用 GitHub Release 素材')
  }

  const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw sessionError
  if (!sessionData.session?.access_token) {
    throw new Error('登录已失效，请重新登录')
  }

  const projectRef = new URL(supabaseUrl).hostname.split('.')[0]
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4'
  const path = `content/videos/${Date.now()}-${crypto.randomUUID()}.${extension}`

  await new Promise<void>((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `https://${projectRef}.storage.supabase.co/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        authorization: `Bearer ${sessionData.session.access_token}`,
        apikey: supabasePublishableKey,
      },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      chunkSize: 6 * 1024 * 1024,
      metadata: {
        bucketName: 'site-media',
        objectName: path,
        contentType: file.type,
        cacheControl: '3600',
      },
      onError: reject,
      onProgress: (bytesUploaded, bytesTotal) => {
        onProgress?.(Math.round((bytesUploaded / bytesTotal) * 100))
      },
      onSuccess: () => resolve(),
    })

    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length > 0) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }
      upload.start()
    }).catch(reject)
  })

  const { data } = supabase.storage.from('site-media').getPublicUrl(path)
  return data.publicUrl
}
