import type { Meta, StoryObj } from '@storybook/react-vite'
import { PlayersCard } from './PlayersCard'
import type { PlayerRow } from '../PlayersTableApp/types'

const FREE: PlayerRow = { id: 2, name: 'Raphael Veiga', team: 'Palmeiras', pos: 'MEI', posPt: 'Meio-Campo', rostered: false, rosteredBy: null, goals: 6, total: '118.0', avg: '10.7', action: { kind: 'add' } }
const MINE: PlayerRow = { id: 1, name: 'Yuri Alberto', team: 'Corinthians', pos: 'ATA', posPt: 'Atacante', rostered: true, rosteredBy: 'Galácticos do Bar', goals: 11, total: '142.6', avg: '12.9', action: { kind: 'drop' } }

const meta: Meta<typeof PlayersCard> = {
  title: 'App/PlayersCard',
  component: PlayersCard,
  parameters: {
    docs: {
      description: {
        component:
          'The mobile (`<834px`) reading-width-safe representation of one Jogadores row: avatar + name/team·pos + the row action, then a three-cell stat strip (Gols / Pts Total / Média). Rostered rows get the faint `mist` fill. The whole card is a focusable control opening player stats; the action stops propagation.',
      },
    },
  },
}
export default meta

type S = StoryObj<typeof PlayersCard>

export const Gallery: S = {
  render: () => (
    <div data-ds className="flex max-w-[420px] flex-col gap-[10px] bg-paper p-6">
      <PlayersCard row={FREE} seed={1} />
      <PlayersCard row={MINE} seed={0} />
    </div>
  ),
}
