import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export type FantasyLeagueInvite = {
  id: number;
  recipientEmail: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

  export const useGetInvitesByLeague = (leagueId: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['league-invites', leagueId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.fantasyLeagues.getInvitesByLeagueId(leagueId), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      return res.data;
    },
    enabled: enabled && !!leagueId,
  });
};

export const useCancelInvite = (leagueId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inviteId: number) => {
      await axios.delete(apiConfig.endpoints.fantasyLeagueInvites.cancel(inviteId), {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
    },
    onMutate: async () => {
      // Optional: optimistic update logic
      await queryClient.cancelQueries({ queryKey: ['league-invites', leagueId] });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league-invites', leagueId] });
    },
  });
};