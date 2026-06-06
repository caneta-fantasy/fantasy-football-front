import type { Meta, StoryObj } from '@storybook/react-vite'
import { Azulejo } from './Azulejo'

const meta: Meta<typeof Azulejo> = {
  title: 'Textures/Azulejo',
  component: Azulejo,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Azulejo — the faint tiled Bulcão quarter-arc motif (mid-century Brazilian tile geometry) rendered as a decorative cobalt texture. Drop it into a positioned parent; it fills the box via `inset: 0`. Pure decoration: `aria-hidden`, `pointer-events: none`, and opacity hard-capped at the decorative max (0.15) — the modernista 0.16 default clamps down. Default stroke is the azulejo cobalt token.',
      },
    },
  },
  argTypes: {
    color: { control: 'color' },
    size: { control: { type: 'range', min: 24, max: 120, step: 4 } },
    opacity: { control: { type: 'range', min: 0, max: 0.3, step: 0.01 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 6, step: 0.5 } },
  },
}
export default meta

type S = StoryObj<typeof Azulejo>

/**
 * Decorative backgrounds require a positioned parent. This frame is
 * `relative` + `overflow-hidden`; the texture fills it via `inset: 0`.
 */
const Frame = ({
  children,
  className = 'bg-bg',
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div
    data-ds
    className={`relative h-[320px] w-[480px] overflow-hidden rounded-pill ${className}`}
  >
    {children}
  </div>
)

/** Default: faint cobalt azulejo on true white at the capped 0.15 opacity. */
export const OnWhite: S = {
  render: () => (
    <Frame>
      <Azulejo />
    </Frame>
  ),
}

/** On a bottle-green panel using the warm-white on-green stroke. */
export const OnGreenPanel: S = {
  render: () => (
    <Frame className="bg-signature">
      <Azulejo color="var(--on-green)" />
    </Frame>
  ),
}

/** On a gold color-block using the near-black on-gold stroke. */
export const OnGoldPanel: S = {
  render: () => (
    <Frame className="bg-accent">
      <Azulejo color="var(--on-gold)" />
    </Frame>
  ),
}

/**
 * Opacity is hard-capped at the decorative max (0.15). Asking for 0.9 still
 * renders at 0.15 — proving the §7 guard.
 */
export const OpacityCapped: S = {
  render: () => (
    <Frame className="bg-signature">
      <Azulejo color="var(--gold-light)" opacity={0.9} />
    </Frame>
  ),
}

/** A larger tile with a heavier arc stroke. */
export const LargeTile: S = {
  render: () => (
    <Frame>
      <Azulejo size={96} strokeWidth={3} />
    </Frame>
  ),
}

/** Interactive controls — tweak colour/size/opacity/stroke in the panel. */
export const Playground: S = {
  args: {
    color: 'var(--cobalt)',
    size: 56,
    opacity: 0.16,
    strokeWidth: 2,
  },
  render: (args) => (
    <Frame className="bg-signature">
      <Azulejo {...args} />
    </Frame>
  ),
}
