import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';

export type RoundCalendarRowStatus =
  | 'FINISHED'
  | 'CURRENT'
  | 'SKIPPED'
  | 'UPCOMING';

export interface RoundCalendarRow {
  fantasyRound: number | null;
  realRound: number;
  status: RoundCalendarRowStatus;
  isPlayoffRound: boolean;
  firstKickoffAt: string | null;
  canSkip: boolean;
  canUnskip: boolean;
}

export interface RoundCalendar {
  seasonId: string;
  startRound: number;
  numberOfRounds: number;
  playoffStartRound: number | null;
  currentFantasyRound: number | null;
  realCurrentRound: number | null;
  maxRealRound: number;
  lastMappedRealRound: number | null;
  remainingMargin: number;
  rows: RoundCalendarRow[];
}

export const useRoundCalendar = (seasonId: string | undefined) =>
  useQuery<RoundCalendar>({
    queryKey: ['roundCalendar', seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.roundMappings.calendar(seasonId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });

const useRoundMappingMutation = (
  url: (seasonId: string, realRound: number) => string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      seasonId,
      realRound,
    }: {
      seasonId: string;
      realRound: number;
    }) => {
      const res = await axios.post(url(seasonId, realRound), null, {
        headers: authHeader(),
      });
      return res.data as RoundCalendar;
    },
    onSuccess: (_data, { seasonId }) => {
      queryClient.invalidateQueries({ queryKey: ['roundCalendar', seasonId] });
      queryClient.invalidateQueries({ queryKey: ['fantasyLeagueSeasons'] });
      queryClient.invalidateQueries({ queryKey: ['fantasyMatchups', seasonId] });
      queryClient.invalidateQueries({ queryKey: ['playoffs', seasonId] });
    },
  });
};

export const useSkipRound = () =>
  useRoundMappingMutation(apiConfig.endpoints.roundMappings.skip);

export const useUnskipRound = () =>
  useRoundMappingMutation(apiConfig.endpoints.roundMappings.unskip);
