// Build lib/client.js: wrap src/client/index.js in the ModuleLoader handoff.
// The source file already contains the handoff wrapper (id + factory), so this
// script copies it to lib/ verbatim (single-file bundle, no external deps).
import { mkdirSync, copyFileSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
mkdirSync(join(root, 'lib'), { recursive: true })
const src = readFileSync(join(root, 'src', 'client', 'index.js'), 'utf8')
// Verify the handoff shape before shipping.
if (!src.includes('window.__ModuleLoader__.load') || !src.includes('factory:')) {
  throw new Error('client bundle missing ModuleLoader handoff')
}
writeFileSync(join(root, 'lib', 'client.js'), src, 'utf8')
console.log('built lib/client.js')
