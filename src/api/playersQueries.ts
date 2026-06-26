// api/playersQueries.ts
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { apiConfig } from './config';
import { STALE_TIME } from './queryConfig';

export interface Player {
  player_id: number;
  player_name: string;
  player_position: string;
  player_photo: string;
  team_name: string;
  goals: number;
  totalPoints: number | null;
  gamesPlayed: number;
  avgPoints: number | null;
  team: { code: string };
  is_rostered: boolean;
  rostered_by_user_team_id?: number;
  rostered_by_user_team_name?: string;
  // True when the player just (re)entered the league and must clear one waiver
  // window before a direct add (drives the "Novo" badge).
  isNew?: boolean;
}

export interface PlayersFiltersResponse {
  teams: { id: number; name: string }[];
}

export interface PlayerResponse {
  data: Player[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    sortBy: string;
    order: 'asc' | 'desc';
  };
}

type UsePlayersFiltersParams = {
  leagueId?: number;
  seasonYear?: number; // optional: pass if your BE expects it
};


export const usePlayers = ({
  position,
  search,
  page,
  limit,
  sortBy,
  order,
  leagueId,
  fantasyLeagueId,
  onlyFreeAgents,
  onlyNewPlayers,
  teamId,
  excludePlayerIds,
}: {
  position?: string[];
  search?: string;
  page: number;
  limit: number;
  sortBy: string;
  order: 'asc' | 'desc';
  leagueId?: number;
  fantasyLeagueId?: number;
  onlyFreeAgents: boolean,
  onlyNewPlayers?: boolean,
  teamId?: number,
  excludePlayerIds?: number[],
}) => {
  return useQuery<PlayerResponse>({
    queryKey: ['players', { position, search, page, limit, sortBy, order, leagueId, fantasyLeagueId, onlyFreeAgents, onlyNewPlayers, teamId, excludePlayerIds }],
    enabled: leagueId != null,
    placeholderData: (prev) => prev,
    queryFn: async () => {
      const response = await axios.get(`${apiConfig.endpoints.players.getAll}`, {
        params: { position, search, page, limit, sortBy, order, leagueId, fantasyLeagueId, onlyFreeAgents, onlyNewPlayers, teamId, excludePlayerIds },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        withCredentials: true,
      });
      return response.data;
    },
  });
};


export const usePlayersFilters = (params: UsePlayersFiltersParams) => {
  return useQuery<PlayersFiltersResponse>({
    queryKey: ['players-filters', params],
    enabled: params.leagueId != null,
    queryFn: async () => {
      const response = await axios.get(
        apiConfig.endpoints.players.getFilters,
        {
          params, // e.g. { leagueId, seasonYear }
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          withCredentials: true,
        }
      );
      return response.data;
    },
    staleTime: STALE_TIME.STANDARD,
  });
};