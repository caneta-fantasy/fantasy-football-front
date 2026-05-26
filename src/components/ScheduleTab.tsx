import React, { useState, useMemo } from 'react';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Typography,
  Chip,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useScheduleBySeason, usePlayoffMatchups, FantasyMatchupDto } from '../api/fantasyMatchupQueries';
import MatchupCard from './MatchupCard';
import MatchupDetailModal from './MatchupDetailModal';
import PlayoffBracket from './PlayoffBracket';
import StandingsTable from './StandingsTable';

interface Props {
  seasonId: string | undefined;
  userTeamId?: number;
  seasonYear?: number;
  currentRound?: number | null;
  playoffStartRound?: number | null;
  numberOfRounds?: number | null;
}

function detectCurrentRoundFromSchedule(
  regularRounds: number[],
  playoffRounds: number[],
  regularSchedule: { roundNumber: number; matchups: FantasyMatchupDto[] }[],
): number {
  // First look for an unfinished regular season round
  const activeRegular = regularSchedule.find((r) =>
    r.matchups.some((m) => m.status !== 'completed' && m.status !== 'bye'),
  );
  if (activeRegular) return activeRegular.roundNumber;
  // Then fall through to first playoff round if any exist
  if (playoffRounds.length > 0) return playoffRounds[0];
  // Otherwise last regular round
  return regularRounds[regularRounds.length - 1];
}

const ScheduleTab: React.FC<Props> = ({
  seasonId,
  userTeamId,
  seasonYear,
  currentRound,
  playoffStartRound,
  numberOfRounds,
}) => {
  const { data: schedule, isLoading: scheduleLoading } = useScheduleBySeason(seasonId);
  const { data: playoffMatchups, isLoading: playoffLoading } = usePlayoffMatchups(seasonId);
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedMatchup, setSelectedMatchup] = useState<FantasyMatchupDto | null>(null);

  const isLoading = scheduleLoading || playoffLoading;

  // All regular season round numbers from the schedule
  const regularRounds = useMemo(
    () => (schedule ?? []).map((r) => r.roundNumber),
    [schedule],
  );

  // Unique playoff round numbers from fetched playoff matchups
  const playoffRounds = useMemo(() => {
    if (!playoffStartRound || !numberOfRounds) return [];
    // Build the full range even if matchups aren't generated yet
    return Array.from(
      { length: numberOfRounds - playoffStartRound + 1 },
      (_, i) => playoffStartRound + i,
    );
  }, [playoffStartRound, numberOfRounds]);

  // Full ordered round list: regular + playoff
  const allRounds = useMemo(
    () => [...regularRounds, ...playoffRounds.filter((r) => !regularRounds.includes(r))],
    [regularRounds, playoffRounds],
  );

  const currentRoundNumber = useMemo(() => {
    if (currentRound != null) return currentRound;
    if (regularRounds.length > 0)
      return detectCurrentRoundFromSchedule(regularRounds, playoffRounds, schedule ?? []);
    return null;
  }, [currentRound, regularRounds, playoffRounds, schedule]);

  // For two-leg ties, determine if this round is Jogo 1 or Jogo 2 within each pair.
  // Within a twoLegPairId group, the lower roundNumber = leg 1, higher = leg 2.
  const legNumberByMatchupId = useMemo(() => {
    const map = new Map<string, number>();
    if (!playoffMatchups) return map;

    const byPair = new Map<string, typeof playoffMatchups>();
    for (const matchup of playoffMatchups) {
      if (!matchup.twoLegPairId) continue;
      const group = byPair.get(matchup.twoLegPairId) ?? [];
      group.push(matchup);
      byPair.set(matchup.twoLegPairId, group);
    }

    byPair.forEach((legs) => {
      const sorted = [...legs].sort((legA, legB) => legA.roundNumber - legB.roundNumber);
      sorted.forEach((leg, index) => map.set(leg.id, index + 1));
    });

    return map;
  }, [playoffMatchups]);

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

  const activeRound = selectedRound ?? currentRoundNumber ?? allRounds[0];
  const activeIndex = allRounds.indexOf(activeRound);
  const isPlayoffRound = playoffStartRound != null && activeRound >= playoffStartRound;

  // Regular season matchups for the selected round
  const activeRoundData = schedule.find((r) => r.roundNumber === activeRound);
  const regularMatchups = activeRoundData
    ? [...activeRoundData.matchups].sort(
        (a, b) => (isMyMatchup(b) ? 1 : 0) - (isMyMatchup(a) ? 1 : 0),
      )
    : [];

  // Playoff matchups for the selected round
  const roundPlayoffMatchups = (playoffMatchups ?? []).filter(
    (matchup) => matchup.roundNumber === activeRound,
  );

  function isMyMatchup(m: { homeTeamId: number | null; awayTeamId: number | null }) {
    return userTeamId != null && (m.homeTeamId === userTeamId || m.awayTeamId === userTeamId);
  }

  const getStageLabel = (stage: number | null): string | null => {
    if (stage === 1) return 'Final';
    if (stage === 2) return 'Semifinal';
    if (stage === 3) return 'Quartas de Final';
    return null;
  };

  const firstStage = roundPlayoffMatchups[0]?.playoffStage ?? null;
  const stageLabel = getStageLabel(firstStage);

  const hasPlayoffMatchups = playoffMatchups && playoffMatchups.length > 0;

  return (
    <Box>
      {/* Round selector */}
      <Stack direction="row" alignItems="center" spacing={1}>
        <IconButton
          size="small"
          disabled={activeIndex <= 0}
          onClick={() => setSelectedRound(allRounds[activeIndex - 1])}
        >
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>

        <Select
          value={activeRound}
          onChange={(e) => setSelectedRound(Number(e.target.value))}
          size="small"
          sx={{ minWidth: 180 }}
          renderValue={(val) => {
            const isPlayoff = playoffStartRound != null && val >= playoffStartRound;
            return (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography fontWeight={600}>Rodada {val}</Typography>
                {isPlayoff && (
                  <Chip label="Mata-mata" size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />
                )}
                {val === currentRoundNumber && (
                  <Chip label="Atual" size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />
                )}
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
                  {isPlayoff && (
                    <Chip label="Mata-mata" size="small" color="warning" sx={{ height: 18, fontSize: 11 }} />
                  )}
                  {r === currentRoundNumber && (
                    <Chip label="Atual" size="small" color="primary" sx={{ height: 18, fontSize: 11 }} />
                  )}
                </Box>
              </MenuItem>
            );
          })}
        </Select>

        <IconButton
          size="small"
          disabled={activeIndex >= allRounds.length - 1}
          onClick={() => setSelectedRound(allRounds[activeIndex + 1])}
        >
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* Matchups area */}
      <Box mt={3}>
        {isPlayoffRound ? (
          roundPlayoffMatchups.length > 0 ? (
            <Stack spacing={1.5}>
              {stageLabel && (
                <Typography variant="subtitle2" fontWeight={700} color="warning.main" mb={0.5}>
                  {stageLabel}
                </Typography>
              )}
              {roundPlayoffMatchups.map((playoffMatchup) => {
                const legNumber = legNumberByMatchupId.get(playoffMatchup.id) ?? null;
                return (
                  <Box key={playoffMatchup.id}>
                    {legNumber !== null && (
                      <Typography variant="caption" color="text.secondary" mb={0.5} display="block">
                        Jogo {legNumber}
                      </Typography>
                    )}
                    <MatchupCard
                      matchup={playoffMatchup}
                      highlighted={isMyMatchup(playoffMatchup)}
                      onClick={playoffMatchup.status !== 'bye' ? () => setSelectedMatchup(playoffMatchup) : undefined}
                    />
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Typography color="text.secondary" textAlign="center" py={4}>
              Mata-mata a ser definido
            </Typography>
          )
        ) : (
          <Stack spacing={1.5}>
            {regularMatchups.map((matchup) => (
              <MatchupCard
                key={matchup.id}
                matchup={matchup}
                highlighted={isMyMatchup(matchup)}
                onClick={matchup.status !== 'bye' ? () => setSelectedMatchup(matchup) : undefined}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" fontWeight={700} mb={2}>
        Classificação
      </Typography>
      <StandingsTable seasonId={seasonId} userTeamId={userTeamId} />

      {hasPlayoffMatchups && (
        <>
          <Divider sx={{ my: 4 }} />
          <Typography variant="h6" fontWeight={700} mb={2}>
            Mata-mata
          </Typography>
          <PlayoffBracket seasonId={seasonId} seasonYear={seasonYear} />
        </>
      )}

      <MatchupDetailModal
        matchup={selectedMatchup}
        onClose={() => setSelectedMatchup(null)}
        userTeamId={userTeamId}
        seasonYear={seasonYear}
        seasonId={seasonId}
      />
    </Box>
  );
};

export default ScheduleTab;
