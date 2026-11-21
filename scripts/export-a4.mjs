import { chromium } from 'playwright'
import { mkdirSync, copyFileSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'

const OUT = process.env.OUT || '/opt/cursor/artifacts/nebo-moskva-2027-A4-1200dpi.png'
const PREVIEW = process.env.PREVIEW || '/opt/cursor/artifacts/nebo-moskva-2027-print-preview.png'
const URL = process.env.URL || 'http://127.0.0.1:3847/'
const W = 2480
const H = 3508
const SCALE = 4 // 2480*4 = 9920 → 1200 dpi on 210 mm

mkdirSync(dirname(OUT), { recursive: true })

const browser = await chromium.launch({
  args: ['--disable-dev-shm-usage', '--font-render-hinting=none'],
})
const page = await browser.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: SCALE,
})

await page.goto(URL, { waitUntil: 'networkidle', timeout: 120_000 })
await page.evaluate(async () => {
  document.querySelector('.toolbar')?.remove()
  const poster = document.querySelector('.poster')
  if (!poster) throw new Error('poster missing')
  Object.assign(document.body.style, {
    margin: '0',
    padding: '0',
    background: '#050814',
    display: 'block',
  })
  const shell = document.querySelector('.app-shell')
  if (shell) {
    Object.assign(shell.style, {
      padding: '0',
      margin: '0',
      minHeight: '0',
      width: '100%',
      display: 'block',
    })
  }
  Object.assign(poster.style, {
    width: `${2480}px`,
    height: `${3508}px`,
    maxWidth: 'none',
    aspectRatio: 'auto',
    borderRadius: '0',
    boxShadow: 'none',
    margin: '0',
  })
  await document.fonts.ready
  await Promise.all(
    [...document.images].map((img) =>
      img.complete ? null : new Promise((r) => img.addEventListener('load', r)),
    ),
  )
  // settle layout / animations
  await new Promise((r) => setTimeout(r, 800))
})

const poster = page.locator('#poster')
await poster.screenshot({ path: OUT, type: 'png' })

// preview ~1/6.25 of linear size
const previewBuf = await poster.screenshot({ type: 'png' })
const { createRequire } = await import('node:module')
// write full then shrink with sharp if available — else use playwright smaller viewport
writeFileSync(OUT.replace('A4-1200dpi', 'A4-raw-check'), previewBuf)

await browser.close()

// Build preview via second pass at lower scale
const browser2 = await chromium.launch({ args: ['--disable-dev-shm-usage'] })
const page2 = await browser2.newPage({
  viewport: { width: W, height: H },
  deviceScaleFactor: 0.64, // ~1587×2245
})
await page2.goto(URL, { waitUntil: 'networkidle', timeout: 120_000 })
await page2.evaluate(async () => {
  document.querySelector('.toolbar')?.remove()
  const poster = document.querySelector('.poster')
  Object.assign(document.body.style, { margin: '0', padding: '0', background: '#050814' })
  const shell = document.querySelector('.app-shell')
  if (shell) Object.assign(shell.style, { padding: '0', margin: '0', minHeight: '0', display: 'block' })
  Object.assign(poster.style, {
    width: '2480px',
    height: '3508px',
    maxWidth: 'none',
    aspectRatio: 'auto',
    borderRadius: '0',
    boxShadow: 'none',
    margin: '0',
  })
  await document.fonts.ready
  await new Promise((r) => setTimeout(r, 600))
})
await page2.locator('#poster').screenshot({ path: PREVIEW, type: 'png' })
await browser2.close()

console.log(JSON.stringify({ out: OUT, preview: PREVIEW, css: `${W}x${H}`, scale: SCALE }, null, 2))
