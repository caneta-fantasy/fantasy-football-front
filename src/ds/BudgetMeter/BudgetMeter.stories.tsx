import type { Meta, StoryObj } from '@storybook/react'
import { BudgetMeter } from './BudgetMeter'

const meta: Meta<typeof BudgetMeter> = {
  title: 'Fantasy/BudgetMeter',
  component: BudgetMeter,
  args: {
    value: 72,
    max: 120,
    currency: 'R$',
    unit: 'mi',
    label: 'Orçamento usado',
    height: 12,
  },
  argTypes: {
    value: { control: { type: 'range', min: -10, max: 150, step: 0.5 } },
    max: { control: 'number' },
    height: { control: 'number' },
    currency: { control: 'text' },
    unit: { control: 'text' },
    hint: { control: 'text' },
    label: { control: 'text' },
    hideCaption: { control: 'boolean' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type S = StoryObj<typeof BudgetMeter>

/** Interactive controls — drag `value` past `max` to see the over-budget treatment. */
export const Playground: S = {}

/** Empty budget — fill is 0% (DS §7 #6: width is value-driven, never always-full). */
export const Empty: S = { args: { value: 0 } }

/** Healthy spend, well under the cap → signature green. */
export const Healthy: S = { args: { value: 50 } }

/** Running low (75–95% of cap) → warning amber. */
export const Warning: S = { args: { value: 100 } }

/** Near the cap (>=95%) → brick danger, but still within budget. */
export const NearCap: S = { args: { value: 116 } }

/** Over budget (value > max): fill clamps to 100%, bar turns brick danger, caption flags "estourando". */
export const OverBudget: S = {
  args: { value: 130, hint: '+1 transfer = -4 pts' },
}

/** Bar only — omit currency and unit to hide the numeric caption. */
export const BarOnly: S = {
  args: { value: 72, currency: undefined, unit: undefined, label: 'Orçamento' },
}

/** All threshold states stacked, mirroring screens/13-fantasy-patterns. */
export const Thresholds: S = {
  render: () => (
    <div className="flex flex-col gap-4" style={{ width: 320 }}>
      <BudgetMeter value={50} max={120} currency="R$" unit="mi" label="Saudável" />
      <BudgetMeter value={100} max={120} currency="R$" unit="mi" label="Atenção" />
      <BudgetMeter value={116} max={120} currency="R$" unit="mi" label="No limite" />
      <BudgetMeter
        value={130}
        max={120}
        currency="R$"
        unit="mi"
        hint="+1 transfer = -4 pts"
      />
    </div>
  ),
}
