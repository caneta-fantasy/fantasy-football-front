import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('exposes role="progressbar" with the ARIA value contract', () => {
    render(<ProgressRing value={82} />)
    const ring = screen.getByRole('progressbar')
    expect(ring).toHaveAttribute('aria-valuenow', '82')
    expect(ring).toHaveAttribute('aria-valuemin', '0')
    expect(ring).toHaveAttribute('aria-valuemax', '100')
  })

  it('respects a custom max', () => {
    render(<ProgressRing value={9} max={12} />)
    const ring = screen.getByRole('progressbar')
    expect(ring).toHaveAttribute('aria-valuenow', '9')
    expect(ring).toHaveAttribute('aria-valuemax', '12')
  })

  it('renders the visible label and sub text', () => {
    render(<ProgressRing value={45} label="45%" sub="DRAFT" />)
    expect(screen.getByText('45%')).toBeInTheDocument()
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
  })

  it('decorative text inside the ring is hidden from assistive tech', () => {
    render(<ProgressRing value={45} label="45%" sub="DRAFT" />)
    // The accessible name comes from the label prop / aria, not the visual text.
    const ring = screen.getByRole('progressbar')
    // The visual label node carries aria-hidden so AT does not double-read it.
    expect(screen.getByText('45%').closest('[aria-hidden="true"]')).toBeTruthy()
    expect(ring).toBeInTheDocument()
  })

  it('clamps the drawn arc at 100% when value exceeds max but reports the real value', () => {
    render(<ProgressRing value={130} max={100} />)
    const ring = screen.getByRole('progressbar')
    expect(ring).toHaveAttribute('aria-valuenow', '130')
    // No throw and the progress arc circle exists.
    const arc = ring.querySelector('[data-ds-ring-arc]') as SVGCircleElement
    expect(arc).toBeTruthy()
  })

  it('handles an empty (0) value without throwing', () => {
    expect(() => render(<ProgressRing value={0} />)).not.toThrow()
  })

  it('uses an accessible label when ariaLabel is provided', () => {
    render(<ProgressRing value={82} ariaLabel="Salário usado" />)
    expect(
      screen.getByRole('progressbar', { name: 'Salário usado' }),
    ).toBeInTheDocument()
  })
})
