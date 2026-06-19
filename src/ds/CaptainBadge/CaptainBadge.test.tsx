import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CaptainBadge } from './CaptainBadge'

describe('CaptainBadge', () => {
  it('renders the captain glyph with the spoken "Capitão" label', () => {
    render(<CaptainBadge role="C" />)
    // The accessible name spells the role out; it is announced as an image.
    const badge = screen.getByRole('img', { name: 'Capitão' })
    expect(badge).toBeInTheDocument()
    // The visible glyph is the single letter, hidden from the a11y tree so the
    // spelled-out label is the only announcement.
    expect(badge).toHaveTextContent('C')
  })

  it('renders the vice-captain glyph with the spoken "Vice-capitão" label', () => {
    render(<CaptainBadge role="V" />)
    const badge = screen.getByRole('img', { name: 'Vice-capitão' })
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('V')
  })

  it('exposes the role via a data attribute for styling/testing hooks', () => {
    render(<CaptainBadge role="V" />)
    expect(screen.getByRole('img', { name: 'Vice-capitão' })).toHaveAttribute(
      'data-role',
      'V',
    )
  })

  it('falls back to the captain treatment for an unknown role without throwing', () => {
    expect(() =>
      // @ts-expect-error testing the runtime default fallback (no throw — §7 #1)
      render(<CaptainBadge role="X" />),
    ).not.toThrow()
    // Unknown role resolves to the captain default.
    expect(screen.getByRole('img', { name: 'Capitão' })).toBeInTheDocument()
  })

  it('applies a size token (md by default) and accepts a raw pixel size', () => {
    const { rerender } = render(<CaptainBadge role="C" size="lg" />)
    const lg = screen.getByRole('img', { name: 'Capitão' })
    expect(lg).toHaveStyle({ width: '32px', height: '32px' })

    rerender(<CaptainBadge role="C" size={48} />)
    const raw = screen.getByRole('img', { name: 'Capitão' })
    expect(raw).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('falls back to the md size for an unknown size token without throwing', () => {
    expect(() =>
      // @ts-expect-error testing the runtime size fallback
      render(<CaptainBadge role="C" size="nope" />),
    ).not.toThrow()
    expect(screen.getByRole('img', { name: 'Capitão' })).toHaveStyle({
      width: '24px',
      height: '24px',
    })
  })

  it('forwards extra props and merges className', () => {
    render(<CaptainBadge role="C" className="extra" data-testid="cap" />)
    const badge = screen.getByTestId('cap')
    expect(badge.className).toContain('extra')
  })
})
