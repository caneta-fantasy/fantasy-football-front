import React from 'react'
import { Table, type Column, type SortState } from '../Table/Table'
import { Avatar } from '../Avatar/Avatar'
import { ActionCell } from '../ActionCell/ActionCell'
import { PlayersCard } from '../PlayersCard/PlayersCard'
import type { PlayerRow, PosTagCode } from './types'
import { useBreakpoint, type Breakpoint } from './useBreakpoint'

export type { PlayerRow, PlayerRowAction, PosTagCode } from './types'
export type { SortState } from '../Table/Table'

/**
 * PlayersTableApp — the Jogadores roster of players. Desktop/tablet render the
 * accessible ds `Table`; mobile (`<834px`) renders a `PlayersCard` list (no
 * `<table>`). Source: `app/app-kit2.jsx:PlayersTableApp`.
 *
 * The desktop layout keeps the real `Próx.` (next-opponent) column the
 * prototype omits — it slots between Escalado and the numeric columns and
 * collapses out at the tablet breakpoint along with Escalado + Gols.
 *
 * Sort is **controlled by the parent** (server-sorted): pass `sort` +
 * `onSortChange`; only the numeric stat columns are sortable. The empty/error
 * slots are the parent's responsibility — pass `empty` for the no-rows state.
 */
export interface PlayersTableAppProps {
  rows: PlayerRow[]
  /** Controlled sort state (server-sorted). */
  sort: SortState | null
  onSortChange: (next: SortState | null) => void
  /** Whether to render the `Próx.` next-opponent column (desktop only). */
  showNext?: boolean
  /** Shown when there are no rows. */
  empty?: React.ReactNode
  /** Force a breakpoint (testing/storybook). Defaults to the live hook. */
  bp?: Breakpoint
  className?: string
}

const POS_TONE: Record<PosTagCode, { bg: string; fg: string }> = {
  GOL: { bg: 'var(--cobalt)', fg: '#fff' },
  DEF: { bg: 'var(--green)', fg: 'var(--on-green)' },
  MEI: { bg: 'var(--gold)', fg: 'var(--on-gold)' },
  ATA: { bg: 'var(--danger)', fg: '#fff' },
}

function PosTag({ pos }: { pos: PosTagCode }) {
  const tone = POS_TONE[pos] ?? { bg: 'var(--ink-muted)', fg: '#fff' }
  return (
    <span
      className="inline-flex h-[22px] items-center rounded-[5px] px-[9px] font-sans text-[11px] font-extrabold"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {pos}
    </span>
  )
}

const GOLD_NUM: React.CSSProperties = {
  fontFamily: 'var(--font-display)',
  fontVariationSettings: '"wght" 800, "wdth" 108',
  fontSize: 15,
  lineHeight: 1,
  color: 'var(--gold-deep)',
  fontVariantNumeric: 'tabular-nums',
}

function NameCell({ row, seed }: { row: PlayerRow; seed: number }) {
  return (
    <span className="flex min-w-0 items-center gap-[10px]">
      <Avatar name={row.name} src={row.photo} seed={seed} size={32} />
      <span className="truncate font-sans text-[13.5px] font-semibold text-ink">
        {row.name}
      </span>
    </span>
  )
}

export function PlayersTableApp({
  rows,
  sort,
  onSortChange,
  showNext = false,
  empty,
  bp,
  className,
}: PlayersTableAppProps) {
  const liveBp = useBreakpoint()
  const breakpoint = bp ?? liveBp

  // Mobile: stacked cards, no <table>.
  if (breakpoint === 'm') {
    if (rows.length === 0 && empty) {
      return <div className={className}>{empty}</div>
    }
    return (
      <div className={`flex flex-col gap-[10px] ${className ?? ''}`.trim()}>
        {rows.map((row, i) => (
          <PlayersCard key={row.id} row={row} seed={i} onOpen={row.onOpen} />
        ))}
      </div>
    )
  }

  const isTablet = breakpoint === 't'

  const columns: Column<PlayerRow>[] = []
  columns.push({
    key: 'name',
    header: 'Jogador',
    width: 'w-[28%]',
    cell: (row) => {
      const seed = rows.indexOf(row)
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            row.onOpen?.()
          }}
          className="flex w-full min-w-0 items-center text-left cursor-pointer"
          aria-label={`Ver estatísticas de ${row.name}`}
        >
          <NameCell row={row} seed={seed} />
        </button>
      )
    },
  })
  columns.push({
    key: 'team',
    header: 'Time',
    cell: (row) => (
      <span className="block truncate font-sans text-[13px] text-ink-muted">
        {row.team}
      </span>
    ),
  })
  columns.push({
    key: 'pos',
    header: isTablet ? 'Pos' : 'Posição',
    cell: (row) => <PosTag pos={row.pos} />,
  })

  if (!isTablet) {
    columns.push({
      key: 'escalado',
      header: 'Escalado',
      cell: (row) => (
        <span
          className={`block truncate font-sans text-[12px] ${
            row.rosteredBy ? 'text-ink-muted' : 'text-ink-subtle'
          }`}
        >
          {row.rosteredBy || 'Livre'}
        </span>
      ),
    })
    if (showNext) {
      columns.push({
        key: 'next',
        header: 'Próx.',
        cell: (row) => (
          <span className="block font-sans text-[12px] text-ink-muted">
            {row.next ?? '—'}
          </span>
        ),
      })
    }
    columns.push({
      key: 'goals',
      header: 'Gols',
      align: 'right',
      sortable: true,
      cell: (row) => (
        <span className="font-sans text-[13px] text-ink-muted tabular-nums">
          {row.goals}
        </span>
      ),
    })
  }

  columns.push({
    key: 'totalPoints',
    header: 'Pts Total',
    align: 'right',
    sortable: true,
    cell: (row) => <span style={GOLD_NUM}>{row.total}</span>,
  })
  columns.push({
    key: 'avgPoints',
    header: 'Média',
    align: 'right',
    sortable: true,
    cell: (row) => (
      <span className="font-sans text-[13px] text-ink tabular-nums">
        {row.avg}
      </span>
    ),
  })
  columns.push({
    key: 'action',
    header: 'Ação',
    align: 'center',
    cell: (row) => (
      <span
        className="flex justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionCell
          kind={row.action.kind}
          onAction={row.action.onAction}
          loading={row.action.loading}
          disabled={row.action.disabled}
          tooltip={row.action.tooltip}
        />
      </span>
    ),
  })

  return (
    <Table<PlayerRow>
      className={className}
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.id}
      sort={sort}
      onSortChange={onSortChange}
      empty={empty}
    />
  )
}
