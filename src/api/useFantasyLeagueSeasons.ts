import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
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
  // Originally-requested round count if the season was shortened at schedule
  // generation to fit the real league's remaining rounds; null otherwise.
  roundsShortenedFrom: number | null;
  playoffFormat: string;
  seasonKickoffAt: string;
  activatedAt: string;
  status: string;
  seasonYear: number;
  currentFantasyRound: number | null;
  currentRealRound: number | null;
  // Real-league round tracker + skip budget (round calendar feature)
  realCurrentRound: number | null;
  maxRealRound: number;
  lastMappedRealRound: number | null;
  remainingSkipMargin: number | null;
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
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return res.data;
    },
    enabled: !!leagueId,
  });
};
