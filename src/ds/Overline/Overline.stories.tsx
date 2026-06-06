import type { Meta, StoryObj } from '@storybook/react-vite'
import { Overline } from './Overline'

const meta: Meta<typeof Overline> = {
  title: 'Primitives/Overline',
  component: Overline,
  parameters: {
    docs: {
      description: {
        component:
          'Overline (alias `SectionLabel`) — the small all-caps tracked Archivo label that headlines a section. The canonical modernista replacement for the old stripped mono captions (Spline Sans Mono is now reserved for tabular numerics). Default color is muted ink (`--ink-muted`), which clears 4.5:1 on white at 11px. The optional `accent` rule swatch is decorative (`aria-hidden`, non-interactive). Use `as` to render a real heading when the overline names a section.',
      },
    },
  },
  argTypes: {
    children: { control: 'text' },
    color: { control: 'text' },
    accent: { control: 'text' },
    as: { control: false },
  },
  decorators: [
    (Story) => (
      <div data-ds className="bg-bg p-8">
        <Story />
      </div>
    ),
  ],
}
export default meta

type S = StoryObj<typeof Overline>

/** Default muted-ink overline on white. */
export const Default: S = {
  args: { children: 'Classificação' },
}

/** With the decorative gold rule swatch — the signature accent block. */
export const WithAccent: S = {
  args: { children: 'Titulares', accent: 'var(--gold)' },
}

/** Recolored for a dark green band (on-green text). */
export const OnDarkBand: S = {
  args: { children: 'Placar ao vivo', color: 'var(--on-green)', accent: 'var(--gold-light)' },
  render: (args) => (
    <div className="bg-signature p-6 rounded-pill">
      <Overline {...args} />
    </div>
  ),
}

/** Rendered as a real heading (`h2`) — stays in the document outline. */
export const AsHeading: S = {
  args: { as: 'h2', children: 'Detalhes da rodada', accent: 'var(--cobalt)' },
}

/** The accent palette, side by side. */
export const AccentSwatches: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Overline accent="var(--gold)">Acento ouro</Overline>
      <Overline accent="var(--cobalt)">Acento cobalto</Overline>
      <Overline accent="var(--green)">Acento verde</Overline>
      <Overline accent="var(--danger)">Acento alerta</Overline>
    </div>
  ),
}

/** Interactive controls. */
export const Playground: S = {
  args: { children: 'Mercado', color: 'var(--ink-muted)', accent: 'var(--gold)' },
}
