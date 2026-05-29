import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LiveChip } from './LiveChip'

describe('LiveChip', () => {
  it('renders the default "AO VIVO" label as a live status region', () => {
    render(<LiveChip />)
    const chip = screen.getByRole('status')
    expect(chip).toHaveTextContent(/ao vivo/i)
    // Live status is announced politely.
    expect(chip).toHaveAttribute('aria-live', 'polite')
  })

  it('renders a custom label (e.g. with the match minute)', () => {
    render(<LiveChip label="AO VIVO · 67'" />)
    expect(screen.getByRole('status')).toHaveTextContent("AO VIVO · 67'")
  })

  it('shows a pulsing dot when live (decorative, aria-hidden)', () => {
    const { container } = render(<LiveChip status="live" />)
    const dot = container.querySelector('.ds-live-dot')
    expect(dot).toBeInTheDocument()
    expect(dot).toHaveAttribute('aria-hidden', 'true')
  })

  it('disconnected state drops the pulse and announces a non-color cue', () => {
    const { container } = render(<LiveChip status="disconnected" />)
    expect(container.querySelector('.ds-live-dot')).not.toBeInTheDocument()
    // Non-color cue: the disconnected label text, not just a color swap.
    expect(screen.getByRole('status')).toHaveTextContent(/sem conex/i)
  })

  it('stale state drops the pulse and announces a stale cue', () => {
    const { container } = render(<LiveChip status="stale" />)
    expect(container.querySelector('.ds-live-dot')).not.toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent(/desatualizado/i)
  })

  it('falls back to the live style for an unknown status without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<LiveChip status="nope" />)
    ).not.toThrow()
  })
})
