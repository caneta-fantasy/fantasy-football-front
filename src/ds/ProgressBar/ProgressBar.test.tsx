import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressBar } from './ProgressBar'

describe('ProgressBar', () => {
  it('exposes role="progressbar" with the ARIA value contract', () => {
    render(<ProgressBar value={40} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '100')
  })

  it('respects a custom max in aria-valuemax and aria-valuenow', () => {
    render(<ProgressBar value={30} max={60} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '30')
    expect(bar).toHaveAttribute('aria-valuemax', '60')
  })

  it('clamps fill width to 100% when value exceeds max', () => {
    const { container } = render(<ProgressBar value={150} max={100} />)
    const fill = container.querySelector('[data-ds-progress-fill]') as HTMLElement
    expect(fill.style.width).toBe('100%')
    // aria-valuenow still reports the real (over-max) value for AT.
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '150')
  })

  it('renders an empty (0%) fill without throwing', () => {
    const { container } = render(<ProgressBar value={0} />)
    const fill = container.querySelector('[data-ds-progress-fill]') as HTMLElement
    expect(fill.style.width).toBe('0%')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('clamps a negative value to 0% fill', () => {
    const { container } = render(<ProgressBar value={-20} />)
    const fill = container.querySelector('[data-ds-progress-fill]') as HTMLElement
    expect(fill.style.width).toBe('0%')
  })

  it('applies a threshold color: success under warning, danger over the cutoff', () => {
    const { container: low } = render(<ProgressBar value={10} />)
    const lowFill = low.querySelector('[data-ds-progress-fill]') as HTMLElement
    expect(lowFill.className).toContain('bg-success')

    const { container: high } = render(<ProgressBar value={95} />)
    const highFill = high.querySelector('[data-ds-progress-fill]') as HTMLElement
    expect(highFill.className).toContain('bg-danger')
  })

  it('uses an explicit tone over the threshold heuristic when given', () => {
    const { container } = render(<ProgressBar value={95} tone="success" />)
    const fill = container.querySelector('[data-ds-progress-fill]') as HTMLElement
    expect(fill.className).toContain('bg-success')
  })

  it('falls back to the success tone for an unknown tone without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<ProgressBar value={50} tone="nope" />),
    ).not.toThrow()
  })

  it('uses an accessible label when provided', () => {
    render(<ProgressBar value={50} label="Orçamento" />)
    expect(screen.getByRole('progressbar', { name: 'Orçamento' })).toBeInTheDocument()
  })
})
