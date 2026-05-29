import { render, screen, within } from '@testing-library/react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { FixtureCard } from './FixtureCard'

const home = { name: 'Palmeiras', short: 'PAL', seed: 2 }
const away = { name: 'Flamengo', short: 'FLA', seed: 1 }

afterEach(() => {
  vi.restoreAllMocks()
})

describe('FixtureCard', () => {
  it('renders a real article landmark labelled with both clubs', () => {
    render(<FixtureCard home={home} away={away} venue="Allianz" />)
    // Semantic <article>, not a styled div.
    const card = screen.getByRole('article')
    expect(card.tagName).toBe('ARTICLE')
    // Accessible name names both teams.
    expect(card).toHaveAccessibleName(/Palmeiras/i)
    expect(card).toHaveAccessibleName(/Flamengo/i)
  })

  it('pre-match: shows kickoff time, no score, status text "A SAIR"', () => {
    render(
      <FixtureCard status="pre" home={home} away={away} kickoff="16:00" />,
    )
    const card = screen.getByRole('article')
    // pre-match shows the kickoff, never a "x" score line.
    expect(within(card).getByText('16:00')).toBeInTheDocument()
    expect(within(card).queryByText('×')).not.toBeInTheDocument()
    // Status is communicated as TEXT (not color alone).
    expect(within(card).getByText(/A SAIR/i)).toBeInTheDocument()
    expect(card).toHaveAttribute('data-status', 'pre')
  })

  it('live: renders an aria-live region, the score, and the minute label', () => {
    render(
      <FixtureCard
        status="live"
        home={home}
        away={away}
        homeScore={2}
        awayScore={1}
        minute={67}
      />,
    )
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('data-status', 'live')
    // The score line is present with tabular score figures.
    expect(within(card).getByText('2')).toBeInTheDocument()
    expect(within(card).getByText('1')).toBeInTheDocument()
    expect(within(card).getByText('×')).toBeInTheDocument()
    // A polite live region carries the live updates.
    const region = within(card).getByRole('status')
    expect(region).toHaveAttribute('aria-live', 'polite')
    // The minute is surfaced (live "AO VIVO · 67'").
    expect(within(card).getByText(/67/)).toBeInTheDocument()
  })

  it('finished: shows the final score and a "ENCERRADO" status, no live region', () => {
    render(
      <FixtureCard
        status="finished"
        home={home}
        away={away}
        homeScore={3}
        awayScore={0}
      />,
    )
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('data-status', 'finished')
    expect(within(card).getByText(/ENCERRADO/i)).toBeInTheDocument()
    expect(within(card).getByText('3')).toBeInTheDocument()
    expect(within(card).getByText('0')).toBeInTheDocument()
    // Not live: no polite status region.
    expect(within(card).queryByRole('status')).not.toBeInTheDocument()
  })

  it('postponed: shows the "ADIADO" status and no score', () => {
    render(<FixtureCard status="postponed" home={home} away={away} />)
    const card = screen.getByRole('article')
    expect(card).toHaveAttribute('data-status', 'postponed')
    expect(within(card).getByText(/ADIADO/i)).toBeInTheDocument()
    expect(within(card).queryByText('×')).not.toBeInTheDocument()
  })

  it('renders each club crest as a labelled image (composes Crest)', () => {
    render(<FixtureCard home={home} away={away} status="pre" kickoff="16:00" />)
    // Crest renders role="img" with the club name as its label.
    expect(screen.getByRole('img', { name: 'Palmeiras' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Flamengo' })).toBeInTheDocument()
  })

  it('falls back to the pre-match state for an unknown status without throwing', () => {
    expect(() =>
      render(
        // @ts-expect-error testing the runtime default-fallback (§7 #1)
        <FixtureCard status="nope" home={home} away={away} kickoff="16:00" />,
      ),
    ).not.toThrow()
    // Unknown status is treated as pre-match: kickoff shown, no score line.
    const card = screen.getByRole('article')
    expect(within(card).getByText('16:00')).toBeInTheDocument()
    expect(within(card).queryByText('×')).not.toBeInTheDocument()
  })

  it('forwards extra props (e.g. onClick) to the article element', () => {
    render(<FixtureCard home={home} away={away} status="pre" data-testid="fx" />)
    expect(screen.getByTestId('fx')).toBe(screen.getByRole('article'))
  })
})
