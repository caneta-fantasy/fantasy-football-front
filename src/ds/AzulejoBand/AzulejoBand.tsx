import React from 'react'

/** Default tile unit; also the fallback when given a non-positive size (no throw). */
const DEFAULT_SIZE = 60

/** base64 the SVG tile in either a browser (`btoa`) or Node/test (`Buffer`). */
const toBase64 = (s: string): string =>
  typeof btoa === 'function'
    ? btoa(s)
    : Buffer.from(s, 'utf-8').toString('base64')

export interface AzulejoBandProps {
  /**
   * The solid foreground tile colour (the filled half-circle blocks). Defaults
   * to the azulejo cobalt token (`--cobalt`). Pass any token-backed CSS colour.
   */
  a?: string
  /**
   * The background colour the half-circles sit on. Defaults to white
   * (`--paper`). Pass a token to match the surface the band divides.
   */
  b?: string
  /**
   * Tile unit in px — both the SVG cell and the background tiling step.
   * Non-positive/invalid values fall back to 60 (no throw). Default 60.
   */
  size?: number
  /** Escape-hatch style merged last (e.g. to set `zIndex`). Positioning is enforced. */
  style?: React.CSSProperties
  /** Optional extra classes (kept for parity with other DS primitives). */
  className?: string
}

/**
 * `AzulejoBand` — a solid two-tone Bulcão half-circle tile band, used as a
 * color-block divider or hero footer. Unlike `Azulejo` (a faint watermark
 * texture), this is a fully opaque graphic band: filled cobalt half-circles
 * woven against a white field. It is therefore **not** opacity-capped — it is a
 * surface decoration, not a watermark.
 *
 * Usage: drop inside a **positioned** parent (`relative`/`absolute`); it fills
 * the box via `position: absolute; inset: 0`. Give the parent an explicit
 * height (e.g. the tile `size`) to use it as a divider strip.
 *
 * a11y contract: `aria-hidden="true"`, no role — pure decoration, never
 * announced. `pointer-events: none` so it never steals interaction. No
 * animation, so reduced-motion is a non-issue.
 */
export function AzulejoBand({
  a = 'var(--cobalt)',
  b = 'var(--paper)',
  size = DEFAULT_SIZE,
  style,
  className,
}: AzulejoBandProps) {
  const s = Number.isFinite(size) && size > 0 ? size : DEFAULT_SIZE
  // Inline SVG tile (fixed 60-unit viewBox; the cell is scaled to `size` via
  // backgroundSize). Two filled quarter-circle quadrants on a `b` field.
  // base64 (rather than a raw utf8 data-URI) keeps the `<`, `#` and quote
  // characters out of the CSS value so it survives strict CSSOM parsers.
  const svgMarkup =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' viewBox='0 0 60 60'>` +
    `<rect width='60' height='60' fill='${b}'/>` +
    `<path d='M0 30 A30 30 0 0 1 30 0 L30 30 Z' fill='${a}'/>` +
    `<path d='M60 60 A30 30 0 0 1 30 60 L30 30 Z' fill='${a}'/>` +
    `</svg>`
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
      }}
    />
  )
}
