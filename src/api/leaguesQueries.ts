import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';
import { SUPPORTED_LEAGUE } from '../constants/league';

export interface RealLeague {
  id: number;
  externalId: number;
  name: string;
}

/** Seeded real championships (for admin league pickers). */
export function useLeagues() {
  return useQuery<RealLeague[]>({
    queryKey: ['leagues'],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.leagues.list, {
        headers: authHeader(),
      });
      return res.data;
    },
    staleTime: Infinity, // seeded reference data
  });
}

/**
 * The single supported league (Brasileirão Série A) resolved against the
 * backend so the INTERNAL id is correct regardless of seed order.
 */
export function useSupportedLeague() {
  const { data: leagues, ...rest } = useLeagues();
  const league = leagues?.find(
    (l) => l.externalId === SUPPORTED_LEAGUE.externalId,
  );
  return { league, ...rest };
}
