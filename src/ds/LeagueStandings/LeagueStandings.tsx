import React from 'react'
import { Table, type Column } from '../Table/Table'
import { Crest } from '../Crest/Crest'
import { Overline } from '../Overline/Overline'

/**
 * LeagueStandings — the league classification table (DS
 * `screens/12-data-display.jsx`, "C · LeagueStandings"). Built on the shared
 * `../Table/Table` so it inherits the real, accessible `<table>`, the sticky
 * bottle-green header, zebra striping, hover, the `aria-selected` row band, and
 * the loading + empty slots — this component supplies the columns and the two
 * standings-specific highlights:
 *
 * - **Rank-1 highlight:** the leader's rank numeral is featured in gold (the
 *   heritage accent) and the row carries a visible "LÍDER" gold badge. The cue
 *   is **textual**, not colour-only (§7 colour-cue rule), so it survives for
 *   colour-blind users and AT.
 * - **Current-user row highlight:** the row whose id matches `currentUserRowId`
 *   is passed to Table as `selectedRowKey`, which paints the selected band +
 *   side bar and sets `aria-selected` on the `<tr>`.
 *
 * a11y contract:
 * - Renders a real `<table>` (via Table) with `<th scope="col">` headers and a
 *   `<caption>` naming it.
 * - Movement (▲/▼/━) is never colour-only: each cell carries an accessible
 *   label ("subiu N" / "caiu N" / "sem mudança") and the glyph is `aria-hidden`.
 * - The form guide (V/E/D run) renders each result as a labelled cell with the
 *   full word, and an unknown code falls back to a neutral style without
 *   throwing (§7 #1).
 * - The current-user row is `aria-selected`.
 */

export type FormResult = 'V' | 'E' | 'D'

export interface StandingRow {
  /** Stable identity for selection + React keys. */
  id: React.Key
  /** League position (1-based). */
  rank: number
  /** Team / manager name. */
  team: string
  /** Crest palette seed (deterministic club crest). */
  seed?: number
  /** Total points. */
  points: number
  /** Places gained (+) or lost (−) since the last round; 0 = steady. */
  movement: number
  /** Recent form, most-recent-last: array of 'V' | 'E' | 'D'. */
  form?: FormResult[]
}

export interface LeagueStandingsProps {
  rows: StandingRow[]
  /** Names the table for assistive tech. Defaults to "Classificação". */
  caption?: React.ReactNode
  /** Id of the signed-in user's row → lime band + `aria-selected`. */
  currentUserRowId?: React.Key
  /** Fires when a whole row is clicked. */
  onRowClick?: (row: StandingRow) => void
  /** Loading slot (centered Spinner, `role="status"`). */
  loading?: boolean
  /** Custom empty-slot node; defaults to a house-voice message. */
  empty?: React.ReactNode
  /** Extra classes on the scroll container. */
  className?: string
}

const DEFAULT_CAPTION = 'Classificação'

// Form-result chip styling. Unknown codes resolve to a neutral chip (no throw).
// V (win) = signature green, E (draw) = neutral line-strong, D (loss) = brick
// danger (the functional hue, never the referee card-red) with white text.
const FORM_STYLE: Record<FormResult, string> = {
  V: 'bg-signature text-on-green',
  E: 'bg-line-strong text-ink',
  D: 'bg-danger text-white',
}
const FORM_NEUTRAL = 'bg-surface-inset text-text-muted'

const FORM_LABEL: Record<FormResult, string> = {
  V: 'Vitória',
  E: 'Empate',
  D: 'Derrota',
}

/** A single form-guide result square. Decorative colour + accessible word. */
function FormDot({ result }: { result: FormResult }) {
  const style = FORM_STYLE[result as FormResult] ?? FORM_NEUTRAL
  const label = FORM_LABEL[result as FormResult]
  return (
    <span
      className={`inline-flex h-4 w-4 items-center justify-center rounded-pill font-sans text-[9px] font-bold ${style}`}
      title={label}
    >
      <span aria-hidden="true">{result}</span>
      {label && <span className="sr-only">{label}</span>}
    </span>
  )
}

/** Recent-form run, rendered as a row of labelled squares. */
function FormGuide({ form }: { form?: FormResult[] }) {
  if (!form || form.length === 0) {
    return <span className="font-sans text-[11px] text-text-muted">—</span>
  }
  return (
    <span className="inline-flex items-center justify-center gap-1">
      {form.map((r, i) => (
        <FormDot key={i} result={r} />
      ))}
    </span>
  )
}

/** Movement indicator: glyph is decorative, the direction is in the label. */
function Movement({ movement }: { movement: number }) {
  if (movement === 0) {
    return (
      <span
        className="font-mono text-[12px] text-ink-subtle"
        aria-label="Sem mudança de posição"
      >
        <span aria-hidden="true">━</span>
      </span>
    )
  }
  const up = movement > 0
  const n = Math.abs(movement)
  return (
    <span
      className={`font-mono text-[11px] font-bold ${
        up ? 'text-signature' : 'text-danger'
      }`}
      aria-label={up ? `Subiu ${n}` : `Caiu ${n}`}
    >
      <span aria-hidden="true">
        {up ? '▲' : '▼'}
        {n}
      </span>
    </span>
  )
}

export function LeagueStandings({
  rows,
  caption = DEFAULT_CAPTION,
  currentUserRowId,
  onRowClick,
  loading = false,
  empty,
  className,
}: LeagueStandingsProps) {
  const columns: Column<StandingRow>[] = [
    {
      key: 'rank',
      header: '#',
      width: 'w-[64px]',
      cell: (row) => {
        const leader = row.rank === 1
        return (
          <span className="inline-flex items-center gap-2">
            <span
              className={`font-display text-[22px] leading-none ${
                leader ? 'text-accent-deep' : 'text-text'
              }`}
              style={{ fontVariantNumeric: 'tabular-nums' }}
            >
              {row.rank}
            </span>
            {leader && (
              <span className="rounded-pill bg-accent px-1 py-px font-sans text-[8px] font-bold uppercase tracking-[1.2px] text-on-gold">
                Líder
              </span>
            )}
          </span>
        )
      },
    },
    {
      key: 'team',
      header: 'Time',
      cell: (row) => (
        <span className="inline-flex items-center gap-[9px]">
          <Crest seed={row.seed ?? 0} size={24} club={row.team} />
          <span className="font-sans text-[13.5px] font-bold text-text">
            {row.team}
          </span>
        </span>
      ),
    },
    {
      key: 'form',
      header: 'Forma',
      align: 'center',
      width: 'w-[100px]',
      cell: (row) => <FormGuide form={row.form} />,
    },
    {
      key: 'points',
      header: 'Pts',
      align: 'right',
      width: 'w-[70px]',
      cell: (row) => (
        <span
          className="font-mono text-[14px] font-bold text-text"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {row.points}
        </span>
      ),
    },
    {
      key: 'movement',
      header: 'Mov',
      align: 'right',
      width: 'w-[56px]',
      cell: (row) => <Movement movement={row.movement} />,
    },
  ]

  return (
    <Table<StandingRow>
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      caption={caption}
      selectedRowKey={currentUserRowId}
      onRowClick={onRowClick}
      loading={loading}
      empty={
        empty ?? <Overline as="span">Nenhum time na classificação</Overline>
      }
      className={className}
    />
  )
}
