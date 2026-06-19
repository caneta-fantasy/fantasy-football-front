import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { FixtureDifficulty } from './FixtureDifficulty'

afterEach(() => {
  vi.restoreAllMocks()
})

const FIXTURES = [
  { opponent: 'PAL', difficulty: 1 as const },
  { opponent: 'VFL', difficulty: 2 as const },
  { opponent: 'SAN', difficulty: 1 as const },
  { opponent: 'FLA', difficulty: 4 as const },
  { opponent: 'COR', difficulty: 5 as const },
]

describe('FixtureDifficulty', () => {
  it('renders a semantic list of fixtures', () => {
    render(<FixtureDifficulty fixtures={FIXTURES} />)
    const list = screen.getByRole('list')
    expect(list).toBeInTheDocument()
    expect(within(list).getAllByRole('listitem')).toHaveLength(5)
  })

  it('shows the opponent code text for each fixture (text, not color-only)', () => {
    render(<FixtureDifficulty fixtures={FIXTURES} />)
    expect(screen.getByText('PAL')).toBeInTheDocument()
    expect(screen.getByText('COR')).toBeInTheDocument()
  })

  it('renders the numeric 1-5 difficulty cue so color is never the only signal (§7)', () => {
    render(<FixtureDifficulty fixtures={[{ opponent: 'FLA', difficulty: 4 }]} />)
    // The numeric cue is visible text on the swatch.
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('exposes a spelled-out accessible name combining opponent + difficulty', () => {
    render(<FixtureDifficulty fixtures={[{ opponent: 'COR', difficulty: 5 }]} />)
    // Each item announces opponent + the difficulty level (1..5) and word.
    const item = screen.getByRole('listitem')
    expect(item).toHaveAccessibleName(/COR/i)
    expect(item).toHaveAccessibleName(/5/)
    expect(item).toHaveAccessibleName(/dif[ií]cil/i)
  })

  it('uppercases the opponent code even when given lowercase', () => {
    render(<FixtureDifficulty fixtures={[{ opponent: 'vfl', difficulty: 2 }]} />)
    expect(screen.getByText('VFL')).toBeInTheDocument()
  })

  it('uses the AA-validated foreground per heat step (médio amber → dark on-gold text)', () => {
    const { container } = render(
      <FixtureDifficulty fixtures={[{ opponent: 'GRE', difficulty: 3 }]} />,
    )
    const swatch = container.querySelector('[data-difficulty="3"]') as HTMLElement
    expect(swatch).not.toBeNull()
    // Level 3 (médio) is the warning-amber step; the dark near-black on-gold
    // text clears AA on the amber (6.18:1), where white would fail.
    expect(swatch.className).toContain('bg-warning')
    expect(swatch.className).toContain('text-on-gold')
  })

  it('anchors the hardest step (5) on the deepest bottle-green with warm-white text', () => {
    const { container } = render(
      <FixtureDifficulty fixtures={[{ opponent: 'COR', difficulty: 5 }]} />,
    )
    const swatch = container.querySelector('[data-difficulty="5"]') as HTMLElement
    // muito difícil = the deepest signature anchor (distinct from the brick
    // step 4), warm-white on-green text at 13.57:1.
    expect(swatch.className).toContain('bg-signature-deep')
    expect(swatch.className).toContain('text-on-green')
  })

  it('exposes data-difficulty for each step so the level is machine-readable', () => {
    const { container } = render(<FixtureDifficulty fixtures={FIXTURES} />)
    const levels = Array.from(
      container.querySelectorAll('[data-difficulty]'),
    ).map((el) => el.getAttribute('data-difficulty'))
    expect(levels).toEqual(['1', '2', '1', '4', '5'])
  })

  it('clamps out-of-range difficulty to 1..5 without throwing (default fallback)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() =>
      render(
        <FixtureDifficulty
          // @ts-expect-error testing runtime clamp of an out-of-range level
          fixtures={[{ opponent: 'OUT', difficulty: 9 }]}
        />,
      ),
    ).not.toThrow()
    const item = screen.getByRole('listitem')
    // Clamped to the hardest step (5).
    expect(item).toHaveAccessibleName(/5/)
    expect(warn).toHaveBeenCalled()
  })

  it('has an overall accessible name on the list (defaults provided)', () => {
    render(<FixtureDifficulty fixtures={FIXTURES} />)
    expect(
      screen.getByRole('list', { name: /dificuldade/i }),
    ).toBeInTheDocument()
  })

  it('honors a custom list label', () => {
    render(<FixtureDifficulty fixtures={FIXTURES} label="Próximos 5 jogos" />)
    expect(
      screen.getByRole('list', { name: 'Próximos 5 jogos' }),
    ).toBeInTheDocument()
  })

  it('renders the FÁCIL/DIFÍCIL legend when showLegend is set', () => {
    render(<FixtureDifficulty fixtures={FIXTURES} showLegend />)
    expect(screen.getByText(/f[áa]cil/i)).toBeInTheDocument()
    expect(screen.getByText(/dif[ií]cil/i)).toBeInTheDocument()
  })

  it('renders nothing breaking for an empty fixture list', () => {
    const { container } = render(<FixtureDifficulty fixtures={[]} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(container.querySelectorAll('[data-difficulty]')).toHaveLength(0)
  })
})
