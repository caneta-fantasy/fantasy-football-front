import type { Meta, StoryObj } from '@storybook/react'
import { Halftone } from './Halftone'

const meta: Meta<typeof Halftone> = {
  title: 'Textures/Halftone',
  component: Halftone,
  args: {
    opacity: 0.15,
    size: 4,
    color: 'var(--ink-900)',
  },
  argTypes: {
    opacity: { control: { type: 'range', min: 0, max: 0.3, step: 0.01 } },
    size: { control: { type: 'range', min: 1, max: 16, step: 1 } },
    color: { control: 'color' },
  },
  parameters: { layout: 'centered' },
}
export default meta

type S = StoryObj<typeof Halftone>

/**
 * Decorative backgrounds require a positioned parent. This frame is
 * `relative` + `overflow-hidden`; the texture fills it via `inset: 0`.
 */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[320px] w-[480px] overflow-hidden rounded-md bg-paper text-[color:var(--paper-ink)]">
    {children}
    <div className="relative flex h-full items-end p-6">
      <span className="font-display text-[40px] uppercase leading-none">Ao Vivo</span>
    </div>
  </div>
)

/** Interactive controls — tweak opacity/size/colour in the panel. */
export const Playground: S = {
  render: (args) => (
    <Frame>
      <Halftone {...args} />
    </Frame>
  ),
}

/** Default: ink dots on paper at the broadcast-print 0.15 opacity. */
export const OnPaper: S = {
  render: () => (
    <Frame>
      <Halftone />
    </Frame>
  ),
}

/** Larger dot grid for a coarser print texture. */
export const CoarseDots: S = {
  render: () => (
    <Frame>
      <Halftone size={10} />
    </Frame>
  ),
}

/** Light dots over a dark surface. */
export const OnDarkSurface: S = {
  render: () => (
    <div className="relative h-[320px] w-[480px] overflow-hidden rounded-md bg-[color:var(--color-surface-dark)]">
      <Halftone color="var(--chalk)" />
    </div>
  ),
}

/**
 * Opacity is hard-capped at the decorative max (0.15). Asking for 0.8 still
 * renders at 0.15 — proving the §7 guard.
 */
export const OpacityCapped: S = {
  render: () => (
    <Frame>
      <Halftone opacity={0.8} />
    </Frame>
  ),
}
