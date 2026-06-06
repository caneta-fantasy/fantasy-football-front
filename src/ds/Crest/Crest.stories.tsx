import type { Meta, StoryObj } from '@storybook/react'
import { Crest } from './Crest'

const meta: Meta<typeof Crest> = {
  title: 'Domain/Crest',
  component: Crest,
  args: {
    seed: 0,
    size: 48,
    club: 'Caneta FC',
    loading: false,
    empty: false,
  },
  argTypes: {
    seed: { control: { type: 'number' } },
    size: { control: { type: 'range', min: 20, max: 96, step: 4 } },
    club: { control: 'text' },
    loading: { control: 'boolean' },
    empty: { control: 'boolean' },
  },
}
export default meta

type S = StoryObj<typeof Crest>

/** Interactive controls — change seed/size/club/loading/empty in the panel. */
export const Playground: S = {}

export const Default: S = {
  args: { seed: 0, club: 'Caneta FC', size: 48 },
}

export const NamedClub: S = {
  args: { seed: 1, club: 'Esporte Clube Pena', size: 48 },
}

export const NoClubName: S = {
  args: { seed: 2, club: undefined, size: 48 },
}

export const Loading: S = {
  args: { loading: true, size: 48 },
}

export const Empty: S = {
  args: { empty: true, size: 48 },
}

/**
 * The seeded roundel palette: each seed is a flat two-colour geometric mark
 * with its own division device (bar / diag / chevron / ring / vert).
 * Same seed → same crest, deterministic per club.
 */
export const SeededPalette: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Crest key={i} seed={i} club={`Clube ${i}`} size={48} />
      ))}
    </div>
  ),
}

/** The five division devices, one per roundel. */
export const Devices: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {(['bar', 'diag', 'chevron', 'ring', 'vert'] as const).map((d, i) => (
        <div key={d} className="flex flex-col items-center gap-1">
          <Crest seed={i} club={`Device ${d}`} size={56} />
          <span className="text-xs text-ink-muted">{d}</span>
        </div>
      ))}
    </div>
  ),
}

export const Sizes: S = {
  render: () => (
    <div className="flex items-end gap-3">
      {[24, 32, 48, 64, 96].map((s) => (
        <Crest key={s} seed={4} club="Caneta FC" size={s} />
      ))}
    </div>
  ),
}
