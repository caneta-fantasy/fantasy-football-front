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
})
