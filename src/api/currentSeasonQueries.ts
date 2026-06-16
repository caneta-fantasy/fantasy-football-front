import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { STALE_TIME } from './queryConfig';

interface CurrentSeason {
  year: number;
}

export const useCurrentSeason = () => {
  return useQuery<CurrentSeason>({
    queryKey: ['currentSeason'],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.currentSeason);
      return res.data;
    },
    staleTime: STALE_TIME.LONG,
  });
};
