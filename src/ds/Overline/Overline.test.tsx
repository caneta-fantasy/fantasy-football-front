import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Overline, SectionLabel } from './Overline'

describe('Overline', () => {
  it('keeps the label text in the accessibility tree', () => {
    render(<Overline>Classificação</Overline>)
    // Real, announceable content — not aria-hidden, not decorative.
    const el = screen.getByText('Classificação')
    expect(el).toBeInTheDocument()
    expect(el.closest('[aria-hidden="true"]')).toBeNull()
  })

  it('renders a <div> by default', () => {
    render(<Overline>Rodada</Overline>)
    expect(screen.getByText('Rodada').tagName).toBe('DIV')
  })

  it('renders as the element given by `as` (e.g. a real heading)', () => {
    render(
      <Overline as="h2">Tabela</Overline>,
    )
    const heading = screen.getByRole('heading', { name: 'Tabela', level: 2 })
    expect(heading.tagName).toBe('H2')
  })

  it('defaults the text color to the muted ink token (4.5:1 on white at 11px)', () => {
    render(<Overline>Elenco</Overline>)
    expect(screen.getByText('Elenco')).toHaveStyle({ color: 'var(--ink-muted)' })
  })

  it('applies a custom color when provided', () => {
    render(<Overline color="var(--on-green)">Reservas</Overline>)
    expect(screen.getByText('Reservas')).toHaveStyle({ color: 'var(--on-green)' })
  })

  it('renders the accent swatch as a decorative, non-interactive element', () => {
    render(<Overline accent="var(--gold)">Titulares</Overline>)
    const label = screen.getByText('Titulares')
    const swatch = label.querySelector('[aria-hidden="true"]')
    expect(swatch).not.toBeNull()
    // Decorative: hidden from AT, no pointer events, carries no text content.
    expect(swatch).toHaveStyle({
      background: 'var(--gold)',
      pointerEvents: 'none',
    })
    expect(swatch).toHaveTextContent('')
  })

  it('does not render an accent swatch when none is provided', () => {
    render(<Overline>Mercado</Overline>)
    const label = screen.getByText('Mercado')
    expect(label.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('forwards className and extra props to the root element', () => {
    render(
      <Overline className="extra" data-testid="ov">
        Próxima
      </Overline>,
    )
    const el = screen.getByTestId('ov')
    expect(el).toHaveClass('extra')
    // Token utilities still present alongside the consumer class.
    expect(el).toHaveClass('uppercase')
  })

  it('exposes SectionLabel as an alias of Overline', () => {
    expect(SectionLabel).toBe(Overline)
    render(<SectionLabel>Detalhes</SectionLabel>)
    expect(screen.getByText('Detalhes')).toBeInTheDocument()
  })
})
