import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Stepper } from './Stepper'

const meta: Meta<typeof Stepper> = {
  title: 'Forms/Stepper',
  component: Stepper,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A numeric +/- control. The increment/decrement controls are real `<button type="button">`s with accessible labels; they are genuinely `disabled` at the bounds (removed from the tab order, cannot fire `onChange`). The value display is a `role="spinbutton"` exposing `aria-valuemin`/`aria-valuemax`/`aria-valuenow` and supporting ArrowUp/ArrowDown/Home/End. Controlled: the host owns `value` and updates it from `onChange`. Use `formatValue` for display affixes (e.g. `×2`).',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    value: { control: 'number' },
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: {
    label: 'Multiplicador do capitão',
    value: 2,
    min: 1,
    max: 3,
    step: 1,
    disabled: false,
  },
}
export default meta

type S = StoryObj<typeof Stepper>

/** Interactive controls — tweak value/min/max/step/disabled live. */
export const Playground: S = {
  render: (args) => {
    const [v, setV] = useState(args.value)
    return <Stepper {...args} value={v} onChange={setV} />
  },
}

/** The domain example from screens/08-forms.jsx: captain multiplier ×1..×3. */
export const CaptainMultiplier: S = {
  render: () => {
    const [v, setV] = useState(2)
    return (
      <div className="flex items-center gap-[18px]">
        <Stepper
          label="Multiplicador do capitão"
          value={v}
          min={1}
          max={3}
          onChange={setV}
          formatValue={(n) => `×${n}`}
        />
        <span className="font-sans text-[12px] text-text-subtle">
          min ×1 · max ×3
        </span>
      </div>
    )
  },
}

/** At the lower bound: the decrement button is disabled. */
export const AtLowerBound: S = {
  render: () => (
    <Stepper
      label="Multiplicador"
      value={1}
      min={1}
      max={3}
      onChange={() => {}}
      formatValue={(n) => `×${n}`}
    />
  ),
}

/** At the upper bound: the increment button is disabled. */
export const AtUpperBound: S = {
  render: () => (
    <Stepper
      label="Multiplicador"
      value={3}
      min={1}
      max={3}
      onChange={() => {}}
      formatValue={(n) => `×${n}`}
    />
  ),
}

/** A custom step size (here, increments of 5). */
export const CustomStep: S = {
  render: () => {
    const [v, setV] = useState(10)
    return (
      <Stepper label="Pontos" value={v} min={0} max={50} step={5} onChange={setV} />
    )
  },
}

/** Fully disabled: both controls are inert. */
export const Disabled: S = {
  render: () => (
    <Stepper
      label="Multiplicador"
      value={2}
      min={1}
      max={3}
      disabled
      onChange={() => {}}
      formatValue={(n) => `×${n}`}
    />
  ),
}
