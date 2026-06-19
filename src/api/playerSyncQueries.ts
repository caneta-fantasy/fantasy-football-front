import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';

export const useSyncTeamSquad = () => {
  const qc = useQueryClient();
  return useMutation<
    { inserted: number; updated: number; cleared: number },
    Error,
    { teamExternalId: number; leagueExternalId: number; seasonYear: number }
  >({
    mutationFn: async ({ teamExternalId }) => {
      const res = await axios.post(
        apiConfig.endpoints.syncPlayers.syncTeam(teamExternalId),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, { leagueExternalId, seasonYear }) => {
      qc.invalidateQueries({ queryKey: ['playerFilters', leagueExternalId, seasonYear] });
      // invalidate the specific team's roster cache
      qc.invalidateQueries({ queryKey: ['squadRoster'] });
    },
  });
};

export const useSyncAllSquads = () => {
  const qc = useQueryClient();
  return useMutation<
    { teams: number; inserted: number; updated: number; cleared: number },
    Error,
    { leagueExternalId: number; seasonYear: number }
  >({
    mutationFn: async ({ leagueExternalId, seasonYear }) => {
      const res = await axios.post(
        apiConfig.endpoints.syncPlayers.syncAll(leagueExternalId, seasonYear),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, { leagueExternalId, seasonYear }) => {
      qc.invalidateQueries({ queryKey: ['playerFilters', leagueExternalId, seasonYear] });
      qc.invalidateQueries({ queryKey: ['squadRoster'] }); // broad invalidate — refreshes all open team rosters
    },
  });
};
