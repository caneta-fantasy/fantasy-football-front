import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Slider } from './Slider'

const meta: Meta<typeof Slider> = {
  title: 'Forms/Slider',
  component: Slider,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A real, styled `<input type="range">`. Carries the implicit `slider` role and the full native keyboard model (arrows, Home/End, PageUp/PageDown). `aria-valuemin`/`aria-valuemax`/`aria-valuenow` are set explicitly from `min`/`max`/`value`. The lime track fill is value-driven via a computed `--ds-slider-fill` custom property, so it always matches the real value. Label it with `aria-label` or an external `<label htmlFor>`.',
      },
    },
  },
  argTypes: {
    min: { control: 'number' },
    max: { control: 'number' },
    step: { control: 'number' },
    value: { control: 'number' },
    disabled: { control: 'boolean' },
  },
  args: { min: 0, max: 100, step: 1, disabled: false },
}
export default meta

type S = StoryObj<typeof Slider>

/** Interactive controls — tweak min/max/step/value/disabled live. */
export const Playground: S = {
  render: (args) => {
    const [v, setV] = useState(args.value ?? 50)
    return (
      <div className="w-[320px]">
        <Slider
          {...args}
          aria-label="Valor"
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
        />
      </div>
    )
  },
  args: { value: 50 },
}

/** The domain example from screens/08-forms.jsx: price between two bounds. */
export const PriceFilter: S = {
  render: () => {
    const [v, setV] = useState(4.5)
    return (
      <div className="w-[320px]">
        <Slider
          aria-label="Preço"
          min={2.5}
          max={9}
          step={0.5}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
        />
        <div className="mt-3 flex justify-between font-mono text-[11px] font-bold text-text">
          <span>R$ {v.toFixed(1)} mi</span>
          <span className="text-text-subtle">R$ 9,0 mi</span>
        </div>
      </div>
    )
  },
}

/** Empty (value at minimum) — the track shows no fill. */
export const AtMinimum: S = {
  render: () => (
    <div className="w-[320px]">
      <Slider aria-label="Valor" min={0} max={100} value={0} onChange={() => {}} />
    </div>
  ),
}

/** Full (value at maximum) — the track fills completely. */
export const AtMaximum: S = {
  render: () => (
    <div className="w-[320px]">
      <Slider aria-label="Valor" min={0} max={100} value={100} onChange={() => {}} />
    </div>
  ),
}

/** Disabled — non-interactive, dimmed. */
export const Disabled: S = {
  render: () => (
    <div className="w-[320px]">
      <Slider
        aria-label="Valor"
        min={0}
        max={100}
        value={40}
        disabled
        onChange={() => {}}
      />
    </div>
  ),
}

/** Labelled via an external <label htmlFor> for full screen-reader association. */
export const WithLabel: S = {
  render: () => {
    const [v, setV] = useState(60)
    return (
      <div className="w-[320px]">
        <label
          htmlFor="ds-slider-demo"
          className="mb-2 block font-mono text-[11px] font-bold uppercase tracking-[2px] text-text-muted"
        >
          Intensidade
        </label>
        <Slider
          id="ds-slider-demo"
          min={0}
          max={100}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
        />
      </div>
    )
  },
}
