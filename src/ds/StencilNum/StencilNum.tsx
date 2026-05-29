import React from 'react'

/**
 * StencilNum — the big "jersey" display numeral used as a data anchor (hero
 * scores, rank numerals, the SignIn stencil). Screens previously hand-rolled
 * this inline with Anton + tabular figures; this is the exported primitive
 * (DS `tokens.jsx` `StencilNum`).
 *
 * a11y contract: the numeral is **decorative** — the real value is always
 * conveyed by adjacent functional text/labels, so this renders `aria-hidden`
 * and exposes no role or accessible name. (Pass `aria-hidden={false}` only if
 * a specific composition genuinely needs it announced.)
 *
 * Styling is intrinsically per-instance (font-size drives letter-spacing), so
 * the size/color land as inline style on top of the `font-display` utility
 * rather than as Tailwind classes.
 */
type SizeToken = 'sm' | 'md' | 'lg' | 'xl'

// Semantic sizes → px. `md` is the default. Numbers echo the DS usages:
// inline rank (~48), matchup hero (~88), foundations data anchor (120).
const SIZES: Record<SizeToken, number> = {
  sm: 48,
  md: 80,
  lg: 120,
  xl: 220,
}

export interface StencilNumProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** The numeral to display (string keeps leading zeros, e.g. "09"). */
  value: string | number
  /**
   * Semantic size token (`sm | md | lg | xl`) or a raw pixel number as an
   * escape hatch. An unknown token falls back to `md` (never throws).
   */
  size?: SizeToken | number
  /**
   * Text color. Defaults to the faint `--ink-50` used for the watermark/data
   * anchor treatment; pass a token like `var(--caneta-lime)` to feature it.
   */
  color?: string
}

export function StencilNum({
  value,
  size = 'md',
  color = 'var(--ink-50)',
  className,
  style,
  ...rest
}: StencilNumProps) {
  // Resolve a numeric pixel size: raw number passes through; a token resolves
  // via the map with an `md` fallback so an unknown key never throws (§7 #1).
  const px = typeof size === 'number' ? size : SIZES[size] ?? SIZES.md

  return (
    <span
      aria-hidden="true"
      className={`font-display ${className ?? ''}`.trim()}
      style={{
        fontSize: `${px}px`,
        lineHeight: 0.85,
        // Tight, jersey-style tracking scaled to the numeral (DS: -size*0.04).
        letterSpacing: `${-px * 0.04}px`,
        fontVariantNumeric: 'tabular-nums',
        color,
        display: 'inline-block',
        ...style,
      }}
      {...rest}
    >
      {value}
    </span>
  )
}
