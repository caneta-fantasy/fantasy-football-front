import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BudgetMeter } from './BudgetMeter'

describe('BudgetMeter', () => {
  it('exposes role="progressbar" with the ARIA value contract', () => {
    render(<BudgetMeter value={60} max={120} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '60')
    expect(bar).toHaveAttribute('aria-valuemin', '0')
    expect(bar).toHaveAttribute('aria-valuemax', '120')
  })

  it('drives the fill WIDTH from value/max (DS §7 #6 — never always-full)', () => {
    const { container } = render(<BudgetMeter value={30} max={120} />)
    const fill = container.querySelector('[data-ds-budget-fill]') as HTMLElement
    // 30 / 120 = 25%
    expect(fill.style.width).toBe('25%')
  })

  it('renders an empty (0%) fill without throwing', () => {
    const { container } = render(<BudgetMeter value={0} max={120} />)
    const fill = container.querySelector('[data-ds-budget-fill]') as HTMLElement
    expect(fill.style.width).toBe('0%')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0')
  })

  it('clamps the drawn fill to 100% when over budget, but keeps the real aria-valuenow', () => {
    const { container } = render(<BudgetMeter value={150} max={120} />)
    const fill = container.querySelector('[data-ds-budget-fill]') as HTMLElement
    expect(fill.style.width).toBe('100%')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '150')
  })

  it('clamps a negative value to 0% fill', () => {
    const { container } = render(<BudgetMeter value={-20} max={120} />)
    const fill = container.querySelector('[data-ds-budget-fill]') as HTMLElement
    expect(fill.style.width).toBe('0%')
  })

  it('applies threshold colors: green when healthy, warning amber on warning, danger near the cap', () => {
    const { container: low } = render(<BudgetMeter value={10} max={120} />)
    expect(
      (low.querySelector('[data-ds-budget-fill]') as HTMLElement).className,
    ).toContain('bg-signature')

    const { container: warn } = render(<BudgetMeter value={100} max={120} />)
    expect(
      (warn.querySelector('[data-ds-budget-fill]') as HTMLElement).className,
    ).toContain('bg-warning')

    const { container: high } = render(<BudgetMeter value={116} max={120} />)
    expect(
      (high.querySelector('[data-ds-budget-fill]') as HTMLElement).className,
    ).toContain('bg-danger')
  })

  it('gives a clear over-budget treatment past 100% (brick-danger fill + over-budget flag)', () => {
    const { container } = render(<BudgetMeter value={130} max={120} />)
    const root = screen.getByRole('progressbar')
    expect(root).toHaveAttribute('data-over-budget', 'true')
    const fill = container.querySelector('[data-ds-budget-fill]') as HTMLElement
    expect(fill.className).toContain('bg-danger')
  })

  it('does not flag over-budget when exactly at the cap', () => {
    render(<BudgetMeter value={120} max={120} />)
    expect(screen.getByRole('progressbar')).not.toHaveAttribute('data-over-budget')
  })

  it('uses an explicit accessible label when provided', () => {
    render(<BudgetMeter value={60} max={120} label="Orçamento da liga" />)
    expect(
      screen.getByRole('progressbar', { name: 'Orçamento da liga' }),
    ).toBeInTheDocument()
  })

  it('falls back to a sensible max without throwing when max is non-positive', () => {
    const { container } = render(<BudgetMeter value={50} max={0} />)
    // max coerced to 100; 50/100 = 50%
    const fill = container.querySelector('[data-ds-budget-fill]') as HTMLElement
    expect(fill.style.width).toBe('50%')
    expect(() => render(<BudgetMeter value={50} max={-5} />)).not.toThrow()
  })

  it('renders a formatted spent/cap caption with a currency prefix', () => {
    render(<BudgetMeter value={98.4} max={120} currency="R$" unit="mi" />)
    // raw numbers are surfaced in the caption text
    expect(screen.getByText(/R\$/)).toBeInTheDocument()
    expect(screen.getByText(/120/)).toBeInTheDocument()
  })

  it('shows the optional transfer-penalty hint when provided', () => {
    render(<BudgetMeter value={130} max={120} hint="+1 transfer = -4 pts" />)
    expect(screen.getByText('+1 transfer = -4 pts')).toBeInTheDocument()
  })
})
