import React from 'react';
import { Box, Chip, Typography } from '@mui/material';
import { FantasyMatchupDto } from '../api/fantasyMatchupQueries';

interface Props {
  matchup: FantasyMatchupDto;
  highlighted?: boolean;
  onClick?: () => void;
}

const MatchupCard: React.FC<Props> = ({ matchup, highlighted = false, onClick }) => {
  const homeName = matchup.homeTeamName ?? 'Ghost';
  const homeOwner = matchup.homeOwnerName;
  const awayName = matchup.awayTeamName ?? 'Ghost';
  const awayOwner = matchup.awayOwnerName;

  if (matchup.status === 'bye') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: 'action.hover',
          opacity: 0.6,
        }}
      >
        <Typography fontWeight={600} color="text.secondary">
          {homeName}
        </Typography>
        <Chip label="BYE" size="small" variant="outlined" />
      </Box>
    );
  }

  const homeScore = matchup.homeScore != null ? matchup.homeScore : '—';
  const awayScore = matchup.awayScore != null ? matchup.awayScore : '—';

  const homeWon =
    matchup.homeScore != null &&
    matchup.awayScore != null &&
    matchup.homeScore > matchup.awayScore;
  const awayWon =
    matchup.homeScore != null &&
    matchup.awayScore != null &&
    matchup.awayScore > matchup.homeScore;

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1.5,
        borderRadius: 2,
        bgcolor: highlighted ? 'primary.50' : 'background.paper',
        border: highlighted ? '2px solid' : '1px solid',
        borderColor: highlighted ? 'primary.main' : 'divider',
        gap: 1,
        ...(onClick && {
          cursor: 'pointer',
          '&:hover': { bgcolor: highlighted ? 'primary.100' : 'action.hover' },
        }),
      }}
    >
      <Box sx={{ flex: 1, textAlign: 'right' }}>
        <Typography fontWeight={homeWon ? 700 : 400} color={matchup.isGhost ? 'text.disabled' : 'text.primary'}>
          {homeName}
        </Typography>
        {homeOwner && (
          <Typography variant="caption" color="text.secondary">{homeOwner}</Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', minWidth: 80, justifyContent: 'center' }}>
        <Typography fontWeight={700} color={homeWon ? 'success.main' : 'text.secondary'}>
          {homeScore}
        </Typography>
        <Typography color="text.disabled">–</Typography>
        <Typography fontWeight={700} color={awayWon ? 'success.main' : 'text.secondary'}>
          {awayScore}
        </Typography>
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography fontWeight={awayWon ? 700 : 400} color={matchup.isGhost ? 'text.disabled' : 'text.primary'}>
          {awayName}
        </Typography>
        {awayOwner && (
          <Typography variant="caption" color="text.secondary">{awayOwner}</Typography>
        )}
      </Box>
    </Box>
  );
};

export default MatchupCard;
