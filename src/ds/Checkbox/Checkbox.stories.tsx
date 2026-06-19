import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Checkbox } from './Checkbox'

const meta: Meta<typeof Checkbox> = {
  title: 'Forms/Checkbox',
  component: Checkbox,
  parameters: {
    docs: {
      description: {
        component:
          'A real native `<input type="checkbox">` wrapped in a `<label>`, so the whole row toggles it and the label is the accessible name. The signature-green box is decorative (`aria-hidden`); the input stays focusable so the base-layer cobalt focus ring shows. `indeterminate` drives the DOM node’s `.indeterminate` property (it is not a real HTML attribute).',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    indeterminate: { control: 'boolean' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Manter conectado' },
}
export default meta

type S = StoryObj<typeof Checkbox>

/** Interactive controls — toggle label/checked/indeterminate/disabled. */
export const Playground: S = {
  render: (args) => {
    const [checked, setChecked] = useState(false)
    return (
      <Checkbox
        {...args}
        checked={args.checked ?? checked}
        onChange={(e) => setChecked(e.currentTarget.checked)}
      />
    )
  },
}

export const Unchecked: S = { args: { label: 'Aceito os termos' } }
export const Checked: S = {
  args: { label: 'Lembrar de mim', defaultChecked: true },
}
export const Indeterminate: S = {
  args: { label: 'Selecionar todos', indeterminate: true },
}
export const Disabled: S = { args: { label: 'Temporada travada', disabled: true } }
export const DisabledChecked: S = {
  args: { label: 'Pré-selecionado', defaultChecked: true, disabled: true },
}

/** Every state side by side. */
export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Checkbox label="Desligado" />
      <Checkbox label="Ligado" defaultChecked />
      <Checkbox label="Indeterminado" indeterminate />
      <Checkbox label="Desabilitado" disabled />
      <Checkbox label="Desabilitado + ligado" defaultChecked disabled />
    </div>
  ),
}
