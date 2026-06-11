import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  RoundCalendarRow,
  useRoundCalendar,
  useSkipRound,
  useUnskipRound,
} from '../api/roundMappingQueries';
import { useAllRoundsMatchCounts, useListRoundMatches } from '../api/fantasyRoundGameQueries';
import { FantasyLeagueSeason } from '../api/useFantasyLeagueSeasons';

const getErrorMessage = (err: unknown): string => {
  if (typeof err === 'string') return err;
  const e: any = err;
  const d = e?.response?.data;
  if (d) {
    if (Array.isArray(d.message)) return d.message.join(', ');
    return d.message || d.error || 'Erro desconhecido';
  }
  return e?.message ?? 'Erro desconhecido';
};

const STATUS_CHIP: Record<
  RoundCalendarRow['status'],
  { label: string; color: 'default' | 'success' | 'warning' | 'info' }
> = {
  FINISHED: { label: 'Encerrada', color: 'default' },
  CURRENT: { label: 'Atual', color: 'success' },
  SKIPPED: { label: 'Pulada', color: 'warning' },
  UPCOMING: { label: 'Futura', color: 'info' },
};

interface RoundMatchesListProps {
  leagueExternalId: number | undefined;
  seasonYear: number;
  realRound: number;
}

// Separate child so the matches query only fires when the row is expanded
const RoundMatchesList: React.FC<RoundMatchesListProps> = ({
  leagueExternalId,
  seasonYear,
  realRound,
}) => {
  const { data: matches, isLoading } = useListRoundMatches(
    leagueExternalId,
    seasonYear,
    realRound,
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={2}>
        <CircularProgress size={20} />
      </Box>
    );
  }
  if (!matches || matches.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 1.5, px: 2 }}>
        Nenhum jogo cadastrado para esta rodada do campeonato.
      </Typography>
    );
  }

  return (
    <Box sx={{ py: 1, px: 2 }}>
      {matches.map((m) => (
        <Box
          key={m.matchId}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          py={0.5}
        >
          <Typography variant="body2">
            {m.homeTeam?.name ?? '?'}{' '}
            {m.homeGoals != null && m.awayGoals != null
              ? `${m.homeGoals} x ${m.awayGoals}`
              : 'x'}{' '}
            {m.awayTeam?.name ?? '?'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {m.status === 'PST'
              ? 'Adiado'
              : m.date
                ? new Date(m.date).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })
                : 'Sem data'}
            {m.venueName ? ` • ${m.venueName}` : ''}
          </Typography>
        </Box>
      ))}
    </Box>
  );
};

interface Props {
  fantasyLeagueSeason: FantasyLeagueSeason;
  isOwner: boolean;
}

const RoundCalendar: React.FC<Props> = ({ fantasyLeagueSeason, isOwner }) => {
  const { data: calendar, isLoading } = useRoundCalendar(fantasyLeagueSeason.id);
  const skipMutation = useSkipRound();
  const unskipMutation = useUnskipRound();

  const [expandedRound, setExpandedRound] = useState<number | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'skip' | 'unskip';
    realRound: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leagueExternalId = fantasyLeagueSeason.fantasyLeague?.league?.externalId;
  const seasonYear = fantasyLeagueSeason.seasonYear;
  const isMutating = skipMutation.isPending || unskipMutation.isPending;

  const allRealRounds = (calendar?.rows ?? []).map((r) => r.realRound);
  const matchCounts = useAllRoundsMatchCounts(leagueExternalId, seasonYear, allRealRounds);

  const handleConfirm = () => {
    if (!confirmAction) return;
    const mutation = confirmAction.type === 'skip' ? skipMutation : unskipMutation;
    mutation.mutate(
      { seasonId: fantasyLeagueSeason.id, realRound: confirmAction.realRound },
      {
        onError: (err) => setError(getErrorMessage(err)),
        onSettled: () => setConfirmAction(null),
      },
    );
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 2, mt: 2 }}>
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      </Paper>
    );
  }
  if (!calendar) return null;

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Calendário de Rodadas
      </Typography>
      {isOwner && calendar.rows.length > 0 && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {calendar.remainingMargin > 0
            ? `Margem restante: ${calendar.remainingMargin} rodada(s) pulável(is)`
            : 'Margem esgotada: a temporada termina na última rodada do campeonato, não é possível pular rodadas.'}
        </Typography>
      )}

      {calendar.rows.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          O calendário fica disponível após a geração da tabela (pós-draft).
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Liga</TableCell>
              <TableCell>Brasileirao</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Início</TableCell>
              {isOwner && <TableCell align="right">Ações</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {calendar.rows.map((row) => (
              <React.Fragment key={row.realRound}>
                <TableRow hover>
                  <TableCell padding="checkbox">
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedRound(
                          expandedRound === row.realRound ? null : row.realRound,
                        )
                      }
                    >
                      {expandedRound === row.realRound ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    {row.fantasyRound != null ? `Rodada ${row.fantasyRound}` : '—'}
                    {row.isPlayoffRound && (
                      <Chip
                        label="Playoffs"
                        size="small"
                        color="secondary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    Rodada {row.realRound}
                    {matchCounts.has(row.realRound) && (matchCounts.get(row.realRound) ?? 10) < 10 && (
                      <Chip
                        label={`${matchCounts.get(row.realRound)} jogos`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ ml: 1, fontSize: 11, height: 18 }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={STATUS_CHIP[row.status].label}
                      color={STATUS_CHIP[row.status].color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {row.firstKickoffAt
                      ? new Date(row.firstKickoffAt).toLocaleString('pt-BR', {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })
                      : '—'}
                  </TableCell>
                  {isOwner && (
                    <TableCell align="right">
                      {row.canSkip && (
                        <Button
                          size="small"
                          color="warning"
                          disabled={isMutating}
                          onClick={() =>
                            setConfirmAction({ type: 'skip', realRound: row.realRound })
                          }
                        >
                          Pular
                        </Button>
                      )}
                      {row.canUnskip && (
                        <Button
                          size="small"
                          disabled={isMutating}
                          onClick={() =>
                            setConfirmAction({ type: 'unskip', realRound: row.realRound })
                          }
                        >
                          Reverter
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
                <TableRow>
                  <TableCell colSpan={isOwner ? 6 : 5} sx={{ p: 0, border: 0 }}>
                    <Collapse in={expandedRound === row.realRound} unmountOnExit>
                      <RoundMatchesList
                        leagueExternalId={leagueExternalId}
                        seasonYear={seasonYear}
                        realRound={row.realRound}
                      />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)}>
        <DialogTitle>
          {confirmAction?.type === 'skip' ? 'Pular rodada' : 'Reverter rodada pulada'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction?.type === 'skip'
              ? `Pular a rodada ${confirmAction?.realRound} do campeonato? Todas as rodadas seguintes da liga serão adiadas em 1 rodada do campeonato.`
              : `Voltar a jogar a rodada ${confirmAction?.realRound} do campeonato? Todas as rodadas seguintes da liga serão antecipadas em 1 rodada do campeonato.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)} disabled={isMutating}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color={confirmAction?.type === 'skip' ? 'warning' : 'primary'}
            disabled={isMutating}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
      >
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default RoundCalendar;
