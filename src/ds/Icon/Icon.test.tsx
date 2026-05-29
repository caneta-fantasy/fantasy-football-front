import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { Icon } from './Icon'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Icon', () => {
  it('renders an SVG for a known name', () => {
    const { container } = render(<Icon name="home" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
  })

  it('is decorative by default: aria-hidden and no role', () => {
    const { container } = render(<Icon name="home" />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('aria-hidden', 'true')
    expect(svg).not.toHaveAttribute('role')
    // no accessible <title>
    expect(svg.querySelector('title')).toBeNull()
  })

  it('with a title: role="img" and an accessible <title> name', () => {
    render(<Icon name="trophy" title="Troféu" />)
    const img = screen.getByRole('img', { name: 'Troféu' })
    expect(img.tagName.toLowerCase()).toBe('svg')
    expect(img).not.toHaveAttribute('aria-hidden')
    expect(img.querySelector('title')?.textContent).toBe('Troféu')
  })

  it('renders the four §7 #8 first-class glyphs without warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    for (const name of ['sub-arrow', 'external-link', 'card-yellow', 'card-red'] as const) {
      const { container } = render(<Icon name={name} />)
      expect(container.querySelector('svg')).toBeInTheDocument()
    }
    expect(warn).not.toHaveBeenCalled()
  })

  it('applies the requested size to width and height', () => {
    const { container } = render(<Icon name="home" size={16} />)
    const svg = container.querySelector('svg')!
    expect(svg).toHaveAttribute('width', '16')
    expect(svg).toHaveAttribute('height', '16')
  })

  it('falls back to a default size for an unknown size value without throwing', () => {
    const { container } = render(
      // @ts-expect-error testing runtime fallback for an unknown size
      <Icon name="home" size={99} />,
    )
    const svg = container.querySelector('svg')!
    // default fallback is 24
    expect(svg).toHaveAttribute('width', '24')
    expect(svg).toHaveAttribute('height', '24')
  })

  it('warns once in dev and still renders a fallback glyph on an unknown name', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(
      // @ts-expect-error testing runtime fallback for an unknown name
      <Icon name="definitely-not-an-icon" />,
    )
    expect(container.querySelector('svg')).toBeInTheDocument()
    expect(warn).toHaveBeenCalledTimes(1)
    expect(warn.mock.calls[0]?.[0]).toMatch(/definitely-not-an-icon/)
  })
})
