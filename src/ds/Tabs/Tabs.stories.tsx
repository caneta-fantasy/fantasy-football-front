import type { Meta, StoryObj } from '@storybook/react'
import { Tabs } from './Tabs'

const meta: Meta<typeof Tabs> = {
  title: 'Navigation/Tabs',
  component: Tabs,
  args: {
    'aria-label': 'Seções da liga',
    variant: 'underline',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['underline', 'scrollable'] },
    defaultValue: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Tabs>

const ITEMS = [
  { id: 'time', label: 'Time', content: <p>Sua escalação para a rodada.</p> },
  { id: 'mercado', label: 'Mercado', content: <p>Jogadores disponíveis.</p> },
  { id: 'stats', label: 'Stats', content: <p>Desempenho da temporada.</p> },
  { id: 'chat', label: 'Chat', content: <p>Conversa da liga.</p> },
]

/** Interactive controls — switch variant and defaultValue in the panel. */
export const Playground: S = { args: { items: ITEMS } }

export const Underline: S = {
  args: { items: ITEMS, variant: 'underline' },
}

export const PreselectedTab: S = {
  args: { items: ITEMS, defaultValue: 'stats' },
}

export const WithDisabledTab: S = {
  args: {
    items: [
      { id: 'time', label: 'Time', content: <p>Escalação.</p> },
      {
        id: 'chat',
        label: 'Chat',
        content: <p>Indisponível.</p>,
        disabled: true,
      },
      { id: 'stats', label: 'Stats', content: <p>Estatísticas.</p> },
    ],
  },
}

export const Scrollable: S = {
  render: (args) => (
    <div style={{ width: 320, border: '1px solid var(--color-border)' }}>
      <Tabs {...args} variant="scrollable" items={MANY} />
    </div>
  ),
  args: { 'aria-label': 'Rodadas' },
}

const MANY = Array.from({ length: 12 }, (_, i) => ({
  id: `r${i + 1}`,
  label: `Rodada ${i + 1}`,
  content: <p>Conteúdo da rodada {i + 1}.</p>,
}))
