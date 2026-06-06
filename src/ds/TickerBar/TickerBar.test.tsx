import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TickerBar, type TickerItem } from './TickerBar'

const ITEMS: TickerItem[] = [
  { tag: 'FLA', text: 'Flamengo', val: '2' },
  { tag: 'PAL', text: 'Palmeiras', val: '1' },
  { text: 'Min restantes', val: '32' },
]

describe('TickerBar', () => {
  it('renders as a region landmark named "Placar" by default', () => {
    render(<TickerBar items={ITEMS} />)
    const region = screen.getByRole('region', { name: 'Placar' })
    expect(region).toBeInTheDocument()
  })

  it('accepts a custom accessible label', () => {
    render(<TickerBar items={ITEMS} label="Sua partida" />)
    expect(
      screen.getByRole('region', { name: 'Sua partida' })
    ).toBeInTheDocument()
  })

  it('keeps tag, text and value text in the a11y tree (real content)', () => {
    render(<TickerBar items={ITEMS} />)
    expect(screen.getByText('FLA')).toBeInTheDocument()
    expect(screen.getByText('Flamengo')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Min restantes')).toBeInTheDocument()
  })

  it('is NOT a live region by default (no aria-live)', () => {
    render(<TickerBar items={ITEMS} />)
    expect(screen.getByRole('region')).not.toHaveAttribute('aria-live')
  })

  it('adds aria-live="polite" when live (values update in place)', () => {
    render(<TickerBar items={ITEMS} live />)
    expect(screen.getByRole('region')).toHaveAttribute('aria-live', 'polite')
  })

  it('renders the gold top rule (broadcast signature) for the green tone', () => {
    render(<TickerBar items={ITEMS} />)
    const region = screen.getByRole('region')
    expect(region.className).toContain('border-t-[3px]')
    expect(region.className).toContain('border-t-accent')
    expect(region.className).toContain('bg-signature')
  })

  it('renders the white tone band with a bottom hairline and ink text', () => {
    render(<TickerBar items={ITEMS} tone="white" />)
    const region = screen.getByRole('region')
    expect(region.className).toContain('bg-white')
    expect(region.className).toContain('text-ink')
    expect(region.className).toContain('border-b')
    // gold top rule persists across tones
    expect(region.className).toContain('border-t-accent')
  })

  it('falls back to the green tone for an unknown value (no throw)', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback for an unknown tone
      render(<TickerBar items={ITEMS} tone="neon" />)
    ).not.toThrow()
    expect(screen.getByRole('region').className).toContain('bg-signature')
  })

  it('renders values in the Archivo display voice with tabular figures', () => {
    render(<TickerBar items={[{ text: 'Pontos', val: '116.6' }]} />)
    const val = screen.getByText('116.6')
    expect(val.className).toContain('font-display')
    expect(val.className).toContain('tabular-nums')
    expect(val).toHaveStyle({
      fontVariationSettings: '"wght" 800, "wdth" 110',
    })
  })

  it('omits the tag span when no tag is provided', () => {
    render(<TickerBar items={[{ text: 'Sem tag', val: '0' }]} />)
    expect(screen.getByText('Sem tag')).toBeInTheDocument()
    // no gold tag text rendered
    expect(screen.queryByText('FLA')).not.toBeInTheDocument()
  })

  it('omits the value span when val is absent or empty', () => {
    render(
      <TickerBar
        items={[
          { tag: 'INFO', text: 'Aguardando' },
          { text: 'Vazio', val: '' },
        ]}
        data-testid="bar"
      />
    )
    // The display-voiced value class should not appear for value-less cells.
    const bar = screen.getByTestId('bar')
    const displayVals = bar.querySelectorAll('.font-display')
    expect(displayVals).toHaveLength(0)
  })

  it('accepts a numeric value (and keeps it in the tree)', () => {
    render(<TickerBar items={[{ text: 'Gols', val: 3 }]} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('forwards className and arbitrary props (e.g. data-testid)', () => {
    render(
      <TickerBar items={ITEMS} className="my-band" data-testid="placar" />
    )
    const el = screen.getByTestId('placar')
    expect(el.className).toContain('my-band')
  })
})
