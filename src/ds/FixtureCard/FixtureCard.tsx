import React from 'react'
import { Crest } from '../Crest/Crest'
import { LiveChip } from '../LivePoints/LiveChip'

/**
 * FixtureCard — a single match tile for the four real fixture states the
 * design system specifies (`screens/13-fantasy-patterns.jsx`, Block B):
 * pre-match, live, finished, postponed.
 *
 * a11y contract:
 * - The card is a real `<article>` landmark with an `aria-label` that names
 *   both clubs and the current state, so a screen reader announces the whole
 *   fixture as one self-contained unit.
 * - State is communicated by TEXT, never by color alone: each state carries an
 *   explicit status word ("A SAIR" / "AO VIVO" / "ENCERRADO" / "ADIADO").
 * - In the live state the status row is a `role="status"` + `aria-live="polite"`
 *   region (the embedded `LiveChip` with `asStatus={false}` so there is a single
 *   region, not nested ones) so the minute/score update is announced politely.
 * - Club crests are real labelled images (composed `Crest`, `role="img"` +
 *   `<title>`); the 3-letter short code is rendered `aria-hidden` so the club
 *   name (the crest label) is the single announcement per side.
 * - An unknown `status` falls back to pre-match — never throws (§7 #1).
 */

export type FixtureStatus = 'pre' | 'live' | 'finished' | 'postponed'

/** One side of a fixture. Only `name` is required (drives the a11y label). */
export interface FixtureTeam {
  /** Full club name. Used for the accessible label and crest `<title>`. */
  name: string
  /** Short 3-letter code shown next to the crest (decorative). */
  short?: string
  /** Crest palette seed (forwarded to `Crest`). Any integer is safe. */
  seed?: number
  /** Optional crest image URL (forwarded to `Crest` if supported). */
  crestSrc?: string
}

interface FixtureCardBaseProps {
  /**
   * Match state. Unknown values fall back to `pre` (no throw — §7 #1).
   * - `pre`: not started; shows the kickoff time, no score.
   * - `live`: in progress; shows the score + a pulsing AO VIVO chip with the
   *   match minute, inside a polite live region.
   * - `finished`: full time; shows the final score + ENCERRADO.
   * - `postponed`: called off; shows ADIADO, no score.
   */
  status?: FixtureStatus
  /** Home side. */
  home: FixtureTeam
  /** Away side. */
  away: FixtureTeam
  /** Home goals (live/finished). */
  homeScore?: number
  /** Away goals (live/finished). */
  awayScore?: number
  /** Match minute, surfaced in the live chip (e.g. `67` → "AO VIVO · 67'"). */
  minute?: number
  /** Kickoff time string for the pre-match state (e.g. `"16:00"`). */
  kickoff?: string
  /** Venue / stadium, shown top-right (decorative metadata). */
  venue?: string
}

export type FixtureCardProps = FixtureCardBaseProps &
  Omit<React.HTMLAttributes<HTMLElement>, keyof FixtureCardBaseProps | 'children'>

interface StatusMeta {
  /** Status word shown in the header AND folded into the accessible name. */
  word: string
  /** Color of the top accent bar (token-mapped Tailwind bg utility). */
  accent: string
  /** Whether this state shows a numeric score line. */
  hasScore: boolean
}

// Each state has an explicit text word + a distinct accent. Color is never the
// sole cue — the word carries the meaning. §7 #3: the live accent is the red
// token used as a 3px bar (no text sits on it, so no contrast issue).
const STATUS_MAP: Record<FixtureStatus, StatusMeta> = {
  pre: { word: 'A SAIR', accent: 'bg-[color:var(--color-border-strong)]', hasScore: false },
  live: { word: 'AO VIVO', accent: 'bg-red', hasScore: true },
  finished: { word: 'ENCERRADO', accent: 'bg-lime', hasScore: true },
  postponed: { word: 'ADIADO', accent: 'bg-yellow', hasScore: false },
}

const CREST_SIZE = 28

function isStatus(value: unknown): value is FixtureStatus {
  return (
    value === 'pre' ||
    value === 'live' ||
    value === 'finished' ||
    value === 'postponed'
  )
}

/** Compose the accessible name: state + both clubs (+ score when shown). */
function buildLabel(
  status: FixtureStatus,
  meta: StatusMeta,
  home: FixtureTeam,
  away: FixtureTeam,
  homeScore?: number,
  awayScore?: number,
  minute?: number,
  kickoff?: string,
): string {
  const head = `${meta.word}: ${home.name} contra ${away.name}`
  if (meta.hasScore && typeof homeScore === 'number' && typeof awayScore === 'number') {
    const min = status === 'live' && typeof minute === 'number' ? `, ${minute} minutos` : ''
    return `${head}, ${homeScore} a ${awayScore}${min}.`
  }
  if (status === 'pre' && kickoff) return `${head}, às ${kickoff}.`
  return `${head}.`
}

const SHELL =
  'relative overflow-hidden rounded-sm bg-surface-dark text-text-on-dark px-4 py-[14px]'

/** A single side: crest + short code, mirrored so both crests sit innermost. */
function Side({ team, align }: { team: FixtureTeam; align: 'home' | 'away' }) {
  const crest = (
    <Crest seed={team.seed ?? 0} size={CREST_SIZE} club={team.name} />
  )
  const code = (
    <span
      aria-hidden="true"
      className="font-display text-[18px] uppercase leading-none"
    >
      {team.short ?? team.name.slice(0, 3).toUpperCase()}
    </span>
  )
  return (
    <div className="flex items-center gap-[9px]">
      {align === 'home' ? (
        <>
          {crest}
          {code}
        </>
      ) : (
        <>
          {code}
          {crest}
        </>
      )}
    </div>
  )
}

export function FixtureCard({
  status,
  home,
  away,
  homeScore,
  awayScore,
  minute,
  kickoff,
  venue,
  className,
  ...rest
}: FixtureCardProps) {
  // Default-fallback: an unknown/missing status resolves to pre (never throws).
  const resolved: FixtureStatus = isStatus(status) ? status : 'pre'
  const meta = STATUS_MAP[resolved] ?? STATUS_MAP.pre

  const showScore =
    meta.hasScore &&
    typeof homeScore === 'number' &&
    typeof awayScore === 'number'

  const isLive = resolved === 'live'

  const label = buildLabel(
    resolved,
    meta,
    home,
    away,
    homeScore,
    awayScore,
    minute,
    kickoff,
  )

  // Header left: the status indicator. Live uses the pulsing LiveChip (with the
  // minute); the other states use a plain text word in the brand mono face.
  const liveLabel =
    typeof minute === 'number' ? `${meta.word} · ${minute}'` : meta.word

  return (
    <article
      data-status={resolved}
      aria-label={label}
      className={[SHELL, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {/* Top accent bar — color cue, paired with the textual status word. */}
      <span
        aria-hidden="true"
        className={['absolute inset-x-0 top-0 h-[3px]', meta.accent].join(' ')}
      />

      {/* Header: status (left) + venue (right). */}
      <div className="flex items-center justify-between">
        {isLive ? (
          // Single polite live region carries minute/score updates.
          <LiveChip
            status="live"
            label={liveLabel}
            // LiveChip is its own region here so the announcement is scoped to
            // the changing status; keep it announcing (default asStatus=true).
            className="!bg-transparent !px-0 !py-0 text-lime"
          />
        ) : (
          <span className="inline-flex items-center gap-[6px] font-mono text-[9.5px] font-bold uppercase tracking-[0.5px] text-lime">
            {meta.word}
          </span>
        )}
        {venue ? (
          <span className="font-mono text-[9.5px] uppercase text-ink-100">
            {venue}
          </span>
        ) : null}
      </div>

      {/* Body: home — score/kickoff — away. */}
      <div className="mt-[10px] flex items-center justify-between">
        <Side team={home} align="home" />

        <div className="px-2 text-center">
          {showScore ? (
            <span className="font-display text-[32px] leading-none tracking-[-1px] [font-variant-numeric:tabular-nums]">
              <span>{homeScore}</span>{' '}
              <span aria-hidden="true" className="text-ink-500">
                ×
              </span>{' '}
              <span>{awayScore}</span>
            </span>
          ) : resolved === 'pre' && kickoff ? (
            <span className="font-display text-[26px] leading-none tracking-[-0.5px] [font-variant-numeric:tabular-nums]">
              {kickoff}
            </span>
          ) : (
            // postponed (or pre without a kickoff): an em-dash placeholder so
            // the two sides stay visually balanced. aria-hidden — the status
            // word already conveys the meaning in the accessible name.
            <span
              aria-hidden="true"
              className="font-display text-[26px] leading-none text-ink-500"
            >
              —
            </span>
          )}
        </div>

        <Side team={away} align="away" />
      </div>
    </article>
  )
}
