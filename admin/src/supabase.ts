import { createClient } from '@supabase/supabase-js'

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
