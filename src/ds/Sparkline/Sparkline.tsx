import React from 'react'

type Trend = 'up' | 'down' | 'neutral'

export interface SparklineProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'role' | 'width' | 'height'> {
  /** Numeric series, oldest → newest. Empty / single / all-equal are handled. */
  data: number[]
  /** SVG width in px. */
  w?: number
  /** SVG height in px. */
  h?: number
  /**
   * Line colour intent. `up` → signature green (default), `down` → brick danger,
   * `neutral` → ink. Unknown values fall back to `up` (no throw — §7 #1).
   */
  trend?: Trend
  /**
   * Accessible name. When omitted, a text summary is generated from the data
   * (count, direction, first → last). Maps to `aria-label`.
   */
  label?: string
}

// Trend → stroke colour, mapped to the modernista token CSS variables (no
// hardcoded hex). up = signature green, down = brick danger (#B23A2B, the
// functional hue — never the referee card-red), neutral = muted ink.
const TRENDS: Record<Trend, string> = {
  up: 'var(--green)',
  down: 'var(--danger)',
  neutral: 'var(--ink-muted)',
}

// Vertical padding so the stroke + endpoint dot never clip at the top/bottom.
const PAD = 2

/**
 * Map the series to SVG coordinates.
 *
 * Guards every degenerate case the spec calls out:
 * - empty: returns no points (caller draws nothing).
 * - single point: one centred coordinate (no `i / (len - 1)` divide-by-zero).
 * - all-equal: `max - min` is 0, so every point sits on the vertical midline
 *   (the `|| 1` denominator guard keeps the math finite; midline because the
 *   normalised value collapses to 0).
 */
function toPoints(data: number[], w: number, h: number): Array<[number, number]> {
  const n = data.length
  if (n === 0) return []
  const usableH = h - PAD * 2
  if (n === 1) {
    // A lone reading has no trend — pin it to the vertical centre.
    return [[w / 2, h / 2]]
  }
  const max = Math.max(...data)
  const min = Math.min(...data)
  const span = max - min || 1
  const flat = max === min
  return data.map((d, i) => {
    const x = (i / (n - 1)) * w
    // Flat series: centre the line vertically rather than slamming it to the
    // bottom, so an all-equal sparkline reads as a calm mid-line.
    const norm = flat ? 0.5 : (d - min) / span
    const y = h - norm * usableH - PAD
    return [x, y]
  })
}

function describe(data: number[]): string {
  const n = data.length
  if (n === 0) return 'Gráfico de tendência sem dados'
  if (n === 1) return `Gráfico de tendência, 1 ponto: ${data[0]}`
  const first = data[0]
  const last = data[n - 1]
  const direction =
    last > first ? 'em alta' : last < first ? 'em queda' : 'estável'
  return `Gráfico de tendência, ${n} pontos, ${direction}, de ${first} a ${last}`
}

/**
 * Compact trend SVG (sparkline).
 *
 * a11y contract: rendered as `role="img"` with an `aria-label` text summary so
 * the trend is conveyed to assistive tech without exposing the raw `<polyline>`
 * geometry. The drawing itself is decorative (its child shapes are aria-hidden
 * by virtue of the img role collapsing the subtree).
 */
export function Sparkline({
  data,
  w = 90,
  h = 28,
  trend = 'up',
  label,
  className,
  ...rest
}: SparklineProps) {
  const stroke = TRENDS[trend] ?? TRENDS.up
  const pts = toPoints(data, w, h)
  const summary = label ?? describe(data)
  const last = pts[pts.length - 1]

  return (
    <svg
      role="img"
      aria-label={summary}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={`block${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {pts.length > 1 && (
        <polyline
          points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
          fill="none"
          stroke={stroke}
          strokeWidth={1.75}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {last && (
        <circle
          data-ds-spark-endpoint
          cx={last[0]}
          cy={last[1]}
          r={2.2}
          fill={stroke}
        />
      )}
    </svg>
  )
}
