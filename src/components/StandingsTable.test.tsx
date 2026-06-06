import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import StandingsTable from './StandingsTable';
import type { StandingDto } from '../api/fantasyMatchupQueries';

// Mock the data hook so we drive each state deterministically; the query
// key/args contract is exercised by the real hook, not this view test.
const useStandings = vi.fn();
vi.mock('../api/fantasyMatchupQueries', () => ({
  useStandings: (seasonId: string | undefined) => useStandings(seasonId),
}));

const rows: StandingDto[] = [
  { teamId: 2, teamName: 'Os Galácticos', wins: 9, draws: 0, losses: 2, points: 27, pointsFor: 1142, pointsAgainst: 988.4, seed: 1 },
  { teamId: 1, teamName: 'Galácticos do Bar', wins: 7, draws: 0, losses: 4, points: 21, pointsFor: 1084.6, pointsAgainst: 1031.7, seed: 3 },
];

beforeEach(() => useStandings.mockReset());

describe('StandingsTable', () => {
  it('shows a skeleton loading grid while loading', () => {
    useStandings.mockReturnValue({ data: undefined, isLoading: true });
    render(<StandingsTable seasonId="s1" />);
    expect(screen.getByTestId('standings-loading')).toBeInTheDocument();
  });

  it('shows an empty state when there are no standings', () => {
    useStandings.mockReturnValue({ data: [], isLoading: false });
    render(<StandingsTable seasonId="s1" />);
    expect(screen.getByRole('region', { name: /sem classificação/i })).toBeInTheDocument();
  });

  it('renders a header band and one row per team', () => {
    useStandings.mockReturnValue({ data: rows, isLoading: false });
    render(<StandingsTable seasonId="s1" userTeamId={1} />);
    // Names appear in both the desktop and mobile grids → use getAllByText.
    expect(screen.getAllByText('Os Galácticos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Galácticos do Bar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Time').length).toBeGreaterThan(0);
  });

  it('marks the user row with the data-me attribute', () => {
    useStandings.mockReturnValue({ data: rows, isLoading: false });
    const { container } = render(<StandingsTable seasonId="s1" userTeamId={1} />);
    const meRows = container.querySelectorAll('[data-me="true"]');
    // one per visible grid (desktop + mobile both in the DOM)
    expect(meRows.length).toBeGreaterThan(0);
  });

  it('renders PP/PC values in the desktop grid', () => {
    useStandings.mockReturnValue({ data: rows, isLoading: false });
    render(<StandingsTable seasonId="s1" />);
    // pointsFor 1142 → "1142.0", pointsAgainst 988.4 → "988.4"
    expect(screen.getByText('1142.0')).toBeInTheDocument();
    expect(screen.getByText('988.4')).toBeInTheDocument();
  });
});
