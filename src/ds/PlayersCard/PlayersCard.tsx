import React from 'react'
import { Avatar } from '../Avatar/Avatar'
import { ActionCell } from '../ActionCell/ActionCell'
import type { PlayerRow } from '../PlayersTableApp/types'

/**
 * PlayersCard — the mobile (`<834px`) reading-width-safe representation of one
 * Jogadores row. Source: `app/app-kit2.jsx:PlayersTableApp` (mobile branch).
 *
 * Layout: avatar + name/team·pos + the row's `ActionCell`, then a three-cell
 * stat strip (Gols / Pts Total / Média) with the Pts Total value tinted
 * gold-deep. Rostered rows get the faint `mist` fill. The whole card is a
 * focusable control (Enter/Space) that opens the player's stats — the action
 * button stops propagation so it fires its own handler.
 *
 * a11y contract: the card is a real `<button>` (player stats); the inner action
 * is a separate control whose click is stopped from bubbling.
 */
export interface PlayersCardProps {
  row: PlayerRow
  seed?: number
  /** Opens the player stats (whole-card activation). */
  onOpen?: () => void
}

const STAT_LABEL =
  'font-sans text-[9px] font-bold tracking-[0.6px] text-ink-subtle uppercase'
const STAT_VALUE = (gold: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-display)',
  fontVariationSettings: '"wght" 800, "wdth" 108',
  fontSize: 16,
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  marginTop: 2,
  color: gold ? 'var(--gold-deep)' : 'var(--ink)',
})

export function PlayersCard({ row, seed, onOpen }: PlayersCardProps) {
  const stats: Array<[string, React.ReactNode, boolean]> = [
    ['Gols', row.goals, false],
    ['Pts Total', row.total, true],
    ['Média', row.avg, false],
  ]

  return (
    <div
      className={[
        'rounded-btn-sm border border-line p-[12px_13px]',
        row.rostered ? 'bg-mist' : 'bg-paper',
      ].join(' ')}
    >
      <div className="flex items-center gap-[11px]">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-w-0 flex-1 items-center gap-[11px] text-left cursor-pointer"
          aria-label={`Ver estatísticas de ${row.name}`}
        >
          <Avatar name={row.name} src={row.photo} seed={seed} size={38} />
          <span className="min-w-0 flex-1">
            <span className="block truncate font-sans text-[14.5px] font-bold text-ink">
              {row.name}
            </span>
            <span className="mt-[2px] block font-sans text-[11.5px] text-ink-muted">
              {row.team} · {row.posPt}
            </span>
          </span>
        </button>
        <div onClick={(e) => e.stopPropagation()}>
          <ActionCell
            kind={row.action.kind}
            onAction={row.action.onAction}
            loading={row.action.loading}
            disabled={row.action.disabled}
            tooltip={row.action.tooltip}
          />
        </div>
      </div>

      <div className="mt-[11px] flex overflow-hidden rounded-[6px] border border-line">
        {stats.map(([label, value, gold], j) => (
          <div
            key={label}
            className={`flex-1 px-2 py-[6px] text-center ${
              j < stats.length - 1 ? 'border-r border-line' : ''
            }`}
          >
            <div className={STAT_LABEL}>{label}</div>
            <div style={STAT_VALUE(gold)}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
