import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Alert,
  Avatar,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFantasyLeagueTeams } from '../api/fantasyLeagueQueries';
import { useRoster } from './userTeamRosterQueries';
import { useProposeTrade, TradeLegInput } from '../api/tradeQueries';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import { POSITION_SLOT_MAP } from '../utils/positions';

interface Props {
  open: boolean;
  onClose: () => void;
  fantasyLeague: FantasyLeague;
  myUserTeamId: number;
  seasonId: string;
  seasonYear: number;
}

interface LegDraft {
  senderTeamId: number;
  receiverTeamId: number;
  playerId: number | '';
  receiverPlayerId: number | '';
  dropPlayerId: number | '';
}


// Sub-component: player selector from a given team's roster
const PlayerSelectRow: React.FC<{
  teamId: number;
  seasonYear: number;
  value: number | '';
  onChange: (playerId: number | '') => void;
  label: string;
  excludePlayerIds?: number[];
}> = ({ teamId, seasonYear, value, onChange, label, excludePlayerIds = [] }) => {
  const { data: roster = [] } = useRoster({ userTeamId: teamId, seasonYear });
  const occupied = roster.filter(
    (s: any) => s.player && !excludePlayerIds.includes(s.player.id),
  );

  return (
    <FormControl fullWidth size="small">
      <InputLabel>{label}</InputLabel>
      <Select
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as number | '')}
      >
        <MenuItem value=""><em>Selecionar jogador</em></MenuItem>
        {occupied.map((slot: any) => (
          <MenuItem key={slot.player.id} value={slot.player.id}>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src={slot.player.photo} sx={{ width: 24, height: 24 }} />
              <Typography variant="body2">{slot.player.name}</Typography>
              <Chip label={slot.player.position} size="small" sx={{ ml: 'auto' }} />
            </Box>
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

// Sub-component: drop selector shown when proposer has no free slot for incoming player
const DropSelector: React.FC<{
  myUserTeamId: number;
  seasonYear: number;
  incomingPosition: string;
  outgoingPlayerIds: number[];
  value: number | '';
  onChange: (id: number | '') => void;
}> = ({ myUserTeamId, seasonYear, incomingPosition, outgoingPlayerIds, value, onChange }) => {
  const { data: roster = [] } = useRoster({ userTeamId: myUserTeamId, seasonYear });

  const compatibleSlots = POSITION_SLOT_MAP[incomingPosition] ?? [];

  const hasOpenSlot = roster.some((s: any) => {
    const free = !s.player || outgoingPlayerIds.includes(s.player?.id);
    return free && s.allowedPositions?.some((p: string) => compatibleSlots.includes(p));
  });

  if (hasOpenSlot) return null;

  const droppable = roster.filter(
    (s: any) =>
      s.player &&
      !outgoingPlayerIds.includes(s.player.id) &&
      s.allowedPositions?.some((p: string) => compatibleSlots.includes(p)),
  );

  return (
    <Box mt={1}>
      <Alert severity="warning" sx={{ mb: 1 }}>
        Você não tem vaga disponível para este jogador. Selecione um para liberar caso a troca seja concluída.
      </Alert>
      <FormControl fullWidth size="small">
        <InputLabel>Liberar ao receber</InputLabel>
        <Select
          value={value}
          label="Liberar ao receber"
          onChange={(e) => onChange(e.target.value as number | '')}
        >
          <MenuItem value=""><em>Selecionar jogador para liberar</em></MenuItem>
          {droppable.map((s: any) => (
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
  );
};

// Tiny hook to get a player's position from the roster
const usePlayerPosition = (teamId: number, seasonYear: number, playerId: number | '') => {
  const { data: roster = [] } = useRoster({ userTeamId: teamId, seasonYear });
  if (!playerId) return null;
  const slot = roster.find((s: any) => s.player?.id === playerId);
  return slot?.player?.position ?? null;
};

const LegRow: React.FC<{
  leg: LegDraft;
  index: number;
  otherTeams: { id: number; name: string; user?: { firstName: string; lastName: string } }[];
  myUserTeamId: number;
  seasonYear: number;
  allLegs: LegDraft[];
  onChange: (patch: Partial<LegDraft>) => void;
  onRemove: () => void;
  showRemove: boolean;
}> = ({ leg, index, otherTeams, myUserTeamId, seasonYear, allLegs, onChange, onRemove, showRemove }) => {
  // outgoing player IDs from all legs (so their slots count as free)
  const outgoingPlayerIds = allLegs
    .map((l) => l.playerId)
    .filter((id): id is number => !!id);

  const receiverPosition = usePlayerPosition(leg.receiverTeamId || 0, seasonYear, leg.receiverPlayerId);

  return (
    <Box mb={3}>
      {index > 0 && <Divider sx={{ mb: 2 }} />}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="subtitle2">Troca {index + 1}</Typography>
        {showRemove && (
          <IconButton size="small" onClick={onRemove}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <FormControl fullWidth size="small" sx={{ mb: 1.5 }}>
        <InputLabel>Trocar com</InputLabel>
        <Select
          value={leg.receiverTeamId || ''}
          label="Trocar com"
          onChange={(e) => onChange({ receiverTeamId: Number(e.target.value), receiverPlayerId: '', dropPlayerId: '' })}
        >
          {otherTeams.map((t) => (
            <MenuItem key={t.id} value={t.id}>
              {t.name} ({t.user?.firstName} {t.user?.lastName})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" gap={1} alignItems="center">
        <Box flex={1}>
          <PlayerSelectRow
            teamId={myUserTeamId}
            seasonYear={seasonYear}
            value={leg.playerId}
            onChange={(v) => onChange({ playerId: v })}
            label="Você envia"
          />
        </Box>
        <Typography sx={{ px: 1 }}>⇄</Typography>
        <Box flex={1}>
          {leg.receiverTeamId ? (
            <PlayerSelectRow
              teamId={leg.receiverTeamId}
              seasonYear={seasonYear}
              value={leg.receiverPlayerId}
              onChange={(v) => onChange({ receiverPlayerId: v, dropPlayerId: '' })}
              label="Você recebe"
            />
          ) : (
            <Typography variant="body2" color="text.secondary">Selecione um time primeiro</Typography>
          )}
        </Box>
      </Box>

      {leg.receiverPlayerId && receiverPosition && (
        <DropSelector
          myUserTeamId={myUserTeamId}
          seasonYear={seasonYear}
          incomingPosition={receiverPosition}
          outgoingPlayerIds={outgoingPlayerIds}
          value={leg.dropPlayerId}
          onChange={(v) => onChange({ dropPlayerId: v })}
        />
      )}
    </Box>
  );
};

const ProposeTradeModal: React.FC<Props> = ({
  open,
  onClose,
  fantasyLeague,
  myUserTeamId,
  seasonId,
  seasonYear,
}) => {
  const { data: allTeams = [] } = useFantasyLeagueTeams(fantasyLeague.id);
  const otherTeams = allTeams.filter((t) => t.id !== myUserTeamId);

  const emptyLeg = (): LegDraft => ({
    senderTeamId: myUserTeamId,
    receiverTeamId: otherTeams[0]?.id ?? 0,
    playerId: '',
    receiverPlayerId: '',
    dropPlayerId: '',
  });

  const [legs, setLegs] = useState<LegDraft[]>([emptyLeg()]);
  const [error, setError] = useState<string | null>(null);

  const proposeTrade = useProposeTrade(seasonId);

  const updateLeg = (i: number, patch: Partial<LegDraft>) =>
    setLegs((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const handleSubmit = () => {
    setError(null);

    const tradeLegs: TradeLegInput[] = [];
    for (const leg of legs) {
      if (!leg.playerId) { setError('Selecione um jogador para enviar em cada troca'); return; }
      if (!leg.receiverPlayerId) { setError('Selecione um jogador para receber em cada troca'); return; }
      if (!leg.receiverTeamId) { setError('Selecione um time para trocar em cada troca'); return; }

      // My player goes to them
      tradeLegs.push({
        senderTeamId: myUserTeamId,
        receiverTeamId: leg.receiverTeamId,
        playerId: leg.playerId as number,
      });
      // Their player comes to me — attach dropPlayerId if I need to free a slot
      tradeLegs.push({
        senderTeamId: leg.receiverTeamId,
        receiverTeamId: myUserTeamId,
        playerId: leg.receiverPlayerId as number,
        dropPlayerId: leg.dropPlayerId ? (leg.dropPlayerId as number) : undefined,
      });
    }

    proposeTrade.mutate(
      { seasonId, proposedByUserTeamId: myUserTeamId, legs: tradeLegs },
      {
        onSuccess: () => {
          setLegs([emptyLeg()]);
          onClose();
        },
        onError: (err: any) => {
          setError(err?.response?.data?.message ?? err.message ?? 'Erro ao propor troca');
        },
      },
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Propor Troca</DialogTitle>
      <DialogContent dividers>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {legs.map((leg, i) => (
          <LegRow
            key={i}
            leg={leg}
            index={i}
            otherTeams={otherTeams}
            myUserTeamId={myUserTeamId}
            seasonYear={seasonYear}
            allLegs={legs}
            onChange={(patch) => updateLeg(i, patch)}
            onRemove={() => setLegs((prev) => prev.filter((_, idx) => idx !== i))}
            showRemove={legs.length > 1}
          />
        ))}

      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={proposeTrade.isPending}
        >
          {proposeTrade.isPending ? 'Enviando...' : 'Propor Troca'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProposeTradeModal;
