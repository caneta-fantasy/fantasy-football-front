import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MatchupCard from './MatchupCard';
import { FantasyMatchupDto } from '../api/fantasyMatchupQueries';

const base: FantasyMatchupDto = {
  id: 'm1',
  roundNumber: 12,
  homeTeamId: 1,
  homeTeamName: 'Galácticos do Bar',
  awayTeamId: 2,
  awayTeamName: 'Os Galácticos',
  homeScore: 92,
  awayScore: 74,
  winnerId: 1,
  status: 'completed',
  matchupType: 'regular',
  isGhost: false,
  playoffStage: null,
  twoLegPairId: null,
  playoffSeed: null,
};

describe('MatchupCard', () => {
  it('renders both team names and the scoreline', () => {
    render(<MatchupCard matchup={base} />);
    expect(screen.getByText('Galácticos do Bar')).toBeInTheDocument();
    expect(screen.getByText('Os Galácticos')).toBeInTheDocument();
    expect(screen.getByText('92')).toBeInTheDocument();
    expect(screen.getByText('74')).toBeInTheDocument();
  });

  it('renders a BYE chip and only the home name for a bye matchup', () => {
    render(
      <MatchupCard
        matchup={{ ...base, status: 'bye', awayTeamName: null }}
      />,
    );
    expect(screen.getByText('BYE')).toBeInTheDocument();
    expect(screen.getByText('Galácticos do Bar')).toBeInTheDocument();
    expect(screen.queryByText('Os Galácticos')).not.toBeInTheDocument();
  });

  it('renders a focusable button and fires onClick when interactive', async () => {
    const onClick = vi.fn();
    render(<MatchupCard matchup={base} onClick={onClick} highlighted />);
    const btn = screen.getByRole('button');
    await userEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('is a non-button static row when no onClick is provided', () => {
    render(<MatchupCard matchup={base} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows an em dash placeholder for missing scores', () => {
    render(
      <MatchupCard
        matchup={{ ...base, homeScore: null, awayScore: null, winnerId: null, status: 'scheduled' }}
      />,
    );
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('uses Ghost as the fallback name when a team is null', () => {
    render(
      <MatchupCard
        matchup={{ ...base, awayTeamName: null, isGhost: true }}
      />,
    );
    expect(screen.getByText('Ghost')).toBeInTheDocument();
  });
});
