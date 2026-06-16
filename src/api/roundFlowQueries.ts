import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';
import { REFETCH_INTERVAL } from './queryConfig';

export type RoundFlowStatus =
  | 'PENDING'
  | 'LIVE'
  | 'SCORED'
  | 'WAIVER_OPEN'
  | 'DONE'
  | 'CANCELED';

export interface RoundFlow {
  id: number;
  leagueExternalId: number;
  seasonYear: number;
  roundNumber: number;
  status: RoundFlowStatus;
  liveScoringStartAt: string;
  roundEndAt: string;
  waiverWindowStartAt: string;
  waiverResolveAt: string;
  liveScoringStartedAt: string | null;
  scoredAt: string | null;
  waiverWindowOpenedAt: string | null;
  waiverResolvedAt: string | null;
  matchIds: number[];
  activatedByUserId: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivateRoundFlowInput {
  leagueExternalId: number;
  seasonYear: number;
  roundNumber: number;
}

export interface UpdateRoundFlowInput {
  liveScoringStartAt?: string;
  roundEndAt?: string;
  waiverWindowStartAt?: string;
  waiverResolveAt?: string;
}

export type RoundFlowEvent =
  | 'live-start'
  | 'round-end'
  | 'waiver-open'
  | 'waiver-resolve';

export function useRoundFlows(filter?: {
  leagueExternalId?: number;
  seasonYear?: number;
  status?: RoundFlowStatus;
}) {
  return useQuery<RoundFlow[]>({
    queryKey: ['roundFlows', filter],
    queryFn: async () => {
      const params: Record<string, string | number> = {};
      if (filter?.leagueExternalId) params.leagueExternalId = filter.leagueExternalId;
      if (filter?.seasonYear) params.seasonYear = filter.seasonYear;
      if (filter?.status) params.status = filter.status;
      const res = await axios.get(apiConfig.endpoints.roundFlow.list, {
        headers: authHeader(),
        params,
      });
      return res.data;
    },
    refetchInterval: REFETCH_INTERVAL.STANDARD,
  });
}

export function useRoundFlow(id: number | null | undefined) {
  return useQuery<RoundFlow>({
    queryKey: ['roundFlow', id],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.roundFlow.byId(id!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: id != null,
  });
}

export function useActivateRoundFlow() {
  const qc = useQueryClient();
  return useMutation<RoundFlow, Error, ActivateRoundFlowInput>({
    mutationFn: async (input) => {
      const res = await axios.post(apiConfig.endpoints.roundFlow.activate, input, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roundFlows'] }),
  });
}

export function useUpdateRoundFlow() {
  const qc = useQueryClient();
  return useMutation<RoundFlow, Error, { id: number; patch: UpdateRoundFlowInput }>({
    mutationFn: async ({ id, patch }) => {
      const res = await axios.patch(apiConfig.endpoints.roundFlow.update(id), patch, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['roundFlows'] });
      qc.invalidateQueries({ queryKey: ['roundFlow', id] });
    },
  });
}

export function useTriggerRoundFlowEvent() {
  const qc = useQueryClient();
  return useMutation<RoundFlow, Error, { id: number; event: RoundFlowEvent }>({
    mutationFn: async ({ id, event }) => {
      const url = {
        'live-start': apiConfig.endpoints.roundFlow.triggerLiveStart(id),
        'round-end': apiConfig.endpoints.roundFlow.triggerRoundEnd(id),
        'waiver-open': apiConfig.endpoints.roundFlow.triggerWaiverOpen(id),
        'waiver-resolve': apiConfig.endpoints.roundFlow.triggerWaiverResolve(id),
      }[event];
      const res = await axios.post(url, {}, { headers: authHeader() });
      return res.data;
    },
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['roundFlows'] });
      qc.invalidateQueries({ queryKey: ['roundFlow', id] });
    },
  });
}

export function useCancelRoundFlow() {
  const qc = useQueryClient();
  return useMutation<RoundFlow, Error, number>({
    mutationFn: async (id) => {
      const res = await axios.post(
        apiConfig.endpoints.roundFlow.cancel(id),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['roundFlows'] });
      qc.invalidateQueries({ queryKey: ['roundFlow', id] });
    },
  });
}
