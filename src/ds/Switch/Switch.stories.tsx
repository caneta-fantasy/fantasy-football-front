import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Switch } from './Switch'

const meta: Meta<typeof Switch> = {
  title: 'Forms/Switch',
  component: Switch,
  parameters: {
    docs: {
      description: {
        component:
          'A real `<button role="switch">` with `aria-checked`. Space/Enter toggle it (native button) and it never submits a form (`type="button"`). Works controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`). The track/thumb animate via CSS (neutralized under `prefers-reduced-motion` by the base layer).',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { label: 'Notificações' },
}
export default meta

type S = StoryObj<typeof Switch>

/** Interactive controls — drive it controlled from the panel. */
export const Playground: S = {
  render: (args) => {
    const [on, setOn] = useState(false)
    return (
      <Switch
        {...args}
        checked={args.checked ?? on}
        onChange={(next) => setOn(next)}
      />
    )
  },
}

export const Off: S = { args: { label: 'Auto-pick', defaultChecked: false } }
export const On: S = { args: { label: 'Notificações', defaultChecked: true } }
export const Disabled: S = {
  args: { label: 'Travado', defaultChecked: true, disabled: true },
}
export const DisabledOff: S = {
  args: { label: 'Indisponível', disabled: true },
}

/** Every state side by side. */
export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Switch label="Desligado" defaultChecked={false} />
      <Switch label="Ligado" defaultChecked />
      <Switch label="Desabilitado (off)" disabled />
      <Switch label="Desabilitado (on)" defaultChecked disabled />
    </div>
  ),
}
