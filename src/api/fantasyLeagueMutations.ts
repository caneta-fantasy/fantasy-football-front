import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

interface CreateFantasyLeagueData {
  name: string;
  numberOfTeams: number;
  ownerId: number;
  leagueId: number;
  draftType: string;
  numberOfRounds?: number;
}

export interface UpdateFantasyLeague {
  values: {
    name: string;
    numberOfTeams: number;
    tradeReviewDays: number;
    numberOfRounds: number;
    tradeDeadlineRound: number | null;
    playoffTeams: number;
    playoffFormat: 'single_game' | 'two_leg_single_game_final' | 'two_leg_all';
    injuredReserveSlots: number;
  };
}

interface UpdateFantasyLeagueData {
  id: number;
  updates: Partial<{
    name: string;
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

export const useCreateFantasyLeague = () => {
  return useMutation({
    mutationFn: (fantasyLeagueData: CreateFantasyLeagueData) => 
      axios.post(apiConfig.endpoints.fantasyLeagues.create, fantasyLeagueData, {
        headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
    }),
  });
};

export const inviteUserToFantasyLeague = async ({
  email,
  id,
}: {
  email: string;
  id: number;
}) => {
  const res = await fetch(`${apiConfig.endpoints.fantasyLeagueInvites.invite}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ email, id }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to send invite');
  }

  return res.json();
};

export const useUpdateFantasyLeague = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: UpdateFantasyLeagueData) =>
      axios.patch(`${apiConfig.endpoints.fantasyLeagues.update(id)}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    onSuccess: (_data, variables) => {
      // Refresh the league name app-wide (sidebar, my-leagues list, detail).
      queryClient.invalidateQueries({ queryKey: ['myLeagues'] });
      queryClient.invalidateQueries({ queryKey: ['leagueId', variables.id] });
      onSuccess?.();
    },
  });
};

export const useJoinFantasyLeague = () => {
  return useMutation({
    mutationFn: async (joinCode: string) => {
      const res = await axios.post(
        apiConfig.endpoints.fantasyLeagues.join,
        { joinCode },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      return res.data as { message: string; leagueId: number };
    },
  });
};

export const useDeleteFantasyLeague = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${apiConfig.endpoints.fantasyLeagues.delete(id)}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    onSuccess: (_data, id) => {
      // Drop the deleted league from the cached list so it disappears on /welcome.
      queryClient.invalidateQueries({ queryKey: ['myLeagues'] });
      queryClient.removeQueries({ queryKey: ['leagueId', id] });
    },
  });
};
