import React from 'react'

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
   * Foreground utility. Chosen per-step from the measured WCAG contrast of
   * ink900 vs white on each background (see below) — colour is NEVER the only
   * cue because the numeric level is always printed, but the printed number
   * must itself clear AA (≥4.5:1 for the small mono text).
   */
  fg: string
  /** One-word difficulty label for the accessible name. */
  word: string
}

/**
 * Per-step visual + spoken treatment.
 *
 * §7 / spec fix — contrast-validated foregrounds (ink900 #0B0F0C vs white):
 *   1 lime    #D8FF3D → ink900 16.81:1  ✓  (white 1.15 ✗)
 *   2 yellow  #FFC42E → ink900 12.12:1  ✓  (white 1.59 ✗)
 *   3 clay    #C5532D → ink900  4.27:1  ✗  → WHITE 4.52:1 ✓  (spec: flip to white)
 *   4 red     #E5453A → ink900  4.82:1  ✓  (white 4.00 ✗; matches §7 #3 ink-on-red)
 *   5 redDeep #B82C22 → ink900  3.15:1  ✗  → WHITE 6.14:1 ✓
 * Every retained foreground clears AA (≥4.5) for the small numeric label.
 */
const STEPS: Record<DifficultyLevel, StepStyle> = {
  1: { bg: 'bg-lime', fg: 'text-ink-900', word: 'muito fácil' },
  2: { bg: 'bg-yellow', fg: 'text-ink-900', word: 'fácil' },
  3: {
    bg: 'bg-clay',
    fg: 'text-[color:var(--color-text-on-dark)]',
    word: 'médio',
  },
  4: { bg: 'bg-red', fg: 'text-ink-900', word: 'difícil' },
  5: {
    bg: 'bg-[color:var(--red-deep)]',
    fg: 'text-[color:var(--color-text-on-dark)]',
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
                className={`flex flex-col items-center justify-center gap-px rounded-xs px-1 font-mono font-bold leading-none ${style.bg} ${style.fg}`}
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
                  className="mt-1 block font-mono text-[8px] text-text-muted"
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
          <span className="font-mono text-[8.5px] uppercase tracking-[0.4px] text-text-muted">
            Fácil
          </span>
          <div
            aria-hidden="true"
            className="flex flex-1 overflow-hidden rounded-xs"
          >
            {([1, 2, 3, 4, 5] as DifficultyLevel[]).map((l) => (
              <span
                key={l}
                className={`h-[6px] flex-1 ${(STEPS[l] ?? STEPS[3]).bg}`}
              />
            ))}
          </div>
          <span className="font-mono text-[8.5px] uppercase tracking-[0.4px] text-text-muted">
            Difícil
          </span>
        </div>
      )}
    </div>
  )
}
