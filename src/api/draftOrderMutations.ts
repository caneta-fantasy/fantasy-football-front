import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export interface SetDraftOrderPayload {
  season: number;
  order: Array<{ userTeamId: number; pickPosition: number }>;
}

export const useSetDraftOrder = (leagueId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetDraftOrderPayload) =>
      axios.post(apiConfig.endpoints.draftOrder.set(leagueId), payload, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['draftOrder', leagueId, variables.season],
      });
    },
  });
};
