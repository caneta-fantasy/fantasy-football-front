import React from 'react'
import { Overline } from '../Overline/Overline'

/**
 * The five difficulty steps, easiest (1) → hardest (5). This is the canonical
 * domain scale ("FDR" / dificuldade de jogo) from screens/12-data-display.
 */
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5

export interface Fixture {
  /** Opponent short code, e.g. `PAL`, `FLA`. Always rendered verbatim. */
  opponent: string
  /** Difficulty 1 (easiest) … 5 (hardest). Out-of-range values are clamped. */
  difficulty: DifficultyLevel
  /** Optional home/away marker shown under the code (e.g. `C`/`F`, `H`/`A`). */
  venue?: string
}

export interface FixtureDifficultyProps
  extends Omit<React.HTMLAttributes<HTMLOListElement>, 'children'> {
  /** Ordered fixtures to display, soonest first. */
  fixtures: Fixture[]
  /** Accessible name for the whole strip (maps to `aria-label`). */
  label?: string
  /** Show the FÁCIL → DIFÍCIL colour legend below the strip. */
  showLegend?: boolean
  /** Swatch height in px. */
  height?: number
}

interface StepStyle {
  /** Background utility mapped to a token. */
  bg: string
  /**
   * Foreground utility. Chosen per-step from the measured WCAG contrast on each
   * background (see below) — colour is NEVER the only cue because the numeric
   * level is always printed, but the printed number must itself clear AA
   * (≥4.5:1 for the small label).
   */
  fg: string
  /** One-word difficulty label for the accessible name. */
  word: string
}

/**
 * Per-step visual + spoken treatment — a modernista FDR heat ramp built from the
 * functional + signature hues (own hues, never the referee card colours), with
 * the hardest fixture anchored on the deepest bottle-green rather than on a
 * second red, so the five steps stay distinct.
 *
 * Contrast-validated foregrounds for the small numeric label (vs the listed bg):
 *   1 green-pale  #E4EDE7 → green   #14402C  9.76:1  ✓  (calm green = easy)
 *   2 gold-pale   #F4EACB → on-gold #1B1505 15.12:1  ✓
 *   3 warning     #C98A28 → on-gold #1B1505  6.18:1  ✓  (amber)
 *   4 danger      #B23A2B → white   #FFFFFF  5.94:1  ✓  (brick — the functional
 *                                                         hue, NOT card-red)
 *   5 green-deep  #0C2A1D → on-green #F2F1E8 13.57:1  ✓  (deepest anchor = hardest)
 * Every foreground clears AA (≥4.5) for the small numeric label, and colour is
 * never the only cue — the numeric level (1–5) is always printed on the swatch.
 */
const STEPS: Record<DifficultyLevel, StepStyle> = {
  1: { bg: 'bg-signature-pale', fg: 'text-signature', word: 'muito fácil' },
  2: { bg: 'bg-accent-pale', fg: 'text-on-gold', word: 'fácil' },
  3: { bg: 'bg-warning', fg: 'text-on-gold', word: 'médio' },
  4: { bg: 'bg-danger', fg: 'text-white', word: 'difícil' },
  5: {
    bg: 'bg-signature-deep',
    fg: 'text-on-green',
    word: 'muito difícil',
  },
}

/** Coerce any input to a valid 1..5 step, never throwing (default fallback). */
function clampLevel(raw: number): DifficultyLevel {
  if (!Number.isFinite(raw)) return 3
  const n = Math.round(raw)
  if (n < 1) return 1
  if (n > 5) return 5
  return n as DifficultyLevel
}

/**
 * FixtureDifficulty — the 5-step "dificuldade de jogo" (FDR) colour scale.
 *
 * Source: screens/12-data-display.jsx (block D). The prototype encoded
 * difficulty by COLOUR ONLY (a row of coloured opponent chips), which is a
 * WCAG SC 1.4.1 failure. This codification fixes that:
 *
 *  - The numeric level (1–5) is always printed on each swatch — colour is one
 *    of two redundant cues, never the sole one (§7).
 *  - Each swatch's foreground is contrast-validated per step; clay (level 3)
 *    flips to white text because ink900-on-clay is 4.27:1 (< AA), white is
 *    4.52:1 (spec instruction). redDeep (level 5) likewise uses white.
 *  - Built as a real `<ol role="list">` of `<li>`s. Each item carries an
 *    `aria-label` spelling out the opponent and the difficulty word + level,
 *    so a screen reader gets the full meaning without seeing the colour.
 */
export function FixtureDifficulty({
  fixtures,
  label = 'Dificuldade dos próximos jogos',
  showLegend = false,
  height = 26,
  className,
  ...rest
}: FixtureDifficultyProps) {
  const items = fixtures.map((f) => {
    const level = clampLevel(f.difficulty as number)
    if (
      level !== (f.difficulty as number) &&
      process.env.NODE_ENV !== 'production'
    ) {
      console.warn(
        `[FixtureDifficulty] difficulty "${f.difficulty}" for "${f.opponent}" ` +
          `is outside 1..5 and was clamped to ${level}.`,
      )
    }
    return { ...f, level, code: String(f.opponent ?? '').toUpperCase() }
  })

  const cls = ['flex items-stretch gap-1', className].filter(Boolean).join(' ')

  return (
    <div>
      <ol role="list" aria-label={label} className={cls} {...rest}>
        {items.map((f, i) => {
          const style = STEPS[f.level] ?? STEPS[3]
          const venueText = f.venue ? ` (${f.venue})` : ''
          return (
            <li
              key={`${f.code}-${i}`}
              aria-label={`${f.code}${venueText}: dificuldade ${f.level} de 5 — ${style.word}`}
              className="flex-1 text-center"
            >
              <div
                data-difficulty={f.level}
                className={`flex flex-col items-center justify-center gap-px rounded-pill px-1 font-sans font-bold leading-none ${style.bg} ${style.fg}`}
                style={{ minHeight: height }}
              >
                {/* Both cues are aria-hidden — the <li> aria-label is the single
                    spoken announcement, but the glyphs remain the visible,
                    non-colour signal for sighted users. */}
                <span aria-hidden="true" className="text-[9px] tracking-[0.4px]">
                  {f.code}
                </span>
                <span aria-hidden="true" className="text-[11px]">
                  {f.level}
                </span>
              </div>
              {f.venue && (
                <span
                  aria-hidden="true"
                  className="mt-1 block font-sans text-[8px] font-bold text-text-muted"
                >
                  {f.venue}
                </span>
              )}
            </li>
          )
        })}
      </ol>

      {showLegend && (
        <div className="mt-2 flex items-center gap-2">
          <Overline as="span" className="!text-[8.5px] !tracking-[1.4px]">
            Fácil
          </Overline>
          <div
            aria-hidden="true"
            className="flex flex-1 overflow-hidden rounded-pill"
          >
            {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((l) => (
              <span
                key={l}
                className={`h-[6px] flex-1 ${(STEPS[l] ?? STEPS[3]).bg}`}
              />
            ))}
          </div>
          <Overline as="span" className="!text-[8.5px] !tracking-[1.4px]">
            Difícil
          </Overline>
        </div>
      )}
    </div>
  )
}
