import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Table, type Column, type SortState } from './Table'

interface Player {
  id: number
  pos: string
  name: string
  club: string
  proj: number
  delta: number
}

const PLAYERS: Player[] = [
  { id: 1, pos: 'ATA', name: 'Pedro Henrique', club: 'PAL', proj: 14.8, delta: 18 },
  { id: 2, pos: 'ATA', name: 'Yuri Alberto', club: 'COR', proj: 13.9, delta: 22 },
  { id: 3, pos: 'MEI', name: 'André', club: 'FLU', proj: 11.7, delta: 14 },
  { id: 4, pos: 'MEI', name: 'Estevão', club: 'PAL', proj: 12.4, delta: 13 },
]

const Pos = ({ code }: { code: string }) => (
  <span className="font-mono text-[9px] font-bold uppercase tracking-[0.6px] text-text-muted">
    {code}
  </span>
)

const COLUMNS: Column<Player>[] = [
  { key: 'pos', header: 'Pos', cell: (r) => <Pos code={r.pos} />, width: 'w-[44px]' },
  {
    key: 'name',
    header: 'Jogador',
    cell: (r) => (
      <span>
        <span className="font-sans text-[13px] font-bold">{r.name}</span>
        <span className="ml-2 font-mono text-[10px] text-text-muted">{r.club}</span>
      </span>
    ),
  },
  {
    key: 'proj',
    header: 'Proj',
    align: 'right',
    sortable: true,
    cell: (r) => (
      <span className="font-mono text-[13px] font-bold">{r.proj.toFixed(1)}</span>
    ),
    sortValue: (r) => r.proj,
  },
  {
    key: 'delta',
    header: '+/-',
    align: 'right',
    sortable: true,
    cell: (r) => (
      <span className="font-mono text-[12px] font-bold text-lime-deep">+{r.delta}</span>
    ),
    sortValue: (r) => r.delta,
  },
]

const meta: Meta<typeof Table<Player>> = {
  title: 'Data Display/Table',
  component: Table,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Real `<table>` with a generic, typed columns/rows API. Sticky INK ' +
          'header, zebra striping, hover/selected/expanded row states. Sortable ' +
          'headers expose `aria-sort` and a real toggle button cycling ' +
          'none → ascending → descending → none (DS §7). Empty + loading slots.',
      },
    },
  },
  argTypes: {
    columns: { control: false },
    rows: { control: false },
    getRowKey: { control: false },
    renderExpanded: { control: false },
    empty: { control: false },
    onSortChange: { control: false },
    onRowClick: { control: false },
    loading: { control: 'boolean' },
  },
}
export default meta

type S = StoryObj<typeof Table<Player>>

const base = {
  columns: COLUMNS,
  rows: PLAYERS,
  getRowKey: (r: Player) => r.id,
  caption: 'Projeções da rodada',
}

/** Default — uncontrolled sort, zebra striping, sticky header. */
export const Default: S = { args: base }

/** A selected row (lime band + side bar + `aria-selected`). */
export const SelectedRow: S = { args: { ...base, selectedRowKey: 1 } }

/** An expanded row with a drawer panel of extra stats. */
export const ExpandedRow: S = {
  args: {
    ...base,
    expandedRowKey: 3,
    renderExpanded: (r) => (
      <div className="flex items-center gap-6">
        {[
          ['G/A', '12/8'],
          ['MIN%', '92%'],
          ['ÚLT 5', `+${r.delta}`],
        ].map(([label, value]) => (
          <div key={label}>
            <div className="font-mono text-[9px] font-bold uppercase tracking-[0.6px] text-text-muted">
              {label}
            </div>
            <div className="font-mono text-[14px] font-bold">{value}</div>
          </div>
        ))}
      </div>
    ),
  },
}

/** Loading slot — body replaced by a centered `role="status"` Spinner. */
export const Loading: S = { args: { ...base, rows: [], loading: true } }

/** Empty slot — custom message when there are no rows. */
export const Empty: S = {
  args: {
    ...base,
    rows: [],
    empty: (
      <span className="font-mono text-[11px] font-bold uppercase tracking-[0.6px]">
        Nenhum jogador encontrado
      </span>
    ),
  },
}

/** Controlled sort — the parent owns `sort`/`onSortChange` and the ordering. */
export const ControlledSort: S = {
  render: () => {
    const [sort, setSort] = useState<SortState | null>({
      key: 'proj',
      direction: 'descending',
    })
    const sorted = [...PLAYERS].sort((a, b) => {
      if (!sort) return 0
      const av = sort.key === 'proj' ? a.proj : a.delta
      const bv = sort.key === 'proj' ? b.proj : b.delta
      return sort.direction === 'ascending' ? av - bv : bv - av
    })
    return (
      <Table<Player>
        columns={COLUMNS}
        rows={sort ? sorted : PLAYERS}
        getRowKey={(r) => r.id}
        caption={`Ordenado: ${sort ? `${sort.key} ${sort.direction}` : 'nenhum'}`}
        sort={sort}
        onSortChange={setSort}
      />
    )
  },
}

/** Interactive controls — toggle loading and tweak the table live. */
export const Playground: S = {
  args: { ...base, loading: false, selectedRowKey: undefined },
}
