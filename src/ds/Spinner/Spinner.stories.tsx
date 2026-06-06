import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'

const meta: Meta<typeof Spinner> = {
  title: 'Primitives/Spinner',
  component: Spinner,
  parameters: {
    docs: {
      description: {
        component:
          'SVG rotating arc. Exposes `role="status"` with a visually-hidden "Carregando" label so loading is announced to assistive tech. The spin animation is pure CSS; the DS base layer disables it under `prefers-reduced-motion`.',
      },
    },
  },
  argTypes: {
    size: { control: { type: 'range', min: 12, max: 64, step: 2 } },
    stroke: { control: { type: 'range', min: 1, max: 8, step: 0.5 } },
    color: { control: 'color' },
    label: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Spinner>

/** Default: size 20, signature green arc, stroke 2.5. */
export const Default: S = {}

/** Small inline spinner, e.g. for use inside a button. */
export const Small: S = { args: { size: 16, stroke: 2 } }

/** Large standalone spinner for full-section loading. */
export const Large: S = { args: { size: 48, stroke: 4 } }

/** Custom color (cobalt) — color is configurable per surface. */
export const CobaltColor: S = {
  args: { size: 32, color: 'var(--cobalt)', stroke: 3 },
}

/** On the green broadcast surface: the faint track + warm-white arc stay legible. */
export const OnGreen: S = {
  render: (args) => (
    <div className="bg-signature p-8 rounded-btn">
      <Spinner {...args} color="var(--on-green)" />
    </div>
  ),
  args: { size: 32, stroke: 3 },
}

/** Custom accessible label (e.g. "Buscando" for a search field). */
export const CustomLabel: S = { args: { size: 24, label: 'Buscando' } }

/** Interactive controls: tweak size, color, stroke and label live. */
export const Playground: S = {
  args: { size: 20, color: 'var(--green)', stroke: 2.5, label: 'Carregando' },
}
