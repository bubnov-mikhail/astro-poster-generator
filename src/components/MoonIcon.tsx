import { useId } from 'react'
import type { MoonPhaseKind } from '../data/astronomy2027'

interface Props {
  kind: MoonPhaseKind
  size?: number
  className?: string
}

/**
 * Растровая полная Луна + векторная маска затенения.
 * Северное полушарие (Москва): 1-я четверть — свет справа, последняя — слева.
 */
export function MoonIcon({ kind, size = 14, className }: Props) {
  const uid = useId().replace(/:/g, '')
  const disk = `${uid}-disk`
  const lit = `${uid}-lit`

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      className={className}
      aria-hidden
    >
      <defs>
        <clipPath id={disk}>
          <circle cx="20" cy="20" r="18" />
        </clipPath>
        <clipPath id={lit}>
          {kind === 'full' && <circle cx="20" cy="20" r="18" />}
          {kind === 'first' && <rect x="20" y="0" width="20" height="40" />}
          {kind === 'last' && <rect x="0" y="0" width="20" height="40" />}
          {/* new — пустой clip: светлой части нет */}
        </clipPath>
      </defs>

      {/* Тёмный диск (ночная сторона / новолуние) */}
      <circle cx="20" cy="20" r="18" fill="#121018" />
      <circle cx="20" cy="20" r="18" fill="#1a1520" opacity="0.9" clipPath={`url(#${disk})`} />

      {/* Освещённая часть — растр полной Луны */}
      {kind !== 'new' && (
        <g clipPath={`url(#${lit})`}>
          <g clipPath={`url(#${disk})`}>
            <image
              href="/art/full-moon.jpg"
              x="0.5"
              y="0.5"
              width="39"
              height="39"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </g>
      )}

      {/* Мягкий терминатор */}
      {(kind === 'first' || kind === 'last') && (
        <ellipse
          cx="20"
          cy="20"
          rx="1.8"
          ry="17.5"
          fill="rgba(0,0,0,0.45)"
          clipPath={`url(#${disk})`}
        />
      )}

      <circle
        cx="20"
        cy="20"
        r="18"
        fill="none"
        stroke="rgba(255,236,200,0.4)"
        strokeWidth="0.9"
      />
    </svg>
  )
}
