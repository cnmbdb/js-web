import { rename, rm } from 'node:fs/promises'
import { join } from 'node:path'

const root = process.cwd()
const adminSiteDir = join(root, '..', '_site', 'admin')

await rename(
  join(adminSiteDir, 'static', 'index.html'),
  join(adminSiteDir, 'index.html'),
)
await rm(join(adminSiteDir, 'static'), { recursive: true, force: true })
