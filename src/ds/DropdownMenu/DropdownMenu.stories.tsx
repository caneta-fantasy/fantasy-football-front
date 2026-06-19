import type { Meta, StoryObj } from '@storybook/react'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'
import { Btn } from '../Btn/Btn'

const meta: Meta<typeof DropdownMenu> = {
  title: 'Overlays/DropdownMenu',
  component: DropdownMenu,
  parameters: { layout: 'centered' },
  argTypes: {
    placement: { control: 'inline-radio', options: ['top', 'bottom'] },
    label: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof DropdownMenu>

const teamItems: DropdownMenuItem[] = [
  { id: 'edit', label: 'Editar time', icon: 'edit', shortcut: 'Enter' },
  { id: 'swap', label: 'Trocar', icon: 'swap', shortcut: 't' },
  { id: 'share', label: 'Compartilhar', icon: 'share', shortcut: 's' },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'delete',
    shortcut: 'Backspace',
    danger: true,
  },
]

/** Interactive controls — open with click; navigate with ↑↓, Enter, Esc, or shortcuts. */
export const Playground: S = {
  args: { label: 'Ações do time', placement: 'bottom' },
  render: (args) => (
    <DropdownMenu
      {...args}
      items={teamItems}
      trigger={<Btn variant="ghost" size="sm">Ações</Btn>}
    />
  ),
}

export const Bottom: S = {
  render: () => (
    <DropdownMenu
      label="Ações"
      placement="bottom"
      items={teamItems}
      trigger={<Btn variant="ghost" size="sm">Abaixo</Btn>}
    />
  ),
}

export const Top: S = {
  render: () => (
    <DropdownMenu
      label="Ações"
      placement="top"
      items={teamItems}
      trigger={<Btn variant="ghost" size="sm">Acima</Btn>}
    />
  ),
}

export const WithDisabledItem: S = {
  render: () => (
    <DropdownMenu
      label="Ações"
      items={[
        { id: 'edit', label: 'Editar time', icon: 'edit' },
        { id: 'swap', label: 'Trocar (bloqueado)', icon: 'swap', disabled: true },
        { id: 'delete', label: 'Excluir', icon: 'delete', danger: true },
      ]}
      trigger={<Btn variant="ghost" size="sm">Com item inativo</Btn>}
    />
  ),
}

export const NoIcons: S = {
  render: () => (
    <DropdownMenu
      label="Ordenar"
      items={[
        { id: 'proj', label: 'Projeção' },
        { id: 'val', label: 'Valorização' },
        { id: 'price', label: 'Preço' },
      ]}
      trigger={<Btn variant="ghost" size="sm">Ordenar por</Btn>}
    />
  ),
}
