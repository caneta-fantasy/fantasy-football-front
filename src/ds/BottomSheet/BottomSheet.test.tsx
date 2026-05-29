import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { BottomSheet } from './BottomSheet'

afterEach(() => {
  document.body.style.overflow = ''
})

// jsdom does not implement PointerEvent, and @testing-library's fireEvent does
// not propagate coordinate fields for pointer events. Dispatch a plain Event
// with the coordinate assigned as a property — React's synthetic event reads
// it just as it would from a real browser PointerEvent.
function pointer(el: Element, type: string, clientY: number) {
  const ev = new Event(type, { bubbles: true, cancelable: true }) as Event & {
    clientY: number
    pointerId: number
  }
  ev.clientY = clientY
  ev.pointerId = 1
  el.dispatchEvent(ev)
}

describe('BottomSheet', () => {
  it('renders nothing when closed', () => {
    render(
      <BottomSheet open={false} onClose={() => {}} title="Yuri Alberto">
        body
      </BottomSheet>,
    )
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders a dialog with aria-modal and an accessible name', () => {
    render(
      <BottomSheet open onClose={() => {}} title="Yuri Alberto">
        body
      </BottomSheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Yuri Alberto')
  })

  it('renders a real drag-handle <button> labelled to dismiss', () => {
    render(
      <BottomSheet open onClose={() => {}} title="Yuri Alberto">
        body
      </BottomSheet>,
    )
    const handle = screen.getByRole('button', { name: /fechar/i })
    expect(handle.tagName).toBe('BUTTON')
  })

  it('closes via Esc and scrim', async () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open onClose={onClose} title="Yuri Alberto">
        body
      </BottomSheet>,
    )
    await userEvent.keyboard('{Escape}')
    const dialog = screen.getByRole('dialog')
    const scrim = dialog.parentElement as HTMLElement
    await userEvent.click(scrim)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('closes when the handle button is activated', async () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open onClose={onClose} title="Yuri Alberto">
        body
      </BottomSheet>,
    )
    await userEvent.click(screen.getByRole('button', { name: /fechar/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('locks body scroll while open', () => {
    render(
      <BottomSheet open onClose={() => {}} title="X">
        body
      </BottomSheet>,
    )
    expect(document.body.style.overflow).toBe('hidden')
  })

  it('moves focus into the sheet when opened', () => {
    render(
      <BottomSheet open onClose={() => {}} title="X">
        <button>dentro</button>
      </BottomSheet>,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('dismisses when dragged down past the threshold', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open onClose={onClose} title="X">
        body
      </BottomSheet>,
    )
    const handle = screen.getByRole('button', { name: /fechar/i })
    // Simulate a downward drag well past the dismiss threshold.
    pointer(handle, 'pointerdown', 100)
    pointer(handle, 'pointermove', 300)
    pointer(handle, 'pointerup', 300)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does NOT dismiss when dragged down a tiny amount', () => {
    const onClose = vi.fn()
    render(
      <BottomSheet open onClose={onClose} title="X">
        body
      </BottomSheet>,
    )
    const handle = screen.getByRole('button', { name: /fechar/i })
    pointer(handle, 'pointerdown', 100)
    pointer(handle, 'pointermove', 110)
    pointer(handle, 'pointerup', 110)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('traps Tab focus inside the sheet', async () => {
    render(
      <BottomSheet open onClose={() => {}} title="X">
        <button>um</button>
        <button>dois</button>
      </BottomSheet>,
    )
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 6; i++) {
      await userEvent.tab()
      expect(dialog.contains(document.activeElement)).toBe(true)
    }
  })
})
