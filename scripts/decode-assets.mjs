#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'

const root = join(fileURLToPath(new URL('.', import.meta.url)), '..')
const packDir = join(root, 'public/art/_pack')
const manifest = JSON.parse(readFileSync(join(packDir, 'manifest.json'), 'utf8'))
const b64 = Array.from({ length: manifest.parts }, (_, i) =>
  readFileSync(join(packDir, `part-${String(i).padStart(2, '0')}.b64`), 'utf8').trim(),
).join('')
const blob = inflateSync(Buffer.from(b64, 'base64'))
let offset = 0
const textDecoder = new TextDecoder()
while (offset < blob.length) {
  const nl1 = blob.indexOf(0x0a, offset)
  const path = textDecoder.decode(blob.subarray(offset, nl1))
  const nl2 = blob.indexOf(0x0a, nl1 + 1)
  const size = Number(textDecoder.decode(blob.subarray(nl1 + 1, nl2)))
  const data = blob.subarray(nl2 + 1, nl2 + 1 + size)
  const out = join(root, path)
  mkdirSync(dirname(out), { recursive: true })
  writeFileSync(out, data)
  console.log('wrote', path, data.length)
  offset = nl2 + 1 + size
}
console.log('done', manifest.files.length, 'files')
