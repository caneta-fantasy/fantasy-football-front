import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';
import { REFETCH_INTERVAL } from './queryConfig';

export interface WaiverClaim {
  id: string;
  status: 'PENDING' | 'WON' | 'LOST' | 'CANCELLED' | 'FAILED';
  bidAmount: number;
  resolvedAt: string | null;
  createdAt: string;
  userTeam: { id: number; name: string; user: { id: number; username: string } };
  targetPlayer: { id: number; name: string; photo: string; position: string };
  dropPlayer: { id: number; name: string } | null;
}

export interface WaiverBudget {
  id: string;
  remainingBudget: number;
  userTeam: { id: number; name: string; user: { id: number; username: string } };
}

export function useWaiverClaims(seasonId: string | undefined) {
  return useQuery<WaiverClaim[]>({
    queryKey: ['waiverClaims', seasonId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.waiver.claimsBySeason(seasonId!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!seasonId,
    refetchInterval: REFETCH_INTERVAL.STANDARD,
  });
}

export function useWaiverBudgets(seasonId: string | undefined) {
  return useQuery<WaiverBudget[]>({
    queryKey: ['waiverBudgets', seasonId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.waiver.budgetsBySeason(seasonId!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!seasonId,
  });
}

export interface PlaceClaimInput {
  seasonId: string;
  userTeamId: number;
  targetPlayerId: number;
  dropPlayerId?: number;
  bidAmount: number;
}

export function usePlaceWaiverClaim() {
  const qc = useQueryClient();
  return useMutation<WaiverClaim, Error, PlaceClaimInput>({
    mutationFn: async (input) => {
      const res = await axios.post(apiConfig.endpoints.waiver.placeClaim, input, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['waiverClaims', vars.seasonId] });
      qc.invalidateQueries({ queryKey: ['waiverBudgets', vars.seasonId] });
    },
  });
}

export interface WaiverWindowStatus {
  window: { id: string; seasonYear: number; windowStart: string; windowEnd: string } | null;
  isOpen: boolean;
  pendingClaimCount: number;
}

export function useWaiverHistory(seasonId: string | undefined) {
  return useQuery<WaiverClaim[]>({
    queryKey: ['waiverHistory', seasonId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.waiver.historyBySeason(seasonId!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!seasonId,
  });
}

export function useWaiverWindowStatus(leagueExternalId: number | null | undefined, seasonYear: number | null | undefined) {
  return useQuery<WaiverWindowStatus>({
    queryKey: ['waiverWindowStatus', leagueExternalId, seasonYear],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.waiver.windowStatus(leagueExternalId!, seasonYear!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!leagueExternalId && !!seasonYear,
    refetchInterval: REFETCH_INTERVAL.STANDARD,
  });
}

export interface MarketTransaction {
  id: string;
  type: 'WAIVER_WIN' | 'FREE_AGENT_ADD' | 'DROP' | 'DRAFT_PICK' | 'TRADE';
  tradeId: string | null;
  transactedAt: string;
  userTeam: { id: number; name: string };
  playerIn: { id: number; name: string; photo: string; position: string } | null;
  playerOut: { id: number; name: string; photo: string; position: string } | null;
  bidAmount: string | null;
}

export function useMarketHistory(seasonId: string | undefined) {
  return useQuery<MarketTransaction[]>({
    queryKey: ['marketHistory', seasonId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.marketTransactions.bySeason(seasonId!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!seasonId,
  });
}

export function useCancelWaiverClaim(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: async (claimId) => {
      await axios.delete(apiConfig.endpoints.waiver.cancelClaim(claimId), {
        headers: authHeader(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waiverClaims', seasonId] });
    },
  });
}
