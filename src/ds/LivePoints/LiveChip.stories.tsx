import type { Meta, StoryObj } from '@storybook/react-vite'
import { LiveChip, type LiveStatus } from './LiveChip'

const STATUSES: LiveStatus[] = ['live', 'disconnected', 'stale']

const meta: Meta<typeof LiveChip> = {
  title: 'Patterns/LiveChip',
  component: LiveChip,
  parameters: {
    docs: {
      description: {
        component:
          'The "AO VIVO" realtime status chip. A `role="status"` + `aria-live="polite"` region with a CSS-pulsing dot (neutralized under `prefers-reduced-motion` by the DS base layer). The `disconnected` and `stale` states drop the pulse and swap to descriptive text ("SEM CONEXÃO" / "DESATUALIZADO") so the state never relies on color alone. The live tone is the brick danger (#B23A2B, the functional hue) with white text — never the referee card-red. Unknown statuses fall back to `live`.',
      },
    },
  },
  argTypes: {
    status: { control: 'inline-radio', options: STATUSES },
    label: { control: 'text' },
    asStatus: { control: 'boolean' },
  },
  args: { status: 'live' },
}
export default meta

type S = StoryObj<typeof LiveChip>

/** Interactive controls — flip status / edit the live label. */
export const Playground: S = {}

/** Default live state with the pulsing dot. */
export const Live: S = { args: { status: 'live' } }

/** Live with the match minute surfaced in the label. */
export const LiveWithMinute: S = { args: { status: 'live', label: "AO VIVO · 67'" } }

/** Realtime link dropped — no pulse, descriptive text cue. */
export const Disconnected: S = { args: { status: 'disconnected' } }

/** Link up but data is old — no pulse, "DESATUALIZADO" cue. */
export const Stale: S = { args: { status: 'stale' } }

/** All three states side by side. */
export const AllStates: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {STATUSES.map((status) => (
        <LiveChip key={status} status={status} />
      ))}
    </div>
  ),
}

/** On the signature-green surface the chip stays legible across states. */
export const OnGreen: S = {
  render: () => (
    <div className="bg-signature p-6 rounded-pill flex flex-wrap gap-3">
      {STATUSES.map((status) => (
        <LiveChip key={status} status={status} />
      ))}
    </div>
  ),
}
