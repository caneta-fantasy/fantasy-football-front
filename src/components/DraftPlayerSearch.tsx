import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Pagination,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { usePlayers, usePlayersFilters } from '../api/playersQueries';
import { DraftPick } from '../api/draftQueries';
import {
  mapPositionToSlot,
  POSITIONS_TRANSLATION,
  CLOSED_POSITION_OPTIONS,
  OPEN_POSITION_OPTIONS,
  CLOSED_POSITIONS_BACKEND_MAP,
  OPEN_POSITIONS_BACKEND_MAP,
} from '../utils/positions';
import { useRosterSettings } from '../api/useRosterSettings';


interface Props {
  leagueId: number;
  realLeagueId: number | undefined;
  season: number;
  picks: DraftPick[];
  onPick: (playerId: number) => void;
  disabled?: boolean;
  fullPositions?: Set<string>;
}

export default function DraftPlayerSearch({ leagueId, realLeagueId, picks, onPick, disabled, fullPositions }: Props) {
  const [search, setSearch] = useState('');
  const [position, setPosition] = useState('ALL');
  const [teamId, setTeamId] = useState<number | ''>('');
  const [page, setPage] = useState(1);

  const { data: rosterSettingsData } = useRosterSettings(leagueId);
  const isOpenDefense = rosterSettingsData?.defenseType === 'OPEN';
  const positionOptions = isOpenDefense ? OPEN_POSITION_OPTIONS : CLOSED_POSITION_OPTIONS;
  const positionsBackendMap = isOpenDefense ? OPEN_POSITIONS_BACKEND_MAP : CLOSED_POSITIONS_BACKEND_MAP;

  const draftedIds = picks.filter((p) => p.player).map((p) => p.player!.id);

  const { data, isLoading } = usePlayers({
    search: search || undefined,
    position: position === 'ALL' ? undefined : [positionsBackendMap[position]],
    teamId: teamId || undefined,
    page,
    limit: 20,
    sortBy: 'name',
    order: 'asc',
    leagueId: realLeagueId,
    fantasyLeagueId: leagueId,
    onlyFreeAgents: false,
    excludePlayerIds: draftedIds.length > 0 ? draftedIds : undefined,
  });

  const { data: filters } = usePlayersFilters({
    leagueId: realLeagueId,
  });

  const players = data?.data ?? [];

  return (
    <Box>
      {/* Filters row */}
      <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
        <ToggleButtonGroup
          value={position}
          exclusive
          onChange={(_, v) => { if (v) { setPosition(v); setPage(1); } }}
          size="small"
        >
          {positionOptions.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value} sx={{ px: 1.5 }}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="draft-team-label">Time</InputLabel>
          <Select
            labelId="draft-team-label"
            label="Time"
            value={teamId}
            onChange={(e) => { setTeamId(e.target.value as number | ''); setPage(1); }}
          >
            <MenuItem value=""><em>Todos</em></MenuItem>
            {filters?.teams?.map((t) => (
              <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        size="small"
        placeholder="Buscar jogador..."
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 1 }}
      />

      {isLoading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={24} />
        </Box>
      )}

      {data?.meta && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
          {data.meta.total} jogadores disponíveis
        </Typography>
      )}

      <List dense disablePadding>
        {players.map((player) => (
          <ListItem
            key={player.player_id}
            disableGutters
            secondaryAction={
              <Button
                size="small"
                variant="contained"
                disabled={disabled || (!!fullPositions && fullPositions.has(mapPositionToSlot(player.player_position) ?? ''))}
                onClick={() => onPick(player.player_id)}
                sx={{ textTransform: 'none', borderRadius: 4, minWidth: 72 }}
              >
                Escolher
              </Button>
            }
          >
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={500} noWrap>
                  {player.player_name}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary" noWrap>
                  {POSITIONS_TRANSLATION[player.player_position] ?? player.player_position} · {player.team_name}
                </Typography>
              }
            />
          </ListItem>
        ))}

        {!isLoading && players.length === 0 && (
          <Typography variant="body2" color="text.secondary" py={1} textAlign="center">
            Nenhum jogador encontrado.
          </Typography>
        )}
      </List>

      {(data?.meta.totalPages ?? 1) > 1 && (
        <Pagination
          count={data?.meta.totalPages ?? 1}
          page={page}
          onChange={(_, v) => setPage(v)}
          size="small"
          sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}
        />
      )}
    </Box>
  );
}
