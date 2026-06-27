import { useMemo } from 'react';
import { getToken } from '../utils/session';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Box, CircularProgress, Divider, Stack, Typography, Alert } from '@mui/material';
import { DraftPick } from '../api/draftQueries';
import { Slot } from './userTeamRosterQueries';
import { SlotCard, RosterSlotCard } from './SlotCard';
import { mapPositionToSlot } from '../utils/positions';
import { apiConfig } from '../api/config';

interface Props {
  picks: DraftPick[];
  myUserTeamId: number | undefined;
  totalRounds: number;
  seasonYear: number;
}

type SlotWithNullablePlayer = Omit<Slot, 'player'> & { player: Slot['player'] | null };

function assignPicksToSlots(slots: Slot[], myPicks: DraftPick[]): SlotWithNullablePlayer[] {
  const usedPickIds = new Set<string>();

  return slots.map((slot) => {
    const isBench = slot.slotType === 'bench';

    const match = myPicks.find((p) => {
      if (usedPickIds.has(p.id)) return false;
      if (isBench) return true;
      const slotCode = mapPositionToSlot(p.player!.position);
      if (!slotCode) return false;
      return (slot.allowedPositions as string[]).includes(slotCode);
    });

    if (match) {
      usedPickIds.add(match.id);
      return {
        ...slot,
        player: {
          id: match.player!.id,
          name: match.player!.name,
          photo: match.player!.photo,
          position: match.player!.position,
          team: { id: 0, name: '', code: '' },
        },
      };
    }

    return { ...slot, player: null };
  });
}

export default function DraftMyTeam({ picks, myUserTeamId, totalRounds, seasonYear }: Props) {
  const { data: slots, isLoading, isError } = useQuery<Slot[]>({
    queryKey: ['virtual-roster', myUserTeamId, seasonYear],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.usersTeamsRoster.getRoster(myUserTeamId!, seasonYear),
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      return res.data;
    },
    enabled: !!myUserTeamId,
    retry: false,
  });

  const myPicks = useMemo(
    () => picks.filter((p) => p.userTeam?.id === myUserTeamId && p.player != null && !p.isGhost),
    [picks, myUserTeamId],
  );

  const filledSlots = useMemo(
    () => (slots ? assignPicksToSlots(slots, myPicks) : []),
    [slots, myPicks],
  );

  const starters = filledSlots.filter((s) => s.slotType === 'starter');
  const bench = filledSlots.filter((s) => s.slotType === 'bench');

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
        <Typography variant="subtitle2" fontWeight={700}>
          Meu Time
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {myPicks.length}/{totalRounds}
        </Typography>
      </Box>

      {isLoading && (
        <Box display="flex" justifyContent="center" py={2}>
          <CircularProgress size={20} />
        </Box>
      )}

      {isError && (
        <Alert severity="warning" sx={{ fontSize: 12, py: 0.5 }}>
          Configurações do elenco não encontradas.
        </Alert>
      )}

      {!isLoading && !isError && (
        <>
          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
            TITULARES
          </Typography>
          <Stack spacing={0.5} mb={1.5}>
            {starters.map((slot) => (
              <SlotCard
                key={slot.id}
                slotType={slot.slotType}
                allowedPositions={slot.allowedPositions as RosterSlotCard[]}
                player={slot.player ?? null}
                slot={slot as Slot}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" mb={0.5}>
            RESERVAS
          </Typography>
          <Stack spacing={0.5}>
            {bench.map((slot) => (
              <SlotCard
                key={slot.id}
                slotType={slot.slotType}
                allowedPositions={slot.allowedPositions as RosterSlotCard[]}
                player={slot.player ?? null}
                slot={slot as Slot}
              />
            ))}
          </Stack>
        </>
      )}
    </Box>
  );
}
