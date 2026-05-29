import type { Meta, StoryObj } from '@storybook/react-vite'
import { LivePoints, type LivePointsProps } from './LivePoints'
import { type LiveStatus } from './LiveChip'

const STATUSES: LiveStatus[] = ['live', 'disconnected', 'stale']

const meta: Meta<typeof LivePoints> = {
  title: 'Patterns/LivePoints',
  component: LivePoints,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Live-points hero tile: a big display number with an embedded `LiveChip`. The whole tile is one `role="status"` + `aria-live="polite"` region (labelled by `label`) so the value is announced as it updates; the embedded chip is rendered non-announcing to avoid nested live regions. In the live state the number breathes via CSS (reduced-motion safe). In `disconnected`/`stale` the animation stops, the tile dims, and the chip shows descriptive text — state is never color- or motion-only. A numeric value is formatted to one decimal; a string renders verbatim. Unknown statuses fall back to `live`.',
      },
    },
  },
  argTypes: {
    value: { control: 'number' },
    status: { control: 'inline-radio', options: STATUSES },
    label: { control: 'text' },
  },
  args: { value: 116.6, status: 'live', label: 'Seus pontos agora' },
}
export default meta

type S = StoryObj<typeof LivePoints>

/** Interactive controls — edit value / status / label live. */
export const Playground: S = {}

/** Connected: pulsing chip + breathing number. */
export const Live: S = { args: { value: 116.6, status: 'live' } }

/** Realtime link dropped — dimmed tile, last value retained. */
export const Disconnected: S = { args: { value: 116.6, status: 'disconnected' } }

/** Link up but data is old — "DESATUALIZADO" cue, last value retained. */
export const Stale: S = { args: { value: 116.6, status: 'stale' } }

/** Not-yet-available value: pass a pre-formatted string verbatim. */
export const NoValueYet: S = { args: { value: '—', status: 'live' } }

/** All three states stacked. */
export const AllStates: S = {
  render: (args: LivePointsProps) => (
    <div className="flex flex-col gap-3 max-w-[360px]">
      {STATUSES.map((status) => (
        <LivePoints key={status} {...args} status={status} />
      ))}
    </div>
  ),
}
