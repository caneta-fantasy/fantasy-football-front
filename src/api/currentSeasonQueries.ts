import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { STALE_TIME } from './queryConfig';

export interface CurrentSeason {
  year: number;
  realCurrentRound: number | null;
  maxRealRound: number;
  minRounds: number; // floor for a fantasy season (12)
  maxRounds: number; // real rounds left to play (shrinks as the season advances)
  canCreate: boolean; // false once the real season is past the creation cutoff
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
