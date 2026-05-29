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
  Avatar,
  TablePagination,
  IconButton,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Snackbar,
  Alert,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { Player, usePlayers } from '../api/playersQueries';
import { useAddPlayer } from '../api/userTeamRosterMutations';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import Loading from './Loading';

export const POSITIONS_TRANSLATION = {
  Defender: 'Defensor',
  Midfielder: 'Meio-Campo',
  Attacker: 'Atacante',
  Goalkeeper: 'Goleiro',
  Defense: 'Defesa',
};

const POSITIONS_BACKEND_MAP = {
  DEF: 'Defense',
  MEI: 'Midfielder',
  ATA: 'Attacker',
};

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

  const [position, setPosition] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = React.useState<{ open: boolean; message: string; type: 'success' | 'error' }>({
    open: false,
    message: '',
    type: 'success',
  });

  const { mutate: addPlayer, isPending: isAddingPlayer } = useAddPlayer({
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Player added to roster!', type: 'success' });
      refetch();
      onClose();
    },
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

  const backendPosition = allowedPositions.map(
    (pos) => POSITIONS_BACKEND_MAP[pos as keyof typeof POSITIONS_BACKEND_MAP]
  );

  const { data, isLoading } = usePlayers({
    position: backendPosition,
    search,
    page: page + 1,
    limit: rowsPerPage,
    sortBy: 'goals',
    order: 'desc',
    leagueId: fantasyLeague.league.id,
    fantasyLeagueId: fantasyLeague.id,
    onlyFreeAgents: true, 
  });

  // 🔁 Cache the last successful data to prevent blinking
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
  if (isLoading) return <Loading message="Carregando jogadores..." fullScreen />;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Selecionar Jogador</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} gap={2} mb={3}>
          <ToggleButtonGroup
            value={position}
            exclusive
            onChange={(_, newPos) => newPos && setPosition(newPos)}
            size="small"
          >
            {allowedPositions.map((pos) => (
              <ToggleButton key={pos} value={pos}>
                {pos}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

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

        <Box
          sx={{
            opacity: isLoading ? 0.6 : 1,
            transition: 'opacity 300ms ease-in-out',
          }}
        >
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
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar src={player.player_photo} alt={player.player_name} />
                        {player.player_name}
                      </Box>
                    </TableCell>
                    <TableCell>{player.team_name}</TableCell>
                    <TableCell>
                      {POSITIONS_TRANSLATION[player.player_position as keyof typeof POSITIONS_TRANSLATION]}
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
