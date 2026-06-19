import type { Meta, StoryObj } from '@storybook/react-vite'
import { TickerBar } from './TickerBar'

const meta: Meta<typeof TickerBar> = {
  title: 'Patterns/TickerBar',
  component: TickerBar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'TickerBar (Placar) — the broadcast scoreboard band: a flat full-width ' +
          'strip of score/stat cells under a 3px **gold top rule** (the broadcast ' +
          'signature), with hairline cell dividers. Each cell carries an optional ' +
          'uppercase gold `tag`, the uppercase `text`, and an optional `val` in the ' +
          'Archivo poster voice with **tabular figures** so digit columns align. ' +
          'Two tones: `green` (bottle-green band) and `white` (white band, bottom ' +
          'hairline). It is a `role="region"` landmark named "Placar" (override via ' +
          '`label`); set `live` to add `aria-live="polite"` when the scoreline ' +
          'updates in place. There is **no auto-scroll**, so it never violates ' +
          '`prefers-reduced-motion`.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['green', 'white'] },
    label: { control: 'text' },
    live: { control: 'boolean' },
    items: { control: 'object' },
  },
}
export default meta

type S = StoryObj<typeof TickerBar>

// Every story is wrapped in a `data-ds` host so the DS base layer (fonts,
// focus ring) applies, matching how the band sits inside a migrated screen.
const Host = ({ children }: { children: React.ReactNode }) => (
  <div data-ds className="bg-bg p-6">
    {children}
  </div>
)

const MATCHUP = [
  { tag: 'FLA', text: 'Flamengo', val: '2' },
  { tag: 'PAL', text: 'Palmeiras', val: '1' },
  { tag: "60'", text: 'Tempo', val: '' },
]

const STANDINGS = [
  { tag: '1º', text: 'Meu Time', val: '116.6' },
  { tag: '2º', text: 'Os Cracks', val: '109.2' },
  { tag: '3º', text: 'FC Resenha', val: '98.0' },
]

/** Default: the green broadcast band — your-matchup placar. */
export const Green: S = {
  render: (args) => (
    <Host>
      <TickerBar {...args} />
    </Host>
  ),
  args: { items: MATCHUP, tone: 'green' },
}

/** The white band — a lighter placar with a bottom hairline on a white page. */
export const White: S = {
  render: (args) => (
    <Host>
      <TickerBar {...args} />
    </Host>
  ),
  args: { items: STANDINGS, tone: 'white' },
}

/**
 * Live scoreline: `live` adds `aria-live="polite"` so updated values are
 * announced without stealing focus. Use only when the band updates in place.
 */
export const Live: S = {
  render: (args) => (
    <Host>
      <TickerBar {...args} />
    </Host>
  ),
  args: {
    items: [
      { tag: 'AO VIVO', text: 'Flamengo', val: '2' },
      { tag: 'AO VIVO', text: 'Palmeiras', val: '1' },
    ],
    tone: 'green',
    live: true,
    label: 'Placar ao vivo',
  },
}

/** Cells without a tag — just label + value (e.g. a points readout). */
export const NoTags: S = {
  render: (args) => (
    <Host>
      <TickerBar {...args} />
    </Host>
  ),
  args: {
    items: [
      { text: 'Pontos', val: '116.6' },
      { text: 'Posição', val: '1' },
      { text: 'Restam', val: '32' },
    ],
    tone: 'white',
  },
}

/** Tabular figures: digit columns stay aligned across cells. */
export const TabularValues: S = {
  render: (args) => (
    <Host>
      <TickerBar {...args} />
    </Host>
  ),
  args: {
    items: [
      { tag: 'PTS', text: 'Total', val: '111.11' },
      { tag: 'MÉD', text: 'Média', val: '99.99' },
      { tag: 'MÁX', text: 'Máxima', val: '188.88' },
    ],
    tone: 'green',
  },
}

/** Both tones stacked for comparison. */
export const BothTones: S = {
  render: () => (
    <Host>
      <div className="flex flex-col gap-4">
        <TickerBar items={MATCHUP} tone="green" />
        <TickerBar items={MATCHUP} tone="white" />
      </div>
    </Host>
  ),
}

/** Interactive controls — tweak items, tone, label and live in the panel. */
export const Playground: S = {
  render: (args) => (
    <Host>
      <TickerBar {...args} />
    </Host>
  ),
  args: { items: MATCHUP, tone: 'green', label: 'Placar', live: false },
}
