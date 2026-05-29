import type { Meta, StoryObj } from '@storybook/react'
import { PitchLines } from './PitchLines'

const meta: Meta<typeof PitchLines> = {
  title: 'Textures/PitchLines',
  component: PitchLines,
  args: {
    opacity: 0.08,
    color: 'var(--chalk)',
  },
  argTypes: {
    opacity: { control: { type: 'range', min: 0, max: 0.3, step: 0.01 } },
    color: { control: 'color' },
  },
  parameters: { layout: 'centered' },
}
export default meta

type S = StoryObj<typeof PitchLines>

/**
 * Decorative backgrounds require a positioned parent. This frame is
 * `relative` + `overflow-hidden`; the texture fills it via `inset: 0`.
 */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[320px] w-[480px] overflow-hidden rounded-md bg-[color:var(--color-surface-dark)] text-text-on-dark">
    {children}
    <div className="relative flex h-full items-end p-6">
      <span className="font-display text-[40px] uppercase leading-none">Caneta</span>
    </div>
  </div>
)

/** Interactive controls — tweak opacity/colour in the panel. */
export const Playground: S = {
  render: (args) => (
    <Frame>
      <PitchLines {...args} />
    </Frame>
  ),
}

/** Default: chalk lines on a dark surface at the recommended 0.08 opacity. */
export const OnDarkSurface: S = {
  render: () => (
    <Frame>
      <PitchLines />
    </Frame>
  ),
}

/** The same texture on a lime panel using ink lines. */
export const OnLimePanel: S = {
  render: () => (
    <div className="relative h-[320px] w-[480px] overflow-hidden rounded-md bg-lime">
      <PitchLines color="var(--ink-900)" />
    </div>
  ),
}

/**
 * Opacity is hard-capped at the decorative max (0.15). Asking for 0.9 still
 * renders at 0.15 — proving the §7 guard.
 */
export const OpacityCapped: S = {
  render: () => (
    <Frame>
      <PitchLines opacity={0.9} />
    </Frame>
  ),
}
