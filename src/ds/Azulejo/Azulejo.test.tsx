import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Azulejo } from './Azulejo'

/** Pull the decoded SVG markup back out of the element's backgroundImage. */
const decodeTile = (el: HTMLElement): string => {
  const bg = el.style.backgroundImage
  const m = bg.match(/base64,([^"]+)/)
  expect(m).not.toBeNull()
  const b64 = (m as RegExpMatchArray)[1]
  return typeof atob === 'function'
    ? atob(b64)
    : Buffer.from(b64, 'base64').toString('utf-8')
}

describe('Azulejo', () => {
  it('renders a decorative layer that is invisible to assistive tech', () => {
    const { container } = render(<Azulejo />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toBeInTheDocument()
    // Decorative: hidden from the a11y tree, no role exposed.
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).not.toHaveAttribute('role')
  })

  it('is absolutely positioned to fill (and not intercept) its parent', () => {
    const { container } = render(<Azulejo />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.position).toBe('absolute')
    expect(el.style.pointerEvents).toBe('none')
  })

  it('defaults to the cobalt token stroke and the 56px tile', () => {
    const { container } = render(<Azulejo />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundSize).toBe('56px 56px')
    const svg = decodeTile(el)
    expect(svg).toContain("stroke='var(--cobalt)'")
    expect(svg).toContain("width='56'")
  })

  it('caps the default 0.16 opacity down to the decorative max (0.15)', () => {
    const { container } = render(<Azulejo />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBeLessThanOrEqual(0.15)
  })

  it('caps an explicit over-cap opacity at 0.15', () => {
    const { container } = render(<Azulejo opacity={0.9} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBeLessThanOrEqual(0.15)
  })

  it('honours an opacity below the cap', () => {
    const { container } = render(<Azulejo opacity={0.05} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBeCloseTo(0.05)
  })

  it('clamps a negative opacity to zero without throwing', () => {
    const { container } = render(<Azulejo opacity={-1} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBe(0)
  })

  it('paints the arcs with the given stroke colour and width', () => {
    const { container } = render(<Azulejo color="tomato" strokeWidth={4} />)
    const el = container.firstElementChild as HTMLElement
    const svg = decodeTile(el)
    expect(svg).toContain("stroke='tomato'")
    expect(svg).toContain("stroke-width='4'")
  })

  it('scales the tile to a custom size', () => {
    const { container } = render(<Azulejo size={80} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundSize).toBe('80px 80px')
    expect(decodeTile(el)).toContain("width='80'")
  })

  it('falls back to 56 for a non-positive size without throwing', () => {
    const { container } = render(<Azulejo size={0} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundSize).toBe('56px 56px')
  })

  it('falls back to stroke 2 for a non-positive strokeWidth', () => {
    const { container } = render(<Azulejo strokeWidth={0} />)
    const el = container.firstElementChild as HTMLElement
    expect(decodeTile(el)).toContain("stroke-width='2'")
  })

  it('merges caller style without dropping the positioning contract', () => {
    const { container } = render(<Azulejo style={{ zIndex: 2 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.zIndex).toBe('2')
    expect(el.style.position).toBe('absolute')
  })

  it('does not let a caller style raise opacity past the cap', () => {
    const { container } = render(<Azulejo style={{ opacity: 0.9 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(parseFloat(el.style.opacity)).toBeLessThanOrEqual(0.15)
  })
})
