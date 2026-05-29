import type { Meta, StoryObj } from '@storybook/react'
import { Breadcrumbs } from './Breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'Navigation/Breadcrumbs',
  component: Breadcrumbs,
  args: {
    'aria-label': 'Trilha de navegação',
    maxItems: 4,
  },
  argTypes: {
    maxItems: { control: { type: 'number', min: 2 } },
  },
}
export default meta

type S = StoryObj<typeof Breadcrumbs>

const TRAIL = [
  { label: 'Ligas', href: '/ligas' },
  { label: 'Família Khouri', href: '/ligas/khouri' },
  { label: 'Rodada 12' },
]

/** Interactive controls — adjust maxItems to see truncation kick in. */
export const Playground: S = { args: { items: TRAIL } }

export const Default: S = { args: { items: TRAIL } }

export const TwoLevels: S = {
  args: {
    items: [{ label: 'Ligas', href: '/ligas' }, { label: 'Família Khouri' }],
  },
}

export const Truncated: S = {
  args: {
    maxItems: 3,
    items: [
      { label: 'Ligas', href: '/ligas' },
      { label: 'Família Khouri', href: '/ligas/khouri' },
      { label: 'Temporada 2026', href: '/ligas/khouri/2026' },
      { label: 'Rodada 12', href: '/ligas/khouri/2026/r12' },
      { label: 'Partida 4' },
    ],
  },
}

export const LongLabelTruncates: S = {
  args: {
    items: [
      { label: 'Ligas', href: '/ligas' },
      {
        label:
          'Liga com um nome extremamente longo que precisa truncar com reticências',
      },
    ],
  },
}
