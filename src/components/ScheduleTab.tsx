import React from 'react';
import { Box, CircularProgress, Divider, Typography } from '@mui/material';
import { usePlayoffMatchups } from '../api/fantasyMatchupQueries';
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

const ScheduleTab: React.FC<Props> = ({ seasonId, userTeamId, seasonYear }) => {
  const { data: playoffMatchups, isLoading } = usePlayoffMatchups(seasonId);

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

  const hasPlayoffMatchups = playoffMatchups && playoffMatchups.length > 0;

  return (
    <Box>
      {hasPlayoffMatchups && (
        <>
          <Typography variant="h6" fontWeight={700} mb={2}>
            Mata-mata
          </Typography>
          <PlayoffBracket seasonId={seasonId} seasonYear={seasonYear} />
          <Divider sx={{ my: 4 }} />
        </>
      )}

      <Typography variant="h6" fontWeight={700} mb={2}>
        Classificação
      </Typography>
      <StandingsTable seasonId={seasonId} userTeamId={userTeamId} />
    </Box>
  );
};

export default ScheduleTab;
