// FantasyLeaguesSidebar.tsx
import React, { useState } from 'react';
import { Button, Stack, Typography, Divider, Paper, Chip, Box, Tooltip, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import SeasonStatusCard from '../components/SeasonStatusCard';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { useDraftSettings } from '../api/useDraftSettings';
import { useAuth } from '../context/AuthContext';
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
  const { user } = useAuth();
  const isOwner = currentUserId === fantasyLeague.owner?.id;
  const isEmailVerified = !!user?.emailVerifiedAt;
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    if (!fantasyLeague.joinCode) return;
    navigator.clipboard.writeText(fantasyLeague.joinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

      {isOwner && fantasyLeague.joinCode && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Código de convite
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              px: 1.5,
              py: 0.5,
              mt: 0.5,
            }}
          >
            <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: 2 }}>
              {fantasyLeague.joinCode}
            </Typography>
            <Tooltip title={copied ? 'Copiado!' : 'Copiar código'}>
              <IconButton size="small" onClick={handleCopyCode}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {isOwner && (
        <Stack spacing={1.5}>
          <Tooltip
            title={isEmailVerified ? '' : 'Verifique seu email para convidar jogadores'}
          >
            <span>
              <Button
                fullWidth
                onClick={onInviteClick}
                disabled={!isEmailVerified}
                variant="contained"
                sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
              >
                Convidar para a Liga
              </Button>
            </span>
          </Tooltip>
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
