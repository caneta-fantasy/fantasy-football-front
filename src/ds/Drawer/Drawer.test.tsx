import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Drawer } from './Drawer'

afterEach(() => {
  document.body.style.overflow = ''
})

describe('Drawer', () => {
  it('renders nothing when closed', () => {
    render(
      <Drawer open={false} onClose={() => {}} title="Pedro Henrique">
        body
      </Drawer>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog with aria-modal and an accessible name', () => {
    render(
      <Drawer open onClose={() => {}} title="Pedro Henrique">
        body
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Pedro Henrique')
  })

  it('renders a real close <button> labelled "Fechar"', () => {
    render(
      <Drawer open onClose={() => {}} title="Pedro Henrique">
        body
      </Drawer>,
    )
    const close = screen.getByRole('button', { name: /fechar/i })
    expect(close.tagName).toBe('BUTTON')
  })

  it('closes via the close button, Esc, and scrim', async () => {
    const onClose = vi.fn()
    render(
      <Drawer open onClose={onClose} title="Pedro Henrique">
        body
      </Drawer>,
    )
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    await userEvent.keyboard('{Escape}')
    const dialog = screen.getByRole('dialog')
    const scrim = dialog.parentElement as HTMLElement
    await userEvent.click(scrim)
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('locks body scroll while open', () => {
    render(
      <Drawer open onClose={() => {}} title="X">
        body
      </Drawer>,
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('moves focus into the drawer when opened', () => {
    render(
      <Drawer open onClose={() => {}} title="X">
        <button>dentro</button>
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('applies the left side classes when side="left"', () => {
    render(
      <Drawer open onClose={() => {}} title="X" side="left">
        body
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.className).toMatch(/left-0/)
  })

  it('defaults to the right side', () => {
    render(
      <Drawer open onClose={() => {}} title="X">
        body
      </Drawer>,
    )
    expect(screen.getByRole('dialog').className).toMatch(/right-0/)
  })

  it('falls back to the right side for an unknown side without throwing', () => {
    expect(() =>
      render(
        // @ts-expect-error testing runtime fallback
        <Drawer open onClose={() => {}} title="X" side="nope">
          body
        </Drawer>,
      ),
    ).not.toThrow()
  })

  it('traps Tab focus inside the drawer', async () => {
    render(
      <Drawer open onClose={() => {}} title="X">
        <button>um</button>
        <button>dois</button>
      </Drawer>,
    )
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})
