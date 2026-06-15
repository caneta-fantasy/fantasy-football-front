// FantasyLeaguesSidebar.tsx
import React from 'react';
import { Button, Stack, Typography, Divider, Paper, Chip } from '@mui/material';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import SeasonStatusCard from '../components/SeasonStatusCard';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { useDraftSettings } from '../api/useDraftSettings';
import Loading from './Loading';

type Props = {
  fantasyLeague: FantasyLeague;
  currentUserId: number;
  onInviteClick?: () => void;
  onViewInvitesClick?: () => void;
  onSeasonUpdated?: () => void;
};

const FantasyLeaguesSidebar: React.FC<Props> = ({
  fantasyLeague,
  currentUserId,
  onInviteClick,
  onViewInvitesClick,
  onSeasonUpdated,
}) => {
  const isOwner = currentUserId === fantasyLeague.owner?.id;

  const { data: fantasyLeagueSeason,  isLoading: isLoadingFantasyLeagueSeason, refetch: refetchFantasyLeagueSeason } = useFantasyLeagueSeasons(fantasyLeague.id);
  const { data: draftSettings, isLoading: isLoadingDraftSettings } = useDraftSettings(fantasyLeague.id);

  if (isLoadingFantasyLeagueSeason || isLoadingDraftSettings) return <Loading message="Carregando..." />;

  return (
    <Paper
      elevation={0}
      sx={{
        width: { xs: '100%', sm: 260 },
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        p: 3,
        borderRight: '1px solid #e0e0e0',
        borderRadius: 0,
        bgcolor: 'background.default',
      }}
    >
      <Typography variant="h6" gutterBottom>
        {fantasyLeague.name}
        {fantasyLeague.isSimulation && (
          <Chip label="Simulação" color="warning" size="small" sx={{ ml: 1 }} />
        )}
      </Typography>

      <Typography variant="body2" sx={{ mb: 1 }}>
        <strong>Dono:</strong> {fantasyLeague.owner?.firstName} {fantasyLeague.owner?.lastName}
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        <strong>Quantidade de times:</strong> {fantasyLeague.members.length}
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {isOwner && (
        <Stack spacing={1.5}>
          <Button
            fullWidth
            onClick={onInviteClick}
            variant="contained"
            sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
          >
            Convidar para a Liga
          </Button>
          <Button
            fullWidth
            onClick={onViewInvitesClick}
            variant="contained"
            color="primary"
            sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
          >
            Ver convites
          </Button>
        </Stack>
      )}

        <SeasonStatusCard
          season={fantasyLeagueSeason}
          canManage={isOwner}
          onUpdated={onSeasonUpdated}
          devEnableForceOpen
          refetchSeason={refetchFantasyLeagueSeason}
          draftSettings={draftSettings}
        />
    </Paper>
  );
};

export default FantasyLeaguesSidebar;
