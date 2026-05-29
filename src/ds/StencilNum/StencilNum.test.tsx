import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { StencilNum } from './StencilNum'

describe('StencilNum', () => {
  it('renders the value as visible text', () => {
    render(<StencilNum value="09" data-testid="num" />)
    const el = screen.getByTestId('num')
    expect(el).toHaveTextContent('09')
  })

  it('renders a span element (not an interactive/heading element)', () => {
    render(<StencilNum value={116} data-testid="num" />)
    expect(screen.getByTestId('num').tagName).toBe('SPAN')
  })

  it('is decorative: aria-hidden by default and exposes no accessible name', () => {
    render(<StencilNum value="98" data-testid="num" />)
    const el = screen.getByTestId('num')
    expect(el).toHaveAttribute('aria-hidden', 'true')
    // Decorative numerals are removed from the a11y tree, so there is no role.
    expect(screen.queryByText('98')).not.toHaveAttribute('role')
  })

  it('uses the Anton display font and tabular figures', () => {
    render(<StencilNum value="7" data-testid="num" />)
    const el = screen.getByTestId('num')
    expect(el.className).toContain('font-display')
    expect(el).toHaveStyle({ fontVariantNumeric: 'tabular-nums' })
  })

  it('maps a semantic size to a pixel font-size', () => {
    render(<StencilNum value="7" size="lg" data-testid="num" />)
    expect(screen.getByTestId('num')).toHaveStyle({ fontSize: '120px' })
  })

  it('accepts a raw numeric size as a pixel escape hatch', () => {
    render(<StencilNum value="7" size={88} data-testid="num" />)
    expect(screen.getByTestId('num')).toHaveStyle({ fontSize: '88px' })
  })

  it('falls back to the default size for an unknown semantic value (no throw)', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback for an unknown size key
      render(<StencilNum value="7" size="enormous" data-testid="num" />)
    ).not.toThrow()
    // md default = 80px
    expect(screen.getByTestId('num')).toHaveStyle({ fontSize: '80px' })
  })

  it('derives a tight tabular letter-spacing from the resolved size', () => {
    render(<StencilNum value="7" size={100} data-testid="num" />)
    // -size * 0.04 => -4px at 100px (matches the DS jersey treatment)
    expect(screen.getByTestId('num')).toHaveStyle({ letterSpacing: '-4px' })
  })

  it('applies the color prop as the text color', () => {
    render(<StencilNum value="7" color="var(--caneta-lime)" data-testid="num" />)
    expect(screen.getByTestId('num')).toHaveStyle({ color: 'var(--caneta-lime)' })
  })

  it('forwards className and merges inline style overrides', () => {
    render(
      <StencilNum
        value="7"
        className="opacity-50"
        style={{ display: 'block' }}
        data-testid="num"
      />
    )
    const el = screen.getByTestId('num')
    expect(el.className).toContain('opacity-50')
    expect(el).toHaveStyle({ display: 'block' })
  })
})
