import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArchShape } from './ArchShape'

describe('ArchShape', () => {
  it('renders a decorative SVG that is invisible to assistive tech', () => {
    const { container } = render(<ArchShape />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg).toBeInTheDocument()
    // Decorative: hidden from the a11y tree, no role/title exposed.
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    expect(svg.querySelector('title')).toBeNull()
  })

  it('does not intercept pointer interaction', () => {
    const { container } = render(<ArchShape />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.style.pointerEvents).toBe('none')
  })

  it('sizes the svg and viewBox from w/h (default 200×120)', () => {
    const { container } = render(<ArchShape />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.getAttribute('width')).toBe('200')
    expect(svg.getAttribute('height')).toBe('120')
    expect(svg.getAttribute('viewBox')).toBe('0 0 200 120')
  })

  it('honours explicit w/h', () => {
    const { container } = render(<ArchShape w={320} h={180} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.getAttribute('width')).toBe('320')
    expect(svg.getAttribute('height')).toBe('180')
    expect(svg.getAttribute('viewBox')).toBe('0 0 320 180')
  })

  it('draws a half-stadium path closed back to the baseline', () => {
    const { container } = render(<ArchShape w={200} h={120} />)
    const path = container.querySelector('path') as SVGPathElement
    const d = path.getAttribute('d') ?? ''
    // Starts at the bottom-left corner, rises to 55% height, arcs (radius w/2),
    // and closes — a half-stadium silhouette.
    expect(d).toContain('M0 120')
    expect(d).toContain('L0 66') // 120 * 0.55
    expect(d).toContain('A 100 100') // radius = w/2
    expect(d.trim().endsWith('Z')).toBe(true)
  })

  it('fills with the signature gold token by default', () => {
    const { container } = render(<ArchShape />)
    const path = container.querySelector('path') as SVGPathElement
    expect(path.getAttribute('fill')).toBe('var(--gold)')
  })

  it('recolors via the fill prop', () => {
    const { container } = render(<ArchShape fill="var(--green)" />)
    const path = container.querySelector('path') as SVGPathElement
    expect(path.getAttribute('fill')).toBe('var(--green)')
  })

  it('falls back to default dimensions for non-positive/invalid sizes (no throw)', () => {
    let svg: SVGSVGElement | null = null
    expect(() => {
      const { container } = render(<ArchShape w={0} h={-40} />)
      svg = container.querySelector('svg')
    }).not.toThrow()
    expect(svg!.getAttribute('width')).toBe('200')
    expect(svg!.getAttribute('height')).toBe('120')
  })

  it('merges inline style overrides while keeping pointer-events none', () => {
    const { container } = render(<ArchShape style={{ opacity: 0.5 }} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.style.opacity).toBe('0.5')
    expect(svg.style.pointerEvents).toBe('none')
  })
})
