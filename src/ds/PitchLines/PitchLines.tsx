import React from 'react'

/** Decorative-opacity hard cap (§7 #12): a decoration must never exceed 0.15. */
const DECOR_MAX = 0.15

/** Clamp into the legal decorative-opacity band [0, 0.15]. */
const capOpacity = (o: number): number =>
  Math.min(DECOR_MAX, Math.max(0, Number.isFinite(o) ? o : 0))

export interface PitchLinesProps {
  /**
   * Layer opacity. Capped at the decorative max (`--opacity-decor-max`, 0.15)
   * — values above are clamped down, negatives to 0 (§7). Default 0.08.
   */
  opacity?: number
  /**
   * Stroke colour of the pitch markings. Defaults to the chalk token so the
   * lines read on a dark surface. Pass any CSS colour to override.
   */
  color?: string
  /** Escape-hatch style merged last (e.g. to set `zIndex`). Positioning is enforced. */
  style?: React.CSSProperties
  /** Optional extra classes (kept for parity with other DS primitives). */
  className?: string
}

/**
 * `PitchLines` — the top-and-bottom-half soccer-pitch markings rendered as a
 * decorative SVG paint layer.
 *
 * Usage: drop inside a **positioned** parent (`relative`/`absolute`); it fills
 * the box via `position: absolute; inset: 0`.
 *
 * a11y contract: `aria-hidden="true"`, no role — it is pure decoration and is
 * never announced. `pointer-events: none` so it never steals interaction. No
 * animation, so reduced-motion is a non-issue.
 */
export function PitchLines({
  opacity = 0.08,
  color = 'var(--chalk)',
  style,
  className,
}: PitchLinesProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 800 480"
      preserveAspectRatio="none"
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        ...style,
        // Enforce the cap last so a caller style can never raise opacity past 0.15.
        opacity: capOpacity(opacity),
      }}
    >
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
    </svg>
  )
}
