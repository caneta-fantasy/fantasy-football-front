import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';
import { User } from './fantasyLeagueQueries';

export interface UserTeam {
  id: number;
  name: string;
  owner: User;
}

export const useFindUserFantasyLeagueTeam = (userId: number, fantasyLeagueId: number) => {
  return useQuery({
    queryKey: ['userFantasyLeagueTeam', userId, fantasyLeagueId],
    queryFn: async () => {
      const response = await axios.get(
        `${apiConfig.endpoints.users.findUserFantasyLeagueTeam(userId, fantasyLeagueId)}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return response.data;
    },
    enabled: !!userId && !!fantasyLeagueId,
  });
}; 