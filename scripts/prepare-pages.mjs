import { cp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { buildPublicArticleIndex } from './article-content.mjs'

const root = process.cwd()
const siteDir = join(root, '_site')

const rootFiles = [
  '.nojekyll',
  'index.html',
  'about.html',
  'business.html',
  'cases.html',
  'consult.html',
  'cooperation.html',
  'news.html',
  'gallery.html',
  'investors.html',
]

await rm(siteDir, { recursive: true, force: true })
await mkdir(siteDir, { recursive: true })

for (const file of rootFiles) {
  await cp(join(root, file), join(siteDir, file))
}

await cp(join(root, 'assets'), join(siteDir, 'assets'), {
  recursive: true,
})

await cp(join(root, 'partials'), join(siteDir, 'partials'), {
  recursive: true,
})

await mkdir(join(siteDir, 'scripts'), { recursive: true })
await cp(join(root, 'scripts', 'site-config.js'), join(siteDir, 'scripts', 'site-config.js'))

const articles = await buildPublicArticleIndex()
await writeFile(join(siteDir, 'articles.json'), `${JSON.stringify(articles, null, 2)}\n`, 'utf8')
