import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PlayersTableApp } from './PlayersTableApp'
import type { PlayerRow } from './types'
import type { SortState } from '../Table/Table'

const ROWS: PlayerRow[] = [
  { id: 1, name: 'Yuri Alberto', team: 'Corinthians', pos: 'ATA', posPt: 'Atacante', rostered: true, rosteredBy: 'Galácticos do Bar', goals: 11, total: '142.6', avg: '12.9', next: 'x SAN (C) · 20h', action: { kind: 'drop' } },
  { id: 2, name: 'Raphael Veiga', team: 'Palmeiras', pos: 'MEI', posPt: 'Meio-Campo', rostered: false, rosteredBy: null, goals: 6, total: '118.0', avg: '10.7', next: 'x FLA (C) · 16h', action: { kind: 'add' } },
  { id: 3, name: 'Pedro', team: 'Flamengo', pos: 'ATA', posPt: 'Atacante', rostered: true, rosteredBy: 'Os Galácticos', goals: 9, total: '131.4', avg: '11.9', next: 'x PAL (V) · 16h', action: { kind: 'escalado', tooltip: 'Escalado por Os Galácticos' } },
  { id: 4, name: 'Gerson', team: 'Flamengo', pos: 'MEI', posPt: 'Meio-Campo', rostered: false, rosteredBy: null, goals: 3, total: '96.2', avg: '8.7', next: '—', action: { kind: 'waiver' } },
  { id: 5, name: 'Weverton', team: 'Palmeiras', pos: 'GOL', posPt: 'Goleiro', rostered: false, rosteredBy: null, goals: 0, total: '84.0', avg: '7.6', next: 'x FLA (C) · 16h', action: { kind: 'bloqueado' } },
]

const meta: Meta<typeof PlayersTableApp> = {
  title: 'App/PlayersTableApp',
  component: PlayersTableApp,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'The Jogadores roster of players. Desktop/tablet render the accessible ds `Table`; mobile (`<834px`) renders a stacked `PlayersCard` list (no `<table>`). Desktop keeps the real `Próx.` next-opponent column; tablet drops Escalado + Gols. Sort is controlled by the parent (server-sorted); only the numeric columns are sortable.',
      },
    },
  },
  argTypes: { bp: { control: 'inline-radio', options: ['m', 't', 'd'] } },
}
export default meta

type S = StoryObj<typeof PlayersTableApp>

const Demo = ({ bp }: { bp: 'm' | 't' | 'd' }) => {
  const [sort, setSort] = useState<SortState | null>({ key: 'totalPoints', direction: 'descending' })
  return (
    <div data-ds className="bg-paper p-6">
      <PlayersTableApp bp={bp} rows={ROWS} sort={sort} onSortChange={setSort} showNext />
    </div>
  )
}

export const Desktop: S = { render: () => <Demo bp="d" /> }
export const Tablet: S = { render: () => <Demo bp="t" /> }
export const Mobile: S = { render: () => <Demo bp="m" /> }
