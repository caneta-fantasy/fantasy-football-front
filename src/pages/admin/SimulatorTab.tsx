import React, { useEffect, useState } from 'react';
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
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplayIcon from '@mui/icons-material/Replay';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import FastForwardIcon from '@mui/icons-material/FastForward';
import LockIcon from '@mui/icons-material/Lock';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import {
  AdvanceSimulationResponse,
  SimulationDefenseType,
  SimulationFillMode,
  SimulationPlayoffFormat,
  SimulationState,
  useAdvanceSimulation,
  useCreateSimulationLeague,
  useDeleteSimulationLeague,
  useRecreateSimulationLeague,
  useSetSimulationLockedTeams,
  useSimulationLeague,
  useSimulationLockedTeams,
  useStartSimulationSeason,
} from '../../api/simulatorQueries';

const STATUS_LABELS: Record<string, string> = {
  INACTIVE: 'Inativa',
  ACTIVATED_PRESEASON: 'Pré-temporada',
  DRAFT_SCHEDULED: 'Draft agendado',
  DRAFT_LIVE: 'Draft ao vivo',
  DRAFT_DONE: 'Draft concluído',
  SCHEDULED: 'Tabela gerada',
  ACTIVE: 'Em andamento',
  SEASON_ENDED: 'Temporada encerrada',
  ARCHIVED: 'Arquivada',
};

const STATUS_COLORS: Record<string, 'default' | 'success' | 'info' | 'warning' | 'secondary'> = {
  ACTIVATED_PRESEASON: 'info',
  DRAFT_SCHEDULED: 'warning',
  DRAFT_LIVE: 'warning',
  DRAFT_DONE: 'info',
  SCHEDULED: 'info',
  ACTIVE: 'success',
  SEASON_ENDED: 'secondary',
};

const SimulatorTab: React.FC = () => {
  const { data: simulation, isLoading } = useSimulationLeague();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return simulation ? <SimulationPanel state={simulation} /> : <CreateSimulationForm />;
};

// ─── Create form (no simulation exists) ──────────────────────────────────────

const CreateSimulationForm: React.FC = () => {
  const create = useCreateSimulationLeague();
  const [name, setName] = useState('Liga de Simulação');
  const [numberOfTeams, setNumberOfTeams] = useState(8);
  const [numberOfRounds, setNumberOfRounds] = useState(19);
  const [fillMode, setFillMode] = useState<SimulationFillMode>('AUTO_FILL');
  const [defenseType, setDefenseType] = useState<SimulationDefenseType>('CLOSED');
  const [playoffTeams, setPlayoffTeams] = useState(4);
  const [playoffFormat, setPlayoffFormat] = useState<SimulationPlayoffFormat>('single_game');

  return (
    <Paper sx={{ p: 3, maxWidth: 560 }}>
      <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
        Criar Liga de Simulação
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Cria uma liga sandbox que reproduz o campeonato a partir da rodada 1 usando as
        estatísticas reais já sincronizadas. Apenas uma simulação pode existir por vez.
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Nome da liga"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Número de times"
          value={numberOfTeams}
          onChange={(e) => setNumberOfTeams(Number(e.target.value))}
        >
          {[8, 10, 12].map((n) => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Número de rodadas"
          value={numberOfRounds}
          onChange={(e) => setNumberOfRounds(Number(e.target.value))}
        >
          {[12, 13, 14, 15, 16, 17, 18, 19].map((n) => (
            <MenuItem key={n} value={n}>{n}</MenuItem>
          ))}
        </TextField>
        <Stack direction="row" spacing={2}>
          <TextField
            select
            fullWidth
            label="Times nos playoffs"
            value={playoffTeams}
            onChange={(e) => setPlayoffTeams(Number(e.target.value))}
          >
            {[4, 6, 7, 8].map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            fullWidth
            label="Formato dos playoffs"
            value={playoffFormat}
            onChange={(e) => setPlayoffFormat(e.target.value as SimulationPlayoffFormat)}
          >
            <MenuItem value="single_game">Jogo único</MenuItem>
            <MenuItem value="two_leg_single_game_final">Ida e volta (final única)</MenuItem>
            <MenuItem value="two_leg_all">Ida e volta (inclusive final)</MenuItem>
          </TextField>
        </Stack>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Montagem dos elencos
          </Typography>
          <RadioGroup
            value={fillMode}
            onChange={(e) => setFillMode(e.target.value as SimulationFillMode)}
          >
            <FormControlLabel
              value="AUTO_FILL"
              control={<Radio />}
              label="Preenchimento automático (snake equilibrado por pontuação real)"
            />
            <FormControlLabel
              value="MANUAL_DRAFT"
              control={<Radio />}
              label="Draft manual (usar a sala de draft normalmente)"
            />
          </RadioGroup>
        </Box>

        <Box>
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Tipo de defesa
          </Typography>
          <RadioGroup
            value={defenseType}
            onChange={(e) => setDefenseType(e.target.value as SimulationDefenseType)}
          >
            <FormControlLabel
              value="CLOSED"
              control={<Radio />}
              label="Fechada (unidade de defesa, ex: Defesa do Flamengo)"
            />
            <FormControlLabel
              value="OPEN"
              control={<Radio />}
              label="Aberta (goleiro + defensores individuais)"
            />
          </RadioGroup>
        </Box>

        {create.isError && (
          <Alert severity="error">
            {(create.error as any)?.response?.data?.message ?? create.error.message}
          </Alert>
        )}

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          disabled={create.isPending || !name.trim()}
          onClick={() =>
            create.mutate({
              name: name.trim(),
              numberOfTeams,
              numberOfRounds,
              fillMode,
              defenseType,
              playoffTeams,
              playoffFormat,
            })
          }
        >
          {create.isPending ? 'Criando…' : 'Criar Simulação'}
        </Button>
      </Stack>
    </Paper>
  );
};

// ─── Management panel (simulation exists) ────────────────────────────────────

const SimulationPanel: React.FC<{ state: SimulationState }> = ({ state }) => {
  const navigate = useNavigate();
  const start = useStartSimulationSeason();
  const advance = useAdvanceSimulation();
  const deleteSim = useDeleteSimulationLeague();
  const recreate = useRecreateSimulationLeague();

  const [advanceCount, setAdvanceCount] = useState(1);
  const [advanceResult, setAdvanceResult] = useState<AdvanceSimulationResponse | null>(null);
  const [locksOpen, setLocksOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmRecreate, setConfirmRecreate] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const canStart = state.status === 'SCHEDULED' || state.status === 'DRAFT_DONE';
  const canAdvance = state.status === 'ACTIVE';
  const isEnded = state.status === 'SEASON_ENDED';
  const inPlayoffs =
    state.playoffStartRound != null &&
    state.currentFantasyRound != null &&
    state.currentFantasyRound >= state.playoffStartRound;

  const errMsg = (err: any) => err?.response?.data?.message ?? err?.message ?? 'Erro';

  const runAdvance = (opts: { rounds?: number; toPlayoffs?: boolean }) => {
    setActionError(null);
    advance.mutate(
      { seasonId: state.seasonId, ...opts },
      {
        onSuccess: (data) => setAdvanceResult(data),
        onError: (err) => setActionError(errMsg(err)),
      },
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" fontWeight="bold">{state.leagueName}</Typography>
              <Chip label="Simulação" color="warning" size="small" />
              <Chip
                label={STATUS_LABELS[state.status] ?? state.status}
                color={STATUS_COLORS[state.status] ?? 'default'}
                size="small"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {state.numberOfTeams} times • {state.numberOfRounds} rodadas • playoffs a partir da
              rodada {state.playoffStartRound ?? '—'} •{' '}
              {state.fillMode === 'AUTO_FILL' ? 'preenchimento automático' : 'draft manual'}
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {state.currentFantasyRound != null ? (
                <>
                  Rodada atual: <b>{state.currentFantasyRound}</b> (rodada real{' '}
                  <b>{state.currentRealRound ?? '—'}</b>)
                </>
              ) : (
                'Temporada ainda não iniciada'
              )}
              {' • '}dados históricos até a rodada real <b>{state.maxAvailableRealRound}</b>
            </Typography>
            {isEnded && state.championTeamName && (
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                <EmojiEventsIcon color="warning" />
                <Typography variant="body1" fontWeight="bold">
                  Campeão: {state.championTeamName}
                </Typography>
              </Stack>
            )}
          </Box>

          <Stack spacing={1} alignItems="flex-end">
            <Button
              startIcon={<OpenInNewIcon />}
              onClick={() => navigate(`/fantasy-league/${state.leagueId}`)}
            >
              Abrir liga
            </Button>
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="warning"
                startIcon={<ReplayIcon />}
                onClick={() => setConfirmRecreate(true)}
              >
                Recriar
              </Button>
              <Button
                size="small"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setConfirmDelete(true)}
              >
                Excluir
              </Button>
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          {canStart && (
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              disabled={start.isPending}
              onClick={() => {
                setActionError(null);
                start.mutate(state.seasonId, {
                  onError: (err) => setActionError(errMsg(err)),
                });
              }}
            >
              {start.isPending ? 'Iniciando…' : 'Iniciar temporada'}
            </Button>
          )}

          {canAdvance && (
            <>
              <Button
                variant="contained"
                startIcon={<PlayArrowIcon />}
                disabled={advance.isPending}
                onClick={() => runAdvance({ rounds: 1 })}
              >
                Avançar 1 rodada
              </Button>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  size="small"
                  type="number"
                  label="N"
                  value={advanceCount}
                  onChange={(e) => setAdvanceCount(Math.max(1, Number(e.target.value)))}
                  sx={{ width: 80 }}
                />
                <Button
                  variant="outlined"
                  disabled={advance.isPending}
                  onClick={() => runAdvance({ rounds: advanceCount })}
                >
                  Avançar N
                </Button>
              </Stack>
              {!inPlayoffs && (
                <Button
                  variant="outlined"
                  startIcon={<FastForwardIcon />}
                  disabled={advance.isPending}
                  onClick={() => runAdvance({ toPlayoffs: true })}
                >
                  Avançar até playoffs
                </Button>
              )}
            </>
          )}

          {(canAdvance || isEnded) && (
            <Button startIcon={<LockIcon />} onClick={() => setLocksOpen(true)}>
              Bloqueios de times
            </Button>
          )}

          {advance.isPending && <CircularProgress size={22} />}
        </Stack>

        {state.status === 'ACTIVATED_PRESEASON' && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Liga em pré-temporada (draft manual): configure o elenco/draft e conduza a sala de
            draft pela página da liga. Após o draft a tabela é gerada automaticamente.
          </Alert>
        )}

        {actionError && (
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}
      </Paper>

      <AdvanceResultDialog result={advanceResult} onClose={() => setAdvanceResult(null)} />
      <LockedTeamsDialog
        open={locksOpen}
        seasonId={state.seasonId}
        onClose={() => setLocksOpen(false)}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Excluir simulação?</DialogTitle>
        <DialogContent>
          <Typography>
            Todos os dados da liga "{state.leagueName}" (times, elencos, confrontos, pontuações)
            serão apagados. Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Cancelar</Button>
          <Button
            color="error"
            variant="contained"
            disabled={deleteSim.isPending}
            onClick={() =>
              deleteSim.mutate(state.leagueId, {
                onSuccess: () => setConfirmDelete(false),
                onError: (err) => setActionError(errMsg(err)),
              })
            }
          >
            {deleteSim.isPending ? 'Excluindo…' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={confirmRecreate} onClose={() => setConfirmRecreate(false)}>
        <DialogTitle>Recriar simulação?</DialogTitle>
        <DialogContent>
          <Typography>
            A liga atual será excluída e uma nova será criada com as mesmas configurações
            (reset completo para a rodada 1).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRecreate(false)}>Cancelar</Button>
          <Button
            color="warning"
            variant="contained"
            disabled={recreate.isPending}
            onClick={() =>
              recreate.mutate(state.leagueId, {
                onSuccess: () => setConfirmRecreate(false),
                onError: (err) => setActionError(errMsg(err)),
              })
            }
          >
            {recreate.isPending ? 'Recriando…' : 'Recriar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ─── Advance result dialog ───────────────────────────────────────────────────

const PLAYOFF_EVENT_LABELS: Record<string, string> = {
  BRACKET_GENERATED: '🏆 Mata-mata gerado!',
  ADVANCED: '➡️ Mata-mata avançou de fase',
  CHAMPION: '👑 Campeão definido!',
};

const AdvanceResultDialog: React.FC<{
  result: AdvanceSimulationResponse | null;
  onClose: () => void;
}> = ({ result, onClose }) => (
  <Dialog open={!!result} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Resultado do avanço</DialogTitle>
    <DialogContent dividers>
      {result?.error && <Alert severity="warning" sx={{ mb: 2 }}>{result.error}</Alert>}
      {result?.results.map((round) => (
        <Box key={round.fantasyRound} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Rodada {round.fantasyRound} (real {round.realRound})
          </Typography>
          {round.playoffEvent && (
            <Alert severity={round.playoffEvent === 'CHAMPION' ? 'success' : 'info'} sx={{ my: 1 }}>
              {PLAYOFF_EVENT_LABELS[round.playoffEvent]}
            </Alert>
          )}
          <List dense disablePadding>
            {round.matchups
              .filter((m) => !m.isGhost && m.homeTeamId && m.awayTeamId)
              .map((m) => (
                <ListItem key={m.id} disableGutters>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <b style={{ fontWeight: m.winnerId === m.homeTeamId ? 700 : 400 }}>
                          {m.homeTeamName}
                        </b>{' '}
                        {Number(m.homeScore ?? 0).toFixed(2)} ×{' '}
                        {Number(m.awayScore ?? 0).toFixed(2)}{' '}
                        <b style={{ fontWeight: m.winnerId === m.awayTeamId ? 700 : 400 }}>
                          {m.awayTeamName}
                        </b>
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      ))}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Fechar</Button>
    </DialogActions>
  </Dialog>
);

// ─── Locked teams dialog ─────────────────────────────────────────────────────

const LockedTeamsDialog: React.FC<{
  open: boolean;
  seasonId: string;
  onClose: () => void;
}> = ({ open, seasonId, onClose }) => {
  const { data, isLoading } = useSimulationLockedTeams(open ? seasonId : null);
  const setLocked = useSetSimulationLockedTeams();
  const [lockedIds, setLockedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (data) {
      setLockedIds(new Set(data.teams.filter((t) => t.locked).map((t) => t.id)));
    }
  }, [data]);

  const toggle = (teamId: number) => {
    setLockedIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) next.delete(teamId);
      else next.add(teamId);
      return next;
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Bloqueios de times</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Jogadores de times bloqueados não podem ser escalados, trocados ou contratados —
          simula o bloqueio por partida em andamento.
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <List dense>
            {data?.teams.map((team) => (
              <ListItem
                key={team.id}
                secondaryAction={
                  <Switch
                    edge="end"
                    checked={lockedIds.has(team.id)}
                    onChange={() => toggle(team.id)}
                  />
                }
              >
                <ListItemAvatar>
                  <Avatar src={team.logoUrl ?? undefined} sx={{ width: 28, height: 28 }} />
                </ListItemAvatar>
                <ListItemText primary={team.name} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={setLocked.isPending}
          onClick={() =>
            setLocked.mutate(
              { seasonId, teamIds: Array.from(lockedIds) },
              { onSuccess: onClose },
            )
          }
        >
          {setLocked.isPending ? 'Salvando…' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SimulatorTab;
