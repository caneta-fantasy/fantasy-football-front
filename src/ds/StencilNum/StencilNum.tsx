import React from 'react'

/**
 * StencilNum — the big "jersey" display numeral used as a data anchor (hero
 * scores, rank numerals, the SignIn stencil). Screens previously hand-rolled
 * this inline with Anton + tabular figures; this is the exported primitive
 * (DS `tokens-modernist.jsx` `StencilNum`).
 *
 * Modernista: no Anton — the poster-display voice is the variable Archivo
 * `disp()` recipe (heavy + wide): `wght 900 / wdth 110`, line-height 0.82,
 * tight tabular tracking. The default tint is the faint `--green-pale`
 * watermark used as a data anchor on white.
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
   * Text color. Defaults to the faint `--green-pale` watermark/data-anchor
   * tint; pass a token like `var(--signature)` or `var(--accent)` to feature it.
   */
  color?: string
}

export function StencilNum({
  value,
  size = 'md',
  color = 'var(--green-pale)',
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
        // Archivo poster voice — heavy + wide via the `disp()` recipe
        // (DS `tokens-modernist.jsx`: wght 900 / wdth 110, lh 0.82).
        fontWeight: 900,
        fontVariationSettings: '"wght" 900, "wdth" 110',
        lineHeight: 0.82,
        // Tight, jersey-style tracking scaled to the numeral (DS: -size*0.03).
        letterSpacing: `${-px * 0.03}px`,
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
