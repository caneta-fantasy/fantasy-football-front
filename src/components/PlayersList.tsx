import React, { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Box,
  Typography,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  TablePagination,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  Button,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import LockIcon from '@mui/icons-material/Lock';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import GavelIcon from '@mui/icons-material/Gavel';
import { usePlayers, usePlayersFilters } from '../api/playersQueries';
import { useRosterSettings } from '../api/useRosterSettings';
import AddPlayerModal from './AddPlayerModal';
import PlayerStatsModal from './PlayerStatsModal';
import WaiverClaimModal from './WaiverClaimModal';
import { Slot, useRoster } from './userTeamRosterQueries';
import { useRemovePlayer } from '../api/userTeamRosterMutations';
import { useWaiverBudgets, useWaiverClaims, useWaiverWindowStatus } from '../api/waiverQueries';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { LeagueStatus } from './SeasonStatusCard';
import Loading from './Loading';
import {
  POSITIONS_TRANSLATION,
  CLOSED_POSITION_OPTIONS,
  OPEN_POSITION_OPTIONS,
  CLOSED_POSITIONS_BACKEND_MAP,
  OPEN_POSITIONS_BACKEND_MAP,
} from '../utils/positions';
import { useRealMatchesByRound } from '../api/matchesQueries';
import { getOpponentForTeam, formatMatchTime } from '../utils/matchUtils';
import { useLockedTeams } from '../api/fantasyRoundGameQueries';
import { useSimulationLockedTeams } from '../api/simulatorQueries';


interface PlayersListProps {
  fantasyLeague: FantasyLeague;
  seasonYear: number;
  userTeamId: number;
  seasonId?: string;
  currentRound?: number;
}

const POST_DRAFT_STATUSES: LeagueStatus[] = [
  LeagueStatus.DRAFT_DONE,
  LeagueStatus.SCHEDULED,
  LeagueStatus.ACTIVE,
  LeagueStatus.ARCHIVED,
];

const PlayersList: React.FC<PlayersListProps> = ({ fantasyLeague, seasonYear, userTeamId, seasonId, currentRound }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { data: season } = useFantasyLeagueSeasons(fantasyLeague.id);
  const activeRealRound = currentRound ?? season?.currentRealRound ?? null;
  const { data: realMatches } = useRealMatchesByRound(
    activeRealRound ? seasonYear : undefined,
    activeRealRound ?? undefined,
  );
  // Simulation leagues: locks are the admin's manual per-club toggles, not real kickoffs
  const isSimulation = !!fantasyLeague.isSimulation;
  const { data: lockedTeamsData } = useLockedTeams(
    isSimulation ? undefined : fantasyLeague.league.id,
    seasonYear,
    activeRealRound,
  );
  const { data: simLockedTeams } = useSimulationLockedTeams(isSimulation ? season?.id : null);
  const lockedTeamIds = new Set<number>(
    isSimulation
      ? (simLockedTeams?.teams ?? []).filter((t) => t.locked).map((t) => t.id)
      : lockedTeamsData?.lockedTeamIds ?? [],
  );
  const draftCompleted = season ? POST_DRAFT_STATUSES.includes(season.status as LeagueStatus) : false;

  const { data: rosterSettingsData } = useRosterSettings(fantasyLeague.id);
  const defenseType = rosterSettingsData?.defenseType ?? 'CLOSED';
  const isOpenDefense = defenseType === 'OPEN';
  const positionOptions = isOpenDefense ? OPEN_POSITION_OPTIONS : CLOSED_POSITION_OPTIONS;
  const positionsBackendMap = isOpenDefense ? OPEN_POSITIONS_BACKEND_MAP : CLOSED_POSITIONS_BACKEND_MAP;

  const [position, setPosition] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [onlyFreeAgents, setOnlyFreeAgents] = useState(false);
  const [teamId, setTeamId] = useState<number | null>(null);
  // 'auto' = let the backend pick: per-league points once the season has points,
  // global draft ranking pre-season. Explicit column clicks override it.
  const [sortBy, setSortBy] = useState<string>('auto');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: string) => {
    if (sortBy === col) {
      setOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(col);
      setOrder('desc');
    }
    setPage(0);
  };
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [selectedPlayerName, setSelectedPlayerName] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<null | {
    id: number; name: string; photo: string; position: 'Goalkeeper' | 'Defense' | 'Defender' | 'Midfielder' | 'Attacker'; teamCode?: string;
  }>(null);

  const [waiverClaimOpen, setWaiverClaimOpen] = useState(false);
  const [waiverPlayer, setWaiverPlayer] = useState<null | { id: number; name: string; photo: string; position: string }>(null);

  const { data: waiverWindowStatus } = useWaiverWindowStatus(fantasyLeague.league.id, seasonYear);
  const isWaiverWindowOpen = waiverWindowStatus?.isOpen ?? false;

  const { data: waiverBudgets } = useWaiverBudgets(isWaiverWindowOpen ? seasonId : undefined);
  const { data: waiverClaims } = useWaiverClaims(isWaiverWindowOpen ? seasonId : undefined);

  const myBudget = waiverBudgets?.find((b) => b.userTeam.id === userTeamId);
  const baseBudget = myBudget ? Number(myBudget.remainingBudget) : (season?.initialWaiverBudget ?? 100);

  const myClaims = waiverClaims?.filter((c) => c.userTeam.id === userTeamId) ?? [];
  const pendingClaims = myClaims.filter((c) => c.status === 'PENDING');
  const reservedBudget = pendingClaims.reduce((sum, c) => sum + Number(c.bidAmount), 0);
  const remainingBudget = baseBudget - reservedBudget;

  const pendingClaimedPlayerIds = new Set(pendingClaims.map((c) => c.targetPlayer.id));
  const pendingDropPlayerIds = new Set(pendingClaims.filter((c) => c.dropPlayer).map((c) => c.dropPlayer!.id));

  const [statsPlayer, setStatsPlayer] = useState<null | { id: number; name: string; photo: string; slotId?: number; isOwner?: boolean; fantasyTeamName?: string }>(null);


  const { data: slots, isLoading, refetch } = useRoster({ userTeamId, seasonYear });

  const playerIdToSlotId = React.useMemo(() => {
    const m = new Map<number, number>();
    (slots ?? []).forEach((slot: Slot) => {
      if (slot?.player?.id != null && slot?.id != null) {
        m.set(Number(slot.player.id), Number(slot.id));
      }
    });
    return m;
  }, [slots]);
  

  const { mutate: removePlayer, isPending: isRemovingPlayer } = useRemovePlayer({
    onSuccess: () => {
      refetch?.();
      refetchPlayers?.();
      setSelectedSlotId(null);
      setSelectedPlayerName('');
      setConfirmOpen(false);
    },
    onError: (e: any) => {
      setDropError(e?.response?.data?.message ?? e?.message ?? 'Erro ao liberar jogador');
    },
  });

  const openConfirmDrop = (slotId: number, playerName: string) => {
    setSelectedSlotId(slotId);
    setSelectedPlayerName(playerName);
    setConfirmOpen(true);
  };
  
  const handleConfirmRemove = () => {
    if (selectedSlotId != null) removePlayer(selectedSlotId);
  }

  const { data, isLoading: isLoadingPlayers, isFetching, refetch: refetchPlayers } = usePlayers({
    position: position === 'ALL'
      ? undefined
      : [positionsBackendMap[position]],
    teamId: teamId ?? undefined,        // <-- only change here
    search,
    page: page + 1,
    limit: rowsPerPage,
    sortBy,
    order,
    leagueId: fantasyLeague.league.id,
    fantasyLeagueId: fantasyLeague.id,
    onlyFreeAgents,
  });


  // When sortBy is 'auto', the backend resolves the real column (totalPoints or
  // draftRank). Use the resolved value from meta so the right header highlights.
  const activeSort = sortBy === 'auto' ? data?.meta?.sortBy ?? '' : sortBy;

  const previousDataRef = useRef<any[]>([]);
  useEffect(() => {
    if (data?.data?.length) {
      previousDataRef.current = data.data;
    }
  }, [data]);

  useEffect(() => {
    setPage(0);
  }, [position, search, onlyFreeAgents]);

  const players = data?.data?.length ? data.data : previousDataRef.current;
  const totalCount = data?.meta?.total || previousDataRef.current.length;

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const { data: filters, isLoading: loadingFilters } = usePlayersFilters({
    leagueId: fantasyLeague.league.id,
    seasonYear,
  });
  
  if (isLoading || (isLoadingPlayers && !data) || loadingFilters) return <Loading message="Carregando jogadores..." fullScreen />;

  if (isRemovingPlayer) return <Loading message="Removendo jogador..." />;

  return (
    <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="h6">Jogadores</Typography>
        {isWaiverWindowOpen && (
          <Chip
            icon={<GavelIcon />}
            label={`Mercado aberto · R$ ${remainingBudget} disponível`}
            color="secondary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {!draftCompleted && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          A seleção de jogadores estará disponível após a realização do draft.
        </Alert>
      )}

      <Box
        display="flex"
        flexDirection={isMobile ? 'column' : 'row'}
        gap={2}
        mb={3}
      >
        <ToggleButtonGroup
          value={position}
          exclusive
          onChange={(_, v) => setPosition(v ?? position)}
          size="small"
        >
          {positionOptions.map((opt) => (
            <ToggleButton key={opt.value} value={opt.value}>
              {opt.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={onlyFreeAgents}
          exclusive
          onChange={(_, v) => setOnlyFreeAgents(Boolean(v))}
          size="small"
        >
          <ToggleButton value={false}>Todos</ToggleButton>
          <ToggleButton value={true}>Jogadores não escalados</ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: 220 }}>
          <InputLabel id="team-filter-label">Time</InputLabel>
          <Select<number | ''>
            labelId="team-filter-label"
            label="Time"
            value={teamId ?? ''}
            onChange={(e) => {
              const v = e.target.value;
              setTeamId(v === '' ? null : Number(v));
            }}
          >
            <MenuItem value="">
              <em>Todos os times</em>
            </MenuItem>
            {filters?.teams?.map((t: any) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Buscar jogador"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
          InputProps={{
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => setSearch('')}
                  edge="end"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <Box
  sx={{
    opacity: isFetching ? 0.6 : 1,
    transition: 'opacity 300ms ease-in-out',
  }}
>
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Jogador</TableCell>
        <TableCell>Time</TableCell>
        <TableCell>Posição</TableCell>
        <TableCell>Escalado</TableCell>
        {currentRound && <TableCell>Próx.</TableCell>}
        <TableCell align="right">
          <TableSortLabel
            active={activeSort === 'goals'}
            direction={activeSort === 'goals' ? order : 'desc'}
            onClick={() => handleSort('goals')}
          >
            Gols
          </TableSortLabel>
        </TableCell>
        <TableCell align="right">
          <TableSortLabel
            active={activeSort === 'totalPoints'}
            direction={activeSort === 'totalPoints' ? order : 'desc'}
            onClick={() => handleSort('totalPoints')}
          >
            Pts Total
          </TableSortLabel>
        </TableCell>
        <TableCell align="right">
          <TableSortLabel
            active={activeSort === 'avgPoints'}
            direction={activeSort === 'avgPoints' ? order : 'desc'}
            onClick={() => handleSort('avgPoints')}
          >
            Média
          </TableSortLabel>
        </TableCell>
        <TableCell align="center">Ação</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {players.length ? (
        players.map((player: any) => (
          <TableRow
            key={player.player_id}
            hover
            onClick={() => {
              const slotId = playerIdToSlotId.get(player.player_id);
              setStatsPlayer({
                id: player.player_id,
                name: player.player_name,
                photo: player.player_photo,
                slotId,
                isOwner: player.rostered_by_user_team_id === userTeamId,
                fantasyTeamName: player.rostered_by_user_team_name ?? undefined,
              });
            }}
            sx={{
              backgroundColor: player.is_rostered
                ? 'rgba(130,127,127,0.16)'
                : 'transparent',
              '& > td': { backgroundColor: 'inherit' },
              cursor: 'pointer',
              opacity: player.is_rostered ? 0.9 : 1,
            }}
          >
            <TableCell>
              <Box display="flex" alignItems="center" gap={0.5}>
                {player.is_rostered && (
                  <LockIcon fontSize="small" sx={{ width: 16, height: 16 }} />
                )}
                {player.player_name}
              </Box>
            </TableCell>
            <TableCell>{player.team_name}</TableCell>
            <TableCell>
              {POSITIONS_TRANSLATION[
                player.player_position as keyof typeof POSITIONS_TRANSLATION
              ]}
            </TableCell>
            <TableCell>
              {player.rostered_by_user_team_name ? (
                <Typography variant="caption" color="text.secondary">
                  {player.rostered_by_user_team_name}
                </Typography>
              ) : (
                <Typography variant="caption" color="text.disabled">Livre</Typography>
              )}
            </TableCell>
            {currentRound && (
              <TableCell>
                {(() => {
                  const opp = player.team_id != null && realMatches
                    ? getOpponentForTeam(realMatches, player.team_id)
                    : null;
                  return opp ? (
                    <Typography variant="caption" color="text.secondary">
                      x {opp.code} ({opp.isHome ? 'C' : 'V'})
                      {formatMatchTime(opp.matchDate) && <> · {formatMatchTime(opp.matchDate)}</>}
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.disabled">—</Typography>
                  );
                })()}
              </TableCell>
            )}
            <TableCell align="right">{player.goals}</TableCell>
            <TableCell align="right">
              {player.totalPoints != null ? Number(player.totalPoints).toFixed(1) : '—'}
            </TableCell>
            <TableCell align="right">
              {player.avgPoints != null ? Number(player.avgPoints).toFixed(1) : '—'}
            </TableCell>
            <TableCell align="center" onClick={(e) => e.stopPropagation()}>
              {!draftCompleted ? (
                <Tooltip title="Disponível após o draft">
                  <Chip size="small" icon={<LockIcon fontSize="small" />} label="Draft pendente" variant="outlined" />
                </Tooltip>
              ) : lockedTeamIds.has(player.team_id) ? (
                // Player's match has started → locked for the duration of the round
                <Tooltip title="Jogador bloqueado — partida em andamento nesta rodada">
                  <Chip size="small" icon={<LockIcon fontSize="small" />} label="Bloqueado" color="warning" variant="outlined" />
                </Tooltip>
              ) : !player.is_rostered ? (
                isWaiverWindowOpen ? (
                  pendingClaimedPlayerIds.has(player.player_id) ? (
                    <Tooltip title="Oferta já registrada — cancele para fazer outra">
                      <span>
                        <IconButton size="small" disabled>
                          <GavelIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                  <Tooltip title="Fazer oferta no Mercado">
                    <IconButton
                      size="small"
                      color="secondary"
                      onClick={(e) => {
                        e.stopPropagation();
                        setWaiverPlayer({
                          id: player.player_id,
                          name: player.player_name,
                          photo: player.player_photo,
                          position: player.player_position,
                        });
                        setWaiverClaimOpen(true);
                      }}
                    >
                      <GavelIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  )
                ) : (
                  // Free agent → Add
                  <Tooltip title="Adicionar ao elenco">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPlayer({
                          id: player.player_id,
                          name: player.player_name,
                          photo: player.player_photo,
                          position: player.player_position,
                          teamCode: player.team_name,
                        });
                        setAddOpen(true);
                      }}
                    >
                      <PersonAddAlt1Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )
              ) : player.rostered_by_user_team_id === userTeamId ? (
                // Rostered by ME → Drop
                (() => {
                  const slotId = playerIdToSlotId.get(player.player_id);
                  const canDrop = !!slotId;
                  return (
                    <Tooltip title={canDrop ? 'Liberar jogador' : 'Slot não encontrado'}>
                      <span>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          disabled={!canDrop}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (slotId) openConfirmDrop(slotId, player.player_name);
                          }}
                        >
                          Liberar
                        </Button>
                      </span>
                    </Tooltip>
                  );
                })()
              ) : (
                // Rostered by another team → Locked
                <Tooltip
                  title={
                    player.rostered_by_user_team_name
                      ? `Escalado por ${player.rostered_by_user_team_name}`
                      : 'Jogador já escalado'
                  }
                >
                  <Chip
                    size="small"
                    icon={<LockIcon fontSize="small" />}
                    label="Escalado"
                    variant="outlined"
                  />
                </Tooltip>
              )}
            </TableCell>
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={currentRound ? 9 : 8}>Nenhum jogador encontrado.</TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</Box>

      <PlayerStatsModal
        playerId={statsPlayer?.id ?? null}
        playerName={statsPlayer?.name}
        playerPhoto={statsPlayer?.photo}
        seasonId={seasonId}
        numberOfRounds={season?.numberOfRounds ?? undefined}
        fantasyTeamName={statsPlayer?.fantasyTeamName}
        onClose={() => setStatsPlayer(null)}
        slotId={statsPlayer?.slotId}
        isOwner={statsPlayer?.isOwner}
        refetch={() => {
          refetchPlayers();
          refetch();
        }}
      />

      {addOpen && selectedPlayer && (
        <AddPlayerModal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          player={selectedPlayer}
          slots={slots}
          userTeamId={userTeamId}
          seasonYear={seasonYear}
          refetch={() => {
            refetchPlayers();
            refetch();
          }}
        />
      )}

      {waiverClaimOpen && waiverPlayer && seasonId && (
        <WaiverClaimModal
          open={waiverClaimOpen}
          onClose={() => setWaiverClaimOpen(false)}
          seasonId={seasonId}
          userTeamId={userTeamId}
          remainingBudget={remainingBudget}
          targetPlayer={waiverPlayer}
          rosterSlots={slots ?? []}
          pendingDropPlayerIds={pendingDropPlayerIds}
          onSuccess={() => {
            refetchPlayers();
            refetch();
          }}
        />
      )}

      <Dialog open={confirmOpen} onClose={() => { setConfirmOpen(false); setDropError(null); }}>
        <DialogTitle>Confirmar remoção</DialogTitle>
        <DialogContent>
          {dropError && <Alert severity="error" sx={{ mb: 2 }}>{dropError}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setConfirmOpen(false); setDropError(null); }}>Cancelar</Button>
          <Button onClick={handleConfirmRemove} color="error" variant="contained" disabled={isRemovingPlayer || !!dropError}>
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

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
    
    
  );
};

export default PlayersList;
