/**
 * A4 print PNG @ 800 dpi.
 * Layout CSS size ≈ 2480×3508 (wide enough for table wrap + approved type),
 * then deviceScaleFactor brings pixels to 210×297 mm at 800 dpi.
 */
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

const DPI = 800
const OUT_W = Math.round((210 / 25.4) * DPI)
const OUT_H = Math.round((297 / 25.4) * DPI)
const CSS_W = 2480
const CSS_H = 3508
const SCALE = OUT_W / CSS_W

const OUT = process.env.OUT || '/opt/cursor/artifacts/nebo-moskva-2027-A4-800dpi.png'
const URL = process.env.URL || 'http://127.0.0.1:3847/'

mkdirSync(dirname(OUT), { recursive: true })

const browser = await chromium.launch({
  args: ['--disable-dev-shm-usage', '--font-render-hinting=none'],
})
const page = await browser.newPage({
  viewport: { width: CSS_W, height: CSS_H },
  deviceScaleFactor: SCALE,
})

await page.goto(URL, { waitUntil: 'networkidle', timeout: 120_000 })
const metrics = await page.evaluate(async ({ CSS_W, CSS_H }) => {
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
    width: `${CSS_W}px`,
    height: `${CSS_H}px`,
    maxWidth: 'none',
    aspectRatio: 'auto',
    borderRadius: '0',
    boxShadow: 'none',
    margin: '0',
  })
  await document.fonts.ready
  await Promise.all(
    [...document.images].map((img) =>
      img.complete
        ? null
        : new Promise((r) => {
            img.addEventListener('load', r)
            img.addEventListener('error', r)
          }),
    ),
  )
  await new Promise((r) => setTimeout(r, 1200))
  const box = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return { w: Math.round(r.width), h: Math.round(r.height), pctH: Math.round((r.height / CSS_H) * 100) }
  }
  const cs = (sel) => getComputedStyle(document.querySelector(sel)).fontSize
  return {
    header: box('.poster-header'),
    chart: box('.circular-chart'),
    table: box('.table-block'),
    eyebrow: cs('.eyebrow'),
    h1: cs('.poster-header h1'),
    tableFs: cs('.planet-table'),
  }
}, { CSS_W, CSS_H })

console.log(JSON.stringify({ dpi: DPI, css: `${CSS_W}x${CSS_H}`, scale: SCALE, out: `${OUT_W}x${OUT_H}`, metrics }, null, 2))

await page.locator('#poster').screenshot({ path: OUT, type: 'png' })
await browser.close()
console.log(JSON.stringify({ out: OUT }, null, 2))
