import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  CircularProgress,
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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SyncIcon from '@mui/icons-material/Sync';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from '../../api/config';
import { authHeader } from '../../api/httpClient';
import { useSyncAllSquads } from '../../api/playerSyncQueries';
import { useSupportedLeague } from '../../api/leaguesQueries';

interface TeamFilter {
  id: number;
  name: string;
  externalId: number;
  lastSquadSyncAt: string | null;
}

interface RosterPlayer {
  id: number;
  name: string;
  position: string;
  number: number | null;
  age: number | null;
}

function formatSyncDate(iso: string | null): string {
  if (!iso) return 'Nunca';
  return new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
}

// ─── Team accordion row ───────────────────────────────────────────────────────

const TeamRow: React.FC<{
  team: TeamFilter;
}> = ({ team }) => {
  const [expanded, setExpanded] = useState(false);

  const { data: roster = [], isLoading: rosterLoading } = useQuery<RosterPlayer[]>({
    queryKey: ['squadRoster', team.id],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.players.squad(team.id), {
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: expanded,
    staleTime: 0,
  });

  const players = roster;

  return (
    <Accordion expanded={expanded} onChange={(_, v) => setExpanded(v)}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%', pr: 1 }}>
          <Typography fontWeight="bold" sx={{ minWidth: 180 }}>
            {team.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Última atualização: {formatSyncDate(team.lastSquadSyncAt)}
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        {rosterLoading ? (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={20} />
          </Box>
        ) : players.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 2 }}>
            Nenhum jogador encontrado — sincronize o elenco.
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Nome</TableCell>
                  <TableCell>Posição</TableCell>
                  <TableCell>Idade</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {players.map((p) => (
                  <TableRow key={p.id} hover>
                    <TableCell>{p.number ?? '—'}</TableCell>
                    <TableCell>{p.name}</TableCell>
                    <TableCell>{p.position}</TableCell>
                    <TableCell>{p.age ?? '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

// ─── Main tab ─────────────────────────────────────────────────────────────────

const SquadSyncTab: React.FC = () => {
  const [seasonYear, setSeasonYear] = useState(String(new Date().getFullYear()));
  const [snack, setSnack] = useState<string | null>(null);

  const { league } = useSupportedLeague();
  const leagueExternalId = league?.externalId;
  const leagueInternalId = league?.id;
  const year = Number(seasonYear) || undefined;

  const { data: filtersData, isLoading: teamsLoading } = useQuery<{ teams: TeamFilter[] }>({
    queryKey: ['playerFilters', leagueInternalId, year],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.players.getFilters, {
        // getFilters is internal-id-keyed; sync calls below use the external id.
        params: { leagueId: leagueInternalId, seasonYear: year },
        headers: authHeader(),
      });
      return res.data;
    },
    enabled: !!leagueInternalId && !!year,
    staleTime: 0,
  });

  const teams = (filtersData?.teams ?? []).sort((a, b) => a.name.localeCompare(b.name));
  const syncAll = useSyncAllSquads();

  const handleSyncAll = () => {
    if (!leagueExternalId || !year) return;
    syncAll.mutate(
      { leagueExternalId, seasonYear: year },
      {
        onSuccess: (d) =>
          setSnack(
            `${d.teams} time(s) — ${d.inserted} inserido(s), ${d.updated} atualizado(s), ${d.cleared} saíram da liga`,
          ),
        onError: (err) => setSnack(`Erro: ${err.message}`),
      },
    );
  };

  return (
    <Box>
      {/* Controls */}
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <TextField
          label="Campeonato"
          value={league?.name ?? 'Carregando...'}
          size="small"
          sx={{ width: 200 }}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Ano da Temporada"
          type="number"
          value={seasonYear}
          onChange={(e) => setSeasonYear(e.target.value)}
          size="small"
          sx={{ width: 120 }}
        />
        <Button
          variant="contained"
          startIcon={syncAll.isPending ? <CircularProgress size={16} color="inherit" /> : <SyncIcon />}
          disabled={!leagueExternalId || !year || syncAll.isPending}
          onClick={handleSyncAll}
        >
          Sincronizar Todos os Elencos
        </Button>
      </Stack>

      {/* Teams list */}
      {teamsLoading ? (
        <CircularProgress size={24} />
      ) : teams.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Nenhum time encontrado para esta liga/temporada.
        </Typography>
      ) : (
        <Box>
          {teams.map((team) => (
            <TeamRow key={team.id} team={team} />
          ))}
        </Box>
      )}

      <Snackbar
        open={snack != null}
        autoHideDuration={5000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" onClose={() => setSnack(null)} sx={{ width: '100%' }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SquadSyncTab;
