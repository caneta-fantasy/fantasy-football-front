import type { Meta, StoryObj } from '@storybook/react'
import { ProgressBar } from './ProgressBar'

const meta: Meta<typeof ProgressBar> = {
  title: 'Feedback/ProgressBar',
  component: ProgressBar,
  args: {
    value: 60,
    max: 100,
    label: 'Progresso',
    height: 10,
  },
  argTypes: {
    value: { control: { type: 'range', min: -20, max: 140, step: 1 } },
    max: { control: 'number' },
    tone: { control: 'inline-radio', options: [undefined, 'lime', 'yellow', 'red'] },
    height: { control: 'number' },
    label: { control: 'text' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type S = StoryObj<typeof ProgressBar>

/** Interactive controls — drag `value` past 100 to see the clamp + threshold. */
export const Playground: S = {}

export const Empty: S = { args: { value: 0 } }

export const Healthy: S = { args: { value: 40 } }

/** 75–90% of max trips the yellow warning threshold. */
export const Warning: S = { args: { value: 82 } }

/** Above 90% of max trips the red danger threshold. */
export const Danger: S = { args: { value: 96 } }

/** Over max — fill is clamped to 100% but aria-valuenow keeps the real value. */
export const OverMax: S = { args: { value: 150, max: 100 } }

export const ForcedTone: S = { args: { value: 96, tone: 'lime' } }

export const Thresholds: S = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 280 }}>
      <ProgressBar value={40} label="Saudável" />
      <ProgressBar value={82} label="Atenção" />
      <ProgressBar value={96} label="Crítico" />
    </div>
  ),
}

/** Budget meter framing from screens/12-data-display. */
export const Budget: S = {
  render: () => (
    <div style={{ width: 280 }}>
      <ProgressBar value={98.4} max={120} label="Orçamento usado" />
      <div className="mt-2 flex justify-between font-mono text-[10.5px] font-bold">
        <span className="text-lime-deep">R$ 98,4 mi usados</span>
        <span className="text-text-muted">120,0 mi</span>
      </div>
    </div>
  ),
}
