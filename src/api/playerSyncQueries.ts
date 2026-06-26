import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';

// Per-team squad sync was retired — the external API only returns a team's
// CURRENT squad, so it can't detect transfers out. Use the full-league sync.
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
