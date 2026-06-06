import React, { useState, useEffect, useRef } from 'react';
import { Btn } from '@/ds';
import { Chip } from '@/ds';
import { Icon } from '@/ds';
import { Spinner } from '@/ds';
import { EmptyState } from '@/ds';
import { ErrorState } from '@/ds';
import { Modal } from '@/ds';
import { Help } from '@/ds';
import { Toast } from '@/ds';
import { SubHead } from '../ds/SubHead/SubHead';
import { PlayersFilters } from '../ds/PlayersFilters/PlayersFilters';
import { PlayersTableApp } from '../ds/PlayersTableApp/PlayersTableApp';
import type { PlayerRow, PosTagCode } from '../ds/PlayersTableApp/types';
import { useBreakpoint } from '../ds/PlayersTableApp/useBreakpoint';
import { ResultsBar } from '../ds/ResultsBar/ResultsBar';
import { usePlayers, usePlayersFilters } from '../api/playersQueries';
import AddPlayerModal from './AddPlayerModal';
import PlayerStatsModal from './PlayerStatsModal';
import WaiverClaimModal from './WaiverClaimModal';
import { Slot, useRoster } from './userTeamRosterQueries';
import { useRemovePlayer } from '../api/userTeamRosterMutations';
import { useWaiverBudgets, useWaiverClaims, useWaiverWindowStatus } from '../api/waiverQueries';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { LeagueStatus } from './SeasonStatusCard';
import { useRealMatchesByRound } from '../api/matchesQueries';
import { getOpponentForTeam, formatMatchTime } from '../utils/matchUtils';
import { useLockedTeams } from '../api/fantasyRoundGameQueries';
import type { SortState } from '../ds/PlayersTableApp/PlayersTableApp';


const POSITION_OPTIONS = [
  { value: 'ALL', label: 'TODOS' },
  { value: 'DEF', label: 'DEF' },
  { value: 'MEI', label: 'MEI' },
  { value: 'ATA', label: 'ATA' },
];

const FREE_AGENTS_OPTIONS = [
  { value: false, label: 'Todos' },
  { value: true, label: 'Não escalados' },
];

const POSITIONS_TRANSLATION = {
  'Defender': 'Defensor',
  'Midfielder': 'Meio-Campo',
  'Attacker': 'Atacante',
  'Goalkeeper': 'Goleiro',
  'ALL': 'Todos',
  'Defense': 'Defesa', // for synthetic team players
};

const POSITIONS_BACKEND_MAP = {
  'DEF': 'Defense',
  'MEI': 'Midfielder',
  'ATA': 'Attacker',
};

// Map the backend position label → the short PosTag taxonomy {GOL,DEF,MEI,ATA}
// the modernista list renders. Unknown/unmapped labels fall back to MEI so the
// tag never throws.
const POSITION_TAG_MAP: Record<string, PosTagCode> = {
  Goalkeeper: 'GOL',
  Defender: 'DEF',
  Defense: 'DEF',
  Midfielder: 'MEI',
  Attacker: 'ATA',
};

// Adapter between the screen's server-sort model ({ sortBy, order }) and the ds
// Table's controlled SortState ({ key, direction }). Only goals/totalPoints/
// avgPoints are sortable (server-sorted).
const SORTABLE_KEYS = new Set(['goals', 'totalPoints', 'avgPoints']);
function toSortState(sortBy: string, order: 'asc' | 'desc'): SortState | null {
  if (!SORTABLE_KEYS.has(sortBy)) return null;
  return { key: sortBy, direction: order === 'asc' ? 'ascending' : 'descending' };
}

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

// Local, MUI-free loading surface. Mirrors the shared Loading.tsx contract
// (centered spinner + message) without importing it — that file is still MUI,
// and importing it would re-introduce the legacy UI lib into this converted screen.
const DsLoading: React.FC<{ message?: string; fullScreen?: boolean }> = ({
  message = 'Carregando...',
  fullScreen = false,
}) => (
  <div
    role="status"
    className={`flex w-full flex-col items-center justify-center gap-3 text-center ${
      fullScreen ? 'h-screen' : 'h-full py-16'
    }`}
  >
    <Spinner size={40} />
    {message && (
      <span className="font-sans text-[13px] text-ink-muted">{message}</span>
    )}
  </div>
);

const PlayersList: React.FC<PlayersListProps> = ({ fantasyLeague, seasonYear, userTeamId, seasonId, currentRound }) => {
  const bp = useBreakpoint();
  const isMobile = bp === 'm';

  const { data: season } = useFantasyLeagueSeasons(fantasyLeague.id);
  const activeRealRound = currentRound ?? season?.currentRealRound ?? null;
  const { data: realMatches } = useRealMatchesByRound(
    activeRealRound ? seasonYear : undefined,
    activeRealRound ?? undefined,
  );
  const { data: lockedTeamsData } = useLockedTeams(fantasyLeague.league.externalId, seasonYear, activeRealRound);
  const lockedTeamIds = new Set<number>(lockedTeamsData?.lockedTeamIds ?? []);
  const draftCompleted = season ? POST_DRAFT_STATUSES.includes(season.status as LeagueStatus) : false;

  const [position, setPosition] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [onlyFreeAgents, setOnlyFreeAgents] = useState(false);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('totalPoints');
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

  // Adapter: ds Table emits { key, direction } | null on each header click; the
  // screen owns { sortBy, order }. The Table cycles none→asc→desc→none, but the
  // screen's contract is a simple desc↔asc toggle per column. We drive that off
  // the *key* the Table reports: when `next` is null the Table just cycled the
  // active column past descending, so the key is the current `sortBy`.
  const handleSortChange = (next: SortState | null) => {
    handleSort(next ? next.key : sortBy);
  };
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [, setSelectedPlayerName] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dropError, setDropError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<null | {
  id: number; name: string; photo: string; position: 'Defense' | 'Midfielder' | 'Attacker'; teamCode?: string;
  }>(null);

  const [waiverClaimOpen, setWaiverClaimOpen] = useState(false);
  const [waiverPlayer, setWaiverPlayer] = useState<null | { id: number; name: string; photo: string; position: string }>(null);

  const leagueExternalId = season?.fantasyLeague?.league?.externalId;
  const { data: waiverWindowStatus } = useWaiverWindowStatus(leagueExternalId, season?.seasonYear);
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

  const { data, isLoading: isLoadingPlayers, isFetching, error: playersError, refetch: refetchPlayers } = usePlayers({
    position: position === 'ALL'
      ? undefined
      : [POSITIONS_BACKEND_MAP[position as keyof typeof POSITIONS_BACKEND_MAP]],
    teamId: teamId ?? undefined,        // <-- only change here
    search,
    page: page + 1,
    limit: rowsPerPage,
    sortBy,
    order,
    leagueId: fantasyLeague.league.externalId,
    fantasyLeagueId: fantasyLeague.id,
    onlyFreeAgents,
  });


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

  const handleChangePage = (newPage: number) => setPage(newPage - 1);
  const handleChangeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
    setPage(0);
  };

  const { data: filters, isLoading: loadingFilters } = usePlayersFilters({
    leagueId: fantasyLeague.league.externalId,
    seasonYear,
  });

  // Build the action descriptor for a row, covering all six states (Add /
  // Oferta / Liberar / Escalado / Bloqueado / Draft-pendente).
  const actionFor = (player: any): PlayerRow['action'] => {
    if (!draftCompleted) {
      return { kind: 'draft' };
    }
    if (lockedTeamIds.has(player.team_id)) {
      return { kind: 'bloqueado' };
    }
    if (!player.is_rostered) {
      if (isWaiverWindowOpen) {
        if (pendingClaimedPlayerIds.has(player.player_id)) {
          return { kind: 'oferta' };
        }
        return {
          kind: 'waiver',
          onAction: () => {
            setWaiverPlayer({
              id: player.player_id,
              name: player.player_name,
              photo: player.player_photo,
              position: player.player_position,
            });
            setWaiverClaimOpen(true);
          },
        };
      }
      return {
        kind: 'add',
        onAction: () => {
          setSelectedPlayer({
            id: player.player_id,
            name: player.player_name,
            photo: player.player_photo,
            position: player.player_position,
            teamCode: player.team_name,
          });
          setAddOpen(true);
        },
      };
    }
    if (player.rostered_by_user_team_id === userTeamId) {
      const slotId = playerIdToSlotId.get(player.player_id);
      const canDrop = !!slotId;
      return {
        kind: 'drop',
        disabled: !canDrop,
        loading: isRemovingPlayer && selectedSlotId === slotId,
        tooltip: canDrop ? 'Liberar jogador' : 'Slot não encontrado',
        onAction: () => {
          if (slotId) openConfirmDrop(slotId, player.player_name);
        },
      };
    }
    return {
      kind: 'escalado',
      tooltip: player.rostered_by_user_team_name
        ? `Escalado por ${player.rostered_by_user_team_name}`
        : 'Jogador já escalado',
    };
  };

  const rows: PlayerRow[] = (players ?? []).map((player: any) => {
    const opp =
      currentRound && player.team_id != null && realMatches
        ? getOpponentForTeam(realMatches, player.team_id)
        : null;
    const nextNode = opp ? (
      <span>
        x {opp.code} ({opp.isHome ? 'C' : 'V'})
        {formatMatchTime(opp.matchDate) ? ` · ${formatMatchTime(opp.matchDate)}` : ''}
      </span>
    ) : (
      '—'
    );
    return {
      id: player.player_id,
      name: player.player_name,
      photo: player.player_photo,
      team: player.team_name,
      pos: POSITION_TAG_MAP[player.player_position as string] ?? 'MEI',
      posPt:
        POSITIONS_TRANSLATION[
          player.player_position as keyof typeof POSITIONS_TRANSLATION
        ] ?? player.player_position,
      rostered: player.is_rostered,
      rosteredBy: player.rostered_by_user_team_name ?? null,
      goals: player.goals,
      total: player.totalPoints != null ? Number(player.totalPoints).toFixed(1) : '—',
      avg: player.avgPoints != null ? Number(player.avgPoints).toFixed(1) : '—',
      next: nextNode,
      action: actionFor(player),
      onOpen: () => {
        const slotId = playerIdToSlotId.get(player.player_id);
        setStatsPlayer({
          id: player.player_id,
          name: player.player_name,
          photo: player.player_photo,
          slotId,
          isOwner: player.rostered_by_user_team_id === userTeamId,
          fantasyTeamName: player.rostered_by_user_team_name ?? undefined,
        });
      },
    };
  });

  if (isLoading || (isLoadingPlayers && !data) || loadingFilters) {
    return (
      <div data-ds>
        <DsLoading message="Carregando jogadores..." fullScreen />
      </div>
    );
  }

  return (
    <div
      data-ds
      className="bg-paper border border-line rounded-btn p-4 sm:p-6"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <SubHead compact={isMobile}>Jogadores</SubHead>
        {isWaiverWindowOpen && (
          <Chip tone="gold">
            <Icon name="market" size={16} aria-hidden /> Mercado aberto · R$ {remainingBudget} disponível
          </Chip>
        )}
      </div>

      {!draftCompleted && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-btn-sm border-[1.5px] border-warning bg-warning-pale px-3 py-2 font-sans text-[12.5px] text-ink"
        >
          <Icon name="info" size={16} className="text-warning" aria-hidden />
          A seleção de jogadores estará disponível após a realização do draft.
        </div>
      )}

      <PlayersFilters
        compact={isMobile}
        position={position}
        positionOptions={POSITION_OPTIONS}
        onPositionChange={(v) => setPosition(v)}
        onlyFreeAgents={onlyFreeAgents}
        freeAgentsOptions={FREE_AGENTS_OPTIONS}
        onFreeAgentsChange={(v) => setOnlyFreeAgents(v)}
        teamId={teamId}
        teams={filters?.teams ?? []}
        onTeamChange={(id) => setTeamId(id)}
        search={search}
        onSearchChange={(v) => setSearch(v)}
      />

      <div className={isMobile ? 'mt-4' : 'mt-[22px]'}>
        {playersError && !players.length ? (
          <ErrorState
            variant="500"
            onRetry={() => {
              refetchPlayers();
            }}
          />
        ) : (
          <div
            className="transition-opacity duration-300"
            style={{ opacity: isFetching ? 0.6 : 1 }}
          >
            <PlayersTableApp
              bp={bp}
              rows={rows}
              sort={toSortState(sortBy, order)}
              onSortChange={handleSortChange}
              showNext={!!currentRound}
              empty={
                <EmptyState
                  icon="search"
                  title="Nenhum jogador"
                  body="Nenhum jogador encontrado com esses filtros. Ajuste a busca ou a posição."
                />
              }
            />
          </div>
        )}
      </div>

      <ResultsBar
        compact={isMobile}
        page={page + 1}
        rowsPerPage={rowsPerPage}
        total={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

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

      <Modal
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDropError(null); }}
        title="Confirmar remoção"
        size="sm"
        footer={
          <div className="flex justify-end gap-2">
            <Btn
              variant="secondary"
              onClick={() => { setConfirmOpen(false); setDropError(null); }}
            >
              Cancelar
            </Btn>
            <Btn
              variant="danger"
              onClick={handleConfirmRemove}
              loading={isRemovingPlayer}
              disabled={isRemovingPlayer || !!dropError}
            >
              Liberar
            </Btn>
          </div>
        }
      >
        {dropError ? (
          <Help tone="error">{dropError}</Help>
        ) : (
          <p className="font-sans text-[13px] text-ink-muted">
            Tem certeza que deseja liberar este jogador do seu elenco?
          </p>
        )}
      </Modal>

      {/* Non-modal drop error → inline toast (mirrors the original Snackbar). */}
      {dropError && !confirmOpen && (
        <div className="fixed inset-x-0 bottom-4 z-toast flex justify-center px-4">
          <Toast
            tone="error"
            title={dropError}
            onDismiss={() => setDropError(null)}
          />
        </div>
      )}
    </div>
  );
};

export default PlayersList;
