import { readFile, stat } from 'node:fs/promises'
import { extname, relative, resolve } from 'node:path'

import { defineConfig, type Plugin } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const siteRoot = resolve(__dirname, '..')
const pageFiles = new Set([
  'index.html',
  'about.html',
  'business.html',
  'cases.html',
  'consult.html',
  'cooperation.html',
  'gallery.html',
  'news.html',
])
const staticPrefixes = ['assets/', 'partials/', 'scripts/']

function getContentType(filePath: string) {
  const types: Record<string, string> = {
    '.css': 'text/css; charset=utf-8',
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.jpeg': 'image/jpeg',
    '.jpg': 'image/jpeg',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
  }
  return types[extname(filePath)] || 'application/octet-stream'
}

function fullSitePages(): Plugin {
  return {
    name: 'suxin-fullsite-pages',
    configureServer(server) {
      server.watcher.add([siteRoot])
      server.watcher.on('change', (file) => {
        if (file.startsWith(siteRoot)) {
          server.ws.send({ type: 'full-reload' })
        }
      })

      server.middlewares.use(async (request, response, next) => {
        const pathName = decodeURIComponent((request.url || '/').split('?')[0])
        if (pathName.startsWith('/admin') || pathName.startsWith('/@') || pathName.startsWith('/src')) {
          next()
          return
        }

        const requestedFile = pathName === '/' ? 'index.html' : pathName.slice(1)
        const isPage = pageFiles.has(requestedFile)
        const isStaticFile = staticPrefixes.some((prefix) => requestedFile.startsWith(prefix))
        if (!isPage && !isStaticFile) {
          next()
          return
        }

        const filePath = resolve(siteRoot, requestedFile)
        if (relative(siteRoot, filePath).startsWith('..')) {
          next()
          return
        }

        try {
          const fileStat = await stat(filePath)
          if (!fileStat.isFile()) {
            next()
            return
          }

          const contents = await readFile(filePath)
          response.statusCode = 200
          response.setHeader('Content-Type', getContentType(filePath))
          if (isPage) {
            response.end(await server.transformIndexHtml(pathName, contents.toString()))
            return
          }
          response.end(contents)
        } catch {
          next()
        }
      })
    },
  }
}

export default defineConfig({
  base: '/admin/',
  resolve: { tsconfigPaths: true },
  plugins: [fullSitePages(), tanstackStart(), tailwindcss(), viteReact()],
  server: {
    fs: { allow: [siteRoot] },
  },
})
