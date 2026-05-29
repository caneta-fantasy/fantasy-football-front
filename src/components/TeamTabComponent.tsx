// src/components/TeamTab.tsx

import { Typography, Stack, Paper, Alert, Chip, Box } from '@mui/material';
import { useRoster } from './userTeamRosterQueries';
import { SlotCard } from './SlotCard';
import { useMemo, useState } from 'react';
import PlayerSelectModal from './PlayerSelectModal';
import MovePlayerModal from './MovePlayerModal';
import PlayerStatsModal from './PlayerStatsModal';
import { Slot } from './userTeamRosterQueries';
import { RosterSlotCard } from './SlotCard'
import { FantasyLeague, useFantasyLeagueTeams, FantasyLeagueTeamsResponse } from '../api/fantasyLeagueQueries';
import { UserTeam } from '../api/userTeamsQueries';
import Loading from './Loading';
import { useRealMatchesByRound } from '../api/matchesQueries';
import { getOpponentForTeam } from '../utils/matchUtils';
import { useLockedTeams } from '../api/fantasyRoundGameQueries';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';

interface Props {
    userTeam: UserTeam;
    seasonYear: number;
    seasonId?: string;
    fantasyLeague: FantasyLeague;
  }

  export const TeamTab: React.FC<Props> = ({ userTeam, fantasyLeague, seasonYear, seasonId }) => {
    console.log('[TeamTab] seasonYear:', seasonYear);
    const [selectedSlot, setSelectedSlot] = useState<any | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [moveOpen, setMoveOpen] = useState(false);
    const [originIndex, setOriginIndex] = useState<number | null>(null);

    const [statsSlot, setStatsSlot] = useState<Slot | null>(null);

    const [selectedTeamId, setSelectedTeamId] = useState<number>(userTeam.id);

    const { data: leagueTeams } = useFantasyLeagueTeams(fantasyLeague.id);
    const { data: season } = useFantasyLeagueSeasons(fantasyLeague.id);
    const currentRound = season?.currentRound ?? undefined;
    const { data: realMatches } = useRealMatchesByRound(seasonYear, currentRound);
    const { data: lockedTeamsData } = useLockedTeams(fantasyLeague.league.externalId, seasonYear, currentRound);
    const lockedTeamIds = new Set<number>(lockedTeamsData?.lockedTeamIds ?? []);
    const isViewingOwnTeam = selectedTeamId === userTeam.id;
    const viewedTeam = leagueTeams?.find((t: FantasyLeagueTeamsResponse) => t.id === selectedTeamId);

    const handleSlotClick = (slot: Slot) => {
      if (slot.player) {
        setStatsSlot(slot);
      } else if (isViewingOwnTeam) {
        setSelectedSlot(slot);
        setIsModalOpen(true);
      }
    };
    const userTeamId = userTeam.id;

    const { data: slots, isLoading, refetch, isError, error } = useRoster({ userTeamId: selectedTeamId, seasonYear });

    const starters = useMemo(() => slots?.filter((s: Slot) => s.slotType === 'starter') || [], [slots]);
    const bench = useMemo(() => slots?.filter((s: Slot) => s.slotType === 'bench') || [], [slots]);
  
    if (isLoading) return <Loading message="Carregando time..." />;

    if (isError) return (
      <Alert severity="error">
        {error instanceof Error ? error.message : 'Algo deu errado ao carregar o time.'}
      </Alert>
    );

    return (
      <Stack spacing={3}>
        {leagueTeams && leagueTeams.length > 1 && (
          <Box sx={{ overflowX: 'auto', pb: 1 }}>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'nowrap' }}>
              {leagueTeams.map((team: FantasyLeagueTeamsResponse) => (
                <Chip
                  key={team.id}
                  label={team.id === userTeam.id ? `${team.name} (Meu Time)` : team.name}
                  onClick={() => setSelectedTeamId(team.id)}
                  color="primary"
                  variant={team.id === selectedTeamId ? 'filled' : 'outlined'}
                  sx={{ whiteSpace: 'nowrap' }}
                />
              ))}
            </Stack>
          </Box>
        )}

        {!isViewingOwnTeam && viewedTeam && (
          <Typography variant="body2" color="text.secondary">
            Time de {viewedTeam.user.firstName} {viewedTeam.user.lastName}
          </Typography>
        )}

          <>
            <Typography variant="h6" fontWeight="bold">Titulares</Typography>
            <Stack spacing={1}>
              {starters.map((slot: Slot) => (
                <Paper
                  onClick={() => handleSlotClick(slot)}
                  sx={{ cursor: slot.player || isViewingOwnTeam ? 'pointer' : 'default' }}
                >
                  <SlotCard
                    key={slot.index}
                    slotType={slot.slotType}
                    allowedPositions={slot.allowedPositions as RosterSlotCard[]}
                    player={slot.player}
                    slot={slot}
                    opponentInfo={slot.player?.team?.id != null && realMatches ? getOpponentForTeam(realMatches, slot.player.team.id) : null}
                  />
                </Paper>
              ))}
            </Stack>

            <Typography variant="h6" fontWeight="bold" mt={3}>Reservas</Typography>
            <Stack spacing={1}>
              {bench.map((slot: Slot) => (
                <Paper
                  onClick={() => handleSlotClick(slot)}
                  sx={{ cursor: slot.player || isViewingOwnTeam ? 'pointer' : 'default' }}
                >
                  <SlotCard
                    key={slot.index}
                    slotType={slot.slotType}
                    allowedPositions={slot.allowedPositions as RosterSlotCard[]}
                    player={slot.player}
                    slot={slot}
                    opponentInfo={slot.player?.team?.id != null && realMatches ? getOpponentForTeam(realMatches, slot.player.team.id) : null}
                  />
                </Paper>
              ))}
            </Stack>
          </>

      <PlayerStatsModal
        playerId={statsSlot?.player?.id ?? null}
        playerName={statsSlot?.player?.name}
        playerPhoto={statsSlot?.player?.photo}
        seasonId={seasonId}
        numberOfRounds={season?.numberOfRounds ?? undefined}
        onClose={() => setStatsSlot(null)}
        slotId={isViewingOwnTeam ? statsSlot?.id : undefined}
        isOwner={isViewingOwnTeam}
        isLocked={
          statsSlot?.player?.team?.id != null &&
          lockedTeamIds.has(statsSlot.player.team.id)
        }
        onMove={() => {
          if (statsSlot) setOriginIndex(statsSlot.index);
          setStatsSlot(null);
          setMoveOpen(true);
        }}
        refetch={refetch}
      />

      {isViewingOwnTeam && (
        <>
          <PlayerSelectModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelectPlayer={() => {
              setIsModalOpen(false);
            }}
            fantasyLeague={fantasyLeague}
            allowedPositions={selectedSlot?.allowedPositions || ['DEF', 'MEI', 'ATA']}
            userTeamId={userTeamId}
            seasonYear={seasonYear}
            slot={selectedSlot?.slot}
            slotType={selectedSlot?.slotType}
            refetch={refetch}
            targetSlotIndex={selectedSlot?.index}
          />

          {originIndex !== null && (
            <MovePlayerModal
              open={moveOpen}
              onClose={() => setMoveOpen(false)}
              slots={slots || []}
              originIndex={originIndex}
              userTeamId={userTeam.id}
              seasonYear={seasonYear}
              refetch={refetch}
            />
          )}

        </>
      )}
      </Stack>
    );
  };
