import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Player, usePlayers, usePlayersFilters } from '../api/playersQueries';
import { useAddPlayer } from '../api/userTeamRosterMutations';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import { useRosterSettings } from '../api/useRosterSettings';
import Loading from './Loading';
import {
  POSITIONS_TRANSLATION,
  CLOSED_POSITIONS_BACKEND_MAP,
  OPEN_POSITIONS_BACKEND_MAP,
} from '../utils/positions';

interface PlayerSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelectPlayer: (player: Player) => void;
  fantasyLeague: FantasyLeague;
  allowedPositions: string[];
  userTeamId: number;
  seasonYear: number;
  slot: string;
  slotType: string;
  refetch: () => void;
  targetSlotIndex: number;
}

const PlayerSelectModal: React.FC<PlayerSelectModalProps> = ({
  open,
  onClose,
  fantasyLeague,
  allowedPositions,
  slot,
  slotType,
  userTeamId,
  seasonYear,
  targetSlotIndex,
  refetch,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: rosterSettingsData } = useRosterSettings(fantasyLeague.id);
  const positionsBackendMap = rosterSettingsData?.defenseType === 'OPEN'
    ? OPEN_POSITIONS_BACKEND_MAP
    : CLOSED_POSITIONS_BACKEND_MAP;

  const [position, setPosition] = useState<string>('ALL');
  const [teamId, setTeamId] = useState<number | ''>('');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Reset filters when modal opens
  useEffect(() => {
    if (open) {
      setPosition('ALL');
      setTeamId('');
      setSearch('');
      setPage(0);
    }
  }, [open]);

  const { mutate: addPlayer, isPending: isAddingPlayer } = useAddPlayer({
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Jogador adicionado ao elenco!', type: 'success' });
      refetch();
      onClose();
    },
  });

  const { data: filtersData } = usePlayersFilters({
    leagueId: fantasyLeague.league.id,
    seasonYear,
  });

  const handlePlayerClick = (playerId: number) => {
    addPlayer({
      body: {
        slot,
        slotType,
        playerId,
        userTeamId,
        seasonYear,
        targetSlotIndex,
      },
    });
  };

  // Resolve which positions to send to the API based on the selected filter
  const resolvedPositions: string[] =
    position === 'ALL'
      ? allowedPositions.map((pos) => positionsBackendMap[pos] ?? pos)
      : [positionsBackendMap[position] ?? position];

  const { data, isLoading } = usePlayers({
    position: resolvedPositions,
    search,
    page: page + 1,
    limit: rowsPerPage,
    sortBy: 'goals',
    order: 'desc',
    leagueId: fantasyLeague.league.id,       // internal DB id — used by tp.league_id join
    fantasyLeagueId: fantasyLeague.id,
    onlyFreeAgents: true,
    teamId: teamId !== '' ? teamId : undefined,
  });

  const previousDataRef = useRef<Player[]>([]);
  useEffect(() => {
    if (data?.data?.length) {
      previousDataRef.current = data.data;
    }
  }, [data]);

  const players = data?.data?.length ? data.data : previousDataRef.current;
  const totalCount = data?.meta?.total || previousDataRef.current.length;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isAddingPlayer) return <Loading message="Adicionando jogador..." />;
  if (isLoading && !previousDataRef.current.length) return <Loading message="Carregando jogadores..." fullScreen />;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Selecionar Jogador</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={3} flexWrap="wrap">
          {/* Position filter */}
          <ToggleButtonGroup
            value={position}
            exclusive
            onChange={(_, newPos) => {
              if (newPos) {
                setPosition(newPos);
                setPage(0);
              }
            }}
            size="small"
          >
            <ToggleButton value="ALL">Todos</ToggleButton>
            {allowedPositions.map((pos) => (
              <ToggleButton key={pos} value={pos}>
                {pos}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          {/* Team filter */}
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Time</InputLabel>
            <Select
              value={teamId}
              label="Time"
              onChange={(e) => {
                setTeamId(e.target.value as number | '');
                setPage(0);
              }}
            >
              <MenuItem value="">Todos os times</MenuItem>
              {(filtersData?.teams ?? []).map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Search */}
          <TextField
            placeholder="Buscar jogador"
            size="small"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            sx={{ minWidth: 200 }}
            InputProps={{
              endAdornment: search && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')} edge="end">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Box sx={{ opacity: isLoading ? 0.6 : 1, transition: 'opacity 300ms ease-in-out' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Jogador</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Posição</TableCell>
                <TableCell align="right">Gols</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {players.length > 0 ? (
                players.map((player: Player) => (
                  <TableRow
                    key={player.player_id}
                    hover
                    onClick={() => handlePlayerClick(player.player_id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell>
                      {player.player_name}
                    </TableCell>
                    <TableCell>{player.team_name}</TableCell>
                    <TableCell>
                      {POSITIONS_TRANSLATION[player.player_position as keyof typeof POSITIONS_TRANSLATION] ?? player.player_position}
                    </TableCell>
                    <TableCell align="right">{player.goals}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4}>Nenhum jogador disponível.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>

        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </DialogContent>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.message}</Alert>
      </Snackbar>
    </Dialog>
  );
};

export default PlayerSelectModal;
