import { readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const adminSiteDir = join(root, '..', '_site', 'admin')

await rename(
  join(adminSiteDir, 'static', 'index.html'),
  join(adminSiteDir, 'index.html'),
)
await rm(join(adminSiteDir, 'static'), { recursive: true, force: true })

const indexPath = join(adminSiteDir, 'index.html')
const html = await readFile(indexPath, 'utf8')
await writeFile(indexPath, html.replaceAll('../assets/', './assets/'))
