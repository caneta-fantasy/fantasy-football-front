import type { Meta, StoryObj } from '@storybook/react'
import { Sparkline } from './Sparkline'
import { Overline } from '../Overline/Overline'

const meta: Meta<typeof Sparkline> = {
  title: 'Data Display/Sparkline',
  component: Sparkline,
  args: {
    data: [6, 9, 4, 12, 8, 16, 22, 18],
    w: 90,
    h: 28,
    trend: 'up',
  },
  argTypes: {
    data: { control: 'object' },
    w: { control: { type: 'range', min: 40, max: 260, step: 10 } },
    h: { control: { type: 'range', min: 16, max: 90, step: 2 } },
    trend: { control: 'inline-radio', options: ['up', 'down', 'neutral'] },
    label: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Sparkline>

/** Interactive controls — edit the `data` array and toggle trend/size. */
export const Playground: S = {}

/** Rising series, signature-green line (the default trend). */
export const Up: S = { args: { data: [80, 92, 70, 110, 98, 116], trend: 'up' } }

/** Falling series, brick-danger line. */
export const Down: S = {
  args: { data: [130, 132, 131, 129, 130, 128], trend: 'down' },
}

/** Comparative / flat series, ink line. */
export const Neutral: S = {
  args: { data: [10, 11, 10, 12, 11, 10], trend: 'neutral' },
}

/** Empty data: no line is drawn, but role="img" + a "sem dados" summary remain. */
export const Empty: S = { args: { data: [] } }

/** A single reading collapses to a centred endpoint dot (no line, no NaN). */
export const SinglePoint: S = { args: { data: [12] } }

/** All-equal data renders a calm flat mid-line (no divide-by-zero). */
export const AllEqual: S = { args: { data: [5, 5, 5, 5, 5] } }

/** Explicit accessible name overrides the generated summary. */
export const CustomLabel: S = {
  args: { data: [3, 2, 2, 1, 1, 1], label: 'Colocação na liga ao longo das rodadas' },
}

/** Wider variant as used inside a StatBlock in screens/12-data-display. */
export const Wide: S = {
  args: { data: [8, 9, 7, 11, 10, 10.6], w: 150, h: 36 },
}

/** The four edge/state cases side by side. */
export const States: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Overline as="span" className="w-24">Em alta</Overline>
        <Sparkline data={[6, 9, 4, 12, 8, 16, 22, 18]} trend="up" />
      </div>
      <div className="flex items-center gap-3">
        <Overline as="span" className="w-24">Em queda</Overline>
        <Sparkline data={[22, 18, 19, 12, 9, 6]} trend="down" />
      </div>
      <div className="flex items-center gap-3">
        <Overline as="span" className="w-24">Estável</Overline>
        <Sparkline data={[10, 10, 10, 10]} trend="neutral" />
      </div>
      <div className="flex items-center gap-3">
        <Overline as="span" className="w-24">1 ponto</Overline>
        <Sparkline data={[12]} />
      </div>
      <div className="flex items-center gap-3">
        <Overline as="span" className="w-24">Sem dados</Overline>
        <Sparkline data={[]} />
      </div>
    </div>
  ),
}
