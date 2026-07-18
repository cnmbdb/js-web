import type { IncomingMessage, ServerResponse } from 'node:http'

import type { Plugin } from 'vite'

import {
  buildPublicArticleIndex,
  deleteArticle,
  listArticles,
  type Article,
  writeArticle,
} from '../scripts/article-content.mjs'

async function readJsonBody(request: IncomingMessage) {
  const chunks: Array<Buffer> = []
  for await (const chunk of request) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}') as Record<string, unknown>
}

function sendJson(response: ServerResponse, status: number, value: unknown) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(value))
}

export function articleContentPlugin(): Plugin {
  return {
    name: 'suxin-local-article-content',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathName = decodeURIComponent((request.url || '/').split('?')[0])

        if (pathName === '/articles.json' && request.method === 'GET') {
          try {
            sendJson(response, 200, await buildPublicArticleIndex())
          } catch (error) {
            sendJson(response, 500, { error: error instanceof Error ? error.message : '无法生成文章索引' })
          }
          return
        }

        if (pathName !== '/__local/articles') {
          next()
          return
        }

        try {
          if (request.method === 'GET') {
            sendJson(response, 200, { articles: await listArticles() })
            return
          }

          if (request.method !== 'POST') {
            sendJson(response, 405, { error: 'Method not allowed' })
            return
          }

          const body = await readJsonBody(request)
          if (body.action === 'save') {
            if (!body.article || typeof body.article !== 'object') {
              sendJson(response, 400, { error: '缺少文章内容' })
              return
            }
            const result = await writeArticle(body.article as Partial<Article>, String(body.previousSlug || ''))
            sendJson(response, 200, result)
            return
          }

          if (body.action === 'delete') {
            const articles = await deleteArticle(String(body.slug || ''))
            sendJson(response, 200, { articles })
            return
          }

          sendJson(response, 400, { error: '未知的文章操作' })
        } catch (error) {
          sendJson(response, 400, { error: error instanceof Error ? error.message : '文章操作失败' })
        }
      })
    },
  }
}
