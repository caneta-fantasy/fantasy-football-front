import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export interface DraftOrderEntry {
  id: number;
  pickPosition: number;
  isLocked: boolean;
  userTeam: {
    id: number;
    name: string;
    user: { id: number; firstName: string; lastName: string };
  };
}

export const useDraftOrder = (leagueId: number, season: number) => {
  return useQuery<DraftOrderEntry[]>({
    queryKey: ['draftOrder', leagueId, season],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.draftOrder.get(leagueId, season),
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );
      return res.data;
    },
    enabled: !!leagueId && !!season,
  });
};
