import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ErrorState } from './ErrorState'

describe('ErrorState', () => {
  it('announces itself via role="alert"', () => {
    render(<ErrorState variant="404" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('renders the 404 copy and code by default', () => {
    render(<ErrorState variant="404" />)
    expect(screen.getByRole('heading', { name: /bola fora/i })).toBeInTheDocument()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('renders the 500 variant copy', () => {
    render(<ErrorState variant="500" />)
    expect(
      screen.getByRole('heading', { name: /caneta no sistema/i }),
    ).toBeInTheDocument()
    expect(screen.getByText('500')).toBeInTheDocument()
  })

  it('renders a retry CTA and fires onRetry when clicked', async () => {
    const onRetry = vi.fn()
    render(<ErrorState variant="500" onRetry={onRetry} />)
    const btn = screen.getByRole('button', { name: /tentar de novo/i })
    await userEvent.click(btn)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('always shows a retry CTA even without an onRetry handler', () => {
    render(<ErrorState variant="404" />)
    expect(
      screen.getByRole('button', { name: /tentar de novo/i }),
    ).toBeInTheDocument()
  })

  it('offline variant exposes a labelled glyph (DS §7)', () => {
    render(<ErrorState variant="offline" />)
    // The offline glyph is meaningful, not decorative: role="img" + a name.
    expect(
      screen.getByRole('img', { name: /sem conex/i }),
    ).toBeInTheDocument()
  })

  it('falls back to the 404 variant for an unknown variant without throwing', () => {
    expect(() =>
      // @ts-expect-error testing the runtime fallback for an unknown variant
      render(<ErrorState variant="teapot" />),
    ).not.toThrow()
    expect(screen.getByText('404')).toBeInTheDocument()
  })

  it('lets a custom retry label override the default', () => {
    render(<ErrorState variant="offline" retryLabel="Reconectar" />)
    expect(
      screen.getByRole('button', { name: 'Reconectar' }),
    ).toBeInTheDocument()
  })

  it('forwards a className and arbitrary props onto the alert', () => {
    render(<ErrorState variant="404" className="my-error" data-testid="err-x" />)
    const el = screen.getByTestId('err-x')
    expect(el).toHaveClass('my-error')
  })
})
