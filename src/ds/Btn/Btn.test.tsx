import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Btn } from './Btn'

describe('Btn', () => {
  it('renders a native button with its label', () => {
    render(<Btn>Entrar</Btn>)
    const btn = screen.getByRole('button', { name: 'Entrar' })
    expect(btn).toBeInTheDocument()
    expect(btn.tagName).toBe('BUTTON')
  })

  it('forwards the native type attribute', () => {
    render(<Btn type="submit">Enviar</Btn>)
    expect(screen.getByRole('button', { name: 'Enviar' })).toHaveAttribute(
      'type',
      'submit',
    )
  })

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn()
    render(<Btn onClick={onClick}>Entrar</Btn>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('when loading, sets aria-busy and is not clickable', async () => {
    const onClick = vi.fn()
    render(
      <Btn loading onClick={onClick}>
        Entrar
      </Btn>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-busy', 'true')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('when loading, renders the Spinner status and preserves the label', () => {
    render(<Btn loading>Aguarde</Btn>)
    // Spinner exposes role="status" with the accessible name "Carregando".
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
    // Label text stays in the DOM so the button keeps its width.
    expect(screen.getByText('Aguarde')).toBeInTheDocument()
  })

  it('does not render a Spinner when not loading', () => {
    render(<Btn>Entrar</Btn>)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('when explicitly disabled (not loading), has no aria-busy', () => {
    render(<Btn disabled>Entrar</Btn>)
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    expect(btn).not.toHaveAttribute('aria-busy')
  })

  it('falls back to primary for an unknown variant without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<Btn variant="nope">x</Btn>),
    ).not.toThrow()
  })

  it('falls back to md for an unknown size without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<Btn size="nope">x</Btn>),
    ).not.toThrow()
  })

  it('applies the danger variant classes', () => {
    render(<Btn variant="danger">Excluir</Btn>)
    expect(screen.getByRole('button')).toHaveClass('bg-red')
  })
})
