import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Avatar } from './Avatar'

describe('Avatar', () => {
  it('exposes the full name as an accessible image label', () => {
    render(<Avatar name="João Silva" />)
    const el = screen.getByRole('img', { name: 'João Silva' })
    expect(el).toBeInTheDocument()
  })

  it('derives at most two initials from the name', () => {
    render(<Avatar name="João Pedro Silva" />)
    // First + last word initials, uppercased.
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('truncates an initials string longer than two characters', () => {
    render(<Avatar name="ABCDE" />)
    // A single token longer than 2 chars is sliced to its first two letters.
    expect(screen.getByText('AB')).toBeInTheDocument()
  })

  it('uppercases lowercase initials', () => {
    render(<Avatar name="ana costa" />)
    expect(screen.getByText('AC')).toBeInTheDocument()
  })

  it('renders an <img> when src is provided, labelled by the name', () => {
    render(<Avatar name="João Silva" src="/players/10.png" />)
    const img = screen.getByRole('img', { name: 'João Silva' })
    expect(img.tagName).toBe('IMG')
    expect(img).toHaveAttribute('src', '/players/10.png')
  })

  it('falls back to initials when the image fails to load', () => {
    render(<Avatar name="João Silva" src="/broken.png" />)
    const img = screen.getByRole('img', { name: 'João Silva' })
    fireEvent.error(img)
    // After the error the <img> is gone and the initials box takes over.
    expect(screen.queryByRole('img')).not.toBeNull()
    expect(screen.getByText('JS')).toBeInTheDocument()
  })

  it('renders a round roundel box', () => {
    render(<Avatar name="João Silva" />)
    const el = screen.getByRole('img', { name: 'João Silva' })
    expect(el).toHaveClass('rounded-full')
  })

  it('picks a deterministic background for the same seed', () => {
    const { container: a } = render(<Avatar name="João Silva" seed={3} />)
    const { container: b } = render(<Avatar name="Maria" seed={3} />)
    const styleA = a.querySelector('[role="img"]')?.getAttribute('style')
    const styleB = b.querySelector('[role="img"]')?.getAttribute('style')
    expect(styleA).toEqual(styleB)
  })

  it('seeds from the name when no explicit seed is given (still deterministic)', () => {
    const { container: a } = render(<Avatar name="João Silva" />)
    const { container: b } = render(<Avatar name="João Silva" />)
    const styleA = a.querySelector('[role="img"]')?.getAttribute('style')
    const styleB = b.querySelector('[role="img"]')?.getAttribute('style')
    expect(styleA).toEqual(styleB)
  })

  it('does not throw for an out-of-range seed (palette wraps)', () => {
    expect(() => render(<Avatar name="X Y" seed={9999} />)).not.toThrow()
  })

  it('applies the requested pixel size', () => {
    render(<Avatar name="João Silva" size={48} />)
    const el = screen.getByRole('img', { name: 'João Silva' })
    expect(el).toHaveStyle({ width: '48px', height: '48px' })
  })

  it('handles an empty name without crashing', () => {
    expect(() => render(<Avatar name="" />)).not.toThrow()
  })
})
