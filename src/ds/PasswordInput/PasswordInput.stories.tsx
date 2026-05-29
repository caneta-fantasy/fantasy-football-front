import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { PasswordInput } from './PasswordInput'

const meta: Meta<typeof PasswordInput> = {
  title: 'Forms/PasswordInput',
  component: PasswordInput,
  args: {
    placeholder: '••••••••',
    'aria-label': 'Senha',
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    defaultVisible: { control: 'boolean' },
  },
}
export default meta
type S = StoryObj<typeof PasswordInput>

export const Default: S = {}

export const Filled: S = {
  args: { defaultValue: 'hunter2' },
}

export const Revealed: S = {
  args: { defaultValue: 'hunter2', defaultVisible: true },
}

export const Error: S = {
  args: { invalid: true, defaultValue: 'curta' },
}

export const Disabled: S = {
  args: { disabled: true, defaultValue: 'hunter2' },
}

export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <PasswordInput aria-label="hidden" placeholder="oculta" />
      <PasswordInput aria-label="revealed" defaultValue="hunter2" defaultVisible />
      <PasswordInput aria-label="error" invalid defaultValue="curta" />
      <PasswordInput aria-label="disabled" disabled defaultValue="hunter2" />
    </div>
  ),
}

export const Interactive: S = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <PasswordInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}
