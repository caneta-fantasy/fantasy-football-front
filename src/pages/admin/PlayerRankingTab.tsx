import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import SyncIcon from '@mui/icons-material/Sync';
import {
  AvailabilityStatus,
  usePlayerRankings,
  useRankingConfig,
  useRecomputeRankings,
  useSetAvailability,
  useSetNudge,
  useUpdateRankingConfig,
} from '../../api/playerRankingQueries';

const STATUS_LABELS: Record<AvailabilityStatus, string> = {
  HEALTHY: 'Disponível',
  MINOR: 'Lesão leve',
  MAJOR: 'Lesão (semanas)',
  LONG_TERM: 'Lesão longa',
  SEASON_ENDING: 'Fora da temporada',
};

const MULTIPLIER_FIELDS: { key: keyof MultConfig; label: string }[] = [
  { key: 'healthyMultiplier', label: 'Disponível' },
  { key: 'minorMultiplier', label: 'Lesão leve' },
  { key: 'majorMultiplier', label: 'Lesão (semanas)' },
  { key: 'longTermMultiplier', label: 'Lesão longa' },
  { key: 'seasonEndingMultiplier', label: 'Fora da temporada' },
];

type MultConfig = {
  healthyMultiplier: number;
  minorMultiplier: number;
  majorMultiplier: number;
  longTermMultiplier: number;
  seasonEndingMultiplier: number;
};

/**
 * Controlled numeric input that only fires onCommit when the value actually
 * changes, on blur or Enter. Remounted (via key) on the parent's refetch so it
 * always reflects the persisted server value.
 */
const NudgeField: React.FC<{
  value: number;
  onCommit: (value: number) => void;
}> = ({ value, onCommit }) => {
  const [local, setLocal] = useState(String(value));
  const commit = () => {
    const n = Number(local);
    if (!Number.isNaN(n) && n !== value) onCommit(n);
  };
  return (
    <TextField
      type="number"
      size="small"
      value={local}
      sx={{ width: 90 }}
      onChange={(e) => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
      }}
    />
  );
};

const PlayerRankingTab: React.FC = () => {
  const { data: rankings = [], isLoading } = usePlayerRankings();
  const { data: config } = useRankingConfig();
  const recompute = useRecomputeRankings();
  const setAvailability = useSetAvailability();
  const setNudge = useSetNudge();
  const updateConfig = useUpdateRankingConfig();
  const [snack, setSnack] = useState<string | null>(null);
  const [draftConfig, setDraftConfig] = useState<Partial<MultConfig>>({});
  const [search, setSearch] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | AvailabilityStatus>('ALL');
  const [teamFilter, setTeamFilter] = useState('ALL');
  const [positionFilter, setPositionFilter] = useState('ALL');
  const [page, setPage] = useState(1);

  const teamOptions = Array.from(
    new Set(rankings.map((r) => r.teamName).filter((t): t is string => !!t)),
  ).sort((a, b) => a.localeCompare(b));
  const positionOptions = Array.from(
    new Set(rankings.map((r) => r.position).filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b));

  const PAGE_SIZE = 25;
  const term = search.trim().toLowerCase();
  const filtered = rankings.filter(
    (r) =>
      (!term || r.name.toLowerCase().includes(term)) &&
      (availabilityFilter === 'ALL' || r.availabilityStatus === availabilityFilter) &&
      (teamFilter === 'ALL' || r.teamName === teamFilter) &&
      (positionFilter === 'ALL' || r.position === positionFilter),
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const handleRecompute = () =>
    recompute.mutate(undefined, {
      onSuccess: () => setSnack('Ranking recalculado.'),
      onError: (e) => setSnack(`Erro: ${(e as Error).message}`),
    });

  const handleSaveConfig = () =>
    updateConfig.mutate(draftConfig, {
      onSuccess: () => {
        setSnack('Multiplicadores atualizados e ranking recalculado.');
        setDraftConfig({});
      },
      onError: (e) => setSnack(`Erro: ${(e as Error).message}`),
    });

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Ranking de Jogadores
        </Typography>
        <Button
          variant="contained"
          startIcon={
            recompute.isPending ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <SyncIcon />
            )
          }
          disabled={recompute.isPending}
          onClick={handleRecompute}
        >
          Recalcular
        </Button>
      </Stack>

      {/* Availability multipliers */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Multiplicadores de disponibilidade
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap>
          {MULTIPLIER_FIELDS.map(({ key, label }) => (
            <TextField
              key={key}
              label={label}
              type="number"
              size="small"
              sx={{ width: 130 }}
              value={draftConfig[key] ?? config?.[key] ?? ''}
              onChange={(e) =>
                setDraftConfig((p) => ({ ...p, [key]: Number(e.target.value) }))
              }
              inputProps={{ step: 0.05, min: 0 }}
            />
          ))}
          <Button
            variant="outlined"
            disabled={updateConfig.isPending || Object.keys(draftConfig).length === 0}
            onClick={handleSaveConfig}
          >
            Salvar
          </Button>
        </Stack>
      </Paper>

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ p: 2, pb: 1 }}
          >
            <TextField
              size="small"
              label="Buscar jogador"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              sx={{ width: 220 }}
            />
            <TextField
              select
              size="small"
              label="Disponibilidade"
              value={availabilityFilter}
              onChange={(e) => {
                setAvailabilityFilter(e.target.value as 'ALL' | AvailabilityStatus);
                setPage(1);
              }}
              sx={{ width: 180 }}
            >
              <MenuItem value="ALL">Todas</MenuItem>
              {(Object.keys(STATUS_LABELS) as AvailabilityStatus[]).map((s) => (
                <MenuItem key={s} value={s}>
                  {STATUS_LABELS[s]}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Time"
              value={teamFilter}
              onChange={(e) => {
                setTeamFilter(e.target.value);
                setPage(1);
              }}
              sx={{ width: 180 }}
            >
              <MenuItem value="ALL">Todos</MenuItem>
              {teamOptions.map((t) => (
                <MenuItem key={t} value={t}>
                  {t}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Posição"
              value={positionFilter}
              onChange={(e) => {
                setPositionFilter(e.target.value);
                setPage(1);
              }}
              sx={{ width: 160 }}
            >
              <MenuItem value="ALL">Todas</MenuItem>
              {positionOptions.map((p) => (
                <MenuItem key={p} value={p}>
                  {p}
                </MenuItem>
              ))}
            </TextField>
            <Typography variant="caption" color="text.secondary">
              {filtered.length} jogadores
            </Typography>
          </Stack>
          <TableContainer sx={{ maxHeight: '65vh' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Jogador</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell>Pos</TableCell>
                  <TableCell align="right">Pontuação auto</TableCell>
                  <TableCell>Disponibilidade</TableCell>
                  <TableCell align="right">Ajuste manual</TableCell>
                  <TableCell align="right">Pontuação final</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pageRows.map((row) => (
                  <TableRow key={row.playerId} hover>
                    <TableCell>{row.draftRank}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.teamName ?? '—'}</TableCell>
                    <TableCell>{row.position}</TableCell>
                    <TableCell align="right">
                      {Number(row.autoStatScore).toFixed(1)}
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={row.availabilityStatus}
                        disabled={setAvailability.isPending}
                        onChange={(e) =>
                          setAvailability.mutate(
                            {
                              playerId: row.playerId,
                              status: e.target.value as AvailabilityStatus,
                            },
                            {
                              onSuccess: () =>
                                setSnack(`${row.name}: disponibilidade atualizada.`),
                              onError: (err) =>
                                setSnack(`Erro: ${(err as Error).message}`),
                            },
                          )
                        }
                        sx={{ minWidth: 160 }}
                      >
                        {(
                          Object.keys(STATUS_LABELS) as AvailabilityStatus[]
                        ).map((s) => (
                          <MenuItem key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell align="right">
                      <NudgeField
                        key={`${row.playerId}-${row.manualNudge}`}
                        value={Number(row.manualNudge)}
                        onCommit={(nudge) =>
                          setNudge.mutate(
                            { playerId: row.playerId, nudge },
                            {
                              onSuccess: () =>
                                setSnack(`${row.name}: ajuste manual salvo.`),
                              onError: (err) =>
                                setSnack(`Erro: ${(err as Error).message}`),
                            },
                          )
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      {Number(row.finalScore).toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" sx={{ py: 1.5 }}>
              <Pagination
                count={totalPages}
                page={safePage}
                onChange={(_, p) => setPage(p)}
                size="small"
              />
            </Box>
          )}
        </Paper>
      )}

      <Snackbar
        open={snack != null}
        autoHideDuration={4000}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default PlayerRankingTab;
