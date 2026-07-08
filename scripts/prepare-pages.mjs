import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

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
  'nav.html',
  'footer.html',
]

await rm(siteDir, { recursive: true, force: true })
await mkdir(siteDir, { recursive: true })

for (const file of rootFiles) {
  await cp(join(root, file), join(siteDir, file))
}

await cp(join(root, 'assets'), join(siteDir, 'assets'), {
  recursive: true,
})
