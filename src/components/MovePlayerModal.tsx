// src/components/MovePlayerModal.tsx
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemButton, ListItemText, ListItemAvatar,
  Avatar, Chip, Stack, Button, Typography, Alert
} from '@mui/material';
import { useMovePlayer } from '../api/userTeamRosterMutations';
import { mapPositionToSlot, RosterSlot } from '../utils/positions';
import { POSITIONS_TRANSLATION } from '../utils/positions';
import Loading from './Loading';

type SlotType = 'starter' | 'bench';

type UISlot = {
  index: number;
  slot: 'DEF' | 'MEI' | 'ATA' | 'FLEX';
  slotType: SlotType;
  allowedPositions: RosterSlot[];
  player: null | {
    id: number;
    name: string;
    photo: string;
    position: 'Defense' | 'Midfielder' | 'Attacker';
    team: { code: string };
  };
};

interface MovePlayerModalProps {
  open: boolean;
  onClose: () => void;
  slots: UISlot[];
  originIndex: number;
  userTeamId: number;
  seasonYear: number;
  refetch: () => void;
}

export default function MovePlayerModal({
  open, onClose, slots, originIndex, userTeamId, seasonYear, refetch,
}: MovePlayerModalProps) {
  // 🔒 Snapshot origin at open-time so re-renders after move don't break
  const [originSnapshot, setOriginSnapshot] = useState<{
    player: NonNullable<UISlot['player']>;
    allowedPositions: RosterSlot[];
    slotType: SlotType;
    index: number;
    labelSlot: UISlot['slot'];
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    const origin = slots.find(s => s.index === originIndex);
    if (origin?.player) {
      setOriginSnapshot({
        player: origin.player,
        allowedPositions: origin.allowedPositions,
        slotType: origin.slotType,
        index: origin.index,
        labelSlot: origin.slot,
      });
    } else {
      // Origin unexpectedly empty -> just close gracefully
      setOriginSnapshot(null);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, originIndex]); // don't depend on slots to keep snapshot stable

  const [error, setError] = useState<string | null>(null);

  const { mutate: movePlayer, isPending: isMovingPlayer, isError: isMovingPlayerError, error: movingPlayerError} = useMovePlayer({
    onSuccess: () => {
      refetch();
      onClose();
    },
  });

  if (!originSnapshot) return null;

  if (isMovingPlayer) return <Loading message="Movendo jogador..." />;
  if (isMovingPlayerError) return (
    <Alert severity="error">
      {typeof movingPlayerError === 'object' && movingPlayerError !== null && 'message' in movingPlayerError
        ? (movingPlayerError as { message: string }).message
        : 'Algo deu errado ao mover o jogador.'}
    </Alert>
  );

  const originPos = mapPositionToSlot(originSnapshot.player.position);

  const legalTargets = slots
  .filter(s => s.index !== originSnapshot.index)
  .filter(s => {
    if (!originPos) return false;
    if (!s.player) return s.allowedPositions.includes(originPos);
    const targetPos = mapPositionToSlot(s.player.position);
    const originCanGoThere = s.allowedPositions.includes(originPos);
    const targetCanComeHere = targetPos ? originSnapshot.allowedPositions.includes(targetPos) : false;
    return originCanGoThere && targetCanComeHere;
  });

  const handleMove = (targetIndex: number) => {
    setError(null);
    movePlayer(
      { userTeamId, seasonYear, originSlotIndex: originSnapshot.index, targetSlotIndex: targetIndex },
      { onError: (e: any) => setError(e?.response?.data?.message ?? 'Não foi possível mover o jogador.') }
    );
  };

// small helper
const labelFor = (slot: UISlot['slot'], allowed: RosterSlot[]) => {
  if (slot !== 'FLEX') return slot;
  return allowed.includes('MEI') && allowed.includes('ATA') ? 'M/A' : 'FLEX';
};


  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Mover jogador</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={originSnapshot.player.photo} />
            <div>
              <Typography fontWeight={700}>{originSnapshot.player.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {POSITIONS_TRANSLATION[originSnapshot.player.position as keyof typeof POSITIONS_TRANSLATION]}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {originSnapshot.player.team.code}
              </Typography>
            </div>
            <Chip
              label={`${labelFor(originSnapshot.labelSlot, originSnapshot.allowedPositions)} • ${
                originSnapshot.slotType === 'starter' ? 'Titular' : 'Reserva'
              }`}
            />
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          <Typography variant="subtitle2" sx={{ mt: 1 }}>Mover para</Typography>
          <List dense>
            {legalTargets.map((s) => (
              <ListItemButton key={s.index} onClick={() => handleMove(s.index)}>
                <ListItemAvatar>
                  {s.player ? <Avatar src={s.player.photo} /> : <Avatar />}
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        label={`${labelFor(s.slot, s.allowedPositions)} • ${s.slotType === 'starter' ? 'Titular' : 'Reserva'}`}
                      />
                      <Typography sx={{ ml: 1 }}>
                        {s.player ? s.player.name : 'Vaga vazia'}
                      </Typography>
                    </Stack>
                  }
                  secondary={s.player ? `${POSITIONS_TRANSLATION[s.player.position as keyof typeof POSITIONS_TRANSLATION]} - ${s.player.team.code}` : 'Disponível'}
                />
              </ListItemButton>
            ))}

            {legalTargets.length === 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
                Nenhum destino válido para este jogador.
              </Typography>
            )}
          </List>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} >Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
