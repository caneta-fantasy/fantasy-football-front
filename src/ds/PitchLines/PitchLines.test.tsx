import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PitchLines } from './PitchLines'

describe('PitchLines', () => {
  it('renders a decorative SVG that is invisible to assistive tech', () => {
    const { container } = render(<PitchLines />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toBeInTheDocument()
    // Decorative: hidden from the a11y tree, no role exposed.
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
  })

  it('is absolutely positioned to fill (and not intercept) its parent', () => {
    const { container } = render(<PitchLines />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.style.position).toBe('absolute')
    expect(svg.style.pointerEvents).toBe('none')
  })

  it('caps opacity at the decorative max (0.15) even when asked for more', () => {
    const { container } = render(<PitchLines opacity={0.9} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(parseFloat(svg.style.opacity)).toBeLessThanOrEqual(0.15)
  })

  it('honours an opacity below the cap', () => {
    const { container } = render(<PitchLines opacity={0.04} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(parseFloat(svg.style.opacity)).toBeCloseTo(0.04)
  })

  it('clamps a negative opacity to zero without throwing', () => {
    const { container } = render(<PitchLines opacity={-1} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(parseFloat(svg.style.opacity)).toBe(0)
  })

  it('paints the pitch lines with the given stroke colour', () => {
    const { container } = render(<PitchLines color="tomato" />)
    const g = container.querySelector('g') as SVGGElement
    expect(g.getAttribute('stroke')).toBe('tomato')
  })

  it('merges caller style without dropping the positioning contract', () => {
    const { container } = render(<PitchLines style={{ zIndex: 2 }} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.style.zIndex).toBe('2')
    expect(svg.style.position).toBe('absolute')
  })

  it('defaults to the watermark variant (capped, absolutely positioned)', () => {
    const { container } = render(<PitchLines />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toHaveAttribute('data-variant', 'watermark')
    expect(svg.style.position).toBe('absolute')
  })

  describe('feature variant (opt-in high-opacity green block)', () => {
    it('renders a self-contained green-block diagram, still decorative', () => {
      const { container } = render(<PitchLines variant="feature" />)
      const svg = container.querySelector('svg') as SVGSVGElement
      expect(svg).toHaveAttribute('data-variant', 'feature')
      // Still pure decoration in feature mode.
      expect(svg).toHaveAttribute('aria-hidden', 'true')
      expect(svg).not.toHaveAttribute('role')
      expect(svg.style.pointerEvents).toBe('none')
      // The green field is painted by the SVG itself (a filled rect).
      const field = svg.querySelector('rect') as SVGRectElement
      expect(field.getAttribute('fill')).toBe('var(--pitch)')
    })

    it('is NOT subject to the decorative cap — full opacity is honoured', () => {
      const { container } = render(<PitchLines variant="feature" opacity={1} />)
      const svg = container.querySelector('svg') as SVGSVGElement
      // The watermark cap (0.15) does not apply to the feature figure.
      expect(parseFloat(svg.style.opacity)).toBe(1)
    })

    it('flows in normal layout (not absolutely positioned) as a standalone figure', () => {
      const { container } = render(<PitchLines variant="feature" />)
      const svg = container.querySelector('svg') as SVGSVGElement
      expect(svg.style.position).not.toBe('absolute')
      expect(svg.style.display).toBe('block')
    })

    it('honours a custom field fill and stroke colour', () => {
      const { container } = render(
        <PitchLines variant="feature" fill="navy" color="white" />,
      )
      const svg = container.querySelector('svg') as SVGSVGElement
      expect((svg.querySelector('rect') as SVGRectElement).getAttribute('fill')).toBe('navy')
      expect((svg.querySelector('g') as SVGGElement).getAttribute('stroke')).toBe('white')
    })
  })

  it('still caps the watermark variant even when feature mode exists', () => {
    const { container } = render(<PitchLines variant="watermark" opacity={0.9} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(parseFloat(svg.style.opacity)).toBeLessThanOrEqual(0.15)
  })
})
