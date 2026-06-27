import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export interface PlayerRankingRow {
  rank: number;
  playerId: number;
  playerName: string;
  playerPosition: string;
  isSynthetic: boolean;
  teamName: string;
  totalPoints: number;
  goalPoints: number;
  assistPoints: number;
  shotPoints: number;
  foulPoints: number;
  cleanSheetPoints: number;
  savePoints: number;
  cardPoints: number;
  ownGoalPoints: number;
  penaltyPoints: number;
  tacklePoints: number;
  goalConcededPoints: number;
  gamesPlayed: number;
}

export const usePlayerRankings = (
  seasonId: string | undefined,
  position?: string,
  limit = 50,
  offset = 0,
) => {
  return useQuery<PlayerRankingRow[]>({
    queryKey: ['playerRankings', seasonId, position, limit, offset],
    queryFn: async () => {
      const params: Record<string, any> = { limit, offset };
      if (position) params.position = position;
      const res = await axios.get(
        apiConfig.endpoints.playerFantasyPoints.rankings(seasonId!),
        {
          params,
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });
};
