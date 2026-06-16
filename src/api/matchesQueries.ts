import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { STALE_TIME } from './queryConfig';

export interface TeamInfoDto {
  id: number;
  name: string;
  code: string | null;
  logoUrl: string | null;
}

export interface RealMatchDto {
  homeTeam: TeamInfoDto;
  awayTeam: TeamInfoDto;
  date: string | null;
  status: string;
}

export function useRealMatchesByRound(seasonYear?: number, roundNumber?: number) {
  return useQuery<RealMatchDto[]>({
    queryKey: ['real-matches', seasonYear, roundNumber],
    queryFn: () =>
      axios
        .get(apiConfig.endpoints.matches.byRound(seasonYear!, roundNumber!))
        .then((r) => r.data),
    enabled: !!seasonYear && !!roundNumber,
    staleTime: STALE_TIME.STATIC,
    gcTime: 1000 * 60 * 60 * 24,
  });
}
