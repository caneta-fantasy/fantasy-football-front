import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Popover } from './Popover'

const renderPopover = (props?: Partial<React.ComponentProps<typeof Popover>>) =>
  render(
    <div>
      <Popover trigger={<button>Ordenar por</button>} {...props}>
        <button>Projeção</button>
        <button>Preço</button>
      </Popover>
      <button>fora</button>
    </div>,
  )

describe('Popover', () => {
  it('renders the trigger and the panel is closed by default', () => {
    renderPopover()
    expect(
      screen.getByRole('button', { name: 'Ordenar por' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens on trigger click and wires aria-expanded / aria-haspopup', async () => {
    renderPopover()
    const trigger = screen.getByRole('button', { name: 'Ordenar por' })
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog')
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('moves focus into the panel on open', async () => {
    renderPopover()
    await userEvent.click(screen.getByRole('button', { name: 'Ordenar por' }))
    const panel = screen.getByRole('dialog')
    expect(panel.contains(document.activeElement)).toBe(true)
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    renderPopover()
    const trigger = screen.getByRole('button', { name: 'Ordenar por' })
    await userEvent.click(trigger)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes on an outside click', async () => {
    renderPopover()
    await userEvent.click(screen.getByRole('button', { name: 'Ordenar por' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'fora' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('does not close when clicking inside the panel', async () => {
    renderPopover()
    await userEvent.click(screen.getByRole('button', { name: 'Ordenar por' }))
    await userEvent.click(screen.getByRole('button', { name: 'Projeção' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('exposes its panel at the popover z-index layer', async () => {
    renderPopover()
    await userEvent.click(screen.getByRole('button', { name: 'Ordenar por' }))
    expect(screen.getByRole('dialog').className).toContain('z-popover')
  })

  it('uses an accessible name from the label prop', async () => {
    renderPopover({ label: 'Opções de ordenação' })
    await userEvent.click(screen.getByRole('button', { name: 'Ordenar por' }))
    expect(screen.getByRole('dialog')).toHaveAccessibleName(
      'Opções de ordenação',
    )
  })

  it('falls back to the default placement for an unknown value without throwing', () => {
    expect(() =>
      render(
        <Popover
          trigger={<button>t</button>}
          // @ts-expect-error testing runtime fallback
          placement="nope"
        >
          <button>x</button>
        </Popover>,
      ),
    ).not.toThrow()
  })
})
