import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';

export type AvailabilityStatus =
  | 'HEALTHY'
  | 'MINOR'
  | 'MAJOR'
  | 'LONG_TERM'
  | 'SEASON_ENDING';

export interface PlayerRankingRow {
  playerId: number;
  name: string;
  position: string;
  teamName: string | null;
  draftRank: number | null;
  autoStatScore: number;
  finalScore: number;
  availabilityStatus: AvailabilityStatus;
  manualNudge: number;
}

export interface RankingConfig {
  id: number;
  healthyMultiplier: number;
  minorMultiplier: number;
  majorMultiplier: number;
  longTermMultiplier: number;
  seasonEndingMultiplier: number;
}

export function usePlayerRankings() {
  return useQuery<PlayerRankingRow[]>({
    queryKey: ['playerRankings'],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.playerRanking.list, {
        headers: authHeader(),
      });
      return res.data;
    },
  });
}

export function useRankingConfig() {
  return useQuery<RankingConfig>({
    queryKey: ['rankingConfig'],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.playerRanking.config, {
        headers: authHeader(),
      });
      return res.data;
    },
  });
}

function useRankingMutation<TVars>(
  fn: (vars: TVars) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playerRankings'] });
      queryClient.invalidateQueries({ queryKey: ['rankingConfig'] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    },
  });
}

export function useSetAvailability() {
  return useRankingMutation<{ playerId: number; status: AvailabilityStatus }>(
    ({ playerId, status }) =>
      axios.patch(
        apiConfig.endpoints.playerRanking.availability(playerId),
        { status },
        { headers: authHeader() },
      ),
  );
}

export function useSetNudge() {
  return useRankingMutation<{ playerId: number; nudge: number }>(
    ({ playerId, nudge }) =>
      axios.patch(
        apiConfig.endpoints.playerRanking.nudge(playerId),
        { nudge },
        { headers: authHeader() },
      ),
  );
}

export function useUpdateRankingConfig() {
  return useRankingMutation<Partial<RankingConfig>>((dto) =>
    axios.patch(apiConfig.endpoints.playerRanking.config, dto, {
      headers: authHeader(),
    }),
  );
}

export function useRecomputeRankings() {
  return useRankingMutation<void>(() =>
    axios.post(apiConfig.endpoints.playerRanking.recompute, {}, {
      headers: authHeader(),
    }),
  );
}
