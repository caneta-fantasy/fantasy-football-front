import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config'; 

export interface FantasyLeagueSeason {
  id: string;
  numberOfTeams: number;
  playoffTeams: number;
  tradeDeadlineRound: number;
  irSlots: number;
  playoffStartRound: number;
  numberOfRounds: number;
  playoffFormat: string;
  seasonKickoffAt: string;
  activatedAt: string;
  status: string;
  seasonYear: number;
  currentFantasyRound: number | null;
  currentRealRound: number | null;
  waiverSystem: 'AUCTION' | 'PRIORITY';
  initialWaiverBudget: number;
  fantasyLeague?: { league?: { externalId?: number } };
  championTeamId: number | null;
}

export const useFantasyLeagueSeasons = (leagueId: number) => {
  return useQuery<FantasyLeagueSeason>({
    queryKey: ['fantasyLeagueSeasons', leagueId],
    queryFn: async () => {
      const res = await axios.get(
        `${apiConfig.endpoints.fantasyLeagues.getFantasyLeagueSeasons(leagueId)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return res.data;
    },
    enabled: !!leagueId,
  });
};
