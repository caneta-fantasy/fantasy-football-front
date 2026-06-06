import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PlayoffBracket from './PlayoffBracket';
import type { FantasyMatchupDto } from '../api/fantasyMatchupQueries';

const usePlayoffMatchups = vi.fn();
vi.mock('../api/fantasyMatchupQueries', () => ({
  usePlayoffMatchups: (seasonId: string | undefined) => usePlayoffMatchups(seasonId),
}));

const mk = (over: Partial<FantasyMatchupDto>): FantasyMatchupDto => ({
  id: Math.random().toString(36),
  roundNumber: 13,
  homeTeamId: 1,
  homeTeamName: 'Home',
  awayTeamId: 2,
  awayTeamName: 'Away',
  homeScore: null,
  awayScore: null,
  winnerId: null,
  status: 'scheduled',
  matchupType: 'playoff',
  isGhost: false,
  playoffStage: 1,
  twoLegPairId: null,
  playoffSeed: { homeSeed: 1, awaySeed: 2 },
  ...over,
});

beforeEach(() => usePlayoffMatchups.mockReset());

describe('PlayoffBracket', () => {
  it('returns null when no seasonId is given', () => {
    usePlayoffMatchups.mockReturnValue({ data: undefined, isLoading: false });
    const { container } = render(<PlayoffBracket seasonId={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('shows a spinner while loading', () => {
    usePlayoffMatchups.mockReturnValue({ data: undefined, isLoading: true });
    render(<PlayoffBracket seasonId="s1" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows the empty state when the bracket is not generated', () => {
    usePlayoffMatchups.mockReturnValue({ data: [], isLoading: false });
    render(<PlayoffBracket seasonId="s1" />);
    expect(screen.getByRole('region', { name: /mata-mata não gerado/i })).toBeInTheDocument();
  });

  it('renders stage labels and the final matchup teams', () => {
    usePlayoffMatchups.mockReturnValue({
      data: [mk({ playoffStage: 1, homeTeamName: 'Os Galácticos', awayTeamName: 'Beira-Rio' })],
      isLoading: false,
    });
    render(<PlayoffBracket seasonId="s1" />);
    expect(screen.getByText('Final')).toBeInTheDocument();
    expect(screen.getByText('Os Galácticos')).toBeInTheDocument();
    expect(screen.getByText('Beira-Rio')).toBeInTheDocument();
  });

  it('renders the champion banner when the final has a winner', () => {
    usePlayoffMatchups.mockReturnValue({
      data: [
        mk({
          playoffStage: 1,
          homeTeamId: 1,
          homeTeamName: 'Os Galácticos',
          awayTeamId: 2,
          awayTeamName: 'Beira-Rio',
          homeScore: 100,
          awayScore: 80,
          winnerId: 1,
          status: 'completed',
        }),
      ],
      isLoading: false,
    });
    render(<PlayoffBracket seasonId="s1" seasonYear={2026} />);
    // The champion name appears in the winner row AND the banner (with trophy).
    expect(screen.getByText(/🏆\s*Os Galácticos/)).toBeInTheDocument();
    expect(screen.getByText(/Campeão da temporada 2026/)).toBeInTheDocument();
  });

  it('shows the two-leg aggregate legend when a pair exists', () => {
    usePlayoffMatchups.mockReturnValue({
      data: [
        mk({ playoffStage: 1, twoLegPairId: 'pair', roundNumber: 13, homeScore: 50, awayScore: 40 }),
        mk({ playoffStage: 1, twoLegPairId: 'pair', roundNumber: 14, homeScore: 30, awayScore: 45 }),
      ],
      isLoading: false,
    });
    render(<PlayoffBracket seasonId="s1" />);
    expect(screen.getByText(/J1 \/ J2 — Agregado/)).toBeInTheDocument();
  });
});
