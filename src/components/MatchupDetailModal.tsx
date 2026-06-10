import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { FantasyMatchupDto, useMatchupRosterSnapshot, SnapshotSlotDto } from '../api/fantasyMatchupQueries';
import { useRoster, Slot } from './userTeamRosterQueries';
import { useRealMatchesByRound, RealMatchDto } from '../api/matchesQueries';
import { getOpponentForTeam, formatMatchTime, OpponentInfo } from '../utils/matchUtils';
import { usePointsByRound } from '../api/playerFantasyPointsQueries';
import PlayerStatsModal from './PlayerStatsModal';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  live: 'Ao Vivo',
  completed: 'Encerrado',
};

const STATUS_COLORS: Record<string, 'default' | 'warning' | 'success'> = {
  scheduled: 'default',
  live: 'warning',
  completed: 'success',
};

// ─── Live/Scheduled roster row ───────────────────────────────────────────────

function SlotRow({
  slot,
  realMatches,
  pointsMap,
  onPlayerClick,
}: {
  slot: Slot;
  realMatches?: RealMatchDto[];
  pointsMap?: Map<number, number>;
  onPlayerClick?: (slot: Slot, opponentInfo: OpponentInfo | null) => void;
}) {
  const label = slot.allowedPositions[0] ?? '?';
  const hasPlayer = !!slot.player;
  const opponentInfo = hasPlayer && slot.player.team?.id != null && realMatches
    ? getOpponentForTeam(realMatches, slot.player.team.id)
    : null;
  const points = hasPlayer && pointsMap ? pointsMap.get(slot.player.id) : undefined;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      py={0.5}
      onClick={() => hasPlayer && onPlayerClick?.(slot, opponentInfo)}
      sx={{ cursor: hasPlayer ? 'pointer' : 'default', borderRadius: 1, '&:hover': hasPlayer ? { bgcolor: 'action.hover' } : {} }}
    >
      <Chip label={label} size="small" variant="outlined" sx={{ width: 44, fontSize: 11 }} />
      {hasPlayer ? (
        <>
          <Avatar src={slot.player.photo} sx={{ width: 24, height: 24 }} />
          <Box flex={1}>
            <Typography variant="body2" noWrap>{slot.player.name}</Typography>
            {opponentInfo && (
              <Typography variant="caption" color="text.disabled" noWrap>
                x {opponentInfo.code} ({opponentInfo.isHome ? 'C' : 'V'})
                {formatMatchTime(opponentInfo.matchDate) && <> · {formatMatchTime(opponentInfo.matchDate)}</>}
              </Typography>
            )}
          </Box>
          {points != null && (
            <Typography variant="body2" fontWeight={700} color={points >= 0 ? 'success.main' : 'error.main'} sx={{ minWidth: 36, textAlign: 'right' }}>
              {points.toFixed(1)}
            </Typography>
          )}
        </>
      ) : (
        <Typography variant="body2" color="text.disabled">Vazio</Typography>
      )}
    </Box>
  );
}

function RosterColumn({
  teamId, seasonYear, realMatches, pointsMap, onPlayerClick,
}: {
  teamId: number | null;
  seasonYear?: number;
  realMatches?: RealMatchDto[];
  pointsMap?: Map<number, number>;
  onPlayerClick?: (slot: Slot, opponentInfo: OpponentInfo | null) => void;
}) {
  const { data: slots, isLoading } = useRoster({ userTeamId: teamId ?? undefined, seasonYear });
  const starters = slots ? [...slots].filter((s) => s.slotType === 'starter').sort((a, b) => a.index - b.index) : [];
  const bench = slots ? [...slots].filter((s) => s.slotType === 'bench').sort((a, b) => a.index - b.index) : [];

  return (
    <Box>
      {isLoading ? (
        <Box display="flex" justifyContent="center" py={4}><CircularProgress size={24} /></Box>
      ) : !teamId ? (
        <Typography variant="body2" color="text.disabled">Time fantasma</Typography>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Titulares</Typography>
          {starters.map((slot) => (
            <SlotRow key={slot.index} slot={slot} realMatches={realMatches} pointsMap={pointsMap} onPlayerClick={onPlayerClick} />
          ))}
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Reservas</Typography>
          {bench.map((slot) => (
            <SlotRow key={slot.index} slot={slot} realMatches={realMatches} pointsMap={pointsMap} onPlayerClick={onPlayerClick} />
          ))}
        </>
      )}
    </Box>
  );
}

// ─── Historical snapshot row ─────────────────────────────────────────────────

function SnapshotSlotRow({
  slot, realMatches, onPlayerClick,
}: {
  slot: SnapshotSlotDto;
  realMatches?: RealMatchDto[];
  onPlayerClick?: (playerId: number, playerName: string | null, opponentInfo: OpponentInfo | null) => void;
}) {
  const opponentInfo = slot.playerTeamId != null && realMatches
    ? getOpponentForTeam(realMatches, slot.playerTeamId)
    : null;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap={1}
      py={0.5}
      onClick={() => slot.playerName && onPlayerClick?.(slot.playerId, slot.playerName, opponentInfo)}
      sx={{ cursor: slot.playerName ? 'pointer' : 'default', borderRadius: 1, '&:hover': slot.playerName ? { bgcolor: 'action.hover' } : {} }}
    >
      <Chip label={slot.rosterSlot} size="small" variant="outlined" sx={{ width: 44, fontSize: 11 }} />
      {slot.playerName ? (
        <>
          <Avatar src={slot.playerPhoto ?? undefined} sx={{ width: 24, height: 24 }} />
          <Box flex={1}>
            <Typography variant="body2" noWrap>{slot.playerName}</Typography>
            {opponentInfo && (
              <Typography variant="caption" color="text.disabled" noWrap>
                x {opponentInfo.code} ({opponentInfo.isHome ? 'C' : 'V'})
              </Typography>
            )}
          </Box>
          <Typography variant="body2" fontWeight={700} color={slot.points >= 0 ? 'success.main' : 'error.main'} sx={{ minWidth: 36, textAlign: 'right' }}>
            {slot.points.toFixed(1)}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="text.disabled">Vazio</Typography>
      )}
    </Box>
  );
}

function SnapshotColumn({
  slots, realMatches, onPlayerClick,
}: {
  slots: SnapshotSlotDto[];
  realMatches?: RealMatchDto[];
  onPlayerClick?: (playerId: number, playerName: string | null, opponentInfo: OpponentInfo | null) => void;
}) {
  const starters = slots.filter((s) => s.slotType === 'starter').sort((a, b) => a.slotIndex - b.slotIndex);
  const bench = slots.filter((s) => s.slotType === 'bench').sort((a, b) => a.slotIndex - b.slotIndex);

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>Titulares</Typography>
      {starters.map((slot) => (
        <SnapshotSlotRow key={slot.slotIndex} slot={slot} realMatches={realMatches} onPlayerClick={onPlayerClick} />
      ))}
      {bench.length > 0 && (
        <>
          <Divider sx={{ my: 1 }} />
          <Typography variant="caption" color="text.secondary" fontWeight={600}>Reservas</Typography>
          {bench.map((slot) => (
            <SnapshotSlotRow key={slot.slotIndex} slot={slot} realMatches={realMatches} onPlayerClick={onPlayerClick} />
          ))}
        </>
      )}
    </Box>
  );
}

// ─── MatchupDetail (reusable inline content) ─────────────────────────────────

export interface MatchupDetailProps {
  matchup: FantasyMatchupDto;
  userTeamId?: number;
  seasonYear?: number;
  seasonId?: string;
}

export const MatchupDetail: React.FC<MatchupDetailProps> = ({ matchup, userTeamId, seasonYear, seasonId }) => {
  const isCompleted = matchup.status === 'completed';

  const { data: realMatches } = useRealMatchesByRound(seasonYear, matchup.roundNumber);
  const { data: pointsMap } = usePointsByRound(
    isCompleted ? undefined : seasonId,
    matchup.roundNumber,
  );
  const { data: snapshotData, isLoading: snapshotLoading } = useMatchupRosterSnapshot(
    isCompleted ? matchup.id : undefined,
  );

  const [statsSlot, setStatsSlot] = useState<{ id: number; name?: string; photo?: string; opponentInfo?: OpponentInfo | null } | null>(null);

  const leftTeamId = matchup.homeTeamId;
  const rightTeamId = matchup.awayTeamId;

  const leftSnapshot = snapshotData?.homeTeam;
  const rightSnapshot = snapshotData?.awayTeam;

  return (
    <>

      {/* Side-by-side rosters */}
      {isCompleted ? (
        snapshotLoading ? (
          <Box display="flex" justifyContent="center" py={4}><CircularProgress size={28} /></Box>
        ) : (
          <Box display="flex" gap={3} flexWrap="wrap">
            <Box flex={1} minWidth={200}>
              <SnapshotColumn
                slots={leftSnapshot?.slots ?? []}
                realMatches={realMatches}
                onPlayerClick={(id, name, opp) => setStatsSlot({ id, name: name ?? undefined, opponentInfo: opp })}
              />
            </Box>
            <Box flex={1} minWidth={200}>
              <SnapshotColumn
                slots={rightSnapshot?.slots ?? []}
                realMatches={realMatches}
                onPlayerClick={(id, name, opp) => setStatsSlot({ id, name: name ?? undefined, opponentInfo: opp })}
              />
            </Box>
          </Box>
        )
      ) : (
        <Box display="flex" gap={3} flexWrap="wrap">
          <Box flex={1} minWidth={200}>
            <RosterColumn
              teamId={leftTeamId}
              seasonYear={seasonYear}
              realMatches={realMatches}
              pointsMap={pointsMap}
              onPlayerClick={(slot, opp) => setStatsSlot({ id: slot.player?.id, name: slot.player?.name, photo: slot.player?.photo, opponentInfo: opp })}
            />
          </Box>
          <Box flex={1} minWidth={200}>
            <RosterColumn
              teamId={rightTeamId}
              seasonYear={seasonYear}
              realMatches={realMatches}
              pointsMap={pointsMap}
              onPlayerClick={(slot, opp) => setStatsSlot({ id: slot.player?.id, name: slot.player?.name, photo: slot.player?.photo, opponentInfo: opp })}
            />
          </Box>
        </Box>
      )}

      <PlayerStatsModal
        playerId={statsSlot?.id ?? null}
        playerName={statsSlot?.name}
        playerPhoto={statsSlot?.photo}
        seasonId={seasonId}
        roundFilter={matchup.roundNumber}
        opponentInfo={statsSlot?.opponentInfo}
        onClose={() => setStatsSlot(null)}
      />
    </>
  );
};

// ─── Modal wrapper (backward compat) ─────────────────────────────────────────

interface ModalProps {
  matchup: FantasyMatchupDto | null;
  onClose: () => void;
  userTeamId?: number;
  seasonYear?: number;
  seasonId?: string;
}

const MatchupDetailModal: React.FC<ModalProps> = ({ matchup, onClose, userTeamId, seasonYear, seasonId }) => (
  <Dialog open={!!matchup} onClose={onClose} fullWidth maxWidth="md">
    <DialogTitle>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={1}>
          <Typography fontWeight={700}>Rodada {matchup?.roundNumber}</Typography>
          {matchup && (
            <Chip
              label={STATUS_LABELS[matchup.status] ?? matchup.status}
              size="small"
              color={(STATUS_COLORS[matchup.status] ?? 'default') as any}
            />
          )}
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </Box>
      {matchup && (
        <Box display="flex" alignItems="center" justifyContent="center" gap={2} mt={1}>
          <Box sx={{ flex: 1, textAlign: 'right' }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {matchup.homeTeamName ?? 'Ghost'}
            </Typography>
            {matchup.homeOwnerName && (
              <Typography variant="caption" color="text.secondary">{matchup.homeOwnerName}</Typography>
            )}
          </Box>
          <Typography variant="h5" fontWeight={800} color="text.secondary" sx={{ minWidth: 80, textAlign: 'center' }}>
            {matchup.homeScore != null ? Number(matchup.homeScore).toFixed(1) : '—'} – {matchup.awayScore != null ? Number(matchup.awayScore).toFixed(1) : '—'}
          </Typography>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700} noWrap>
              {matchup.awayTeamName ?? 'Ghost'}
            </Typography>
            {matchup.awayOwnerName && (
              <Typography variant="caption" color="text.secondary">{matchup.awayOwnerName}</Typography>
            )}
          </Box>
        </Box>
      )}
    </DialogTitle>
    <DialogContent>
      {matchup && (
        <MatchupDetail
          matchup={matchup}
          userTeamId={userTeamId}
          seasonYear={seasonYear}
          seasonId={seasonId}
        />
      )}
    </DialogContent>
  </Dialog>
);

export default MatchupDetailModal;
