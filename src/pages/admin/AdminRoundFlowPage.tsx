import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import BoltIcon from '@mui/icons-material/Bolt';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import {
  RoundFlow,
  RoundFlowEvent,
  RoundFlowStatus,
  useActivateRoundFlow,
  useCancelRoundFlow,
  useRoundFlows,
  useTriggerRoundFlowEvent,
  useUpdateRoundFlow,
} from '../../api/roundFlowQueries';
import RoundGamesTab from './RoundGamesTab';
import SquadSyncTab from './SquadSyncTab';
import SimulatorTab from './SimulatorTab';

const STATUS_COLORS: Record<RoundFlowStatus, 'default' | 'success' | 'info' | 'warning' | 'secondary' | 'error'> = {
  PENDING: 'default',
  LIVE: 'success',
  SCORED: 'info',
  WAIVER_OPEN: 'warning',
  DONE: 'secondary',
  CANCELED: 'error',
};

function formatDt(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// MUI datetime-local inputs need "YYYY-MM-DDTHH:mm" in local time.
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const AdminRoundFlowPage: React.FC = () => {
  const [tab, setTab] = useState(0);

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 2 }}>
        Painel Admin
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Fluxo de Rodada" />
        <Tab label="Jogos da Rodada" />
        <Tab label="Elencos" />
        <Tab label="Simulador" />
      </Tabs>
      {tab === 0 && <RoundFlowTab />}
      {tab === 1 && <RoundGamesTab />}
      {tab === 2 && <SquadSyncTab />}
      {tab === 3 && <SimulatorTab />}
    </Box>
  );
};

const RoundFlowTab: React.FC = () => {
  const { data: roundFlows = [], isLoading } = useRoundFlows();
  const activate = useActivateRoundFlow();
  const update = useUpdateRoundFlow();
  const trigger = useTriggerRoundFlowEvent();
  const cancel = useCancelRoundFlow();

  const [activateOpen, setActivateOpen] = useState(false);
  const [editing, setEditing] = useState<RoundFlow | null>(null);
  const [triggerMenu, setTriggerMenu] = useState<{ rf: RoundFlow; anchor: HTMLElement } | null>(null);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Fluxo de Rodada
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setActivateOpen(true)}
        >
          Ativar Rodada
        </Button>
      </Stack>

      <Paper>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Liga</TableCell>
                <TableCell>Temporada</TableCell>
                <TableCell>Rodada</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Início Ao Vivo</TableCell>
                <TableCell>Fim da Rodada</TableCell>
                <TableCell>Abertura do Mercado</TableCell>
                <TableCell>Fechamento do Mercado</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={9} align="center">Carregando...</TableCell>
                </TableRow>
              )}
              {!isLoading && roundFlows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">Nenhum fluxo de rodada ainda — ative um para começar.</TableCell>
                </TableRow>
              )}
              {roundFlows.map((rf) => (
                <TableRow key={rf.id} hover>
                  <TableCell>{rf.leagueExternalId}</TableCell>
                  <TableCell>{rf.seasonYear}</TableCell>
                  <TableCell>{rf.roundNumber}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={rf.status}
                      color={STATUS_COLORS[rf.status]}
                      variant={rf.status === 'PENDING' ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={rf.liveScoringStartedAt ? `Disparado: ${formatDt(rf.liveScoringStartedAt)}` : ''}>
                      <span style={{ textDecoration: rf.liveScoringStartedAt ? 'line-through' : 'none' }}>
                        {formatDt(rf.liveScoringStartAt)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={rf.scoredAt ? `Disparado: ${formatDt(rf.scoredAt)}` : ''}>
                      <span style={{ textDecoration: rf.scoredAt ? 'line-through' : 'none' }}>
                        {formatDt(rf.roundEndAt)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={rf.waiverWindowOpenedAt ? `Disparado: ${formatDt(rf.waiverWindowOpenedAt)}` : ''}>
                      <span style={{ textDecoration: rf.waiverWindowOpenedAt ? 'line-through' : 'none' }}>
                        {formatDt(rf.waiverWindowStartAt)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title={rf.waiverResolvedAt ? `Disparado: ${formatDt(rf.waiverResolvedAt)}` : ''}>
                      <span style={{ textDecoration: rf.waiverResolvedAt ? 'line-through' : 'none' }}>
                        {formatDt(rf.waiverResolveAt)}
                      </span>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Editar prazos">
                      <span>
                        <IconButton
                          size="small"
                          disabled={rf.status === 'CANCELED' || rf.status === 'DONE'}
                          onClick={() => setEditing(rf)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Disparar evento agora">
                      <span>
                        <IconButton
                          size="small"
                          disabled={rf.status === 'CANCELED' || rf.status === 'DONE'}
                          onClick={(e) => setTriggerMenu({ rf, anchor: e.currentTarget })}
                        >
                          <BoltIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Cancelar">
                      <span>
                        <IconButton
                          size="small"
                          disabled={
                            !!rf.liveScoringStartedAt ||
                            !!rf.scoredAt ||
                            !!rf.waiverWindowOpenedAt ||
                            !!rf.waiverResolvedAt ||
                            rf.status === 'CANCELED'
                          }
                          onClick={() => {
                            if (window.confirm(`Cancelar o fluxo de rodada #${rf.id}?`)) cancel.mutate(rf.id);
                          }}
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ActivateRoundDialog
        open={activateOpen}
        onClose={() => setActivateOpen(false)}
        onSubmit={(input) =>
          activate.mutate(input, {
            onSuccess: () => setActivateOpen(false),
          })
        }
        isPending={activate.isPending}
        errorMessage={activate.error?.message}
      />

      <EditDeadlinesDialog
        roundFlow={editing}
        onClose={() => setEditing(null)}
        onSubmit={(patch) =>
          update.mutate(
            { id: editing!.id, patch },
            { onSuccess: () => setEditing(null) },
          )
        }
        isPending={update.isPending}
        errorMessage={update.error?.message}
      />

      <Menu
        open={triggerMenu != null}
        anchorEl={triggerMenu?.anchor}
        onClose={() => setTriggerMenu(null)}
      >
        {(['live-start', 'round-end', 'waiver-open', 'waiver-resolve'] as RoundFlowEvent[]).map((event) => (
          <MenuItem
            key={event}
            onClick={() => {
              const rf = triggerMenu!.rf;
              setTriggerMenu(null);
              if (window.confirm(`Disparar '${event}' para o fluxo de rodada #${rf.id} agora?`)) {
                trigger.mutate({ id: rf.id, event });
              }
            }}
          >
            {event}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

const ActivateRoundDialog: React.FC<{
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { leagueExternalId: number; seasonYear: number; roundNumber: number }) => void;
  isPending: boolean;
  errorMessage?: string;
}> = ({ open, onClose, onSubmit, isPending, errorMessage }) => {
  const [leagueExternalId, setLeagueExternalId] = useState('71');
  const [seasonYear, setSeasonYear] = useState(String(new Date().getFullYear()));
  const [roundNumber, setRoundNumber] = useState('');

  const submit = () => {
    if (!leagueExternalId || !seasonYear || !roundNumber) return;
    onSubmit({
      leagueExternalId: Number(leagueExternalId),
      seasonYear: Number(seasonYear),
      roundNumber: Number(roundNumber),
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Ativar Fluxo de Rodada</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="ID Externo da Liga"
            type="number"
            value={leagueExternalId}
            onChange={(e) => setLeagueExternalId(e.target.value)}
            helperText="71 = Brasileirão Série A"
            fullWidth
          />
          <TextField
            label="Ano da Temporada"
            type="number"
            value={seasonYear}
            onChange={(e) => setSeasonYear(e.target.value)}
            fullWidth
          />
          <TextField
            label="Número da Rodada"
            type="number"
            value={roundNumber}
            onChange={(e) => setRoundNumber(e.target.value)}
            fullWidth
            autoFocus
          />
          {errorMessage && (
            <Typography color="error" variant="body2">{errorMessage}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={isPending}>
          {isPending ? 'Ativando...' : 'Ativar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditDeadlinesDialog: React.FC<{
  roundFlow: RoundFlow | null;
  onClose: () => void;
  onSubmit: (patch: {
    liveScoringStartAt?: string;
    roundEndAt?: string;
    waiverWindowStartAt?: string;
    waiverResolveAt?: string;
  }) => void;
  isPending: boolean;
  errorMessage?: string;
}> = ({ roundFlow, onClose, onSubmit, isPending, errorMessage }) => {
  const [liveStart, setLiveStart] = useState('');
  const [roundEnd, setRoundEnd] = useState('');
  const [waiverOpen, setWaiverOpen] = useState('');
  const [waiverResolve, setWaiverResolve] = useState('');

  React.useEffect(() => {
    if (!roundFlow) return;
    setLiveStart(toLocalInput(roundFlow.liveScoringStartAt));
    setRoundEnd(toLocalInput(roundFlow.roundEndAt));
    setWaiverOpen(toLocalInput(roundFlow.waiverWindowStartAt));
    setWaiverResolve(toLocalInput(roundFlow.waiverResolveAt));
  }, [roundFlow]);

  if (!roundFlow) return null;

  const submit = () => {
    const patch: any = {};
    if (toLocalInput(roundFlow.liveScoringStartAt) !== liveStart && !roundFlow.liveScoringStartedAt) {
      patch.liveScoringStartAt = new Date(liveStart).toISOString();
    }
    if (toLocalInput(roundFlow.roundEndAt) !== roundEnd && !roundFlow.scoredAt) {
      patch.roundEndAt = new Date(roundEnd).toISOString();
    }
    if (toLocalInput(roundFlow.waiverWindowStartAt) !== waiverOpen && !roundFlow.waiverWindowOpenedAt) {
      patch.waiverWindowStartAt = new Date(waiverOpen).toISOString();
    }
    if (toLocalInput(roundFlow.waiverResolveAt) !== waiverResolve && !roundFlow.waiverResolvedAt) {
      patch.waiverResolveAt = new Date(waiverResolve).toISOString();
    }
    onSubmit(patch);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Editar Prazos — Rodada {roundFlow.roundNumber}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Início da Pontuação Ao Vivo"
            type="datetime-local"
            value={liveStart}
            onChange={(e) => setLiveStart(e.target.value)}
            disabled={!!roundFlow.liveScoringStartedAt}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Fim da Rodada (pontuação)"
            type="datetime-local"
            value={roundEnd}
            onChange={(e) => setRoundEnd(e.target.value)}
            disabled={!!roundFlow.scoredAt}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Abertura do Mercado"
            type="datetime-local"
            value={waiverOpen}
            onChange={(e) => setWaiverOpen(e.target.value)}
            disabled={!!roundFlow.waiverWindowOpenedAt}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          <TextField
            label="Fechamento do Mercado"
            type="datetime-local"
            value={waiverResolve}
            onChange={(e) => setWaiverResolve(e.target.value)}
            disabled={!!roundFlow.waiverResolvedAt}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
          {errorMessage && (
            <Typography color="error" variant="body2">{errorMessage}</Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminRoundFlowPage;
