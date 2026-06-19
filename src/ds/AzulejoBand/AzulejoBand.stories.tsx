import type { Meta, StoryObj } from '@storybook/react-vite'
import { AzulejoBand } from './AzulejoBand'

const meta: Meta<typeof AzulejoBand> = {
  title: 'Textures/AzulejoBand',
  component: AzulejoBand,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'AzulejoBand — a solid two-tone Bulcão half-circle tile band for color-block dividers and hero footers. Unlike `Azulejo` (a faint watermark), this is a full-strength graphic band, so it is not opacity-capped. Drop it into a positioned parent with an explicit height; it fills the box via `inset: 0`. Pure decoration: `aria-hidden`, `pointer-events: none`. Defaults to cobalt half-circles on a white field.',
      },
    },
  },
  argTypes: {
    a: { control: 'color' },
    b: { control: 'color' },
    size: { control: { type: 'range', min: 24, max: 120, step: 4 } },
  },
}
export default meta

type S = StoryObj<typeof AzulejoBand>

/**
 * A divider band: a `relative` strip the height of one tile, filled by the
 * band via `inset: 0`.
 */
const Strip = ({
  children,
  height = 60,
}: {
  children: React.ReactNode
  height?: number
}) => (
  <div
    data-ds
    className="relative w-[480px] overflow-hidden"
    style={{ height }}
  >
    {children}
  </div>
)

/** Default: cobalt half-circles on white, as a divider strip. */
export const Default: S = {
  render: () => (
    <Strip>
      <AzulejoBand />
    </Strip>
  ),
}

/** Gold-on-green — a hero footer band against the signature panel. */
export const GoldOnGreen: S = {
  render: () => (
    <Strip>
      <AzulejoBand a="var(--gold)" b="var(--green)" />
    </Strip>
  ),
}

/** Green-on-white — a quieter section divider. */
export const GreenOnWhite: S = {
  render: () => (
    <Strip>
      <AzulejoBand a="var(--green)" b="var(--paper)" />
    </Strip>
  ),
}

/** Larger tiles read as bolder half-moons. */
export const LargeTiles: S = {
  render: () => (
    <Strip height={90}>
      <AzulejoBand a="var(--cobalt)" b="var(--cobalt-pale)" size={90} />
    </Strip>
  ),
}

/**
 * Used as a footer band beneath panel content (the band sits at the bottom of
 * a positioned hero block).
 */
export const AsHeroFooter: S = {
  render: () => (
    <div
      data-ds
      className="relative h-[200px] w-[480px] overflow-hidden bg-signature"
    >
      <div className="relative p-6 font-sans text-[20px] font-bold text-on-green">
        Caneta Fantasy
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[40px]">
        <AzulejoBand a="var(--gold)" b="var(--green)" size={40} />
      </div>
    </div>
  ),
}

/** Interactive controls — tweak the two tones and tile size in the panel. */
export const Playground: S = {
  args: {
    a: 'var(--cobalt)',
    b: 'var(--paper)',
    size: 60,
  },
  render: (args) => (
    <Strip height={args.size ?? 60}>
      <AzulejoBand {...args} />
    </Strip>
  ),
}
