import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Avatar,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { Trade, TradeLeg, useAcceptTrade, DropPlayerForLeg } from '../api/tradeQueries';
import { POSITION_SLOT_MAP } from '../utils/positions';
import { useRoster } from './userTeamRosterQueries';

interface Props {
  open: boolean;
  onClose: () => void;
  trade: Trade;
  myUserTeamId: number;
  seasonId: string;
  seasonYear: number;
}

const IncomingLegRow: React.FC<{
  leg: TradeLeg;
  myUserTeamId: number;
  seasonYear: number;
  dropPlayerId: number | null;
  onDropChange: (playerId: number | null) => void;
  outgoingPlayerIds: number[];
}> = ({ leg, myUserTeamId, seasonYear, dropPlayerId, onDropChange, outgoingPlayerIds }) => {
  const { data: roster = [] } = useRoster({ userTeamId: myUserTeamId, seasonYear });

  const compatibleSlots = POSITION_SLOT_MAP[leg.player.position] ?? [];

  // A slot is available if it's empty OR the player in it is being traded away
  const hasOpenSlot = roster.some((s: any) => {
    const slotFree = !s.player || outgoingPlayerIds.includes(s.player?.id);
    return slotFree && s.allowedPositions?.some((p: string) => compatibleSlots.includes(p));
  });

  const occupied = roster.filter(
    (s: any) => s.player && !outgoingPlayerIds.includes(s.player?.id),
  );
  const samePositionOccupied = occupied.filter((s: any) =>
    s.allowedPositions?.some((p: string) => compatibleSlots.includes(p)),
  );

  return (
    <Box mb={2}>
      <Box display="flex" alignItems="center" gap={1} mb={1}>
        <Avatar src={leg.player.photo} sx={{ width: 32, height: 32 }} />
        <Box>
          <Typography variant="body2" fontWeight={600}>{leg.player.name}</Typography>
          <Typography variant="caption" color="text.secondary">
            {leg.player.position} · de {leg.senderTeam.name}
          </Typography>
        </Box>
        <Chip label={leg.player.position} size="small" sx={{ ml: 'auto' }} />
      </Box>

      {!hasOpenSlot && (
        <Box>
          <Alert severity="warning" sx={{ mb: 1 }}>
            Não há vaga disponível para este jogador — selecione um para liberar.
          </Alert>
          <FormControl fullWidth size="small">
            <InputLabel>Liberar jogador</InputLabel>
            <Select
              value={dropPlayerId ?? ''}
              label="Liberar jogador"
              onChange={(e) => onDropChange(e.target.value ? Number(e.target.value) : null)}
            >
              <MenuItem value=""><em>Selecionar jogador para liberar</em></MenuItem>
              {samePositionOccupied.map((s: any) => (
                <MenuItem key={s.player.id} value={s.player.id}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={s.player.photo} sx={{ width: 20, height: 20 }} />
                    <Typography variant="body2">{s.player.name}</Typography>
                    <Chip label={s.slot} size="small" sx={{ ml: 'auto' }} />
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}
    </Box>
  );
};

const AcceptTradeModal: React.FC<Props> = ({
  open,
  onClose,
  trade,
  myUserTeamId,
  seasonId,
  seasonYear,
}) => {
  const [dropMap, setDropMap] = useState<Record<number, number | null>>({});
  const [error, setError] = useState<string | null>(null);

  const acceptTrade = useAcceptTrade(seasonId);

  const incomingLegs = trade.legs.filter((l) => l.receiverTeam.id === myUserTeamId);
  const outgoingLegs = trade.legs.filter((l) => l.senderTeam.id === myUserTeamId);

  const handleAccept = () => {
    setError(null);
    const dropPlayers: DropPlayerForLeg[] = Object.entries(dropMap)
      .filter(([, dropId]) => dropId != null)
      .map(([playerId, dropPlayerId]) => ({ playerId: Number(playerId), dropPlayerId: dropPlayerId! }));

    acceptTrade.mutate(
      { tradeId: trade.id, userTeamId: myUserTeamId, dropPlayers },
      {
        onSuccess: () => onClose(),
        onError: (err: any) => {
          setError(err?.response?.data?.message ?? err.message ?? 'Erro ao aceitar troca');
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Revisar Troca</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Typography variant="subtitle2" gutterBottom>Você envia</Typography>
        {outgoingLegs.map((leg) => (
          <Box key={leg.id} display="flex" alignItems="center" gap={1} mb={1}>
            <Avatar src={leg.player.photo} sx={{ width: 28, height: 28 }} />
            <Typography variant="body2">{leg.player.name}</Typography>
            <Typography variant="caption" color="text.secondary">→ {leg.receiverTeam.name}</Typography>
          </Box>
        ))}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>Você recebe</Typography>
        {incomingLegs.map((leg) => (
          <IncomingLegRow
            key={leg.id}
            leg={leg}
            myUserTeamId={myUserTeamId}
            seasonYear={seasonYear}
            dropPlayerId={dropMap[leg.player.id] ?? null}
            onDropChange={(id) => setDropMap((prev) => ({ ...prev, [leg.player.id]: id }))}
            outgoingPlayerIds={outgoingLegs.map((l) => l.player.id)}
          />
        ))}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="success"
          onClick={handleAccept}
          disabled={acceptTrade.isPending}
        >
          {acceptTrade.isPending ? 'Aceitando...' : 'Aceitar Troca'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AcceptTradeModal;
