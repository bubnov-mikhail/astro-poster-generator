import {
  MONTHS,
  MOON_PHASES,
  RING_PLANETS,
  angleForDayOfYear,
  dayOfYear,
  type MoonPhase,
  type PlanetInfo,
  type VisibilityWindow,
} from '../data/astronomy2027'
import { MoonIcon } from './MoonIcon'

const SIZE = 640
const CX = SIZE / 2
const CY = SIZE / 2

/** Середина дня — для точечных меток (фазы Луны). */
function angleMid(doy: number): number {
  return angleForDayOfYear(doy, 'mid')
}

/** Начало суток doy — для старта дуги. */
function angleStart(doy: number): number {
  return angleForDayOfYear(doy, 'start')
}

/** Конец суток doy — для конца дуги. */
function angleEnd(doy: number): number {
  return angleForDayOfYear(doy, 'end')
}

function polar(r: number, angleDeg: number) {
  const a = (angleDeg * Math.PI) / 180
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) }
}

function normalizeSweepCW(startDeg: number, endDeg: number) {
  let sweep = endDeg - startDeg
  while (sweep < 0) sweep += 360
  while (sweep > 360) sweep -= 360
  // ровно 360° оставляем как полный оборот (Марс на весь год)
  return sweep === 0 ? 360 : sweep
}

/** Один кольцевой сектор < 360°. */
function arcSectorPath(
  rInner: number,
  rOuter: number,
  startDeg: number,
  endDeg: number,
): string {
  const sweep = normalizeSweepCW(startDeg, endDeg)
  // Не рисуем полный оборот одним A — SVG схлопывает «старт≈финиш»
  if (sweep >= 359.5) {
    const mid = startDeg + 180
    return `${arcSectorPath(rInner, rOuter, startDeg, mid)} ${arcSectorPath(rInner, rOuter, mid, startDeg + 360)}`
  }
  const large = sweep > 180 ? 1 : 0
  const p1 = polar(rOuter, startDeg)
  const p2 = polar(rOuter, endDeg)
  const p3 = polar(rInner, endDeg)
  const p4 = polar(rInner, startDeg)

  return [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${large} 1 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${large} 0 ${p4.x} ${p4.y}`,
    'Z',
  ].join(' ')
}

function monthStartAngle(monthIndex: number): number {
  // Граница месяца ≈ равные 30° секторы (визуальная сетка)
  return monthIndex * 30 - 90
}

function longestWindow(windows: VisibilityWindow[]): VisibilityWindow {
  return windows.reduce((best, w) => (w.end - w.start > best.end - best.start ? w : best))
}

const R_MONTH = 298
const R_MOON = 268
const R_PLANET_OUTER = 248
const R_PLANET_INNER = 128
const PLANET_RING_GAP = 2

/** Кольца от центра к краю: Меркурий → Венера → Марс → Юпитер → Сатурн */
function planetRingRadii(idx: number, thickness: number) {
  const rInner = R_PLANET_INNER + idx * (thickness + PLANET_RING_GAP)
  const rOuter = rInner + thickness
  return { rInner, rOuter, rMid: (rInner + rOuter) / 2 }
}

interface Glyph {
  ch: string
  x: number
  y: number
  rot: number
}

/**
 * Буквы по окружности с явной ротацией.
 * Сверху: по часовой, низ букв к центру.
 * Снизу: против часовой, чтобы не читать вверх ногами.
 */
function glyphsOnArc(
  text: string,
  r: number,
  midDeg: number,
  spanDeg: number,
): Glyph[] {
  const chars = [...text]
  if (chars.length === 0) return []
  const topSide = polar(r, midDeg).y < CY
  const half = spanDeg / 2
  const step = spanDeg / chars.length

  return chars.map((ch, i) => {
    const angle = topSide
      ? midDeg - half + (i + 0.5) * step
      : midDeg + half - (i + 0.5) * step
    const { x, y } = polar(r, angle)
    const rot = topSide ? angle + 90 : angle - 90
    return {
      ch,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      rot: Math.round(rot * 100) / 100,
    }
  })
}

function CircularWord({
  text,
  r,
  midDeg,
  spanDeg,
  className,
  fill,
  stroke,
  strokeWidth,
  fontSize,
}: {
  text: string
  r: number
  midDeg: number
  spanDeg: number
  className?: string
  fill?: string
  stroke?: string
  strokeWidth?: number
  fontSize?: number
}) {
  const glyphs = glyphsOnArc(text, r, midDeg, spanDeg)
  return (
    <g className={className} aria-label={text}>
      {glyphs.map((g, i) => (
        <text
          key={`${g.ch}-${i}`}
          x={g.x}
          y={g.y}
          transform={`rotate(${g.rot}, ${g.x}, ${g.y})`}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={fill}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          paintOrder="stroke fill"
          style={fontSize ? { fontSize } : undefined}
        >
          {g.ch}
        </text>
      ))}
    </g>
  )
}

export function CircularChart() {
  const planetCount = RING_PLANETS.length
  const ringThickness =
    (R_PLANET_OUTER - R_PLANET_INNER - PLANET_RING_GAP * (planetCount - 1)) / planetCount

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="circular-chart"
      role="img"
      aria-label="Круговая диаграмма месяцев, фаз Луны и видимости планет в 2027 году"
    >
      <defs>
        <radialGradient id="disk-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(8,12,28,0.22)" />
          <stop offset="55%" stopColor="rgba(6,10,24,0.42)" />
          <stop offset="100%" stopColor="rgba(4,6,16,0.62)" />
        </radialGradient>
        <clipPath id="solar-center-clip">
          <circle cx={CX} cy={CY} r={R_PLANET_INNER - 6} />
        </clipPath>
        {/* Заливка = прямоугольный кроп только освещённой поверхности планеты
            (без космоса). Квадрат чуть больше диаметра кольца секторов. */}
        {RING_PLANETS.map((planet, idx) => {
          const { rOuter } = planetRingRadii(idx, ringThickness)
          const diskR = rOuter * 1.12
          return (
            <pattern
              key={`tex-${planet.id}`}
              id={`planet-tex-${planet.id}`}
              patternUnits="userSpaceOnUse"
              x={0}
              y={0}
              width={SIZE}
              height={SIZE}
            >
              <image
                href={`/art/planets/${planet.id}.jpg?v=crop2`}
                x={CX - diskR}
                y={CY - diskR}
                width={diskR * 2}
                height={diskR * 2}
                preserveAspectRatio="xMidYMid slice"
              />
            </pattern>
          )
        })}
      </defs>

      <circle cx={CX} cy={CY} r={R_MONTH + 10} fill="url(#disk-bg)" />
      <circle
        cx={CX}
        cy={CY}
        r={R_MONTH + 10}
        fill="none"
        stroke="rgba(255,220,160,0.22)"
        strokeWidth="1.5"
      />

      {MONTHS.map((name, i) => {
        const a0 = monthStartAngle(i)
        const tickOuter = polar(R_MONTH + 8, a0)
        const tickInner = polar(R_MOON + 8, a0)
        return (
          <line
            key={`tick-${name}`}
            x1={tickInner.x}
            y1={tickInner.y}
            x2={tickOuter.x}
            y2={tickOuter.y}
            stroke="rgba(255,230,190,0.28)"
            strokeWidth="1"
          />
        )
      })}

      {MONTHS.map((name, i) => {
        const mid = monthStartAngle(i) + 15
        const topSide = polar(R_MONTH, mid).y < CY
        const monthFont = 10.5
        const r = (topSide ? R_MONTH - 11 : R_MONTH - 3) + monthFont / 4
        const chars = [...name].length
        const span = Math.min(12, Math.max(7, chars * 1.5))
        return (
          <CircularWord
            key={`month-${name}`}
            text={name}
            r={r}
            midDeg={mid}
            spanDeg={span}
            className="month-label month-curved-label"
            fill="#f0e6d0"
            stroke="rgba(5,8,20,0.75)"
            strokeWidth={2.2}
            fontSize={monthFont}
          />
        )
      })}

      {/* Фон кольца Луны — только дорожка, без «фаз по шаблону» */}
      <circle
        cx={CX}
        cy={CY}
        r={R_MOON}
        fill="none"
        stroke="rgba(180,200,255,0.12)"
        strokeWidth="22"
      />
      {MOON_PHASES.map((phase) => (
        <MoonPhaseMarker key={`${phase.kind}-${phase.month}-${phase.day}`} phase={phase} />
      ))}

      {/* Дуги планет — заливка фото планеты (фронтальный диск) */}
      {RING_PLANETS.map((planet, idx) => {
        const { rInner, rOuter } = planetRingRadii(idx, ringThickness)
        return (
          <PlanetRing
            key={planet.id}
            planet={planet}
            rInner={rInner}
            rOuter={rOuter}
            fillUrl={`url(#planet-tex-${planet.id})`}
          />
        )
      })}

      {/* Подписи на самой длинной дуге видимости */}
      {RING_PLANETS.map((planet, idx) => {
        const { rMid } = planetRingRadii(idx, ringThickness)
        const w = longestWindow(planet.windows)
        const a0 = angleStart(w.start)
        const a1 = angleEnd(w.end)
        const sweep = normalizeSweepCW(a0, a1)
        const mid = a0 + sweep / 2
        const label = planet.name.toUpperCase()
        const chars = [...label].length
        // Читаемый кегль; дуга подписи внутри сектора с запасом
        const fontSize = Math.min(7.5, Math.max(5.5, rMid * 0.048))
        const gapPx = fontSize * 0.95
        const degPerChar = (gapPx / rMid) * (180 / Math.PI)
        const span = Math.min(chars * degPerChar, Math.max(sweep * 0.78, 8), 42)
        return (
          <CircularWord
            key={`label-${planet.id}`}
            text={label}
            r={rMid}
            midDeg={mid}
            spanDeg={span}
            className="planet-curved-label"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth={1.55}
            fontSize={fontSize}
          />
        )
      })}

      <circle
        cx={CX}
        cy={CY}
        r={R_PLANET_INNER - 4}
        fill="rgba(6,10,28,0.9)"
        stroke="rgba(255,210,140,0.45)"
        strokeWidth="1.5"
      />
      <image
        href="/art/solar-system-center.jpg"
        x={CX - (R_PLANET_INNER - 6)}
        y={CY - (R_PLANET_INNER - 6)}
        width={(R_PLANET_INNER - 6) * 2}
        height={(R_PLANET_INNER - 6) * 2}
        preserveAspectRatio="xMidYMid slice"
        clipPath="url(#solar-center-clip)"
      />
      <circle
        cx={CX}
        cy={CY}
        r={R_PLANET_INNER - 6}
        fill="none"
        stroke="rgba(255,220,160,0.35)"
        strokeWidth="1.2"
      />
    </svg>
  )
}

function MoonPhaseMarker({ phase }: { phase: MoonPhase }) {
  const doy = dayOfYear(phase.month, phase.day)
  const ang = angleMid(doy)
  const pos = polar(R_MOON, ang)
  const size = phase.kind === 'full' ? 16 : phase.kind === 'new' ? 15 : 14
  return (
    <g transform={`translate(${pos.x - size / 2}, ${pos.y - size / 2})`}>
      <title>{`${phase.label}: ${phase.day}.${String(phase.month).padStart(2, '0')}.2027`}</title>
      <circle cx={size / 2} cy={size / 2} r={size / 2 + 1.2} fill="rgba(6,10,28,0.85)" />
      <MoonIcon kind={phase.kind} size={size} />
    </g>
  )
}

function PlanetRing({
  planet,
  rInner,
  rOuter,
  fillUrl,
}: {
  planet: PlanetInfo
  rInner: number
  rOuter: number
  fillUrl: string
}) {
  // Склеиваем смежные окна (конец d / начало d+1), чтобы не было hairline-щелей
  // там, где видимость непрерывна; разрывы из-за соединения с Солнцем сохраняем.
  const segments: VisibilityWindow[] = []
  for (const w of planet.windows) {
    const prev = segments[segments.length - 1]
    if (prev && w.start <= prev.end + 1) {
      prev.end = Math.max(prev.end, w.end)
      if (w.when === 'ночь') prev.when = 'ночь'
      else if (w.when === 'вечер' && prev.when !== 'ночь') prev.when = 'вечер'
    } else {
      segments.push({ ...w })
    }
  }

  return (
    <g>
      {segments.map((w, i) => {
        const a0 = angleStart(w.start)
        const a1 = angleEnd(w.end)
        const daySpan = w.end - w.start + 1
        const opacity = w.when === 'ночь' ? 0.98 : w.when === 'вечер' ? 0.94 : 0.9
        const ri = rInner + 0.4
        const ro = rOuter - 0.4
        const title = `${planet.name}: ${w.when} · дни ${w.start}–${w.end}`

        // Полный год: stroke-кольцо с текстурой планеты
        if (daySpan >= 365) {
          const rMid = (ri + ro) / 2
          return (
            <circle
              key={`${planet.id}-${i}-full`}
              cx={CX}
              cy={CY}
              r={rMid}
              fill="none"
              stroke={fillUrl}
              strokeWidth={ro - ri}
              opacity={opacity}
            >
              <title>{title}</title>
            </circle>
          )
        }

        return (
          <path
            key={`${planet.id}-${i}-${w.start}-${w.end}`}
            d={arcSectorPath(ri, ro, a0, a1 + 0.12)}
            fill={fillUrl}
            opacity={opacity}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={0.25}
            strokeLinejoin="round"
          >
            <title>{title}</title>
          </path>
        )
      })}
    </g>
  )
}
