import React from 'react'

/** Decorative-opacity hard cap (§7 #12): a decoration must never exceed 0.15. */
const DECOR_MAX = 0.15

/** Clamp into the legal decorative-opacity band [0, 0.15]. */
const capOpacity = (o: number): number =>
  Math.min(DECOR_MAX, Math.max(0, Number.isFinite(o) ? o : 0))

/** Clamp into the full legal opacity band [0, 1] (feature variant — uncapped). */
const clampOpacity = (o: number): number =>
  Math.min(1, Math.max(0, Number.isFinite(o) ? o : 1))

export type PitchLinesVariant = 'watermark' | 'feature'

export interface PitchLinesProps {
  /**
   * Render mode.
   * - `watermark` (default): a faint decorative paint layer. Opacity is hard
   *   capped at the decorative max (`--opacity-decor-max`, 0.15) so a texture
   *   moment can never dominate content. Fills its positioned parent.
   * - `feature`: an opt-in, high-opacity **green color-block pitch diagram** — a
   *   real modernista graphic device (solid bottle-green field, pale-chalk
   *   markings) drawn at full strength. Painted on its own green block so it can
   *   stand alone as a figure; opacity is NOT capped here (it is intentional
   *   foreground graphic, not a watermark). Still decorative (`aria-hidden`).
   */
  variant?: PitchLinesVariant
  /**
   * Layer opacity. In `watermark` mode it is capped at 0.15 (values above are
   * clamped down, negatives to 0). In `feature` mode it spans the full [0, 1]
   * band. Defaults: 0.08 (watermark), 1 (feature).
   */
  opacity?: number
  /**
   * Stroke colour of the pitch markings. Defaults to the pitch-line chalk token
   * so the lines read on a dark surface. Pass any CSS colour to override.
   */
  color?: string
  /**
   * Field fill behind the markings — `feature` mode only (the green color
   * block). Defaults to the pitch token (bottle green). Ignored for watermark.
   */
  fill?: string
  /** Escape-hatch style merged last (e.g. to set `zIndex`). Positioning is enforced. */
  style?: React.CSSProperties
  /** Optional extra classes (kept for parity with other DS primitives). */
  className?: string
}

// The pitch markings, shared by both variants.
function Markings({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth="2">
      <rect x="6" y="6" width="788" height="468" />
      <line x1="6" y1="240" x2="794" y2="240" />
      <circle cx="400" cy="240" r="74" />
      <circle cx="400" cy="240" r="2" fill={color} />
      <rect x="270" y="6" width="260" height="92" />
      <rect x="340" y="6" width="120" height="34" />
      <path d="M 320 98 A 80 80 0 0 0 480 98" />
      <rect x="270" y="382" width="260" height="92" />
      <rect x="340" y="440" width="120" height="34" />
      <path d="M 320 382 A 80 80 0 0 1 480 382" />
    </g>
  )
}

/**
 * `PitchLines` — the top-and-bottom-half soccer-pitch markings as a graphic.
 *
 * Two modes, one geometry:
 * - **watermark** (default): a faint decorative SVG paint layer, opacity hard
 *   capped at the decorative max (0.15). Drop inside a **positioned** parent
 *   (`relative`/`absolute`); it fills the box via `position: absolute; inset: 0`.
 * - **feature**: an opt-in, full-strength **green color-block pitch diagram** —
 *   a modernista figure (solid bottle-green field + pale-chalk markings) that
 *   stands on its own block. Opacity is uncapped here because it is intentional
 *   foreground graphic, not a watermark. The decorative cap is preserved for the
 *   watermark path rather than lifted globally.
 *
 * a11y contract: `aria-hidden="true"`, no role — pure decoration in BOTH modes,
 * never announced. `pointer-events: none` so it never steals interaction. No
 * animation, so reduced-motion is a non-issue.
 */
export function PitchLines({
  variant = 'watermark',
  opacity,
  color = 'var(--pitch-line)',
  fill = 'var(--pitch)',
  style,
  className,
}: PitchLinesProps) {
  const isFeature = variant === 'feature'

  if (isFeature) {
    // Feature: a self-contained green color-block diagram. The green field is
    // painted by the SVG itself so it reads as a standalone figure. Opacity is
    // uncapped (intentional graphic) — the decorative cap stays on the
    // watermark path only.
    const featureOpacity = clampOpacity(opacity ?? 1)
    return (
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 800 480"
        preserveAspectRatio="xMidYMid meet"
        data-variant="feature"
        className={className}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          ...style,
          opacity: featureOpacity,
        }}
      >
        <rect x="0" y="0" width="800" height="480" fill={fill} />
        <Markings color={color} />
      </svg>
    )
  }

  // Watermark: the faint decorative paint layer, opacity hard capped at 0.15.
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 800 480"
      preserveAspectRatio="none"
      data-variant="watermark"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
        // Enforce the cap last so a caller style can never raise opacity past 0.15.
        opacity: capOpacity(opacity ?? 0.08),
      }}
    >
      <Markings color={color} />
    </svg>
  )
}
