import React from 'react'

/**
 * Decorative-opacity hard cap (§7 #12): a decoration must never exceed 0.15.
 * The modernista `Azulejo` ships a 0.16 default — one point over the cap — so a
 * default `Azulejo` clamps to the legal max. This keeps the faint-tile pattern
 * inside the same decorative invariant as `PitchLines`/`Halftone`.
 */
const DECOR_MAX = 0.15

/** Clamp into the legal decorative-opacity band [0, 0.15] (never throws). */
const capOpacity = (o: number): number =>
  Math.min(DECOR_MAX, Math.max(0, Number.isFinite(o) ? o : 0))

/** Default tile unit; also the fallback when given a non-positive size (no throw). */
const DEFAULT_SIZE = 56

/** Default stroke; also the fallback when given a non-positive width (no throw). */
const DEFAULT_STROKE = 2

/** base64 the SVG tile in either a browser (`btoa`) or Node/test (`Buffer`). */
const toBase64 = (s: string): string =>
  typeof btoa === 'function'
    ? btoa(s)
    : Buffer.from(s, 'utf-8').toString('base64')

export interface AzulejoProps {
  /**
   * Stroke colour of the tile arcs. Defaults to the azulejo cobalt token
   * (`--cobalt`) — the restrained accent hue. Pass any token-backed CSS colour
   * (e.g. `var(--green)`) to recolor.
   */
  color?: string
  /**
   * Tile unit in px — both the SVG cell and the background tiling step.
   * Non-positive/invalid values fall back to 56 (no throw). Default 56.
   */
  size?: number
  /**
   * Layer opacity. Capped at the decorative max (`--opacity-decor-max`, 0.15)
   * — values above are clamped down, negatives to 0 (§7). The modernista
   * default is 0.16, which clamps to 0.15.
   */
  opacity?: number
  /**
   * Arc stroke width in px. Non-positive/invalid values fall back to 2 (no
   * throw). Default 2.
   */
  strokeWidth?: number
  /** Escape-hatch style merged last (e.g. to set `zIndex`). Positioning is enforced. */
  style?: React.CSSProperties
  /** Optional extra classes (kept for parity with other DS primitives). */
  className?: string
}

/**
 * `Azulejo` — the faint tiled Bulcão quarter-arc motif (mid-century Brazilian
 * tile geometry) rendered as a decorative inline-SVG background image. Four
 * quarter-arcs meet at a small centre ring; tiling them yields the woven
 * azulejo lattice used as a restrained cobalt texture behind green/gold panels.
 *
 * Usage: drop inside a **positioned** parent (`relative`/`absolute`); it fills
 * the box via `position: absolute; inset: 0`.
 *
 * a11y contract: `aria-hidden="true"`, no role — it is pure decoration and is
 * never announced. `pointer-events: none` so it never steals interaction. No
 * animation, so reduced-motion is a non-issue.
 */
export function Azulejo({
  color = 'var(--cobalt)',
  size = DEFAULT_SIZE,
  opacity = 0.16,
  strokeWidth = DEFAULT_STROKE,
  style,
  className,
}: AzulejoProps) {
  const s = Number.isFinite(size) && size > 0 ? size : DEFAULT_SIZE
  const sw =
    Number.isFinite(strokeWidth) && strokeWidth > 0
      ? strokeWidth
      : DEFAULT_STROKE
  // Inline SVG tile (fixed 56-unit viewBox; the cell is scaled to `size` via
  // backgroundSize). base64 (rather than a raw utf8 data-URI) keeps the `<`,
  // `#` and quote characters out of the CSS value so it survives strict CSSOM
  // parsers and never trips background-image parsing.
  const svgMarkup =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' viewBox='0 0 56 56'>` +
    `<g fill='none' stroke='${color}' stroke-width='${sw}'>` +
    `<path d='M0 28 A28 28 0 0 1 28 0'/>` +
    `<path d='M56 28 A28 28 0 0 0 28 0'/>` +
    `<path d='M0 28 A28 28 0 0 0 28 56'/>` +
    `<path d='M56 28 A28 28 0 0 1 28 56'/>` +
    `<circle cx='28' cy='28' r='5.5'/>` +
    `</g></svg>`
  const tile = `data:image/svg+xml;base64,${toBase64(svgMarkup)}`

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("${tile}")`,
        backgroundSize: `${s}px ${s}px`,
        pointerEvents: 'none',
        ...style,
        // Enforce the cap last so a caller style can never raise opacity past 0.15.
        opacity: capOpacity(opacity),
      }}
    />
  )
}
