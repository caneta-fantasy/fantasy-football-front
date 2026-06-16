import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { REFETCH_INTERVAL } from './queryConfig';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ─── Types ───────────────────────────────────────────────────────────────────

export type TradeStatus =
  | 'PENDING_ACCEPTANCE'
  | 'ACCEPTED'
  | 'VETOED'
  | 'CANCELLED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'FAILED';

export interface TradePlayer {
  id: number;
  name: string;
  photo: string;
  position: string;
  team?: { id: number; name: string; code: string };
}

export interface TradeTeam {
  id: number;
  name: string;
  user: { id: number; firstName: string; lastName: string };
}

export interface TradeLeg {
  id: string;
  senderTeam: TradeTeam;
  receiverTeam: TradeTeam;
  player: TradePlayer;
  dropPlayer: TradePlayer | null;
}

export interface TradeParticipant {
  id: string;
  userTeam: TradeTeam;
  accepted: boolean;
  respondedAt: string | null;
}

export interface Trade {
  id: string;
  status: TradeStatus;
  vetoDeadline: string | null;
  processAt: string | null;
  createdAt: string;
  proposedByUserTeam: TradeTeam;
  legs: TradeLeg[];
  participants: TradeParticipant[];
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function useTrades(seasonId: string | undefined) {
  return useQuery<Trade[]>({
    queryKey: ['trades', seasonId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.trades.bySeason(seasonId!), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!seasonId,
    refetchInterval: REFETCH_INTERVAL.STANDARD,
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export interface TradeLegInput {
  senderTeamId: number;
  receiverTeamId: number;
  playerId: number;
  dropPlayerId?: number;
}

export interface ProposeTradeInput {
  seasonId: string;
  proposedByUserTeamId: number;
  legs: TradeLegInput[];
}

export function useProposeTrade(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<Trade, Error, ProposeTradeInput>({
    mutationFn: async (input) => {
      const res = await axios.post(apiConfig.endpoints.trades.propose, input, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades', seasonId] });
    },
  });
}

export interface DropPlayerForLeg {
  playerId: number;
  dropPlayerId: number;
}

export interface AcceptTradeInput {
  userTeamId: number;
  dropPlayers?: DropPlayerForLeg[];
}

export function useAcceptTrade(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<Trade, Error, { tradeId: string } & AcceptTradeInput>({
    mutationFn: async ({ tradeId, ...body }) => {
      const res = await axios.post(apiConfig.endpoints.trades.accept(tradeId), body, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades', seasonId] });
    },
  });
}

export function useRejectTrade(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<Trade, Error, { tradeId: string; userTeamId: number }>({
    mutationFn: async ({ tradeId, userTeamId }) => {
      const res = await axios.post(apiConfig.endpoints.trades.reject(tradeId), { userTeamId }, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades', seasonId] });
    },
  });
}

export function useCancelTrade(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<Trade, Error, string>({
    mutationFn: async (tradeId) => {
      const res = await axios.post(apiConfig.endpoints.trades.cancel(tradeId), {}, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades', seasonId] });
    },
  });
}

export function useVetoTrade(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<Trade, Error, string>({
    mutationFn: async (tradeId) => {
      const res = await axios.post(apiConfig.endpoints.trades.veto(tradeId), {}, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades', seasonId] });
    },
  });
}

export function useProcessTrade(seasonId: string | undefined) {
  const qc = useQueryClient();
  return useMutation<Trade, Error, string>({
    mutationFn: async (tradeId) => {
      const res = await axios.post(apiConfig.endpoints.trades.process(tradeId), {}, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['trades', seasonId] });
    },
  });
}
