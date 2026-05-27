import React, { useEffect, useMemo, useState } from 'react';
import { OpponentInfo } from '../utils/matchUtils';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { usePlayerHistory, PlayerHistoryRow } from '../api/playerFantasyPointsQueries';
import { useRemovePlayer } from '../api/userTeamRosterMutations';

interface Props {
  playerId: number | null;
  playerName?: string;
  playerPhoto?: string;
  seasonId: string | undefined;
  onClose: () => void;
  slotId?: number;
  isOwner?: boolean;
  onMove?: () => void;
  roundFilter?: number;
  refetch?: () => void;
  isLocked?: boolean;
  numberOfRounds?: number;
  fantasyTeamName?: string;
  opponentInfo?: OpponentInfo | null;
}

function buildStatRows(row: PlayerHistoryRow) {
  const all = [
    { label: 'Gols',              raw: row.goals,            pts: row.goalPoints },
    { label: 'Assistências',      raw: row.assists,          pts: row.assistPoints },
    { label: 'Defesas (GK)',       raw: row.saves,            pts: row.savePoints },
    { label: 'Clean Sheet',        raw: row.cleanSheet ? 1 : 0, pts: row.cleanSheetPoints, isBoolean: true },
    { label: 'Gols Sofridos',     raw: row.goalsConceded ?? 0, pts: row.goalConcededPoints },
    { label: 'Desarmes',          raw: row.tacklesTotal ?? 0,      pts: row.tacklePoints },
    { label: 'Chutes no Gol',     raw: row.shotsSaved ?? null,     pts: row.shotsSavedPoints },
    { label: 'Chutes pra Fora',   raw: row.shotsOffTarget ?? null, pts: row.shotsOffTargetPoints },
    { label: 'Faltas Sofridas',   raw: row.foulsDrawn ?? null,     pts: row.foulsDrawnPoints },
    { label: 'Faltas Cometidas',  raw: row.foulsCommitted ?? null, pts: row.foulsCommittedPoints },
    { label: 'Cart. Amarelo',     raw: row.yellowCards,            pts: row.yellowCardPoints },
    { label: 'Cart. Vermelho',    raw: row.redCards,               pts: row.redCardPoints },
    { label: 'Gol Contra',        raw: null,                       pts: row.ownGoalPoints },
    { label: 'Pênalti',           raw: null,                       pts: row.penaltyPoints },
  ];
  return all.filter(
    (c) => (c.raw !== null && c.raw !== 0) || (c.pts !== null && c.pts !== 0),
  );
}

function BreakdownView({ row, matchLabel }: { row: PlayerHistoryRow; matchLabel: string }) {
  const statRows = buildStatRows(row);

  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" mb={2}>
        {matchLabel}
      </Typography>

      {statRows.length === 0 ? (
        <Typography variant="body2" color="text.disabled">Sem estatísticas pontuáveis nesta partida.</Typography>
      ) : (
        <Box>
          {/* Header */}
          <Box display="grid" gridTemplateColumns="1fr auto auto" gap={2} px={1} mb={0.5}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Estatística</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textAlign="right" sx={{ minWidth: 48 }}>Valor</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600} textAlign="right" sx={{ minWidth: 56 }}>Pts</Typography>
          </Box>
          <Divider />
          {statRows.map((s, i) => {
            const isNegative = s.pts !== null && s.pts < 0;
            const isPositive = s.pts !== null && s.pts > 0;
            return (
              <Box
                key={i}
                display="grid"
                gridTemplateColumns="1fr auto auto"
                gap={2}
                px={1}
                py={0.75}
                sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
              >
                <Typography variant="body2">{s.label}</Typography>
                <Typography variant="body2" textAlign="right" sx={{ minWidth: 48 }} color="text.secondary">
                  {s.raw === null
                    ? '—'
                    : s.isBoolean
                      ? (s.raw ? '✓' : '—')
                      : s.raw}
                </Typography>
                <Typography
                  variant="body2"
                  textAlign="right"
                  fontWeight={600}
                  sx={{ minWidth: 56 }}
                  color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary'}
                >
                  {s.pts === null ? '—' : s.pts === 0 ? '0.0' : `${s.pts > 0 ? '+' : ''}${s.pts.toFixed(1)}`}
                </Typography>
              </Box>
            );
          })}

          {/* Total */}
          <Divider />
          <Box display="grid" gridTemplateColumns="1fr auto auto" gap={2} px={1} py={1}>
            <Typography variant="body2" fontWeight={700}>Total</Typography>
            <Box sx={{ minWidth: 48 }} />
            <Typography
              variant="body2"
              fontWeight={700}
              textAlign="right"
              sx={{ minWidth: 56 }}
              color={row.totalPoints >= 0 ? 'success.main' : 'error.main'}
            >
              {row.totalPoints.toFixed(1)}
            </Typography>
          </Box>
        </Box>
      )}

      <Box mt={2} display="flex" justifyContent="flex-end" gap={1}>
        <Typography variant="caption" color="text.disabled">{row.minutesPlayed} min jogados</Typography>
      </Box>
    </Box>
  );
}

const PlayerStatsModal: React.FC<Props> = ({
  playerId,
  playerName,
  playerPhoto,
  seasonId,
  onClose,
  slotId,
  isOwner,
  onMove,
  roundFilter,
  refetch,
  isLocked,
  numberOfRounds,
  fantasyTeamName,
  opponentInfo,
}) => {
  const { data: history, isLoading } = usePlayerHistory(playerId, seasonId);
  const [selectedRow, setSelectedRow] = useState<PlayerHistoryRow | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const { mutate: removePlayer, isPending: isReleasing } = useRemovePlayer({
    onSuccess: () => {
      setConfirmOpen(false);
      refetch?.();
      onClose();
    },
    onError: (e: any) => {
      setDropError(e?.response?.data?.message ?? e?.message ?? 'Erro ao liberar jogador');
    },
  });

  // When roundFilter is provided, auto-select that round's row as soon as data loads
  const roundFilterRow = useMemo(
    () => (roundFilter != null && history ? history.find((r) => r.roundNumber === roundFilter) ?? null : null),
    [roundFilter, history],
  );

  // Reset selectedRow when the modal closes or player changes
  useEffect(() => {
    setSelectedRow(null);
  }, [playerId]);

  const totalPoints = history?.reduce((sum, r) => sum + r.totalPoints, 0) ?? 0;

  const allRounds: (PlayerHistoryRow | null)[] = useMemo(() => {
    if (!numberOfRounds) return history ?? [];
    const byRound = new Map((history ?? []).map((r) => [r.roundNumber, r]));
    return Array.from({ length: numberOfRounds }, (_, i) => byRound.get(i + 1) ?? null);
  }, [history, numberOfRounds]);

  const zeroRow: PlayerHistoryRow = useMemo(() => ({
    roundNumber: roundFilter ?? null,
    matchDate: null, homeTeamName: null, awayTeamName: null,
    minutesPlayed: 0, goals: 0, assists: 0, yellowCards: 0, redCards: 0,
    saves: 0, cleanSheet: false, goalsConceded: null, tacklesTotal: null,
    shotsOffTarget: null, shotsSaved: null, foulsDrawn: null, foulsCommitted: null,
    penaltyWon: null, penaltyCommitted: null, offsides: null,
    totalPoints: 0, goalPoints: 0, assistPoints: 0, shotPoints: 0,
    foulPoints: 0, cleanSheetPoints: 0, savePoints: 0, cardPoints: 0,
    ownGoalPoints: 0, penaltyPoints: 0, tacklePoints: 0, goalConcededPoints: 0,
    yellowCardPoints: 0, redCardPoints: 0, foulsDrawnPoints: 0, foulsCommittedPoints: 0,
    penaltyWonPoints: 0, penaltyCommittedPoints: 0, offsidesPoints: 0,
    shotsSavedPoints: 0, shotsOffTargetPoints: 0,
  }), [roundFilter]);

  const isMatchupMode = roundFilter != null;
  const drillRow = isMatchupMode ? (roundFilterRow ?? zeroRow) : selectedRow;
  const showBreakdown = drillRow != null;
  const canGoBack = showBreakdown && !isMatchupMode;

  const matchLabel = drillRow
    ? opponentInfo
      ? `Rodada ${drillRow.roundNumber} · x ${opponentInfo.code} (${opponentInfo.isHome ? 'C' : 'V'})`
      : `Rodada ${drillRow.roundNumber}`
    : '';

  return (
    <>
      <Dialog
        open={!!playerId}
        onClose={onClose}
        fullWidth
        maxWidth={isMatchupMode ? 'xs' : 'lg'}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1.5}>
            {canGoBack && (
              <Button
                size="small"
                startIcon={<ArrowBackIcon />}
                onClick={() => setSelectedRow(null)}
                sx={{ mr: 0.5, minWidth: 0 }}
              >
                Histórico
              </Button>
            )}
            <Avatar src={playerPhoto} sx={{ width: 40, height: 40 }} />
            <Box>
              <Box display="flex" alignItems="center" gap={1}>
                <Typography fontWeight={700} variant="h6" lineHeight={1.2}>
                  {playerName ?? '—'}
                </Typography>
                {fantasyTeamName && (
                  <Chip label={fantasyTeamName} size="small" variant="outlined" color="primary" />
                )}
              </Box>
              {!showBreakdown && history && history.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Total: {totalPoints.toFixed(1)} pts em {history.length} jogo(s)
                </Typography>
              )}
              {showBreakdown && (
                <Typography variant="caption" color="text.secondary">
                  {drillRow.totalPoints.toFixed(1)} pts nesta rodada
                </Typography>
              )}
            </Box>
          </Box>
        </DialogTitle>

        <DialogContent>
          {isLoading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={28} />
            </Box>
          ) : !history || (history.length === 0 && !numberOfRounds) ? (
            <Typography color="text.secondary" py={2}>
              Nenhuma estatística encontrada para esta temporada.
            </Typography>
          ) : showBreakdown ? (
            <BreakdownView row={drillRow!} matchLabel={matchLabel} />
          ) : (
            <Table size="small" sx={{ '& .MuiTableCell-root': { px: 1.5, py: 0.75, fontSize: 13 } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Rod.</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Partida</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: 'success.main' }}>Pts</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Gols</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Ass</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Defesas</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>CS</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>GC</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Tack</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Amar</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>Verm</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary' }}>Min</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allRounds.map((row, i) => row ? (
                  <TableRow
                    key={i}
                    hover
                    onClick={() => setSelectedRow(row)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{row.roundNumber ?? '?'}</TableCell>
                    <TableCell>{row.homeTeamName} x {row.awayTeamName}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: row.totalPoints >= 0 ? 'success.main' : 'error.main' }}>
                      {row.totalPoints.toFixed(1)}
                    </TableCell>
                    <TableCell align="right">{row.goals || '—'}</TableCell>
                    <TableCell align="right">{row.assists || '—'}</TableCell>
                    <TableCell align="right">{row.saves || '—'}</TableCell>
                    <TableCell align="center">
                      {row.cleanSheet ? (
                        <Chip label="✓" size="small" color="success" sx={{ height: 18, fontSize: 10 }} />
                      ) : '—'}
                    </TableCell>
                    <TableCell align="right">{row.goalsConceded ?? '—'}</TableCell>
                    <TableCell align="right">{row.tacklesTotal ?? '—'}</TableCell>
                    <TableCell align="right">{row.yellowCards || '—'}</TableCell>
                    <TableCell align="right">{row.redCards || '—'}</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>{row.minutesPlayed}</TableCell>
                  </TableRow>
                ) : (
                  <TableRow key={i} sx={{ opacity: 0.45 }}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>—</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: 'text.disabled' }}>0.0</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="center">—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right">—</TableCell>
                    <TableCell align="right" sx={{ color: 'text.secondary' }}>—</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        {isOwner && slotId && (
          <>
            <Divider />
            <DialogActions sx={{ px: 3, py: 1.5, gap: 1 }}>
              {onMove && (
                <Tooltip title={isLocked ? 'Jogador bloqueado — partida em andamento nesta rodada' : ''}>
                  <span>
                    <Button
                      variant="outlined"
                      disabled={!!isLocked}
                      onClick={() => {
                        onClose();
                        onMove();
                      }}
                    >
                      Mover
                    </Button>
                  </span>
                </Tooltip>
              )}
              <Tooltip title={isLocked ? 'Jogador bloqueado — partida em andamento nesta rodada' : ''}>
                <span>
                  <Button
                    variant="outlined"
                    color="error"
                    disabled={isReleasing || !!isLocked}
                    onClick={() => setConfirmOpen(true)}
                  >
                    Liberar jogador
                  </Button>
                </span>
              </Tooltip>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setDropError(null); }}>
        <DialogTitle>Confirmar remoção</DialogTitle>
        <DialogContent>
          {dropError && <Alert severity="error" sx={{ mb: 2 }}>{dropError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmOpen(false); setDropError(null); }}>Cancelar</Button>
          <Button
            onClick={() => { if (slotId) removePlayer(slotId); }}
            color="error"
            variant="contained"
            disabled={isReleasing || !!dropError}
          >
            Liberar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!dropError && !confirmOpen}
        autoHideDuration={5000}
        onClose={() => setDropError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setDropError(null)} variant="filled">
          {dropError}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PlayerStatsModal;
