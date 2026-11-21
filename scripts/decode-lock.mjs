#!/usr/bin/env node
/**
 * Decode package-lock.json.zlib.b64 → package-lock.json
 * (uploaded compressed because GitHub MCP tool-call size limits)
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { inflateSync } from 'node:zlib'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const b64 = readFileSync(join(root, 'package-lock.json.zlib.b64'), 'utf8').trim()
const buf = inflateSync(Buffer.from(b64, 'base64'))
writeFileSync(join(root, 'package-lock.json'), buf)
console.log(`Wrote package-lock.json (${buf.length} bytes)`)
