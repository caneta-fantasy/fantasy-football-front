import React from 'react'

/** Decorative-opacity hard cap (§7 #12): a decoration must never exceed 0.15. */
const DECOR_MAX = 0.15

/** Clamp into the legal decorative-opacity band [0, 0.15]. */
const capOpacity = (o: number): number =>
  Math.min(DECOR_MAX, Math.max(0, Number.isFinite(o) ? o : 0))

/** Default dot unit; also the fallback when given a non-positive size (no throw). */
const DEFAULT_SIZE = 4

/** base64 the SVG tile in either a browser (`btoa`) or Node/test (`Buffer`). */
const toBase64 = (s: string): string =>
  typeof btoa === 'function'
    ? btoa(s)
    : Buffer.from(s, 'utf-8').toString('base64')

export interface HalftoneProps {
  /**
   * Layer opacity. Capped at the decorative max (`--opacity-decor-max`, 0.15)
   * — values above are clamped down, negatives to 0 (§7). Default 0.15.
   */
  opacity?: number
  /**
   * Dot unit in px. The tiling cell is `2 * size`; each dot has radius
   * `0.45 * size`. Non-positive/invalid values fall back to 4 (no throw).
   */
  size?: number
  /**
   * Dot colour. Defaults to the ink-900 token for the "broadcast print" look;
   * pass a light colour over dark surfaces.
   */
  color?: string
  /** Escape-hatch style merged last (e.g. to set `zIndex`). Positioning is enforced. */
  style?: React.CSSProperties
  /** Optional extra classes (kept for parity with other DS primitives). */
  className?: string
}

/**
 * `Halftone` — a tiling dot pattern used for "broadcast print" texture moments,
 * rendered as a decorative inline-SVG background image.
 *
 * Usage: drop inside a **positioned** parent (`relative`/`absolute`); it fills
 * the box via `position: absolute; inset: 0`.
 *
 * a11y contract: `aria-hidden="true"`, no role — pure decoration, never
 * announced. `pointer-events: none` so it never steals interaction. No
 * animation, so reduced-motion is a non-issue.
 */
export function Halftone({
  opacity = 0.15,
  size = DEFAULT_SIZE,
  color = 'var(--ink-900)',
  style,
  className,
}: HalftoneProps) {
  const s = Number.isFinite(size) && size > 0 ? size : DEFAULT_SIZE
  const cell = s * 2
  // Inline SVG dot tile, base64-encoded. base64 (rather than a raw utf8
  // data-URI) keeps the `<`, `#` and quote characters out of the CSS value so
  // it survives strict CSSOM parsers and never trips background-image parsing.
  const svgMarkup =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${cell}' height='${cell}'>` +
    `<circle cx='${s}' cy='${s}' r='${s * 0.45}' fill='${color}'/></svg>`
  const dotSvg = `data:image/svg+xml;base64,${toBase64(svgMarkup)}`

  return (
    <div
      aria-hidden="true"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: `url("${dotSvg}")`,
        backgroundSize: `${cell}px ${cell}px`,
        pointerEvents: 'none',
        ...style,
        // Enforce the cap last so a caller style can never raise opacity past 0.15.
        opacity: capOpacity(opacity),
      }}
    />
  )
}
