import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ScheduleTab from './ScheduleTab';
import type { StandingDto, FantasyMatchupDto } from '../api/fantasyMatchupQueries';

const useStandings = vi.fn();
const usePlayoffMatchups = vi.fn();
vi.mock('../api/fantasyMatchupQueries', () => ({
  useStandings: (s: string | undefined) => useStandings(s),
  usePlayoffMatchups: (s: string | undefined) => usePlayoffMatchups(s),
}));

const standings: StandingDto[] = [
  { teamId: 1, teamName: 'Galácticos do Bar', wins: 7, draws: 0, losses: 4, points: 21, pointsFor: 1084.6, pointsAgainst: 1031.7, seed: 3 },
  { teamId: 2, teamName: 'Os Galácticos', wins: 9, draws: 0, losses: 2, points: 27, pointsFor: 1142, pointsAgainst: 988.4, seed: 1 },
];

const playoff: FantasyMatchupDto[] = [
  {
    id: 'p1', roundNumber: 13,
    homeTeamId: 1, homeTeamName: 'Galácticos do Bar',
    awayTeamId: 2, awayTeamName: 'Os Galácticos',
    homeScore: null, awayScore: null, winnerId: null,
    status: 'scheduled', matchupType: 'playoff', isGhost: false,
    playoffStage: 1, twoLegPairId: null, playoffSeed: { homeSeed: 1, awaySeed: 2 },
  },
];

beforeEach(() => {
  useStandings.mockReset();
  usePlayoffMatchups.mockReset();
});

describe('ScheduleTab', () => {
  it('shows an empty state when no seasonId is provided', () => {
    useStandings.mockReturnValue({ data: undefined, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: undefined, isLoading: false });
    render(<ScheduleTab seasonId={undefined} />);
    expect(screen.getByRole('region', { name: /temporada não encontrada/i })).toBeInTheDocument();
  });

  it('renders the ArchHeader title and Classificação section', () => {
    useStandings.mockReturnValue({ data: standings, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: [], isLoading: false });
    render(<ScheduleTab seasonId="s1" userTeamId={1} seasonYear={2026} />);
    expect(screen.getByRole('heading', { name: 'Tabela', level: 2 })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Classificação', level: 3 })).toBeInTheDocument();
    expect(screen.getAllByText('Galácticos do Bar').length).toBeGreaterThan(0);
  });

  it('renders the your-standing placar from the user standings row', () => {
    useStandings.mockReturnValue({ data: standings, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: [], isLoading: false });
    render(<ScheduleTab seasonId="s1" userTeamId={1} />);
    expect(screen.getByRole('region', { name: /sua classificação/i })).toBeInTheDocument();
    expect(screen.getByText('Posição')).toBeInTheDocument();
  });

  it('omits the placar when the user has no standings row', () => {
    useStandings.mockReturnValue({ data: standings, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: [], isLoading: false });
    render(<ScheduleTab seasonId="s1" userTeamId={999} />);
    expect(screen.queryByRole('region', { name: /sua classificação/i })).not.toBeInTheDocument();
  });

  it('shows the Mata-mata section only when playoff matchups exist', () => {
    useStandings.mockReturnValue({ data: standings, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: playoff, isLoading: false });
    render(<ScheduleTab seasonId="s1" userTeamId={1} />);
    expect(screen.getByRole('heading', { name: 'Mata-mata', level: 3 })).toBeInTheDocument();
  });

  it('hides the Mata-mata section when there are no playoff matchups', () => {
    useStandings.mockReturnValue({ data: standings, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: [], isLoading: false });
    render(<ScheduleTab seasonId="s1" userTeamId={1} />);
    expect(screen.queryByRole('heading', { name: 'Mata-mata' })).not.toBeInTheDocument();
  });

  it('keeps the data-ds root', () => {
    useStandings.mockReturnValue({ data: standings, isLoading: false });
    usePlayoffMatchups.mockReturnValue({ data: [], isLoading: false });
    const { container } = render(<ScheduleTab seasonId="s1" userTeamId={1} />);
    expect(container.querySelector('[data-ds]')).toBeInTheDocument();
  });
});
