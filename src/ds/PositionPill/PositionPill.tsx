import React from 'react'
import './PositionPill.css'

/**
 * Outfield/position codes the league recognises. Anything outside this set is
 * rendered with a NEUTRAL style (never silently coerced to MEI — §7 #9).
 */
export type PositionCode = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA' | 'TEC'

export interface PositionPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Position abbreviation, e.g. `GOL`, `ZAG`, `LAT`, `MEI`, `ATA`, `TEC`. */
  code: string
}

interface PosStyle {
  /** Tailwind classes mapped to tokens. */
  cls: string
  /** Spelled-out accessible name. */
  label: string
}

/**
 * Each known code gets its own visual treatment AND its own spoken label.
 *
 * §7 #9 fixes baked in here:
 *  - ZAG vs LAT no longer share an identical look. Both are blue-family
 *    (`--pos-blue`), but ZAG is a SOLID fill while LAT is OUTLINED with a
 *    diagonal-stripe pattern (`ds-pos-lat`) — a structural cue, not a hue.
 *  - ATA uses the danger-fg token (ink900) rather than white-on-red (§7 #3).
 *  - The blue is the `--pos-blue` token, not an off-palette literal.
 *  - The 3-letter code is always the visible glyph, so colour is never the
 *    only cue; an `aria-label` additionally spells the role out.
 */
const POSITIONS: Record<PositionCode, PosStyle> = {
  GOL: {
    cls: 'bg-yellow text-[color:var(--color-on-lime)]',
    label: 'Goleiro',
  },
  ZAG: {
    cls: 'bg-[color:var(--pos-blue)] text-ink-900',
    label: 'Zagueiro',
  },
  LAT: {
    // Outlined + striped: same blue family as ZAG, deliberately NOT identical.
    cls:
      'ds-pos-lat bg-transparent text-ink-900 ' +
      'border border-[color:var(--pos-blue)]',
    label: 'Lateral',
  },
  MEI: {
    cls: 'bg-lime text-[color:var(--color-on-lime)]',
    label: 'Meia',
  },
  ATA: {
    // §7 #3: ink900 on red, never white-on-red.
    cls: 'bg-red text-[color:var(--color-danger-fg)]',
    label: 'Atacante',
  },
  TEC: {
    cls: 'bg-ink-900 text-text-on-dark',
    label: 'Técnico',
  },
}

/**
 * Neutral treatment for codes outside the known set. No fill, just a bordered
 * inset chip with muted text — visually distinct from every known position so
 * an unrecognised code reads as "unknown", not as a mislabelled MEI.
 */
const NEUTRAL: PosStyle = {
  cls:
    'bg-surface-inset text-text-muted ' +
    'border border-[color:var(--color-border-strong)]',
  label: 'Posição',
}

const BASE =
  'inline-flex items-center justify-center align-middle select-none ' +
  'w-[30px] h-[18px] rounded-xs font-sans font-bold ' +
  'text-[10px] leading-none tracking-[0.8px] whitespace-nowrap overflow-hidden'

export function PositionPill({
  code,
  className,
  ...rest
}: PositionPillProps) {
  const key = String(code ?? '').toUpperCase()
  const known = Object.prototype.hasOwnProperty.call(POSITIONS, key)
  const style = known ? POSITIONS[key as PositionCode] : NEUTRAL

  if (!known && process.env.NODE_ENV !== 'production') {
    // Surface the typo/data issue instead of silently masking it.
    console.warn(
      `[PositionPill] Unknown position code "${code}". ` +
        `Rendering a neutral pill — no MEI fallback. ` +
        `Known codes: ${Object.keys(POSITIONS).join(', ')}.`,
    )
  }

  const accessibleName = known ? style.label : `Posição ${key || 'desconhecida'}`

  const cls = [BASE, style.cls, className].filter(Boolean).join(' ')

  return (
    <span
      data-position={key}
      role="img"
      aria-label={accessibleName}
      className={cls}
      {...rest}
    >
      {/* Visible glyph is the abbreviation itself; aria-hidden so the
          accessible name (the spelled-out role) is the single announcement. */}
      <span aria-hidden="true">{key}</span>
    </span>
  )
}
