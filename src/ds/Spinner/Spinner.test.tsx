import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Spinner } from './Spinner'

describe('Spinner', () => {
  it('exposes role="status" with the accessible name "Carregando"', () => {
    render(<Spinner />)
    expect(screen.getByRole('status', { name: 'Carregando' })).toBeInTheDocument()
  })

  it('renders an SVG arc that is hidden from assistive tech (the label carries the meaning)', () => {
    const { container } = render(<Spinner />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('applies the default size (20) to the SVG', () => {
    const { container } = render(<Spinner />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('width', '20')
    expect(svg).toHaveAttribute('height', '20')
  })

  it('honors a custom size, color and stroke', () => {
    const { container } = render(<Spinner size={32} color="red" stroke={4} />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('width', '32')
    expect(svg).toHaveAttribute('height', '32')
    const arc = svg.querySelector('[stroke="red"]')
    expect(arc).not.toBeNull()
    expect(arc).toHaveAttribute('stroke-width', '4')
  })

  it('defaults the arc color to the caneta lime-deep token', () => {
    const { container } = render(<Spinner />)
    const arc = container.querySelector('svg [stroke="var(--caneta-lime-deep)"]')
    expect(arc).not.toBeNull()
    expect(arc).toHaveAttribute('stroke-width', '2.5')
  })

  it('forwards arbitrary props (e.g. className, aria-label override) to the status element', () => {
    render(<Spinner className="my-spin" aria-label="Aguarde" />)
    const status = screen.getByRole('status', { name: 'Aguarde' })
    expect(status).toHaveClass('my-spin')
  })
})
