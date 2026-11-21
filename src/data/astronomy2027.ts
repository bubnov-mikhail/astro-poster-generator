/**
 * Астрономические данные на 2027 год для Москвы (≈55,76° N).
 *
 * Единый источник истины для круговой диаграммы и нижней таблицы.
 * Углы на круге: angleDeg = (dayOfYear / 365) * 360 − 90° (1 янв сверху).
 * 2027 — невисокосный (365 дней).
 */

export const DAYS_IN_YEAR = 365

export const MONTHS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const

const MONTH_LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

/** День года: 1 = 1 января … 365 = 31 декабря. */
export function dayOfYear(month: number, day: number): number {
  let d = day
  for (let i = 0; i < month - 1; i++) d += MONTH_LENGTHS[i]
  return d
}

/**
 * Угол на круге (градусы SVG: 0 = восток, −90 = верх / 1 января).
 * `edge`: start — начало суток, mid — середина дня, end — конец суток.
 */
export function angleForDayOfYear(
  doy: number,
  edge: 'start' | 'mid' | 'end' = 'mid',
): number {
  const t =
    edge === 'start' ? doy - 1 : edge === 'end' ? doy : doy - 0.5
  return (t / DAYS_IN_YEAR) * 360 - 90
}

export type MoonPhaseKind = 'new' | 'first' | 'full' | 'last'

export interface MoonPhase {
  kind: MoonPhaseKind
  month: number
  day: number
  label: string
}

function moon(
  kind: MoonPhaseKind,
  month: number,
  day: number,
): MoonPhase {
  const label =
    kind === 'new'
      ? 'Новолуние'
      : kind === 'first'
        ? 'Первая четверть'
        : kind === 'full'
          ? 'Полнолуние'
          : 'Последняя четверть'
  return { kind, month, day, label }
}

/**
 * Основные фазы Луны 2027 (календарные даты для Москвы).
 * В августе два новолуния: 2 и 31 августа.
 */
export const MOON_PHASES: MoonPhase[] = [
  // Новолуния
  moon('new', 1, 7),
  moon('new', 2, 6),
  moon('new', 3, 8),
  moon('new', 4, 7),
  moon('new', 5, 6),
  moon('new', 6, 4),
  moon('new', 7, 4),
  moon('new', 8, 2),
  moon('new', 8, 31),
  moon('new', 9, 30),
  moon('new', 10, 29),
  moon('new', 11, 28),
  moon('new', 12, 27),
  // Первая четверть
  moon('first', 1, 15),
  moon('first', 2, 14),
  moon('first', 3, 15),
  moon('first', 4, 14),
  moon('first', 5, 13),
  moon('first', 6, 11),
  moon('first', 7, 11),
  moon('first', 8, 9),
  moon('first', 9, 8),
  moon('first', 10, 8),
  moon('first', 11, 6),
  moon('first', 12, 6),
  // Полнолуния
  moon('full', 1, 22),
  moon('full', 2, 20),
  moon('full', 3, 22),
  moon('full', 4, 21),
  moon('full', 5, 20),
  moon('full', 6, 19),
  moon('full', 7, 18),
  moon('full', 8, 17),
  moon('full', 9, 15),
  moon('full', 10, 15),
  moon('full', 11, 14),
  moon('full', 12, 13),
  // Последняя четверть
  moon('last', 1, 30),
  moon('last', 2, 28),
  moon('last', 3, 30),
  moon('last', 4, 29),
  moon('last', 5, 28),
  moon('last', 6, 27),
  moon('last', 7, 26),
  moon('last', 8, 25),
  moon('last', 9, 23),
  moon('last', 10, 23),
  moon('last', 11, 21),
  moon('last', 12, 21),
]

export type VisibilityWhen = 'утро' | 'вечер' | 'ночь'

/** Календарный интервал видимости (включительно). */
export interface VisibilityRange {
  startMonth: number
  startDay: number
  endMonth: number
  endDay: number
  when: VisibilityWhen
}

/** Дни года для отрисовки дуги. */
export interface VisibilityWindow {
  start: number
  end: number
  when: VisibilityWhen
}

export interface PlanetData {
  id: string
  name: string
  short: string
  color: string
  /** Показывать на круговых кольцах (Меркурий–Сатурн). */
  showOnRing: boolean
  visibilityRanges: VisibilityRange[]
  /** Ключевое событие — колонка таблицы. */
  highlight: string
  /** Заметка наблюдателя — колонка таблицы. */
  tableNote: string
}

const MONTH_SHORT = [
  '',
  'янв',
  'фев',
  'мар',
  'апр',
  'мая',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек',
]

function formatDay(month: number, day: number): string {
  return `${day} ${MONTH_SHORT[month]}`
}

function formatRange(r: VisibilityRange): string {
  const sameMonth =
    r.startMonth === r.endMonth && r.startDay === r.endDay
  if (sameMonth) return `${formatDay(r.startMonth, r.startDay)} (${r.when})`
  if (r.startMonth === r.endMonth) {
    return `${r.startDay}–${r.endDay} ${MONTH_SHORT[r.startMonth]} (${r.when})`
  }
  return `${formatDay(r.startMonth, r.startDay)} – ${formatDay(r.endMonth, r.endDay)} (${r.when})`
}

export function rangesToWindows(ranges: VisibilityRange[]): VisibilityWindow[] {
  return ranges.map((r) => ({
    start: dayOfYear(r.startMonth, r.startDay),
    end: dayOfYear(r.endMonth, r.endDay),
    when: r.when,
  }))
}

export function formatTablePeriod(ranges: VisibilityRange[]): string {
  return ranges.map(formatRange).join('; ')
}

/**
 * Единый источник истины для дуг на круге и строк нижней таблицы.
 */
export const PLANETS_DATA: PlanetData[] = [
  {
    id: 'mercury',
    name: 'Меркурий',
    short: '☿',
    color: '#C4B5A0',
    showOnRing: true,
    visibilityRanges: [
      { startMonth: 1, startDay: 23, endMonth: 2, endDay: 10, when: 'вечер' },
      { startMonth: 3, startDay: 9, endMonth: 6, endDay: 4, when: 'утро' },
      { startMonth: 7, startDay: 15, endMonth: 7, endDay: 28, when: 'утро' },
      { startMonth: 10, startDay: 25, endMonth: 11, endDay: 13, when: 'утро' },
    ],
    highlight: 'Наибольшие элонгации: 1 фев (вечер) и 1 ноя (утро)',
    tableNote:
      'Июльская и августовская элонгации в Москве почти не видны из-за белых ночей и низкого положения эклиптики.',
  },
  {
    id: 'venus',
    name: 'Венера',
    short: '♀',
    color: '#F0E6C8',
    showOnRing: true,
    visibilityRanges: [
      { startMonth: 1, startDay: 1, endMonth: 7, endDay: 15, when: 'утро' },
      { startMonth: 11, startDay: 15, endMonth: 12, endDay: 31, when: 'вечер' },
    ],
    highlight: 'Утренняя элонгация 3 янв (47°). Верхнее соединение с Солнцем 12 августа.',
    tableNote:
      'Всю первую половину года сияет как яркая «Утренняя звезда». На вечернее небо возвращается в самом конце года.',
  },
  {
    id: 'mars',
    name: 'Марс',
    short: '♂',
    color: '#E07A4A',
    showOnRing: true,
    visibilityRanges: [
      { startMonth: 1, startDay: 1, endMonth: 12, endDay: 31, when: 'ночь' },
    ],
    highlight:
      'Противостояние 19 февраля во Льве (−1,3m, диск 14″). Сближение с Юпитером 31 марта (около 4°).',
    tableNote:
      'Афелийное противостояние — планета не подойдет близко к Земле, но будет высоко над горизонтом в Москве.',
  },
  {
    id: 'jupiter',
    name: 'Юпитер',
    short: '♃',
    color: '#D4A574',
    showOnRing: true,
    visibilityRanges: [
      { startMonth: 1, startDay: 1, endMonth: 7, endDay: 25, when: 'ночь' },
      { startMonth: 9, startDay: 25, endMonth: 12, endDay: 31, when: 'утро' },
    ],
    highlight: 'Противостояние 11 февраля во Льве. Соединение с Солнцем 31 августа.',
    tableNote:
      'Лучшее время для наблюдений — зима и весна. Осенью снова появляется на утреннем небе.',
  },
  {
    id: 'saturn',
    name: 'Сатурн',
    short: '♄',
    color: '#E8C87A',
    showOnRing: true,
    visibilityRanges: [
      { startMonth: 1, startDay: 1, endMonth: 3, endDay: 15, when: 'вечер' },
      { startMonth: 5, startDay: 5, endMonth: 12, endDay: 31, when: 'ночь' },
    ],
    highlight: 'Соединение с Солнцем 7 апреля. Противостояние 18 октября в Рыбах.',
    tableNote:
      'Кольца снова постепенно раскрываются (наклон до 8°) после прохождения плоскости колец в 2025 году.',
  },
  {
    id: 'uranus',
    name: 'Уран',
    short: '♅',
    color: '#7EC8C8',
    showOnRing: false,
    visibilityRanges: [
      { startMonth: 1, startDay: 1, endMonth: 4, endDay: 25, when: 'вечер' },
      { startMonth: 6, startDay: 25, endMonth: 12, endDay: 31, when: 'ночь' },
    ],
    highlight: 'Соединение 27 мая. Противостояние 30 ноября в Тельце.',
    tableNote: 'Блеск ~5,6m. Для уверенного поиска нужен бинокль или телескоп.',
  },
  {
    id: 'neptune',
    name: 'Нептун',
    short: '♆',
    color: '#5B8CDE',
    showOnRing: false,
    visibilityRanges: [
      { startMonth: 1, startDay: 1, endMonth: 2, endDay: 25, when: 'вечер' },
      { startMonth: 4, startDay: 25, endMonth: 12, endDay: 31, when: 'ночь' },
    ],
    highlight: 'Соединение 26 марта. Противостояние 28 сентября в Рыбах.',
    tableNote: 'Блеск ~7,8m. Наблюдается только в телескоп.',
  },
]

/** Строка таблицы / кольца — производная от PLANETS_DATA. */
export interface PlanetInfo {
  id: string
  name: string
  short: string
  color: string
  showOnRing: boolean
  windows: VisibilityWindow[]
  tablePeriod: string
  tableNote: string
  highlight: string
}

export const PLANETS: PlanetInfo[] = PLANETS_DATA.map((p) => ({
  id: p.id,
  name: p.name,
  short: p.short,
  color: p.color,
  showOnRing: p.showOnRing,
  windows: rangesToWindows(p.visibilityRanges),
  tablePeriod: formatTablePeriod(p.visibilityRanges),
  tableNote: p.tableNote,
  highlight: p.highlight,
}))

/** Кольца круга: Меркурий → Сатурн. */
export const RING_PLANETS = PLANETS.filter((p) => p.showOnRing)

export const SOURCES =
  'Источники: фазы Луны — календарные эфемериды 2027; конфигурации планет — ИАА РАН / Астронет; окна видимости — для широты Москвы.'
