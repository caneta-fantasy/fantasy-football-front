import axios from 'axios';
import { apiConfig } from './config';
import { STALE_TIME } from './queryConfig';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { inviteUserToFantasyLeague } from './fantasyLeagueMutations';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  birthDate: string;
  isAdmin?: boolean;
}

export interface FantasyLeague {
    id: number;
    name: string;
    numberOfTeams: number;
    joinCode?: string | null;
    isOwner?: boolean;
    isActive?: boolean;
    isSimulation?: boolean;
    league: {
      id: number;
      externalId: number;
      name: string;
    };
    owner?: {
      id: number;
      firstName: string;
      lastName: string;
    };
    userLeagues: User[];
    members: User[];
    tradeDeadlineRound: number;
    clearWaivers: string;
    playoffTeams: number;
    injuredReserveSlots: number;
    playoffFormat: string;
    playoffStartRound: number;
  }

  export interface FantasyLeagueTeamsResponse {
    id: number;
    name: string;
    isOwner?: boolean;
    user: User;
  }

  export const useGetMyLeagues = () => {
    return useQuery<FantasyLeague[]>({
      queryKey: ['myLeagues'],
      queryFn: async () => {
        const response = await axios.get(
          apiConfig.endpoints.fantasyLeagues.myLeagues,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        return response.data;
      },
      staleTime: STALE_TIME.STANDARD,
    });
  };

  export const useGetFantasyLeague = (id: number) => {
    return useQuery<FantasyLeague>({
      queryKey: ['leagueId', id],
      queryFn: async () => {
        const response = await axios.get(
          `${apiConfig.endpoints.fantasyLeagues.getLeague}/${id}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        return response.data;
      },
      staleTime: STALE_TIME.STANDARD,
    })
}

export const useInviteUserToFantasyLeague = (id: number) => {
  return useMutation({
    mutationFn: (email: string) =>
      inviteUserToFantasyLeague({ email, id }),
  });
};


export const useFantasyLeagueTeams = (id: number) => {
  return useQuery<FantasyLeagueTeamsResponse[]>({
    queryKey: ['league-members', id],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.fantasyLeagues.getLeagueTeams(id), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      return res.data;
    },
    enabled: !!id,
  });
};