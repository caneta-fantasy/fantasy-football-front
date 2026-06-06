import React from 'react'

/** Default width; also the fallback when given a non-positive value (no throw). */
const DEFAULT_W = 200

/** Default height; also the fallback when given a non-positive value (no throw). */
const DEFAULT_H = 120

/**
 * `ArchShape` — the half-stadium Niemeyer curve rendered as a pure `<svg><path>`
 * graphic device (DS `tokens-modernist.jsx` `ArchShape`). A flat gold block
 * whose top is swept into one big arc: the signature modernista tension of a
 * strict editorial grid interrupted by a single generous curve. Use it as an
 * accent block in a hero (e.g. the once-per-screen Niemeyer curve on SignIn).
 *
 * The path draws a rectangle whose top edge is replaced by a semicircular arc:
 * it rises from the bottom corners to `h * 0.55`, sweeps over a half-circle of
 * radius `w / 2`, and closes — a half-stadium silhouette.
 *
 * a11y contract: this is **pure decoration**. The `<svg>` is `aria-hidden`,
 * exposes no `role`/`<title>`, and sets `pointer-events: none` so it is never
 * announced and never intercepts interaction. No animation, so reduced-motion
 * is a non-issue. Any meaning the arch frames must be carried by adjacent
 * functional text.
 */
export interface ArchShapeProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'fill' | 'width' | 'height'> {
  /** Width of the arch in px. Non-positive/invalid falls back to 200 (no throw). */
  w?: number
  /** Height of the arch in px. Non-positive/invalid falls back to 120 (no throw). */
  h?: number
  /**
   * Fill color, as a token-backed CSS value. Defaults to the signature gold
   * accent (`--gold`); pass another token (e.g. `var(--green)`) to recolor.
   */
  fill?: string
}

export function ArchShape({
  w = DEFAULT_W,
  h = DEFAULT_H,
  fill = 'var(--gold)',
  style,
  ...rest
}: ArchShapeProps) {
  // Resolve safe dimensions: a non-positive/NaN value falls back to the default
  // so a bad prop can never produce an invalid viewBox or path (§7 no-throw).
  const width = Number.isFinite(w) && (w as number) > 0 ? (w as number) : DEFAULT_W
  const height =
    Number.isFinite(h) && (h as number) > 0 ? (h as number) : DEFAULT_H

  // Half-stadium silhouette (DS `ArchShape`): up the left side to 55% height,
  // a half-circle of radius w/2 over the top, down the right side, close.
  const d =
    `M0 ${height} ` +
    `L0 ${height * 0.55} ` +
    `A ${width / 2} ${width / 2} 0 0 1 ${width} ${height * 0.55} ` +
    `L ${width} ${height} Z`

  return (
    <svg
      aria-hidden="true"
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ display: 'block', pointerEvents: 'none', ...style }}
      {...rest}
    >
      <path d={d} fill={fill} />
    </svg>
  )
}
