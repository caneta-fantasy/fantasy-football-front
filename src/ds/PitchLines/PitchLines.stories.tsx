import type { Meta, StoryObj } from '@storybook/react'
import { PitchLines } from './PitchLines'

const meta: Meta<typeof PitchLines> = {
  title: 'Textures/PitchLines',
  component: PitchLines,
  args: {
    variant: 'watermark',
    opacity: 0.08,
    color: 'var(--pitch-line)',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['watermark', 'feature'] },
    opacity: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    color: { control: 'color' },
    fill: { control: 'color' },
  },
  parameters: { layout: 'centered' },
}
export default meta

type S = StoryObj<typeof PitchLines>

/**
 * Decorative watermark backgrounds require a positioned parent. This frame is
 * `relative` + `overflow-hidden`; the texture fills it via `inset: 0`.
 */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative h-[320px] w-[480px] overflow-hidden bg-signature text-on-green">
    {children}
    <div className="relative flex h-full items-end p-6">
      <span className="font-display text-[40px] uppercase leading-none">Caneta</span>
    </div>
  </div>
)

/** Interactive controls — switch variant, tweak opacity/colour in the panel. */
export const Playground: S = {
  render: (args) =>
    args.variant === 'feature' ? (
      <div className="h-[320px] w-[480px] overflow-hidden">
        <PitchLines {...args} />
      </div>
    ) : (
      <Frame>
        <PitchLines {...args} />
      </Frame>
    ),
}

/** Default watermark: chalk lines on the green block at the recommended 0.08 opacity. */
export const Watermark: S = {
  render: () => (
    <Frame>
      <PitchLines />
    </Frame>
  ),
}

/** The same watermark texture on the signature green using warm-white lines. */
export const WatermarkOnGreen: S = {
  render: () => (
    <div className="relative h-[320px] w-[480px] overflow-hidden bg-signature">
      <PitchLines color="var(--on-green)" />
    </div>
  ),
}

/**
 * Watermark opacity is hard-capped at the decorative max (0.15). Asking for 0.9
 * still renders at 0.15 — proving the §7 guard stays on the watermark path.
 */
export const WatermarkCapped: S = {
  render: () => (
    <Frame>
      <PitchLines opacity={0.9} />
    </Frame>
  ),
}

/**
 * The opt-in `feature` variant: a full-strength green color-block pitch diagram
 * — a standalone modernista figure (solid bottle-green field + pale chalk),
 * NOT a watermark, so its opacity is uncapped.
 */
export const Feature: S = {
  render: () => (
    <div className="h-[320px] w-[480px] overflow-hidden">
      <PitchLines variant="feature" />
    </div>
  ),
}

/** A feature diagram recoloured to a custom field + stroke. */
export const FeatureCustom: S = {
  render: () => (
    <div className="h-[320px] w-[480px] overflow-hidden">
      <PitchLines variant="feature" fill="var(--green-deep)" color="var(--gold-light)" />
    </div>
  ),
}
