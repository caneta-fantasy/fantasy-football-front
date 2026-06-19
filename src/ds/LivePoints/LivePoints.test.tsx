import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LivePoints } from './LivePoints'

describe('LivePoints', () => {
  it('renders the value inside a polite live region', () => {
    render(<LivePoints value={116.6} />)
    const region = screen.getByRole('status')
    // Value is announced as it updates.
    expect(region).toHaveAttribute('aria-live', 'polite')
    expect(region).toHaveTextContent('116.6')
  })

  it('exposes an accessible label describing the live points', () => {
    render(<LivePoints value={42} label="Seus pontos agora" />)
    expect(
      screen.getByRole('status', { name: /seus pontos agora/i })
    ).toBeInTheDocument()
  })

  it('shows the live indicator (AO VIVO chip) while connected', () => {
    render(<LivePoints value={88.2} />)
    // The embedded LiveChip renders the exact "AO VIVO" label.
    expect(screen.getByText('AO VIVO')).toBeInTheDocument()
  })

  it('disconnected: no pulse, announces a non-color disconnected cue', () => {
    const { container } = render(<LivePoints value={88.2} status="disconnected" />)
    expect(container.querySelector('.ds-live-dot')).not.toBeInTheDocument()
    expect(screen.getByText(/sem conex/i)).toBeInTheDocument()
  })

  it('stale: announces a stale-data cue and keeps the last value visible', () => {
    render(<LivePoints value={88.2} status="stale" />)
    expect(screen.getByText(/desatualizado/i)).toBeInTheDocument()
    const region = screen.getByRole('status', { name: /pontos ao vivo/i })
    expect(within(region).getByText('88.2')).toBeInTheDocument()
  })

  it('formats a numeric value to one decimal place', () => {
    render(<LivePoints value={116} />)
    expect(screen.getByRole('status')).toHaveTextContent('116.0')
  })

  it('accepts a pre-formatted string value verbatim', () => {
    render(<LivePoints value="—" />)
    expect(screen.getByRole('status')).toHaveTextContent('—')
  })

  it('falls back to the live style for an unknown status without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<LivePoints value={1} status="bogus" />)
    ).not.toThrow()
  })
})
