import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Chip,
  Avatar,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  useTrades,
  useCancelTrade,
  useRejectTrade,
  useVetoTrade,
  useProcessTrade,
  Trade,
  TradeStatus,
} from '../api/tradeQueries';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import ProposeTradeModal from './ProposeTradeModal';
import AcceptTradeModal from './AcceptTradeModal';

interface Props {
  seasonId?: string;
  seasonYear: number;
  userTeam: { id: number; name: string } | null | undefined;
  fantasyLeague: FantasyLeague;
  currentUserId: number;
  currentRound?: number | null;
  tradeDeadlineRound?: number | null;
}

const STATUS_LABELS: Record<TradeStatus, string> = {
  PENDING_ACCEPTANCE: 'Aguardando',
  ACCEPTED: 'Aceita',
  VETOED: 'Vetada',
  CANCELLED: 'Cancelada',
  REJECTED: 'Recusada',
  COMPLETED: 'Concluída',
  FAILED: 'Falhou',
};

const STATUS_COLORS: Record<TradeStatus, 'default' | 'warning' | 'info' | 'error' | 'success'> = {
  PENDING_ACCEPTANCE: 'warning',
  ACCEPTED: 'info',
  VETOED: 'error',
  CANCELLED: 'default',
  REJECTED: 'error',
  COMPLETED: 'success',
  FAILED: 'error',
};

const TradeCard: React.FC<{
  trade: Trade;
  myUserTeamId: number;
  isOwner: boolean;
  seasonId: string;
  seasonYear: number;
  onAccept: (trade: Trade) => void;
}> = ({ trade, myUserTeamId, isOwner, seasonId, onAccept }) => {
  const cancelTrade = useCancelTrade(seasonId);
  const rejectTrade = useRejectTrade(seasonId);
  const vetoTrade = useVetoTrade(seasonId);
  const processTrade = useProcessTrade(seasonId);

  const [actionError, setActionError] = useState<string | null>(null);

  const myParticipant = trade.participants.find((p) => p.userTeam.id === myUserTeamId);
  const isProposer = trade.proposedByUserTeam.id === myUserTeamId;
  const iParticipant = !!myParticipant;
  const iAccepted = myParticipant?.accepted ?? false;

  const doAction = (fn: () => void) => {
    setActionError(null);
    try { fn(); } catch { /* handled by mutation */ }
  };

  const vetoDeadline = trade.vetoDeadline ? new Date(trade.vetoDeadline) : null;
  const processAt = trade.processAt ? new Date(trade.processAt) : null;
  const now = new Date();
  const inVetoWindow = vetoDeadline && now < vetoDeadline;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      {actionError && <Alert severity="error" sx={{ mb: 1 }}>{actionError}</Alert>}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="caption" color="text.secondary">
          Proposta por {trade.proposedByUserTeam.name} · {new Date(trade.createdAt).toLocaleDateString('pt-BR')}
        </Typography>
        <Chip
          label={STATUS_LABELS[trade.status]}
          color={STATUS_COLORS[trade.status]}
          size="small"
        />
      </Box>

      <Box mb={1}>
        {trade.legs.map((leg) => (
          <Box key={leg.id} display="flex" alignItems="center" gap={1} mb={0.5}>
            <Avatar src={leg.player.photo} sx={{ width: 24, height: 24 }} />
            <Typography variant="body2">
              <strong>{leg.player.name}</strong>
              <Typography component="span" variant="caption" color="text.secondary">
                {' '}({leg.player.position})
              </Typography>
              {' '}
              <Typography component="span" variant="caption">
                {leg.senderTeam.name} → {leg.receiverTeam.name}
              </Typography>
              {leg.dropPlayer && (
                <Typography component="span" variant="caption" color="warning.main">
                  {' · libera '}<strong>{leg.dropPlayer.name}</strong>
                </Typography>
              )}
            </Typography>
          </Box>
        ))}
      </Box>

      {trade.status === 'ACCEPTED' && (
        <Box mb={1}>
          <Typography variant="caption" color="text.secondary">
            {processAt ? `Processamento: ${processAt.toLocaleString('pt-BR')}` : ''}
            {vetoDeadline ? ` · Prazo de veto: ${vetoDeadline.toLocaleString('pt-BR')}` : ''}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 1 }} />

      <Box display="flex" gap={1} flexWrap="wrap">
        {trade.status === 'PENDING_ACCEPTANCE' && iParticipant && !isProposer && !iAccepted && (
          <>
            <Button
              size="small"
              variant="contained"
              color="success"
              onClick={() => onAccept(trade)}
            >
              Aceitar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              disabled={rejectTrade.isPending}
              onClick={() =>
                doAction(() =>
                  rejectTrade.mutate(
                    { tradeId: trade.id, userTeamId: myUserTeamId },
                    { onError: (e: any) => setActionError(e?.response?.data?.message ?? e.message) },
                  )
                )
              }
            >
              Recusar
            </Button>
          </>
        )}

        {trade.status === 'PENDING_ACCEPTANCE' && isProposer && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            disabled={cancelTrade.isPending}
            onClick={() =>
              doAction(() =>
                cancelTrade.mutate(trade.id, {
                  onError: (e: any) => setActionError(e?.response?.data?.message ?? e.message),
                })
              )
            }
          >
            Cancelar
          </Button>
        )}

        {trade.status === 'ACCEPTED' && isOwner && (
          <>
            {inVetoWindow && (
              <Button
                size="small"
                variant="outlined"
                color="error"
                disabled={vetoTrade.isPending}
                onClick={() =>
                  doAction(() =>
                    vetoTrade.mutate(trade.id, {
                      onError: (e: any) => setActionError(e?.response?.data?.message ?? e.message),
                    })
                  )
                }
              >
                Vetar
              </Button>
            )}
            <Button
              size="small"
              variant="outlined"
              disabled={processTrade.isPending}
              onClick={() =>
                doAction(() =>
                  processTrade.mutate(trade.id, {
                    onError: (e: any) => setActionError(e?.response?.data?.message ?? e.message),
                  })
                )
              }
            >
              Processar agora
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
};

const TradesTab: React.FC<Props> = ({
  seasonId,
  seasonYear,
  userTeam,
  fantasyLeague,
  currentUserId,
  currentRound,
  tradeDeadlineRound,
}) => {
  const { data: trades = [], isLoading } = useTrades(seasonId);
  const [proposeOpen, setProposeOpen] = useState(false);
  const [acceptTrade, setAcceptTrade] = useState<Trade | null>(null);

  const isOwner = fantasyLeague.owner?.id === currentUserId;
  const deadlinePassed =
    tradeDeadlineRound != null &&
    currentRound != null &&
    currentRound > tradeDeadlineRound;

  if (!seasonId) {
    return <Typography color="text.secondary">Temporada ainda não ativada.</Typography>;
  }

  if (!userTeam) {
    return <Typography color="text.secondary">Você não possui um time nesta liga.</Typography>;
  }

  const active = trades.filter((t) => t.status === 'PENDING_ACCEPTANCE' || t.status === 'ACCEPTED');
  const archived = trades.filter((t) => t.status === 'COMPLETED' || t.status === 'VETOED');


  return (
    <Box>
      {deadlinePassed && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          O prazo para trocas desta temporada encerrou na rodada {tradeDeadlineRound}. Novas trocas não são permitidas.
        </Alert>
      )}

      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Tooltip title={deadlinePassed ? 'O prazo para trocas encerrou' : ''}>
          <span>
            <Button
              variant="contained"
              onClick={() => setProposeOpen(true)}
              disabled={deadlinePassed}
            >
              Propor Troca
            </Button>
          </span>
        </Tooltip>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      )}

      {!isLoading && trades.length === 0 && (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nenhuma troca ainda.
        </Typography>
      )}

      {active.length > 0 && (
        <Box mb={3}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Trocas Ativas
          </Typography>
          {active.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              myUserTeamId={userTeam.id}
              isOwner={isOwner}
              seasonId={seasonId}
              seasonYear={seasonYear}
              onAccept={(t) => setAcceptTrade(t)}
            />
          ))}
        </Box>
      )}

      {archived.length > 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>
            Histórico de Trocas
          </Typography>
          {archived.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              myUserTeamId={userTeam.id}
              isOwner={isOwner}
              seasonId={seasonId}
              seasonYear={seasonYear}
              onAccept={(t) => setAcceptTrade(t)}
            />
          ))}
        </Box>
      )}

      <ProposeTradeModal
        open={proposeOpen}
        onClose={() => setProposeOpen(false)}
        fantasyLeague={fantasyLeague}
        myUserTeamId={userTeam.id}
        seasonId={seasonId}
        seasonYear={seasonYear}
      />

      {acceptTrade && (
        <AcceptTradeModal
          open={!!acceptTrade}
          onClose={() => setAcceptTrade(null)}
          trade={acceptTrade}
          myUserTeamId={userTeam.id}
          seasonId={seasonId}
          seasonYear={seasonYear}
        />
      )}
    </Box>
  );
};

export default TradesTab;
