import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { SearchInput } from './SearchInput'

const meta: Meta<typeof SearchInput> = {
  title: 'Forms/SearchInput',
  component: SearchInput,
  args: {
    placeholder: 'Jogador, time…',
    'aria-label': 'Buscar',
  },
  argTypes: {
    loading: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type S = StoryObj<typeof SearchInput>

export const Default: S = {}

export const WithValue: S = {
  args: { defaultValue: 'messi' },
}

export const Loading: S = {
  args: { defaultValue: 'messi', loading: true },
}

export const Error: S = {
  args: { invalid: true, defaultValue: 'xyz' },
}

export const Disabled: S = {
  args: { disabled: true, defaultValue: 'messi' },
}

export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-4 w-[280px]">
      <SearchInput aria-label="empty" placeholder="Jogador, time…" />
      <SearchInput aria-label="with value" defaultValue="messi" />
      <SearchInput aria-label="loading" defaultValue="messi" loading />
      <SearchInput aria-label="error" invalid defaultValue="xyz" />
      <SearchInput aria-label="disabled" disabled defaultValue="messi" />
    </div>
  ),
}

export const Interactive: S = {
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <SearchInput
        {...args}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    )
  },
}
