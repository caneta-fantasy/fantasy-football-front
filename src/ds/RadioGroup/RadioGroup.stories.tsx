import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RadioGroup } from './RadioGroup'
import { Radio } from '../Radio/Radio'

const meta: Meta<typeof RadioGroup> = {
  title: 'Forms/RadioGroup',
  component: RadioGroup,
  parameters: {
    docs: {
      description: {
        component:
          'A `role="radiogroup"` containing real native `<input type="radio">` children that share one `name`. Implements the WAI-ARIA roving-tabindex model: Tab enters/leaves the whole group, then ArrowDown/Right and ArrowUp/Left move and select the next/previous enabled radio, wrapping at the ends and skipping disabled radios. `Radio` only works inside a `RadioGroup`.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Tipo de draft', name: 'draft' },
}
export default meta

type S = StoryObj<typeof RadioGroup>

const DRAFT_OPTIONS = (
  <>
    <Radio value="snake" label="Vai e Vem" />
    <Radio value="linear" label="Linear" />
    <Radio value="auction" label="Auction" />
  </>
)

/** Interactive controls — selection is managed locally. */
export const Playground: S = {
  render: (args) => {
    const [value, setValue] = useState('snake')
    return (
      <RadioGroup {...args} value={value} onChange={setValue}>
        {DRAFT_OPTIONS}
      </RadioGroup>
    )
  },
}

/** Nothing selected yet — the first radio is the roving entry point. */
export const Unselected: S = {
  render: () => (
    <RadioGroup label="Tipo de draft" name="draft-unselected">
      {DRAFT_OPTIONS}
    </RadioGroup>
  ),
}

/** A controlled selection. */
export const Selected: S = {
  render: () => {
    const [value, setValue] = useState('linear')
    return (
      <RadioGroup
        label="Tipo de draft"
        name="draft-selected"
        value={value}
        onChange={setValue}
      >
        {DRAFT_OPTIONS}
      </RadioGroup>
    )
  },
}

/** Required: a signature-green asterisk on the label + `aria-required` on the group. */
export const Required: S = {
  render: () => {
    const [value, setValue] = useState('')
    return (
      <RadioGroup
        label="Tipo de draft"
        name="draft-required"
        required
        value={value}
        onChange={setValue}
      >
        {DRAFT_OPTIONS}
      </RadioGroup>
    )
  },
}

/** A disabled option is skipped by arrow-key navigation. */
export const WithDisabledOption: S = {
  render: () => {
    const [value, setValue] = useState('snake')
    return (
      <RadioGroup
        label="Tipo de draft"
        name="draft-mixed"
        value={value}
        onChange={setValue}
      >
        <Radio value="snake" label="Vai e Vem" />
        <Radio value="linear" label="Linear" />
        <Radio value="auction" label="Auction (em breve)" disabled />
      </RadioGroup>
    )
  },
}

/** The whole group disabled. */
export const Disabled: S = {
  render: () => (
    <RadioGroup label="Tipo de draft" name="draft-disabled" value="snake" disabled>
      {DRAFT_OPTIONS}
    </RadioGroup>
  ),
}
