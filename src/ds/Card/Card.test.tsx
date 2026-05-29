import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders a non-interactive card as a plain <div> (no button role)', () => {
    render(<Card>Conteúdo</Card>)
    const el = screen.getByText('Conteúdo')
    expect(el.tagName).toBe('DIV')
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders an interactive card as a real <button> that fires onClick', async () => {
    const onClick = vi.fn()
    render(
      <Card interactive onClick={onClick}>
        Escolher time
      </Card>,
    )
    const btn = screen.getByRole('button', { name: 'Escolher time' })
    expect(btn.tagName).toBe('BUTTON')
    // A native button defaults to type=button so it never submits a form.
    expect(btn).toHaveAttribute('type', 'button')
    await userEvent.click(btn)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('exposes aria-pressed reflecting the selected state on an interactive card', () => {
    const { rerender } = render(
      <Card interactive selected>
        Time A
      </Card>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(btn).toHaveAttribute('aria-selected', 'true')

    rerender(
      <Card interactive selected={false}>
        Time A
      </Card>,
    )
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByRole('button')).toHaveAttribute('aria-selected', 'false')
  })

  it('does not leak aria-pressed/aria-selected onto a non-interactive div', () => {
    render(<Card selected>Estático</Card>)
    const el = screen.getByText('Estático')
    expect(el).not.toHaveAttribute('aria-pressed')
    expect(el).not.toHaveAttribute('aria-selected')
  })

  it('falls back to the surface tone for an unknown tone without throwing (DS §7 #1)', () => {
    expect(() =>
      // @ts-expect-error testing the runtime fallback for an unknown tone
      render(<Card tone="nope">x</Card>),
    ).not.toThrow()
    // The surface tone is the fallback: it uses the surface background utility.
    expect(screen.getByText('x').className).toContain('bg-surface')
  })

  it('applies the requested tone (lime) classes', () => {
    render(<Card tone="lime">Lima</Card>)
    expect(screen.getByText('Lima').className).toContain('bg-lime')
  })

  it('applies a custom padding utility when padding is provided', () => {
    render(<Card padding="p-8">Espaçoso</Card>)
    expect(screen.getByText('Espaçoso').className).toContain('p-8')
  })

  it('forwards a className and arbitrary props onto the rendered element', () => {
    render(
      <Card className="my-card" data-testid="card-x">
        Extra
      </Card>,
    )
    const el = screen.getByTestId('card-x')
    expect(el).toHaveClass('my-card')
  })

  it('passes a disabled interactive card through to the native button', async () => {
    const onClick = vi.fn()
    render(
      <Card interactive disabled onClick={onClick}>
        Indisponível
      </Card>,
    )
    const btn = screen.getByRole('button')
    expect(btn).toBeDisabled()
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})
