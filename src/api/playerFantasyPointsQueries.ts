import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export interface PlayerHistoryRow {
  roundNumber: number | null;
  matchDate: string | null;
  homeTeamName: string | null;
  awayTeamName: string | null;
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  saves: number;
  cleanSheet: boolean;
  goalsConceded: number | null;
  tacklesTotal: number | null;
  shotsOffTarget: number | null;
  shotsSaved: number | null;
  foulsDrawn: number | null;
  foulsCommitted: number | null;
  penaltyWon: number | null;
  penaltyCommitted: number | null;
  offsides: number | null;
  totalPoints: number;
  yellowCardPoints: number;
  redCardPoints: number;
  foulsDrawnPoints: number;
  foulsCommittedPoints: number;
  penaltyWonPoints: number;
  penaltyCommittedPoints: number;
  offsidesPoints: number;
  shotsSavedPoints: number;
  shotsOffTargetPoints: number;
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
}

export const usePlayerHistory = (
  playerId: number | null,
  seasonId: string | undefined,
) => {
  return useQuery<PlayerHistoryRow[]>({
    queryKey: ['playerHistory', playerId, seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.playerFantasyPoints.playerHistory(playerId!, seasonId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!playerId && !!seasonId,
  });
};

export interface RoundPoints {
  playerId: number;
  totalPoints: number;
}

export const usePointsByRound = (
  seasonId: string | undefined,
  roundNumber: number | undefined,
) => {
  return useQuery<Map<number, number>>({
    queryKey: ['pointsByRound', seasonId, roundNumber],
    queryFn: async () => {
      const res = await axios.get<RoundPoints[]>(
        apiConfig.endpoints.playerFantasyPoints.byRound(seasonId!, roundNumber!),
        { headers: authHeader() },
      );
      return new Map(res.data.map((r) => [r.playerId, r.totalPoints]));
    },
    enabled: !!seasonId && roundNumber != null,
  });
};
