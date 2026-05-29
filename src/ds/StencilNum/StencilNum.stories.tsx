import type { Meta, StoryObj } from '@storybook/react-vite'
import { StencilNum } from './StencilNum'

const meta: Meta<typeof StencilNum> = {
  title: 'Patterns/StencilNum',
  component: StencilNum,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The big "jersey" display numeral (Anton + tabular figures) used as a ' +
          'data anchor — hero scores, rank numerals, the SignIn stencil. It is ' +
          'decorative (`aria-hidden`): the real value is always carried by ' +
          'adjacent functional text. Semantic sizes (`sm | md | lg | xl`) map to ' +
          'pixels with an `md` fallback; pass a raw number for a custom size. ' +
          'Letter-spacing tightens with the numeral, matching the DS treatment.',
      },
    },
  },
  argTypes: {
    value: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg', 'xl'],
    },
    color: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof StencilNum>

/** Default: `md` (80px), faint `--ink-50` watermark color. */
export const Default: S = {
  args: { value: '09' },
}

/** Small (48px) — inline rank numeral. */
export const Small: S = {
  args: { value: '116', size: 'sm', color: 'var(--caneta-lime)' },
}

/** Medium (80px) — the default. */
export const Medium: S = {
  args: { value: '12', size: 'md', color: 'var(--color-text)' },
}

/** Large (120px) — the foundations "data anchor" motif. */
export const Large: S = {
  args: { value: '09', size: 'lg', color: 'var(--caneta-lime)' },
}

/** Extra-large (220px) — full-bleed watermark numeral. */
export const ExtraLarge: S = {
  args: { value: '09', size: 'xl', color: 'var(--color-border-subtle)' },
}

/** Raw pixel escape hatch — the matchup hero uses 88px. */
export const RawPixelSize: S = {
  args: { value: '116.6', size: 88, color: 'var(--caneta-lime)' },
}

/** Featured lime numeral on a dark surface (broadcast moment). */
export const OnDark: S = {
  render: (args) => (
    <div className="bg-[color:var(--color-surface-dark)] p-8 rounded-md">
      <StencilNum {...args} />
    </div>
  ),
  args: { value: '7', size: 'lg', color: 'var(--caneta-lime)' },
}

/** All semantic sizes side by side. */
export const AllSizes: S = {
  render: () => (
    <div className="flex items-end gap-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <StencilNum value="09" size={size} color="var(--color-text)" />
          <span className="font-mono text-[11px] text-text-muted">{size}</span>
        </div>
      ))}
    </div>
  ),
}

/** Leading zeros are preserved when `value` is a string. */
export const LeadingZeros: S = {
  args: { value: '03', size: 'lg', color: 'var(--clay)' },
}

/** Interactive controls — tweak value, size and color live. */
export const Playground: S = {
  args: { value: '23', size: 'lg', color: 'var(--caneta-lime)' },
}
