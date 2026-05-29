import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Skeleton } from './Skeleton'

describe('Skeleton', () => {
  it('renders an aria-hidden placeholder (invisible to assistive tech)', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild as HTMLElement
    expect(el).toBeInTheDocument()
    expect(el).toHaveAttribute('aria-hidden', 'true')
    // It is decorative: no role exposed to the a11y tree.
    expect(el).not.toHaveAttribute('role')
  })

  it('applies layout-matching width/height from props', () => {
    const { container } = render(<Skeleton width={120} height={16} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.width).toBe('120px')
    expect(el.style.height).toBe('16px')
  })

  it('passes through percentage string dimensions verbatim', () => {
    const { container } = render(<Skeleton width="60%" height="40%" />)
    const el = container.firstElementChild as HTMLElement
    expect(el.style.width).toBe('60%')
    expect(el.style.height).toBe('40%')
  })

  it('renders the circle variant fully rounded', () => {
    const { container } = render(<Skeleton variant="circle" width={40} />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('rounded-full')
  })

  it('falls back to the text variant for an unknown variant without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<Skeleton variant="nope" />),
    ).not.toThrow()
  })

  it('carries the shimmer animation hook class', () => {
    const { container } = render(<Skeleton />)
    const el = container.firstElementChild as HTMLElement
    expect(el.className).toContain('ds-skeleton')
  })
})
