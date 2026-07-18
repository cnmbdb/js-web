import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { buildPublicArticleIndex, repositoryRoot } from './article-content.mjs'

const target = process.argv[2] || join(repositoryRoot, 'articles.json')
const articles = await buildPublicArticleIndex()
await writeFile(target, `${JSON.stringify(articles, null, 2)}\n`, 'utf8')
console.log(`Generated ${articles.length} published articles at ${target}`)
