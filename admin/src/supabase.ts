import { createClient } from '@supabase/supabase-js'
import * as tus from 'tus-js-client'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://xyfgzgcqeasfcfgkzsyd.supabase.co'
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_yoLWgA8eBMu6mjVgXfbP1g_VZW8PveY'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)

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

  if (file.size > 100 * 1024 * 1024) {
    throw new Error('视频不能超过 100MB')
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
