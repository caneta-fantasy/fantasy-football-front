import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Sparkline } from './Sparkline'

describe('Sparkline', () => {
  it('renders as role="img" with an aria-label trend summary', () => {
    render(<Sparkline data={[6, 9, 4, 12, 8, 16, 22, 18]} />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    // The default summary describes a trend over N points.
    expect(img).toHaveAccessibleName(/tend|8 pontos|pontos/i)
  })

  it('uses an explicit label verbatim when provided', () => {
    render(<Sparkline data={[1, 2, 3]} label="Pontos da rodada" />)
    expect(
      screen.getByRole('img', { name: 'Pontos da rodada' }),
    ).toBeInTheDocument()
  })

  it('draws a polyline for multi-point data', () => {
    const { container } = render(<Sparkline data={[1, 5, 2, 8]} />)
    const line = container.querySelector('polyline')
    expect(line).not.toBeNull()
    // Four points → four "x,y" coordinate pairs separated by spaces.
    expect(line!.getAttribute('points')!.trim().split(/\s+/)).toHaveLength(4)
  })

  it('marks the latest data point with an endpoint dot', () => {
    const { container } = render(<Sparkline data={[3, 6, 9]} />)
    expect(container.querySelector('[data-ds-spark-endpoint]')).not.toBeNull()
  })

  it('renders empty data without throwing and exposes an empty summary', () => {
    expect(() => render(<Sparkline data={[]} />)).not.toThrow()
    const img = screen.getByRole('img')
    expect(img).toHaveAccessibleName(/sem dados/i)
    // No line is drawn for empty data.
    const { container } = render(<Sparkline data={[]} />)
    expect(container.querySelector('polyline')).toBeNull()
  })

  it('renders a single point as a centred dot without NaN coordinates', () => {
    const { container } = render(<Sparkline data={[7]} />)
    const dot = container.querySelector('[data-ds-spark-endpoint]') as SVGCircleElement
    expect(dot).not.toBeNull()
    expect(dot.getAttribute('cx')).not.toMatch(/NaN/)
    expect(dot.getAttribute('cy')).not.toMatch(/NaN/)
    // A single point cannot form a line.
    expect(container.querySelector('polyline')).toBeNull()
  })

  it('renders all-equal data as a flat mid-line without divide-by-zero NaN', () => {
    const { container } = render(<Sparkline data={[5, 5, 5, 5]} />)
    const line = container.querySelector('polyline') as SVGPolylineElement
    expect(line).not.toBeNull()
    expect(line.getAttribute('points')).not.toMatch(/NaN/)
    // Flat series: every y coordinate is identical.
    const ys = line
      .getAttribute('points')!
      .trim()
      .split(/\s+/)
      .map((p) => p.split(',')[1])
    expect(new Set(ys).size).toBe(1)
  })

  it('falls back to the up trend color for an unknown trend without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<Sparkline data={[1, 2, 3]} trend="nope" />),
    ).not.toThrow()
  })

  it('honors an explicit down trend color (brick danger, not card-red)', () => {
    const { container } = render(<Sparkline data={[9, 7, 5]} trend="down" />)
    const line = container.querySelector('polyline') as SVGPolylineElement
    expect(line.getAttribute('stroke')).toContain('--danger')
  })

  it('respects custom width and height on the svg', () => {
    const { container } = render(<Sparkline data={[1, 2]} w={150} h={40} />)
    const svg = container.querySelector('svg') as SVGSVGElement
    expect(svg.getAttribute('width')).toBe('150')
    expect(svg.getAttribute('height')).toBe('40')
  })
})
