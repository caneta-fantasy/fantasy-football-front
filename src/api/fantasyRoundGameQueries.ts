import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export interface RoundGameMatch {
  matchId: number;
  externalId: number | null;
  homeTeam: { id: number; name: string } | null;
  awayTeam: { id: number; name: string } | null;
  date: string | null;
  status: string;
  statusLong: string | null;
  homeGoals: number | null;
  awayGoals: number | null;
  venueName: string | null;
  venueCity: string | null;
}

export interface OrphanedMatch extends RoundGameMatch {
  roundNumber: number | null;
}

// ─── Queries ────────────────────────────────────────────────────────────────

export const useLockedTeams = (
  leagueExternalId: number | undefined,
  seasonYear: number | undefined,
  roundNumber: number | null | undefined,
) =>
  useQuery<{ lockedTeamIds: number[] }>({
    queryKey: ['lockedTeams', leagueExternalId, seasonYear, roundNumber],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyRoundGames.lockedTeams(leagueExternalId!, seasonYear!, roundNumber!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!leagueExternalId && !!seasonYear && roundNumber != null,
    refetchInterval: 2 * 60 * 1000,
    staleTime: 0,
  });

export const useListRoundMatches = (
  leagueExternalId: number | undefined,
  seasonYear: number | undefined,
  roundNumber: number | undefined,
) =>
  useQuery<RoundGameMatch[]>({
    queryKey: ['roundGameMatches', leagueExternalId, seasonYear, roundNumber],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyRoundGames.listMatches(leagueExternalId!, seasonYear!, roundNumber!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!leagueExternalId && !!seasonYear && roundNumber != null,
    staleTime: 0,
  });

// Fetches all rounds in parallel and returns a map of realRound → non-PST match count.
// Used by RoundCalendar to flag rounds with fewer than 10 confirmed games.
export const useAllRoundsMatchCounts = (
  leagueExternalId: number | undefined,
  seasonYear: number | undefined,
  realRounds: number[],
): Map<number, number> => {
  const results = useQueries({
    queries: realRounds.map((round) => ({
      queryKey: ['roundGameMatches', leagueExternalId, seasonYear, round],
      queryFn: async () => {
        const res = await axios.get(
          apiConfig.endpoints.fantasyRoundGames.listMatches(leagueExternalId!, seasonYear!, round),
          { headers: authHeader() },
        );
        return { round, matches: res.data as RoundGameMatch[] };
      },
      enabled: !!leagueExternalId && !!seasonYear,
      staleTime: 0,
    })),
  });

  const map = new Map<number, number>();
  for (const r of results) {
    if (r.data) {
      map.set(r.data.round, r.data.matches.filter((m) => m.status !== 'PST').length);
    }
  }
  return map;
};

export const useOrphanedMatches = (
  leagueExternalId: number | undefined,
  seasonYear: number | undefined,
) =>
  useQuery<OrphanedMatch[]>({
    queryKey: ['orphanedMatches', leagueExternalId, seasonYear],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyRoundGames.orphaned(leagueExternalId!, seasonYear!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!leagueExternalId && !!seasonYear,
    staleTime: 0,
  });

// ─── Mutations ───────────────────────────────────────────────────────────────

function invalidateRoundGames(
  qc: ReturnType<typeof useQueryClient>,
  leagueExternalId: number,
  seasonYear: number,
) {
  qc.invalidateQueries({ queryKey: ['roundGameMatches', leagueExternalId, seasonYear] });
  qc.invalidateQueries({ queryKey: ['orphanedMatches', leagueExternalId, seasonYear] });
}

export const useSyncAllRounds = () => {
  const qc = useQueryClient();
  return useMutation<
    { rounds: number; totalAdded: number },
    Error,
    { leagueExternalId: number; seasonYear: number }
  >({
    mutationFn: async ({ leagueExternalId, seasonYear }) => {
      const res = await axios.post(
        apiConfig.endpoints.fantasyRoundGames.syncAll(leagueExternalId, seasonYear),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, { leagueExternalId, seasonYear }) =>
      invalidateRoundGames(qc, leagueExternalId, seasonYear),
  });
};

export const useSyncRound = () => {
  const qc = useQueryClient();
  return useMutation<
    { added: number },
    Error,
    { leagueExternalId: number; seasonYear: number; roundNumber: number }
  >({
    mutationFn: async ({ leagueExternalId, seasonYear, roundNumber }) => {
      const res = await axios.post(
        apiConfig.endpoints.fantasyRoundGames.syncFromRealRound(leagueExternalId, seasonYear, roundNumber),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, { leagueExternalId, seasonYear }) =>
      invalidateRoundGames(qc, leagueExternalId, seasonYear),
  });
};

export const useAddMatch = () => {
  const qc = useQueryClient();
  return useMutation<
    { added: boolean },
    Error,
    { leagueExternalId: number; seasonYear: number; roundNumber: number; matchId: number }
  >({
    mutationFn: async ({ leagueExternalId, seasonYear, roundNumber, matchId }) => {
      const res = await axios.post(
        apiConfig.endpoints.fantasyRoundGames.addMatch(leagueExternalId, seasonYear, roundNumber, matchId),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, { leagueExternalId, seasonYear }) =>
      invalidateRoundGames(qc, leagueExternalId, seasonYear),
  });
};

export const useRemoveMatch = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { leagueExternalId: number; seasonYear: number; roundNumber: number; matchId: number }
  >({
    mutationFn: async ({ leagueExternalId, seasonYear, roundNumber, matchId }) => {
      await axios.delete(
        apiConfig.endpoints.fantasyRoundGames.removeMatch(leagueExternalId, seasonYear, roundNumber, matchId),
        { headers: authHeader() },
      );
    },
    onSuccess: (_data, { leagueExternalId, seasonYear }) =>
      invalidateRoundGames(qc, leagueExternalId, seasonYear),
  });
};

export const useMatchVenues = (leagueExternalId: number | undefined, seasonYear: number | undefined) =>
  useQuery<{ venues: string[]; cities: string[] }>({
    queryKey: ['matchVenues', leagueExternalId, seasonYear],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.matches.venues(leagueExternalId!, seasonYear!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!leagueExternalId && !!seasonYear,
    staleTime: 5 * 60 * 1000,
  });

export const usePatchMatch = () => {
  const qc = useQueryClient();
  return useMutation<
    void,
    Error,
    { matchId: number; date?: string | null; venueName?: string | null; venueCity?: string | null; leagueExternalId: number; seasonYear: number; roundNumber: number }
  >({
    mutationFn: async ({ matchId, date, venueName, venueCity }) => {
      await axios.patch(
        apiConfig.endpoints.matches.patch(matchId),
        { date, venueName, venueCity },
        { headers: authHeader() },
      );
    },
    onSuccess: (_data, { leagueExternalId, seasonYear, roundNumber }) => {
      qc.invalidateQueries({ queryKey: ['roundGameMatches', leagueExternalId, seasonYear, roundNumber] });
      qc.invalidateQueries({ queryKey: ['matchVenues', leagueExternalId, seasonYear] });
    },
  });
};

export const useRefreshRoundMatchInfo = () => {
  const qc = useQueryClient();
  return useMutation<
    { updated: number },
    Error,
    { leagueExternalId: number; seasonYear: number; roundNumber: number }
  >({
    mutationFn: async ({ leagueExternalId, seasonYear, roundNumber }) => {
      const res = await axios.post(
        apiConfig.endpoints.syncMatchInfo.refreshRound(leagueExternalId, seasonYear, roundNumber),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, { leagueExternalId, seasonYear, roundNumber }) => {
      qc.invalidateQueries({ queryKey: ['roundGameMatches', leagueExternalId, seasonYear, roundNumber] });
    },
  });
};
