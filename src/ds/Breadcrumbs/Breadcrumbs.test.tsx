import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Breadcrumbs } from './Breadcrumbs'

const TRAIL = [
  { label: 'Ligas', href: '/ligas' },
  { label: 'Família Khouri', href: '/ligas/khouri' },
  { label: 'Rodada 12' },
]

describe('Breadcrumbs', () => {
  it('renders a nav with an accessible label', () => {
    render(<Breadcrumbs items={TRAIL} />)
    expect(
      screen.getByRole('navigation', { name: /trilha de navegação/i }),
    ).toBeInTheDocument()
  })

  it('accepts a custom aria-label', () => {
    render(<Breadcrumbs items={TRAIL} aria-label="Onde estou" />)
    expect(
      screen.getByRole('navigation', { name: 'Onde estou' }),
    ).toBeInTheDocument()
  })

  it('renders intermediate items as links', () => {
    render(<Breadcrumbs items={TRAIL} />)
    const link = screen.getByRole('link', { name: 'Ligas' })
    expect(link).toHaveAttribute('href', '/ligas')
  })

  it('marks the last item as the current page and not a link', () => {
    render(<Breadcrumbs items={TRAIL} />)
    const current = screen.getByText('Rodada 12')
    expect(current).toHaveAttribute('aria-current', 'page')
    expect(
      screen.queryByRole('link', { name: 'Rodada 12' }),
    ).not.toBeInTheDocument()
  })

  it('renders separators that are hidden from assistive tech', () => {
    const { container } = render(<Breadcrumbs items={TRAIL} />)
    const seps = container.querySelectorAll('[data-ds-sep]')
    // n items → n-1 separators
    expect(seps).toHaveLength(2)
    seps.forEach((s) => expect(s).toHaveAttribute('aria-hidden', 'true'))
  })

  it('renders items inside an ordered list of list items', () => {
    render(<Breadcrumbs items={TRAIL} />)
    expect(screen.getByRole('list')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(3)
  })

  it('truncates the middle with an inert ellipsis when over maxItems', () => {
    const long = [
      { label: 'A', href: '/a' },
      { label: 'B', href: '/b' },
      { label: 'C', href: '/c' },
      { label: 'D', href: '/d' },
      { label: 'E' },
    ]
    render(<Breadcrumbs items={long} maxItems={3} />)
    // first, ellipsis, last → first and last visible, middle collapsed
    expect(screen.getByText('A')).toBeInTheDocument()
    expect(screen.getByText('E')).toBeInTheDocument()
    expect(screen.queryByText('C')).not.toBeInTheDocument()
    // ellipsis is inert text, never a link or button
    const ellipsis = screen.getByText('…')
    expect(ellipsis).toHaveAttribute('aria-hidden', 'true')
    expect(ellipsis.tagName).not.toBe('BUTTON')
    expect(ellipsis.tagName).not.toBe('A')
  })

  it('renders nothing meaningful for an empty trail without throwing', () => {
    expect(() => render(<Breadcrumbs items={[]} />)).not.toThrow()
  })
})
