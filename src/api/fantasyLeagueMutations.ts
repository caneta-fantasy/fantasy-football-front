import { useMutation } from '@tanstack/react-query';
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
        Authorization: `Bearer ${localStorage.getItem('token')}`,
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
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ email, id }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Failed to send invite');
  }

  return res.json();
};

export const useUpdateFantasyLeague = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: ({ id, updates }: UpdateFantasyLeagueData) =>
      axios.patch(`${apiConfig.endpoints.fantasyLeagues.update(id)}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    onSuccess: onSuccess,
  });
};

export const useDeleteFantasyLeague = () =>
  useMutation({
    mutationFn: (id: number) =>
      axios.delete(`${apiConfig.endpoints.fantasyLeagues.delete(id)}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
  });
