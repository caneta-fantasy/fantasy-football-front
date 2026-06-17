import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useDraftSocket } from '../api/useDraftSocket';
import DraftPickTimer from './DraftPickTimer';
import DraftOrderDisplay from './DraftOrderDisplay';

import DraftPlayerSearch from './DraftPlayerSearch';
import DraftMyTeam from './DraftMyTeam';
import { DraftFullResponse, useFreezeDraft, useResetDraftTimer, useUnfreezeDraft } from '../api/draftQueries';
import { useAuth } from '../context/AuthContext';
import { Slot } from './userTeamRosterQueries';
import { apiConfig } from '../api/config';
import { mapPositionToSlot } from '../utils/positions';

interface Props {
  draftId: string;
  leagueId: number;
  realLeagueId: number | undefined;
  realLeagueExternalId: number | undefined;
  season: number;
  currentUserId: number;
  myUserTeamId: number | undefined;
  initialData: DraftFullResponse | null;
  draftDate: string | null;
}

function useCountdown(targetIso: string | null): string {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!targetIso) return;
    const tick = () => {
      const diff = new Date(targetIso).getTime() - Date.now();
      if (diff <= 0) { setLabel('Iniciando...'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setLabel([h > 0 ? `${h}h` : null, `${String(m).padStart(2, '0')}min`, `${String(s).padStart(2, '0')}s`].filter(Boolean).join(' '));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetIso]);
  return label;
}

export default function DraftRoom({
  draftId,
  leagueId,
  realLeagueId,
  realLeagueExternalId,
  season,
  currentUserId,
  myUserTeamId,
  initialData,
  draftDate,
}: Props) {
  const countdown = useCountdown(draftDate);
  const { draftState, isConnected, error, isComplete, connectedUserIds, submitPick } = useDraftSocket({
    draftId,
    token: localStorage.getItem('token'),
  });

  const [frozen, setFrozen] = useState(false);

  const preState = draftState ?? initialData;
  const currentPickForEffect = preState?.picks.find(
    (p) => p.overallPick === preState?.draft.currentPickPosition,
  );
  const pickingUserIdForEffect = currentPickForEffect?.userTeam?.user?.id;
  const isPickerOnlineForEffect = pickingUserIdForEffect != null && connectedUserIds.includes(pickingUserIdForEffect);
  const currentPickPositionForEffect = preState?.draft.currentPickPosition;

  const autoDraftDeadline = useMemo(() => {
    if (currentPickPositionForEffect && !isPickerOnlineForEffect) {
      return new Date(Date.now() + 5000).toISOString();
    }
    return null;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPickPositionForEffect, isPickerOnlineForEffect]);
  const { mutate: freeze, isPending: isFreezing } = useFreezeDraft();
  const { mutate: unfreeze, isPending: isUnfreezing } = useUnfreezeDraft();
  const { user } = useAuth();
  const { mutate: resetTimer, isPending: isResetting } = useResetDraftTimer();

  const { data: rosterSlots } = useQuery<Slot[]>({
    queryKey: ['virtual-roster', myUserTeamId, season],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.usersTeamsRoster.getRoster(myUserTeamId!, season),
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } },
      );
      return res.data;
    },
    enabled: !!myUserTeamId,
    retry: false,
  });

  const myPicks = useMemo(
    () => (preState?.picks ?? []).filter((p) => p.userTeam?.id === myUserTeamId && p.player != null && !p.isGhost),
    [preState?.picks, myUserTeamId],
  );

  const fullPositions = useMemo(() => {
    if (!rosterSlots) return new Set<string>();
    const full = new Set<string>();
    for (const posCode of ['DEF', 'MEI', 'ATA']) {
      const slotsForPos = rosterSlots.filter((s) => (s.allowedPositions as string[]).includes(posCode));
      const picksForPos = myPicks.filter((p) => mapPositionToSlot(p.player!.position) === posCode);
      if (picksForPos.length >= slotsForPos.length) full.add(posCode);
    }
    return full;
  }, [rosterSlots, myPicks]);

  const handleToggleFreeze = () => {
    if (frozen) {
      unfreeze(draftId, {
        onSuccess: () => {
          setFrozen(false);
          resetTimer(draftId);
        },
      });
    } else {
      freeze(draftId, { onSuccess: () => setFrozen(true) });
    }
  };

  // Use socket state once connected, fall back to REST data
  const state = draftState ?? initialData;

  if (!state) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const { draft, picks } = state;

  const currentPick = picks.find((p) => p.overallPick === draft.currentPickPosition);
  const isMyTurn =
    draft.status === 'LIVE' && currentPick?.userTeam?.id === myUserTeamId;

  const currentTeamName = currentPick?.userTeam?.name ?? '—';
  const pickingUserId = currentPick?.userTeam?.user?.id;
  const isPickerOnline = pickingUserId != null && connectedUserIds.includes(pickingUserId);

  return (
    <Box>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={2}>
        <Typography variant="h6" fontWeight={700}>
          Sala do Draft
        </Typography>
        <Chip
          label={
            draft.status === 'LIVE'
              ? 'Ao vivo'
              : draft.status === 'PENDING'
              ? 'Aguardando início'
              : 'Concluído'
          }
          color={
            draft.status === 'LIVE'
              ? 'success'
              : draft.status === 'PENDING'
              ? 'warning'
              : 'default'
          }
          size="small"
        />
        {!isConnected && (
          <Chip label="Reconectando..." color="error" size="small" />
        )}
        {/* Draft timer/pause controls — admins only */}
        {draft.status === 'LIVE' && user?.isAdmin && (
          <Box display="flex" gap={1} ml="auto">
            <Button
              size="small"
              variant="outlined"
              color="info"
              onClick={() => resetTimer(draftId)}
              disabled={isResetting}
              sx={{ textTransform: 'none' }}
            >
              Reiniciar Tempo
            </Button>
            <Button
              size="small"
              variant="outlined"
              color={frozen ? 'success' : 'warning'}
              onClick={handleToggleFreeze}
              disabled={isFreezing || isUnfreezing}
              sx={{ textTransform: 'none' }}
            >
              {frozen ? 'Retomar' : 'Pausar'}
            </Button>
          </Box>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isComplete && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Draft concluído! Acesse a aba Time para ver seu elenco.
        </Alert>
      )}

      <Box display="flex" gap={2} alignItems="flex-start" flexWrap="wrap">
        {/* Left — Draft order */}
        <Paper variant="outlined" sx={{ p: 2, flex: '0 0 280px', minWidth: 240 }}>
          <DraftOrderDisplay
            draft={draft}
            picks={picks}
            currentUserId={currentUserId}
            connectedUserIds={connectedUserIds}
          />
        </Paper>

        {/* Center — Timer + players */}
        <Paper variant="outlined" sx={{ p: 2, flex: '1 1 200px', minWidth: 200 }}>
          {draft.status === 'PENDING' && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" fontWeight={600}>
                O draft começa em breve...
              </Typography>
              {draftDate && (
                <Typography variant="body2" color="text.secondary" mt={1}>
                  {new Date(draftDate).toLocaleString('pt-BR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                    hour: '2-digit', minute: '2-digit',
                  })}
                </Typography>
              )}
              {countdown && (
                <Typography variant="h4" fontWeight={700} color="primary" mt={2}>
                  {countdown}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" mt={1}>
                Aguarde o início para fazer suas escolhas.
              </Typography>
            </Box>
          )}

          {draft.status === 'LIVE' && (
            <>
              {/* Compact timer row */}
              <Box display="flex" alignItems="center" gap={2} mb={1.5}>
                <Box flex={1}>
                  {isPickerOnline ? (
                    <DraftPickTimer
                      deadline={draft.currentPickDeadline}
                      totalSeconds={draft.pickTimer}
                      compact
                      frozen={frozen}
                    />
                  ) : (
                    <DraftPickTimer
                      deadline={autoDraftDeadline}
                      totalSeconds={5}
                      compact
                      frozen={frozen}
                    />
                  )}
                </Box>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {isMyTurn ? (
                    <strong style={{ color: '#1976d2' }}>Sua vez!</strong>
                  ) : !isPickerOnline ? (
                    <em>Auto-seleção...</em>
                  ) : (
                    <>Vez de <strong>{currentTeamName}</strong></>
                  )}
                </Typography>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              <DraftPlayerSearch
                leagueId={leagueId}
                realLeagueId={realLeagueId}
                realLeagueExternalId={realLeagueExternalId}
                season={season}
                picks={picks}
                onPick={(playerId) => {
                  if (myUserTeamId) submitPick(playerId, myUserTeamId);
                }}
                disabled={!isMyTurn}
                fullPositions={fullPositions}
              />
            </>
          )}

          {draft.status === 'COMPLETED' && (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" fontWeight={700}>
                Draft concluído!
              </Typography>
            </Box>
          )}
        </Paper>

        {/* Right — My team */}
        <Paper variant="outlined" sx={{ p: 2, flex: '0 0 280px', minWidth: 240 }}>
          <DraftMyTeam
            picks={picks}
            myUserTeamId={myUserTeamId}
            totalRounds={draft.totalRounds}
            seasonYear={season}
          />
        </Paper>
      </Box>
    </Box>
  );
}
