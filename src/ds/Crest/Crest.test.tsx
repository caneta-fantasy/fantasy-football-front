import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Crest } from './Crest'

describe('Crest', () => {
  it('renders an SVG with role="img"', () => {
    render(<Crest seed={1} />)
    expect(screen.getByRole('img')).toBeInTheDocument()
  })

  it('uses the club name as the accessible label via <title>', () => {
    render(<Crest seed={1} club="Caneta FC" />)
    expect(screen.getByRole('img', { name: 'Caneta FC' })).toBeInTheDocument()
  })

  it('falls back to a generic label when no club is given', () => {
    render(<Crest seed={2} />)
    const el = screen.getByRole('img')
    expect(el).toHaveAccessibleName(/escudo/i)
  })

  it('is deterministic: the same seed yields the same crest markup', () => {
    const { container: a } = render(<Crest seed={4} />)
    const { container: b } = render(<Crest seed={4} />)
    expect(a.querySelector('svg')?.innerHTML).toEqual(
      b.querySelector('svg')?.innerHTML,
    )
  })

  it('does not throw for an out-of-range seed (palette wraps)', () => {
    expect(() => render(<Crest seed={9999} />)).not.toThrow()
  })

  it('renders the loading variant as a busy status (not a crest image)', () => {
    render(<Crest seed={1} loading />)
    const status = screen.getByRole('status')
    expect(status).toHaveAttribute('aria-busy', 'true')
    expect(status).toHaveAccessibleName(/carregando/i)
    // No crest image while loading.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('renders the empty variant with an accessible "sem escudo" label', () => {
    render(<Crest seed={1} empty />)
    const el = screen.getByRole('img', { name: /sem escudo/i })
    expect(el).toBeInTheDocument()
  })

  it('empty club name still gives the empty placeholder a meaningful label', () => {
    render(<Crest seed={1} empty club="" />)
    expect(screen.getByRole('img', { name: /sem escudo/i })).toBeInTheDocument()
  })

  it('applies the requested pixel size', () => {
    render(<Crest seed={1} size={48} />)
    const el = screen.getByRole('img')
    expect(el).toHaveAttribute('width', '48')
    expect(el).toHaveAttribute('height', '48')
  })
})
