/**
 * Проверка согласованности данных инфографики с опорными фактами 2027.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = readFileSync(join(root, 'src/data/astronomy2027.ts'), 'utf8')

const checks = []

function assert(cond, msg) {
  checks.push({ ok: !!cond, msg })
}

// Фазы Луны: число каждой основной фазы
const newCount = (src.match(/kind: 'new'/g) || []).length
const firstCount = (src.match(/kind: 'first'/g) || []).length
const fullCount = (src.match(/kind: 'full'/g) || []).length
const lastCount = (src.match(/kind: 'last'/g) || []).length

assert(newCount === 13, `Новолуний 13 (факт USNO), сейчас ${newCount}`)
assert(firstCount === 12, `Первых четвертей 12, сейчас ${firstCount}`)
assert(fullCount === 12, `Полнолуний 12, сейчас ${fullCount}`)
assert(lastCount === 12, `Последних четвертей 12, сейчас ${lastCount}`)

// Ключевые даты (MSK)
assert(src.includes("month: 2, day: 21") && src.includes("'full'"), 'Полнолуние 21 фев (MSK)')
assert(src.includes("month: 4, day: 7") && src.includes("'new'"), 'Новолуние 7 апр (MSK)')
assert(src.includes("month: 9, day: 16"), 'Полнолуние 16 сен (MSK)')

// Планетные пики
assert(src.includes('19 фев'), 'Марс противостояние 19 фев')
assert(src.includes('11 фев'), 'Юпитер противостояние 11 фев')
assert(src.includes('18 окт'), 'Сатурн противостояние 18 окт')
assert(src.includes('28 сен'), 'Нептун противостояние 28 сен')
assert(src.includes('30 ноя'), 'Уран противостояние 30 ноя')
assert(src.includes('3 янв'), 'Венера зап. элонгация 3 янв')
assert(src.includes('28 мая'), 'Меркурий вост. элонгация 28 мая')
assert(src.includes('4 ноя'), 'Меркурий зап. элонгация 4 ноя')

// Окна Меркурия не включают март/сентябрь как основные (эклиптика низко)
assert(src.includes('Мартовская и сентябрьская'), 'Пояснение про март/сентябрь Меркурия')

const failed = checks.filter((c) => !c.ok)
for (const c of checks) {
  console.log(`${c.ok ? '✓' : '✗'} ${c.msg}`)
}
if (failed.length) {
  console.error(`\nПровалено: ${failed.length}`)
  process.exit(1)
}
console.log(`\nВсе ${checks.length} проверок пройдены.`)
