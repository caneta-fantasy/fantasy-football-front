import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export interface DraftSettingsResponse {
  id: number;
  draftDate: string;
  draftType: 'snake' | 'linear';
  pickTimer: number;
  rounds: number;
  season: number;
}

export const useDraftSettings = (leagueId: number) => {
  return useQuery<DraftSettingsResponse>({
    queryKey: ['draftSettings', leagueId],
    queryFn: async () => {
      const res = await axios.get(
        `${apiConfig.endpoints.fantasyLeagues.getDraftSettings(leagueId)}`,
        {
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return res.data;
    },
    enabled: !!leagueId,
  });
};
