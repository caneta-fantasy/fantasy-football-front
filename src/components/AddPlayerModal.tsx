import React, { useMemo, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  List, ListItemButton, ListItemText, ListItemAvatar,
  Avatar, Chip, Stack, Button, Typography, Alert, Divider,
} from '@mui/material';
import { useAddPlayer, useReplacePlayer } from '../api/userTeamRosterMutations';
import { mapPositionToSlot, RosterSlot } from '../utils/positions';
import { POSITIONS_TRANSLATION } from './PlayerSelectModal';

type SlotType = 'starter' | 'bench';

export type UISlot = {
  index: number;
  slot: 'GK' | 'DEF' | 'MEI' | 'ATA' | 'FLEX';
  slotType: SlotType;
  allowedPositions: RosterSlot[];
  player: null | {
    id: number;
    name: string;
    photo: string;
    position: 'Goalkeeper' | 'Defense' | 'Defender' | 'Midfielder' | 'Attacker';
    team: { code: string };
  };
};

type AddPlayerModalProps = {
  open: boolean;
  onClose: () => void;
  slots: UISlot[];
  userTeamId: number;
  seasonYear: number;
  player: {
    id: number;
    name: string;
    photo: string;
    position: 'Goalkeeper' | 'Defense' | 'Defender' | 'Midfielder' | 'Attacker';
    teamCode?: string;
  };
  refetch: () => void;
};

const labelFor = (slot: UISlot['slot'], allowed: RosterSlot[]) => {
  if (slot !== 'FLEX') return slot;
  return allowed.includes('MEI') && allowed.includes('ATA') ? 'M/A' : 'FLEX';
};

export default function AddPlayerModal({
  open, onClose, slots, userTeamId, seasonYear, player, refetch,
}: AddPlayerModalProps) {
  const [error, setError] = useState<string | null>(null);
  const [pendingSlot, setPendingSlot] = useState<UISlot | null>(null);

  const playerSlot = mapPositionToSlot(player.position);

  const legalTargets = useMemo(
    () => (playerSlot ? slots.filter((s) => s.allowedPositions.includes(playerSlot)) : []),
    [slots, playerSlot],
  );

  const emptyTargets = useMemo(() => legalTargets.filter((s) => !s.player), [legalTargets]);
  const occupiedTargets = useMemo(() => legalTargets.filter((s) => !!s.player), [legalTargets]);

  const handleSuccess = () => {
    setError(null);
    setPendingSlot(null);
    refetch();
    onClose();
  };

  const handleError = (e: any) => {
    setError(e?.response?.data?.message ?? 'Erro ao adicionar jogador.');
  };

  const { mutate: addPlayer } = useAddPlayer({ onSuccess: handleSuccess });
  const { mutate: replacePlayer } = useReplacePlayer({ onSuccess: handleSuccess, onError: handleError });

  const handleAdd = (slot: UISlot) => {
    setError(null);
    addPlayer(
      { body: { userTeamId, seasonYear, playerId: player.id, targetSlotIndex: slot.index, slot: slot.slot, slotType: slot.slotType } },
      { onError: handleError },
    );
  };

  const handleReplaceConfirm = () => {
    if (!pendingSlot) return;
    setError(null);
    replacePlayer({ body: { userTeamId, seasonYear, playerId: player.id, targetSlotIndex: pendingSlot.index } });
  };

  const handleClose = () => {
    setError(null);
    setPendingSlot(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Adicionar jogador</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={player.photo} />
            <div>
              <Typography fontWeight={700}>{player.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {POSITIONS_TRANSLATION[player.position as keyof typeof POSITIONS_TRANSLATION]}
              </Typography>
              {!!player.teamCode && (
                <Typography variant="body2" color="text.secondary">
                  {player.teamCode}
                </Typography>
              )}
            </div>
          </Stack>

          {error && <Alert severity="error">{error}</Alert>}

          {pendingSlot && (
            <Alert
              severity="warning"
              action={
                <Stack direction="row" spacing={1}>
                  <Button size="small" color="inherit" onClick={() => setPendingSlot(null)}>
                    Cancelar
                  </Button>
                  <Button size="small" color="warning" variant="contained" onClick={handleReplaceConfirm}>
                    Confirmar
                  </Button>
                </Stack>
              }
            >
              <strong>{pendingSlot.player?.name}</strong> será liberado para o mercado.
            </Alert>
          )}

          {legalTargets.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }}>
              Não há vagas compatíveis para este jogador.
            </Typography>
          ) : (
            <>
              {emptyTargets.length > 0 && (
                <>
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Selecionar vaga
                  </Typography>
                  <List dense>
                    {emptyTargets.map((slot) => (
                      <ListItemButton key={slot.index} onClick={() => handleAdd(slot)}>
                        <ListItemAvatar>
                          <Avatar />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={`${labelFor(slot.slot, slot.allowedPositions)} • ${slot.slotType === 'starter' ? 'Titular' : 'Reserva'}`}
                              />
                              <Typography sx={{ ml: 1 }}>Vaga vazia</Typography>
                            </Stack>
                          }
                          secondary="Disponível"
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </>
              )}

              {occupiedTargets.length > 0 && (
                <>
                  {emptyTargets.length > 0 && <Divider />}
                  <Typography variant="subtitle2" sx={{ mt: 1 }}>
                    Substituir jogador
                  </Typography>
                  <List dense>
                    {occupiedTargets.map((slot) => (
                      <ListItemButton
                        key={slot.index}
                        onClick={() => setPendingSlot(slot)}
                        selected={pendingSlot?.index === slot.index}
                      >
                        <ListItemAvatar>
                          <Avatar src={slot.player!.photo} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                color="warning"
                                variant="outlined"
                                label={`${labelFor(slot.slot, slot.allowedPositions)} • ${slot.slotType === 'starter' ? 'Titular' : 'Reserva'}`}
                              />
                              <Typography sx={{ ml: 1 }}>{slot.player!.name}</Typography>
                            </Stack>
                          }
                          secondary={`${POSITIONS_TRANSLATION[slot.player!.position as keyof typeof POSITIONS_TRANSLATION]} • ${slot.player!.team.code} — Será liberado`}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </>
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
      </DialogActions>
    </Dialog>
  );
}
