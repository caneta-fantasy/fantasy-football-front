// src/api/fantasyLeagueSeasonsMutation.ts
import { useMutation } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import { apiConfig } from './config';
import axios from 'axios';

export type ActivateSeasonBody = {
  seasonKickoffAt?: string; // ISO string; optional
};

export interface UpdateFantasyLeagueSeason {
  values: {
    numberOfTeams: number;
    tradeReviewDays: number;
    numberOfRounds: number;
    tradeDeadlineRound: number | null;
    playoffTeams: number;
    playoffFormat: 'single_game' | 'two_leg_single_game_final' | 'two_leg_all';
    injuredReserveSlots: number;
  };
}

interface UpdateFantasyLeagueSeasonData {
  id: number;
  updates: Partial<{
    numberOfTeams: number;
    tradeReviewDays: number;
    numberOfRounds: number;
    tradeDeadlineRound: number | null;
    playoffTeams: number;
    playoffFormat: 'single_game' | 'two_leg_single_game_final' | 'two_leg_all';
    injuredReserveSlots: number;
    // logoUrl: string; <-- for later
  }>;
}

export async function activateSeasonRequest(
  seasonId: string,
  body: ActivateSeasonBody = {}
) {
  try {
    const res = await axios.post(
      apiConfig.endpoints.fantasyLeagueSeasons.activate(seasonId),
      body,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );
    return res.data;
  } catch (err: any) {
    const d = err?.response?.data;
    const msg = Array.isArray(d?.message)
      ? d.message.join(', ')
      : d?.message || d?.error || err?.message || 'Erro ao ativar a temporada';
    throw new Error(msg);
  }
}

export const useUpdateFantasyLeagueSeason = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: ({ id, updates }: UpdateFantasyLeagueSeasonData) =>
      axios.patch(`${apiConfig.endpoints.fantasyLeagueSeasons.update(id)}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    onSuccess: onSuccess,
  });
};

export function useActivateSeasonMutation(options?: {
  onSuccess?: (data: any) => void;
  onError?: (err: unknown) => void;
}) {
  return useMutation({
    mutationKey: ['activateSeason'],
    mutationFn: (vars: { seasonId: string; body?: ActivateSeasonBody }) =>
      activateSeasonRequest(vars.seasonId.toString(), vars.body ?? {}),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  });
}
