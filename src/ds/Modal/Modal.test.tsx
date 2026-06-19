import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Modal } from './Modal'

afterEach(() => {
  // Scroll-lock writes to body.style; make sure nothing leaks between tests.
  document.body.style.overflow = ''
})

describe('Modal', () => {
  it('renders nothing when closed', () => {
    render(
      <Modal open={false} onClose={() => {}} title="Convidar pra liga">
        body
      </Modal>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog with aria-modal and an accessible name from the title', () => {
    render(
      <Modal open onClose={() => {}} title="Convidar pra liga">
        body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Convidar pra liga')
  })

  it('renders a real close <button> labelled "Fechar"', () => {
    render(
      <Modal open onClose={() => {}} title="Regras">
        body
      </Modal>,
    )
    const close = screen.getByRole('button', { name: /fechar/i })
    expect(close.tagName).toBe('BUTTON')
  })

  it('calls onClose when the close button is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Regras">
        body
      </Modal>,
    )
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls onClose on Escape', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Regras">
        body
      </Modal>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close on Escape when closeOnEsc is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} closeOnEsc={false} title="Regras">
        body
      </Modal>,
    )
    await userEvent.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes when the scrim is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Regras">
        body
      </Modal>,
    )
    // The scrim is the dialog's parent backdrop (aria-hidden).
    const dialog = screen.getByRole('dialog')
    const scrim = dialog.parentElement as HTMLElement
    await userEvent.click(scrim)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not close when content inside the dialog is clicked', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} title="Regras">
        <p>algum conteúdo</p>
      </Modal>,
    )
    await userEvent.click(screen.getByText('algum conteúdo'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('does not close on scrim click when closeOnScrimClick is false', async () => {
    const onClose = vi.fn()
    render(
      <Modal open onClose={onClose} closeOnScrimClick={false} title="Regras">
        body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    const scrim = dialog.parentElement as HTMLElement
    await userEvent.click(scrim)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('locks body scroll while open and restores it on close', () => {
    const { rerender } = render(
      <Modal open onClose={() => {}} title="Regras">
        body
      </Modal>,
    )
    expect(document.body.style.overflow).toBe('hidden')
    rerender(
      <Modal open={false} onClose={() => {}} title="Regras">
        body
      </Modal>,
    )
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('moves focus into the dialog when opened', () => {
    render(
      <Modal open onClose={() => {}} title="Regras">
        <button>Primeiro</button>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('returns focus to the opener when closed', async () => {
    // Render an opener button, open, close, assert focus returned.
    const opener = document.createElement('button')
    opener.textContent = 'abrir'
    document.body.appendChild(opener)
    opener.focus()
    expect(document.activeElement).toBe(opener)

    const { rerender } = render(
      <Modal open onClose={() => {}} title="Regras">
        <button>dentro</button>
      </Modal>,
    )
    rerender(
      <Modal open={false} onClose={() => {}} title="Regras">
        <button>dentro</button>
      </Modal>,
    )
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })

  it('falls back to the default size for an unknown size without throwing', () => {
    expect(() =>
      render(
        // @ts-expect-error testing runtime fallback
        <Modal open onClose={() => {}} title="x" size="nope">
          body
        </Modal>,
      ),
    ).not.toThrow()
  })

  it('renders footer content when provided', () => {
    render(
      <Modal
        open
        onClose={() => {}}
        title="Regras"
        footer={<button>Entendi</button>}
      >
        body
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    expect(
      within(dialog).getByRole('button', { name: 'Entendi' }),
    ).toBeInTheDocument()
  })

  it('traps Tab focus inside the dialog', async () => {
    render(
      <Modal open onClose={() => {}} title="Regras">
        <button>um</button>
        <button>dois</button>
      </Modal>,
    )
    const dialog = screen.getByRole('dialog')
    // Tab repeatedly; focus must never leave the dialog subtree.
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})
