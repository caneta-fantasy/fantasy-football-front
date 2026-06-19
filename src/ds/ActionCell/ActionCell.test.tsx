import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ActionCell } from './ActionCell'

describe('ActionCell — state matrix', () => {
  it('add → cobalt "+ Add" button that fires onAction', async () => {
    const onAction = vi.fn()
    render(<ActionCell kind="add" onAction={onAction} />)
    const btn = screen.getByRole('button', { name: /add/i })
    await userEvent.click(btn)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('waiver → gold "Oferta" button that fires onAction', async () => {
    const onAction = vi.fn()
    render(<ActionCell kind="waiver" onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: /oferta/i }))
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('oferta → a disabled Oferta button (claim already filed)', () => {
    render(<ActionCell kind="oferta" />)
    const btn = screen.getByRole('button', { name: /oferta/i })
    expect(btn).toBeDisabled()
  })

  it('drop → "Liberar" button; loading shows the busy spinner', async () => {
    const onAction = vi.fn()
    const { rerender } = render(<ActionCell kind="drop" onAction={onAction} />)
    await userEvent.click(screen.getByRole('button', { name: /liberar/i }))
    expect(onAction).toHaveBeenCalled()
    rerender(<ActionCell kind="drop" onAction={onAction} loading />)
    expect(screen.getByRole('button', { name: /liberar/i })).toHaveAttribute('aria-busy', 'true')
  })

  it('drop → disabled when no slot is resolvable', () => {
    render(<ActionCell kind="drop" disabled />)
    expect(screen.getByRole('button', { name: /liberar/i })).toBeDisabled()
  })

  it('escalado → a locked chip (not a button) with a describing aria-label', () => {
    render(<ActionCell kind="escalado" tooltip="Escalado por Os Galácticos" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/escalado — escalado por os galácticos/i)).toBeInTheDocument()
  })

  it('bloqueado → a locked "Bloqueado" chip', () => {
    render(<ActionCell kind="bloqueado" />)
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('draft → a "Draft pendente" chip', () => {
    render(<ActionCell kind="draft" />)
    expect(screen.getByText('Draft pendente')).toBeInTheDocument()
  })
})
