import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Avatar, Box, TextField, Alert,
  FormControl, InputLabel, Select, MenuItem, Divider,
} from '@mui/material';
import { usePlaceWaiverClaim } from '../api/waiverQueries';
import { Slot } from './userTeamRosterQueries';
import { mapPositionToSlot } from '../utils/positions';

interface Props {
  open: boolean;
  onClose: () => void;
  seasonId: string;
  userTeamId: number;
  remainingBudget: number;
  targetPlayer: { id: number; name: string; photo: string; position: string };
  rosterSlots: Slot[];
  pendingDropPlayerIds: Set<number>;
  onSuccess: () => void;
}

export default function WaiverClaimModal({
  open, onClose, seasonId, userTeamId, remainingBudget,
  targetPlayer, rosterSlots, pendingDropPlayerIds, onSuccess,
}: Props) {
  const [bidAmount, setBidAmount] = useState<string>('');
  const [dropPlayerId, setDropPlayerId] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  const placeClaim = usePlaceWaiverClaim();

  const targetSlot = mapPositionToSlot(targetPlayer.position);
  const droppableSlots = rosterSlots.filter(
    (s) =>
      s.player != null &&
      targetSlot != null &&
      s.allowedPositions.includes(targetSlot) &&
      !pendingDropPlayerIds.has(s.player.id),
  );

  const handleSubmit = async () => {
    setError(null);
    const bid = parseFloat(bidAmount);
    if (isNaN(bid) || bid <= 0) {
      setError('Informe um valor de lance válido maior que 0.');
      return;
    }
    if (bid > remainingBudget) {
      setError(`Oferta excede seu orçamento disponível (R$ ${remainingBudget}).`);
      return;
    }

    try {
      await placeClaim.mutateAsync({
        seasonId,
        userTeamId,
        targetPlayerId: targetPlayer.id,
        dropPlayerId: dropPlayerId !== '' ? dropPlayerId : undefined,
        bidAmount: bid,
      });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Erro ao registrar reivindicação.');
    }
  };

  const handleClose = () => {
    setBidAmount('');
    setDropPlayerId('');
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Reivindicar Jogador</DialogTitle>
      <DialogContent>
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Avatar src={targetPlayer.photo} sx={{ width: 48, height: 48 }} />
          <Box>
            <Typography fontWeight={700}>{targetPlayer.name}</Typography>
            <Typography variant="caption" color="text.secondary">{targetPlayer.position}</Typography>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" mb={2}>
          Orçamento disponível: <strong>R$ {remainingBudget}</strong>
        </Typography>

        <TextField
          label="Oferta (R$)"
          type="number"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          inputProps={{ min: 1, max: remainingBudget, step: 1 }}
          fullWidth
          sx={{ mb: 2 }}
        />

        {droppableSlots.length > 0 && (
          <>
            <Divider sx={{ mb: 2 }} />
            <FormControl fullWidth sx={{ mb: 1 }}>
              <InputLabel id="drop-label">Liberar jogador (opcional)</InputLabel>
              <Select
                labelId="drop-label"
                value={dropPlayerId}
                label="Liberar jogador (opcional)"
                onChange={(e) => setDropPlayerId(e.target.value as number | '')}
              >
                <MenuItem value="">Nenhum</MenuItem>
                {droppableSlots.map((slot) => (
                  <MenuItem key={slot.player!.id} value={slot.player!.id}>
                    {slot.player!.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Necessário se seu elenco estiver cheio.
            </Typography>
          </>
        )}

        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={placeClaim.isPending}
        >
          Confirmar Oferta
        </Button>
      </DialogActions>
    </Dialog>
  );
}
