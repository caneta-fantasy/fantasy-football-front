import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Radio } from './Radio'
import { RadioGroup } from '../RadioGroup/RadioGroup'

/**
 * `Radio` is a leaf control that MUST live inside a {@link RadioGroup}, which
 * supplies the shared `name`, the selected value, roving tabindex and the
 * arrow-key navigation. These stories always render it within a group.
 */
const meta: Meta<typeof Radio> = {
  title: 'Forms/Radio',
  component: Radio,
  parameters: {
    docs: {
      description: {
        component:
          'A single real native `<input type="radio">`. It only works inside a `RadioGroup`. The lime pip is decorative (`aria-hidden`); the input is focusable so the base-layer focus ring shows. See `Forms/RadioGroup` for the full keyboard model.',
      },
    },
  },
}
export default meta

type S = StoryObj<typeof Radio>

/** A single enabled radio inside a minimal group. */
export const InsideGroup: S = {
  render: () => {
    const [value, setValue] = useState('on')
    return (
      <RadioGroup label="Exemplo" name="radio-single" value={value} onChange={setValue}>
        <Radio value="on" label="Selecionado" />
        <Radio value="off" label="Não selecionado" />
      </RadioGroup>
    )
  },
}

/** A disabled radio (skipped by arrow navigation). */
export const Disabled: S = {
  render: () => (
    <RadioGroup label="Exemplo" name="radio-disabled" value="a">
      <Radio value="a" label="Ativo" />
      <Radio value="b" label="Desabilitado" disabled />
    </RadioGroup>
  ),
}
