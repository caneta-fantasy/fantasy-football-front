import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { PlayersFilters } from './PlayersFilters'

const meta: Meta<typeof PlayersFilters> = {
  title: 'App/PlayersFilters',
  component: PlayersFilters,
  parameters: {
    docs: {
      description: {
        component:
          'The Jogadores filter bar: a position segmented control, a free-agents segmented control, a team `Select`, and a search field. Each segmented control is a real accessible **radiogroup** (`role="radiogroup"` of `role="radio"` buttons with `aria-checked`) — not the prototype’s inert divs.',
      },
    },
  },
  argTypes: { compact: { control: 'boolean' } },
}
export default meta

type S = StoryObj<typeof PlayersFilters>

const Demo = ({ compact }: { compact?: boolean }) => {
  const [position, setPosition] = useState('ALL')
  const [free, setFree] = useState(false)
  const [team, setTeam] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  return (
    <div data-ds className="bg-paper p-6">
      <PlayersFilters
        compact={compact}
        position={position}
        positionOptions={[
          { value: 'ALL', label: 'TODOS' },
          { value: 'DEF', label: 'DEF' },
          { value: 'MEI', label: 'MEI' },
          { value: 'ATA', label: 'ATA' },
        ]}
        onPositionChange={setPosition}
        onlyFreeAgents={free}
        freeAgentsOptions={[
          { value: false, label: 'Todos' },
          { value: true, label: 'Não escalados' },
        ]}
        onFreeAgentsChange={setFree}
        teamId={team}
        teams={[{ id: 7, name: 'Palmeiras' }, { id: 8, name: 'Flamengo' }]}
        onTeamChange={setTeam}
        search={search}
        onSearchChange={setSearch}
      />
    </div>
  )
}

export const Desktop: S = { render: () => <Demo /> }
export const Mobile: S = { render: () => <Demo compact /> }
