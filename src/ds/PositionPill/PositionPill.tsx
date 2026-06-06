import React from 'react'
import './PositionPill.css'

/**
 * Position codes the league recognises. The set spans two taxonomies:
 *  - the broadcast/lineup codes (GOL / ZAG / LAT / MEI / ATA / TEC), and
 *  - the roster codes (GOL / DEF / MEI / ATA / BN).
 * Anything outside this set is rendered with a NEUTRAL style (never silently
 * coerced to MEI — §7 #9).
 */
export type PositionCode =
  | 'GOL'
  | 'ZAG'
  | 'LAT'
  | 'MEI'
  | 'ATA'
  | 'TEC'
  | 'DEF'
  | 'BN'

export interface PositionPillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Position abbreviation, e.g. `GOL`, `ZAG`, `LAT`, `MEI`, `ATA`, `TEC`, `DEF`, `BN`. */
  code: string
}

interface PosStyle {
  /** Tailwind classes mapped to modernista tokens. */
  cls: string
  /** Spelled-out accessible name. */
  label: string
}

/**
 * Each known code gets its own modernista treatment AND its own spoken label.
 *
 * Modernista palette (Plan B5):
 *  - GOL = card-yellow / ink (keeper — yellow allowed here as a position-hue
 *    echo; this is the ONE sanctioned non-referee use of card-yellow).
 *  - ZAG = cobalt (SOLID) / white.
 *  - LAT = cobalt-light family, OUTLINED + diagonal-stripe (`ds-pos-lat`).
 *  - MEI = green / on-green.
 *  - ATA = gold / on-gold.
 *  - TEC = ink-muted / white.
 *  - DEF = green / on-green (roster defenders — same green family as MEI; the
 *    3-letter glyph + spelled label keep them distinguishable).
 *  - BN  = ink-muted / white (bench — same neutral family as TEC).
 *
 * §7 #9 fixes baked in here:
 *  - ZAG vs LAT do NOT share an identical look. Both are cobalt-family, but ZAG
 *    is a SOLID fill while LAT is OUTLINED with a diagonal-stripe pattern
 *    (`ds-pos-lat`) — a structural cue that survives greyscale, not a hue alone.
 *  - The 3-letter code is always the visible glyph, so colour is never the only
 *    cue; an `aria-label` additionally spells the role out.
 */
const POSITIONS: Record<PositionCode, PosStyle> = {
  GOL: {
    cls: 'bg-card-yellow text-ink',
    label: 'Goleiro',
  },
  ZAG: {
    // Solid cobalt fill — the structural counterpart to LAT's outline.
    cls: 'bg-cobalt text-white',
    label: 'Zagueiro',
  },
  LAT: {
    // Outlined + striped: same cobalt family as ZAG, deliberately NOT identical.
    cls: 'ds-pos-lat bg-transparent text-cobalt-deep border border-cobalt-light',
    label: 'Lateral',
  },
  MEI: {
    cls: 'bg-signature text-on-green',
    label: 'Meia',
  },
  ATA: {
    cls: 'bg-accent text-on-gold',
    label: 'Atacante',
  },
  TEC: {
    cls: 'bg-ink-muted text-white',
    label: 'Técnico',
  },
  DEF: {
    // Roster defenders — green family (shares the hue with MEI; the glyph +
    // spelled label carry the distinction).
    cls: 'bg-signature text-on-green',
    label: 'Defensor',
  },
  BN: {
    // Bench — neutral ink-muted (shares the hue with TEC).
    cls: 'bg-ink-muted text-white',
    label: 'Reserva',
  },
}

/**
 * Neutral treatment for codes outside the known set. No fill, just a bordered
 * inset chip with muted text — visually distinct from every known position so
 * an unrecognised code reads as "unknown", not as a mislabelled MEI.
 */
const NEUTRAL: PosStyle = {
  cls: 'bg-mist text-ink-muted border border-line-strong',
  label: 'Posição',
}

const BASE =
  'inline-flex items-center justify-center align-middle select-none ' +
  'w-[30px] h-[18px] rounded-pill font-sans font-extrabold ' +
  'text-[10px] leading-none tracking-[0.6px] whitespace-nowrap overflow-hidden'

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
