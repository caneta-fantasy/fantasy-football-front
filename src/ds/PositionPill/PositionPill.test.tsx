import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { PositionPill } from './PositionPill'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PositionPill', () => {
  it('always renders the 3-letter code as text (color is not the only cue)', () => {
    render(<PositionPill code="GOL" />)
    expect(screen.getByText('GOL')).toBeInTheDocument()
  })

  it('uppercases the code text even when given lowercase', () => {
    render(<PositionPill code="ata" />)
    expect(screen.getByText('ATA')).toBeInTheDocument()
  })

  it('exposes a descriptive accessible label for known positions', () => {
    render(<PositionPill code="ZAG" />)
    // The visible glyph is the abbreviation; the accessible name spells it out.
    expect(
      screen.getByRole('img', { name: /zagueiro/i }),
    ).toBeInTheDocument()
  })

  it('handles the roster taxonomy codes DEF and BN (known, not neutral)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { rerender } = render(<PositionPill code="DEF" />)
    expect(screen.getByText('DEF')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /defensor/i })).toBeInTheDocument()

    rerender(<PositionPill code="BN" />)
    expect(screen.getByText('BN')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /reserva/i })).toBeInTheDocument()

    // DEF and BN are recognised codes — no unknown-code warning.
    expect(warn).not.toHaveBeenCalled()
  })

  it('differentiates ZAG from LAT (different classes / pattern, not identical)', () => {
    const { container: zagC } = render(<PositionPill code="ZAG" />)
    const { container: latC } = render(<PositionPill code="LAT" />)
    const zag = zagC.querySelector('[data-position]') as HTMLElement
    const lat = latC.querySelector('[data-position]') as HTMLElement
    expect(zag).not.toBeNull()
    expect(lat).not.toBeNull()
    // Both are blue-family, but must not be styled identically.
    expect(zag.className).not.toEqual(lat.className)
    expect(zag.getAttribute('data-position')).toBe('ZAG')
    expect(lat.getAttribute('data-position')).toBe('LAT')
  })

  it('uses a neutral style for unknown codes (no silent MEI fallback, §7 #9)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { container } = render(<PositionPill code="XYZ" />)
    const known = render(<PositionPill code="MEI" />).container.querySelector(
      '[data-position]',
    ) as HTMLElement
    const unknown = container.querySelector('[data-position]') as HTMLElement
    // The unknown code is still rendered verbatim — never swapped for MEI.
    expect(screen.getByText('XYZ')).toBeInTheDocument()
    expect(unknown.getAttribute('data-position')).toBe('XYZ')
    // And it is NOT styled like MEI (no silent fallback).
    expect(unknown.className).not.toEqual(known.className)
    expect(warn).toHaveBeenCalled()
  })

  it('does not warn for known codes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(<PositionPill code="ATA" />)
    expect(warn).not.toHaveBeenCalled()
  })

  it('renders without throwing for an unknown code', () => {
    expect(() => render(<PositionPill code="NOPE" />)).not.toThrow()
  })
})
