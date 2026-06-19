import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Halftone } from './Halftone'

describe('Halftone', () => {
  it('renders a decorative layer that is invisible to assistive tech', () => {
    const { container } = render(<Halftone />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toBeInTheDocument()
    // Decorative: hidden from the a11y tree, no role exposed.
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).not.toHaveAttribute('role')
  })

  it('is absolutely positioned to fill (and not intercept) its parent', () => {
    const { container } = render(<Halftone />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.position).toBe('absolute')
    expect(el.style.pointerEvents).toBe('none')
  })

  it('caps opacity at the decorative max (0.15) even when asked for more', () => {
    const { container } = render(<Halftone opacity={0.8} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBeLessThanOrEqual(0.15)
  })

  it('honours an opacity below the cap', () => {
    const { container } = render(<Halftone opacity={0.06} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBeCloseTo(0.06)
  })

  it('clamps a negative opacity to zero without throwing', () => {
    const { container } = render(<Halftone opacity={-2} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBe(0)
  })

  it('renders the dot pattern as a tiling background image sized to the dot grid', () => {
    const { container } = render(<Halftone size={6} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundImage).toContain('svg')
    // Grid cell is 2x the dot radius unit.
    expect(el.style.backgroundSize).toBe('12px 12px')
  })

  it('falls back to a sane size for a non-positive size without throwing', () => {
    expect(() => render(<Halftone size={0} />)).not.toThrow()
    const { container } = render(<Halftone size={-4} />)
    const el = container.firstElementChild as HTMLElement
    // Background size stays positive (no zero/negative tiling).
    const px = parseFloat(el.style.backgroundSize)
    expect(px).toBeGreaterThan(0)
  })

  it('merges caller style without dropping the positioning contract', () => {
    const { container } = render(<Halftone style={{ zIndex: 3 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.zIndex).toBe('3')
    expect(el.style.position).toBe('absolute')
  })
})
