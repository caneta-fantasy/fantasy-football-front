import React, { useState, useMemo } from 'react';
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useScheduleBySeason, usePlayoffMatchups, FantasyMatchupDto } from '../api/fantasyMatchupQueries';
import { useRoundCalendar } from '../api/roundMappingQueries';
import { MatchupDetail } from './MatchupDetailModal';

interface Props {
  seasonId: string | undefined;
  userTeamId?: number;
  seasonYear?: number;
  currentRound?: number | null;
  playoffStartRound?: number | null;
  numberOfRounds?: number | null;
}

// Returns null when every round (regular + playoffs) is completed — season over
function detectCurrentRound(
  regularRounds: number[],
  playoffRounds: number[],
  regularSchedule: { roundNumber: number; matchups: FantasyMatchupDto[] }[],
  playoffMatchups: FantasyMatchupDto[],
): number | null {
  const activeRegular = regularSchedule.find((r) =>
    r.matchups.some((m) => m.status !== 'completed' && m.status !== 'bye'),
  );
  if (activeRegular) return activeRegular.roundNumber;
  for (const round of playoffRounds) {
    const matchups = playoffMatchups.filter((m) => m.roundNumber === round);
    // No matchups yet (bracket/stage not generated) → this round is next up
    if (matchups.length === 0) return round;
    if (matchups.some((m) => m.status !== 'completed' && m.status !== 'bye')) return round;
  }
  if (playoffRounds.length === 0) return regularRounds[regularRounds.length - 1] ?? null;
  return null;
}

// ─── Single matchup row: collapsed = score card, expanded = full detail ──────

const MatchupRow: React.FC<{
  matchup: FantasyMatchupDto;
  isExpanded: boolean;
  isHighlighted: boolean;
  onToggle: () => void;
  userTeamId?: number;
  seasonYear?: number;
  seasonId?: string;
}> = ({ matchup, isExpanded, isHighlighted, onToggle, userTeamId, seasonYear, seasonId }) => {
  const STATUS_COLORS: Record<string, string> = {
    scheduled: 'default',
    live: 'warning',
    completed: 'success',
  };
  const STATUS_LABELS: Record<string, string> = {
    scheduled: 'Agendado',
    live: 'Ao Vivo',
    completed: 'Encerrado',
  };

  const homeScore = matchup.homeScore != null ? Number(matchup.homeScore).toFixed(1) : '—';
  const awayScore = matchup.awayScore != null ? Number(matchup.awayScore).toFixed(1) : '—';

  return (
    <Paper
      variant="outlined"
      sx={{
        overflow: 'hidden',
        borderColor: isHighlighted ? 'primary.main' : undefined,
        borderWidth: isHighlighted ? 2 : 1,
      }}
    >
      {/* Header row — always visible, click to toggle */}
      <Box
        onClick={matchup.status !== 'bye' ? onToggle : undefined}
        sx={{
          display: 'flex',
          alignItems: 'center',
          px: 2,
          py: 1.25,
          cursor: matchup.status !== 'bye' ? 'pointer' : 'default',
          bgcolor: isExpanded ? 'action.selected' : 'transparent',
          '&:hover': matchup.status !== 'bye' ? { bgcolor: 'action.hover' } : {},
          userSelect: 'none',
        }}
      >
        <Box sx={{ flex: 1, textAlign: 'right' }}>
          <Typography variant="body2" fontWeight={isHighlighted ? 700 : 400} noWrap>
            {matchup.homeTeamName ?? 'Ghost'}
          </Typography>
          {matchup.homeOwnerName && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {matchup.homeOwnerName}
            </Typography>
          )}
        </Box>
        <Typography
          variant="body2"
          fontWeight={700}
          color="text.secondary"
          sx={{ mx: 2, minWidth: 90, textAlign: 'center', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
        >
          {homeScore} – {awayScore}
        </Typography>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" fontWeight={isHighlighted ? 700 : 400} noWrap>
            {matchup.awayTeamName ?? 'Ghost'}
          </Typography>
          {matchup.awayOwnerName && (
            <Typography variant="caption" color="text.secondary" display="block" noWrap>
              {matchup.awayOwnerName}
            </Typography>
          )}
        </Box>
        <Chip
          label={STATUS_LABELS[matchup.status] ?? matchup.status}
          size="small"
          color={(STATUS_COLORS[matchup.status] ?? 'default') as any}
          sx={{ ml: 1.5, flexShrink: 0 }}
        />
      </Box>

      {/* Expandable detail */}
      {matchup.status !== 'bye' && (
        <Collapse in={isExpanded} unmountOnExit>
          <Box px={2} pb={2} pt={1}>
            <MatchupDetail
              matchup={matchup}
              userTeamId={userTeamId}
              seasonYear={seasonYear}
              seasonId={seasonId}
            />
          </Box>
        </Collapse>
      )}
    </Paper>
  );
};

// ─── Main tab ─────────────────────────────────────────────────────────────────

const RodadaTab: React.FC<Props> = ({
  seasonId,
  userTeamId,
  seasonYear,
  currentRound,
  playoffStartRound,
  numberOfRounds,
}) => {
  const { data: schedule, isLoading: scheduleLoading } = useScheduleBySeason(seasonId);
  const { data: playoffMatchups, isLoading: playoffLoading } = usePlayoffMatchups(seasonId);
  const { data: roundCalendar } = useRoundCalendar(seasonId);

  // Authoritative fantasy→real round map (covers regular AND playoff rounds).
  // Matchup rows don't always carry realRound (e.g. playoff brackets), so we
  // resolve the real round from the calendar mapping instead of the matchups.
  const fantasyToRealRound = useMemo(() => {
    const map = new Map<number, number>();
    (roundCalendar?.rows ?? []).forEach((r) => {
      if (r.fantasyRound != null) map.set(r.fantasyRound, r.realRound);
    });
    return map;
  }, [roundCalendar]);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [expandedMatchupId, setExpandedMatchupId] = useState<string | null>(null);

  const isLoading = scheduleLoading || playoffLoading;

  const regularRounds = useMemo(() => (schedule ?? []).map((r) => r.roundNumber), [schedule]);

  const playoffRounds = useMemo(() => {
    if (!playoffStartRound || !numberOfRounds) return [];
    return Array.from({ length: numberOfRounds - playoffStartRound + 1 }, (_, i) => playoffStartRound + i);
  }, [playoffStartRound, numberOfRounds]);

  const allRounds = useMemo(
    () => [...regularRounds, ...playoffRounds.filter((r) => !regularRounds.includes(r))],
    [regularRounds, playoffRounds],
  );

  const currentRoundNumber = useMemo(() => {
    if (currentRound != null) return currentRound;
    if (regularRounds.length > 0)
      return detectCurrentRound(
        regularRounds,
        playoffRounds,
        schedule ?? [],
        playoffMatchups ?? [],
      );
    return null;
  }, [currentRound, regularRounds, playoffRounds, schedule, playoffMatchups]);

  if (!seasonId) {
    return (
      <Typography color="text.secondary" textAlign="center" py={6}>
        Temporada não encontrada.
      </Typography>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!schedule || schedule.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" py={6}>
        A tabela ainda não foi gerada. Ela será gerada automaticamente ao fim do draft.
      </Typography>
    );
  }

  // Season over (no current round) → default to the last round played
  const activeRound = selectedRound ?? currentRoundNumber ?? allRounds[allRounds.length - 1];
  const activeIndex = allRounds.indexOf(activeRound);
  const isPlayoffRound = playoffStartRound != null && activeRound >= playoffStartRound;

  function isMyMatchup(m: { homeTeamId: number | null; awayTeamId: number | null }) {
    return userTeamId != null && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId);
  }

  const activeRoundData = schedule.find((r) => r.roundNumber === activeRound);
  const roundPlayoffMatchups = (playoffMatchups ?? []).filter((m) => m.roundNumber === activeRound);

  const allMatchups: FantasyMatchupDto[] = isPlayoffRound
    ? roundPlayoffMatchups
    : (activeRoundData?.matchups ?? []);

  // Stable order: user's matchup first, then others in original order
  const myMatchup = allMatchups.find(isMyMatchup) ?? null;
  const orderedMatchups = myMatchup
    ? [myMatchup, ...allMatchups.filter((m) => m.id !== myMatchup.id)]
    : allMatchups;

  // Real championship round this fantasy round maps to. Prefer the authoritative
  // calendar mapping (works for playoff rounds too); fall back to matchup data,
  // then to the fantasy round itself.
  const activeRealRound =
    fantasyToRealRound.get(activeRound) ??
    allMatchups[0]?.realRound ??
    activeRound;

  // Default expansion: user's matchup open on mount / round change
  const defaultExpandedId = myMatchup?.id ?? orderedMatchups[0]?.id ?? null;
  const expandedId = expandedMatchupId !== undefined ? expandedMatchupId : defaultExpandedId;

  const handleRoundChange = (round: number) => {
    setSelectedRound(round);
    setExpandedMatchupId(null); // reset to default (user's matchup)
  };

  return (
    <Box>
      {/* Round selector */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <IconButton
          size="small"
          disabled={activeIndex <= 0}
          onClick={() => handleRoundChange(allRounds[activeIndex - 1])}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Select
          value={activeRound}
          onChange={(e) => handleRoundChange(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 180 }}
          renderValue={(val) => {
            const isPlayoff = playoffStartRound != null && val >= playoffStartRound;
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={600}>Rodada {val}</Typography>
                {isPlayoff && <Chip label="Mata-mata" size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />}
                {val === currentRoundNumber && <Chip label="Atual" size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />}
              </Box>
            );
          }}
        >
          {allRounds.map((r) => {
            const isPlayoff = playoffStartRound != null && r >= playoffStartRound;
            return (
              <MenuItem key={r} value={r}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  Rodada {r}
                  {isPlayoff && <Chip label="Mata-mata" size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />}
                  {r === currentRoundNumber && <Chip label="Atual" size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />}
                </Box>
              </MenuItem>
            );
          })}
        </Select>

        <IconButton
          size="small"
          disabled={activeIndex >= allRounds.length - 1}
          onClick={() => handleRoundChange(allRounds[activeIndex + 1])}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>

        <Typography variant="body2" color="text.secondary">
          Rodada {activeRound} da Liga • Rodada {activeRealRound} do Brasileirão
        </Typography>
      </Stack>

      {/* Matchup list — stable order, expand/collapse in place */}
      {orderedMatchups.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={4}>
          Nenhum jogo nesta rodada.
        </Typography>
      ) : (
        <Stack spacing={1}>
          {orderedMatchups.map((m) => (
            <MatchupRow
              key={m.id}
              matchup={m}
              isExpanded={expandedId === m.id}
              isHighlighted={isMyMatchup(m)}
              onToggle={() => setExpandedMatchupId(expandedId === m.id ? null : m.id)}
              userTeamId={userTeamId}
              seasonYear={seasonYear}
              seasonId={seasonId}
            />
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default RodadaTab;
