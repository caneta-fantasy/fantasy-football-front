import { useMutation, useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';
import { REFETCH_INTERVAL } from './queryConfig';

export type DraftStatus = 'PENDING' | 'LIVE' | 'COMPLETED' | 'CANCELLED';

export interface DraftResponse {
  id: string;
  season: number;
  status: DraftStatus;
  draftType: string;
  totalRounds: number;
  pickTimer: number;
  numberOfSlots: number;
  currentRound: number;
  currentPickPosition: number;
  currentPickDeadline: string | null;
}

export interface DraftPick {
  id: string;
  round: number;
  pickPosition: number;
  overallPick: number;
  userTeam: { id: number; name: string; user: { id: number; firstName: string; lastName: string } } | null;
  player: { id: number; name: string; position: string; photo: string } | null;
  isGhost: boolean;
  isAutoDrafted: boolean;
  pickedAt: string | null;
}

export interface DraftFullResponse {
  draft: DraftResponse;
  picks: DraftPick[];
}

export const useDraftPresence = (draftId: string | undefined) => {
  return useQuery<{ connectedUserIds: number[] }>({
    queryKey: ['draftPresence', draftId],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.drafts.presence(draftId!), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.data;
    },
    enabled: !!draftId,
    refetchInterval: REFETCH_INTERVAL.LIVE,
  });
};

export const useResetDraftTimer = () =>
  useMutation({
    mutationFn: (draftId: string) =>
      axios.post(apiConfig.endpoints.drafts.resetTimer(draftId), {}, { headers: authHeader() }),
  });

export const useFreezeDraft = () =>
  useMutation({
    mutationFn: (draftId: string) =>
      axios.post(apiConfig.endpoints.drafts.freeze(draftId), {}, { headers: authHeader() }),
  });

export const useUnfreezeDraft = () =>
  useMutation({
    mutationFn: (draftId: string) =>
      axios.post(apiConfig.endpoints.drafts.unfreeze(draftId), {}, { headers: authHeader() }),
  });

export const useDraft = (leagueId: number, season: number | undefined) => {
  return useQuery<DraftFullResponse | null>({
    queryKey: ['draft', leagueId, season],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.drafts.get(leagueId, season!), {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      return res.data ?? null;
    },
    enabled: !!leagueId && !!season,
    refetchInterval: REFETCH_INTERVAL.STANDARD,
  });
};
