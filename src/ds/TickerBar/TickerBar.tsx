import React from 'react'

/**
 * TickerBar (Placar) — the broadcast scoreboard band. A flat, full-width strip
 * of score/stat cells under a gold top rule, used as a "your-matchup" placar on
 * the schedule screen and as a compact live scoreline elsewhere
 * (DS `tokens-modernist.jsx` `TickerBar`).
 *
 * Modernista anatomy: a 40px-tall flex row, a 3px gold top rule (the broadcast
 * signature), hairline cell dividers; each cell carries an optional uppercase
 * gold `tag` (team/label), the uppercase `text`, and an optional `val` rendered
 * in the Archivo poster voice with tabular figures so columns of digits align.
 * Two tones: `green` (bottle-green band, warm-white text) and `white` (white
 * band, ink text with a bottom hairline).
 *
 * a11y contract:
 * - The band is a landmark: `role="region"` + an `aria-label` (default
 *   "Placar") so assistive tech can find and name the scoreboard.
 * - Set `live` when the values update in place (a running scoreline): it adds
 *   `aria-live="polite"` so changed scores are announced without stealing
 *   focus. Leave it off for a static placar so SR users are not spammed.
 * - The cell content (`tag`, `text`, `val`) is **real text** and stays in the
 *   a11y tree. Only the divider rules and the gold top rule are presentational
 *   (pure CSS borders), so there is nothing decorative to hide.
 * - There is **no auto-scroll / marquee**: the band is static and never moves,
 *   so it cannot violate `prefers-reduced-motion`. A future scrolling variant
 *   would have to gate its animation behind a reduced-motion guard — this one
 *   sidesteps the issue by not moving at all.
 */
export interface TickerItem {
  /**
   * Optional short uppercase label rendered in gold before the text — a team
   * abbreviation, round tag, or status word (e.g. "FLA", "RODADA 12", "AO VIVO").
   * Real content, kept in the a11y tree.
   */
  tag?: string
  /** The cell's primary text (uppercased visually); real content. */
  text: string
  /**
   * Optional value rendered in the Archivo poster voice with tabular figures —
   * a score, points total, or stat. String keeps leading zeros / decimals.
   */
  val?: string | number
}

export type TickerTone = 'green' | 'white'

export interface TickerBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** The scoreboard cells, left to right. */
  items: TickerItem[]
  /**
   * Band tone. `green` is the bottle-green broadcast band (warm-white text);
   * `white` is the light band (ink text, bottom hairline). Unknown values fall
   * back to `green` (no throw — §7 #1). Default `green`.
   */
  tone?: TickerTone
  /**
   * The accessible name for the region landmark. Defaults to "Placar"
   * (Portuguese for scoreboard).
   */
  label?: string
  /**
   * Set when the values update in place (a running scoreline) so the band
   * announces changes via `aria-live="polite"`. Off for a static placar.
   * Default `false`.
   */
  live?: boolean
}

// Tone → band classes mapped to modernista tokens. Both tones carry the 3px
// gold top rule (the broadcast signature). `green` is the solid bottle-green
// band with warm-white text and no bottom rule; `white` adds a bottom hairline
// for separation on a white page. Contrast (vs the listed bg) is AA at 11-15px:
//   green  on-green / green   10.3:1
//   white  ink / white        16.7:1
const TONES: Record<TickerTone, string> = {
  green:
    'bg-signature text-on-green border-t-[3px] border-t-accent',
  white:
    'bg-white text-ink border-t-[3px] border-t-accent border-b border-b-line',
}

// Cell divider color follows the tone: a green hairline on the green band, the
// neutral line token on the white band.
const CELL_DIVIDER: Record<TickerTone, string> = {
  green: 'border-r border-r-signature-line',
  white: 'border-r border-r-line',
}

// The gold tag color shifts per tone for contrast: the lighter gold reads on
// the dark green band; the deeper gold reads on white.
const TAG_COLOR: Record<TickerTone, string> = {
  green: 'text-accent-light',
  white: 'text-accent-deep',
}

// The value color: warm-white on green, signature green on white. Always the
// Archivo poster voice with tabular figures so digit columns align.
const VAL_COLOR: Record<TickerTone, string> = {
  green: 'text-on-green',
  white: 'text-signature',
}

const BAND_BASE =
  'flex items-center h-[40px] overflow-hidden whitespace-nowrap'

const CELL_BASE =
  'flex items-center gap-[9px] px-[20px] h-full font-sans font-medium ' +
  'text-[12px] tracking-[0.2px]'

export function TickerBar({
  items,
  tone = 'green',
  label = 'Placar',
  live = false,
  className,
  ...rest
}: TickerBarProps) {
  // Unknown tone falls back to green (no throw — §7 #1).
  const bandTone = TONES[tone] ?? TONES.green
  const safeTone: TickerTone = bandTone === TONES.white ? 'white' : 'green'

  const cls = [BAND_BASE, bandTone, className].filter(Boolean).join(' ')

  return (
    <div
      role="region"
      aria-label={label}
      aria-live={live ? 'polite' : undefined}
      className={cls}
      {...rest}
    >
      {items.map((it, i) => (
        <div
          key={i}
          className={`${CELL_BASE} ${CELL_DIVIDER[safeTone]}`}
        >
          {it.tag && (
            <span
              className={`font-extrabold uppercase tracking-[1px] text-[10.5px] ${TAG_COLOR[safeTone]}`}
            >
              {it.tag}
            </span>
          )}
          <span className="uppercase text-[11px] tracking-[0.6px]">
            {it.text}
          </span>
          {it.val != null && it.val !== '' && (
            <span
              className={`font-display font-extrabold text-[15px] leading-none tabular-nums ${VAL_COLOR[safeTone]}`}
              style={{ fontVariationSettings: '"wght" 800, "wdth" 110' }}
            >
              {it.val}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
