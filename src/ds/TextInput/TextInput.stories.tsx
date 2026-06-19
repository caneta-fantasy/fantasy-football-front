import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { TextInput } from './TextInput'

const meta: Meta<typeof TextInput> = {
  title: 'Forms/TextInput',
  component: TextInput,
  args: {
    placeholder: 'nome@email.com',
    'aria-label': 'E-mail',
  },
  argTypes: {
    leadingIcon: { control: 'text' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type S = StoryObj<typeof TextInput>

export const Default: S = {}

export const Filled: S = {
  args: { defaultValue: 'luana@khouri.fc' },
}

export const WithLeadingIcon: S = {
  args: { leadingIcon: 'search', placeholder: 'Jogador, time…', 'aria-label': 'Buscar' },
}

export const WithPrefix: S = {
  args: { prefix: 'R$', defaultValue: '120,0', 'aria-label': 'Orçamento' },
}

export const WithSuffix: S = {
  args: { suffix: 'mi', defaultValue: '120,0', 'aria-label': 'Orçamento' },
}

export const WithPrefixAndSuffix: S = {
  args: { prefix: 'R$', suffix: 'mi', defaultValue: '120,0', 'aria-label': 'Orçamento' },
}

export const Error: S = {
  args: { invalid: true, defaultValue: 'luana@khouri', 'aria-label': 'E-mail' },
}

export const Disabled: S = {
  args: { disabled: true, defaultValue: 'Caneta FC', 'aria-label': 'Time' },
}

export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <TextInput aria-label="default" placeholder="default" />
      <TextInput aria-label="filled" defaultValue="luana@khouri.fc" />
      <TextInput aria-label="with icon" leadingIcon="search" placeholder="Jogador, time…" />
      <TextInput aria-label="prefix" prefix="R$" defaultValue="120,0" />
      <TextInput aria-label="error" invalid defaultValue="luana@khouri" />
      <TextInput aria-label="disabled" disabled defaultValue="Caneta FC" />
    </div>
  ),
}

export const Interactive: S = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <TextInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}
