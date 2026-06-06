import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AzulejoBand } from './AzulejoBand'

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

describe('AzulejoBand', () => {
  it('renders a decorative layer that is invisible to assistive tech', () => {
    const { container } = render(<AzulejoBand />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toBeInTheDocument()
    // Decorative: hidden from the a11y tree, no role exposed.
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).not.toHaveAttribute('role')
  })

  it('is absolutely positioned to fill (and not intercept) its parent', () => {
    const { container } = render(<AzulejoBand />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.position).toBe('absolute')
    expect(el.style.pointerEvents).toBe('none')
  })

  it('is a solid band — it does not carry a watermark opacity', () => {
    const { container } = render(<AzulejoBand />)
    const el = container.firstElementChild as HTMLElement
    // No opacity is applied: the band is a full-strength color-block divider.
    expect(el.style.opacity).toBe('')
  })

  it('defaults to cobalt half-circles on a white (paper) field, 60px tile', () => {
    const { container } = render(<AzulejoBand />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundSize).toBe('60px 60px')
    const svg = decodeTile(el)
    expect(svg).toContain("fill='var(--cobalt)'")
    expect(svg).toContain("fill='var(--paper)'")
  })

  it('paints the two-tone tile with the given a/b colours', () => {
    const { container } = render(<AzulejoBand a="green" b="gold" />)
    const el = container.firstElementChild as HTMLElement
    const svg = decodeTile(el)
    expect(svg).toContain("fill='green'")
    expect(svg).toContain("fill='gold'")
  })

  it('scales the tile to a custom size', () => {
    const { container } = render(<AzulejoBand size={40} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundSize).toBe('40px 40px')
    expect(decodeTile(el)).toContain("width='40'")
  })

  it('falls back to 60 for a non-positive size without throwing', () => {
    const { container } = render(<AzulejoBand size={0} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.backgroundSize).toBe('60px 60px')
  })

  it('merges caller style without dropping the positioning contract', () => {
    const { container } = render(<AzulejoBand style={{ zIndex: 3 }} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.zIndex).toBe('3')
    expect(el.style.position).toBe('absolute')
  })
})
