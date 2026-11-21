#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { inflateSync } from 'node:zlib'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const out = join(root, 'package-lock.json')
if (existsSync(out)) {
  console.log('package-lock.json already present')
  process.exit(0)
}
const packed = join(root, 'package-lock.json.zlib.b64')
const b64 = readFileSync(packed, 'utf8').trim()
writeFileSync(out, inflateSync(Buffer.from(b64, 'base64')))
console.log('wrote package-lock.json')
