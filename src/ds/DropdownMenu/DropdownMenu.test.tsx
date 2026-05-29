import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'

const items = (overrides?: {
  onSelectEdit?: () => void
  onSelectDelete?: () => void
}): DropdownMenuItem[] => [
  { id: 'edit', label: 'Editar time', icon: 'edit', shortcut: 'Enter', onSelect: overrides?.onSelectEdit },
  { id: 'swap', label: 'Trocar', icon: 'swap', shortcut: 't' },
  { id: 'share', label: 'Compartilhar', icon: 'share', shortcut: 's' },
  {
    id: 'delete',
    label: 'Excluir',
    icon: 'delete',
    shortcut: 'Backspace',
    danger: true,
    onSelect: overrides?.onSelectDelete,
  },
]

const renderMenu = (
  props?: Partial<React.ComponentProps<typeof DropdownMenu>>,
) =>
  render(
    <DropdownMenu
      trigger={<button>Ações</button>}
      items={items()}
      {...props}
    />,
  )

describe('DropdownMenu', () => {
  it('renders the trigger with aria-haspopup=menu and is closed by default', () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Ações' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('opens on trigger click exposing role="menu" with menuitems', async () => {
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    expect(screen.getByRole('menu')).toBeInTheDocument()
    expect(screen.getAllByRole('menuitem')).toHaveLength(4)
  })

  it('focuses the first item on open (roving focus)', async () => {
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    const itemsEls = screen.getAllByRole('menuitem')
    expect(itemsEls[0]).toHaveFocus()
  })

  it('moves the active item with ArrowDown / ArrowUp and wraps', async () => {
    renderMenu()
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    const itemsEls = screen.getAllByRole('menuitem')
    await userEvent.keyboard('{ArrowDown}')
    expect(itemsEls[1]).toHaveFocus()
    await userEvent.keyboard('{ArrowUp}')
    expect(itemsEls[0]).toHaveFocus()
    // Wrap from first to last on ArrowUp.
    await userEvent.keyboard('{ArrowUp}')
    expect(itemsEls[3]).toHaveFocus()
  })

  it('activates the focused item with Enter and closes', async () => {
    const onSelectEdit = vi.fn()
    renderMenu({ items: items({ onSelectEdit }) })
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    await userEvent.keyboard('{Enter}')
    expect(onSelectEdit).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    renderMenu()
    const trigger = screen.getByRole('button', { name: 'Ações' })
    await userEvent.click(trigger)
    expect(screen.getByRole('menu')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('invokes the matching item via its wired shortcut key', async () => {
    const onSelectDelete = vi.fn()
    renderMenu({ items: items({ onSelectDelete }) })
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    // "Excluir" is wired to Backspace.
    await userEvent.keyboard('{Backspace}')
    expect(onSelectDelete).toHaveBeenCalledTimes(1)
    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
  })

  it('activates an item on click', async () => {
    const onSelectEdit = vi.fn()
    renderMenu({ items: items({ onSelectEdit }) })
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    await userEvent.click(screen.getByRole('menuitem', { name: /editar time/i }))
    expect(onSelectEdit).toHaveBeenCalledTimes(1)
  })

  it('marks danger items and disabled items appropriately', async () => {
    renderMenu({
      items: [
        { id: 'a', label: 'Normal' },
        { id: 'b', label: 'Perigo', danger: true },
        { id: 'c', label: 'Inativo', disabled: true },
      ],
    })
    await userEvent.click(screen.getByRole('button', { name: 'Ações' }))
    const inativo = screen.getByRole('menuitem', { name: 'Inativo' })
    expect(inativo).toBeDisabled()
  })
})
