import { Box, Button, CircularProgress, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate, useParams } from 'react-router-dom';
import { useGetCurrentUser } from '../api/authQueries';
import { useFantasyLeagueTeams, useGetFantasyLeague } from '../api/fantasyLeagueQueries';
import DraftRoom from '../components/DraftRoom';
import { useDraft } from '../api/draftQueries';
import { useDraftSettings } from '../api/useDraftSettings';

export default function DraftRoomPage() {
  const { draftId, leagueId, season } = useParams<{
    draftId: string;
    leagueId: string;
    season: string;
  }>();
  const navigate = useNavigate();

  const { data: currentUser } = useGetCurrentUser();
  const leagueIdNum = Number(leagueId);
  const seasonNum = Number(season);

  const { data: teams } = useFantasyLeagueTeams(leagueIdNum);
  const { data: fantasyLeague } = useGetFantasyLeague(leagueIdNum);
  const { data: draftData, isLoading } = useDraft(leagueIdNum, seasonNum);
  const { data: draftSettings } = useDraftSettings(leagueIdNum);

  if (isLoading || !currentUser) {
    return (
      <Box display="flex" justifyContent="center" pt={10}>
        <CircularProgress />
      </Box>
    );
  }

  if (!draftData?.draft || !draftId) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" pt={10} gap={2}>
        <Typography variant="h6">Sala do draft não encontrada.</Typography>
        <Button onClick={() => navigate(-1)}>Voltar</Button>
      </Box>
    );
  }

  const myUserTeam = (teams ?? []).find((t: any) => t.user?.id === currentUser.id);

  return (
    <Box sx={{ px: 3, py: 3 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Voltar para a liga
      </Button>

      <DraftRoom
        draftId={draftId}
        leagueId={leagueIdNum}
        realLeagueId={fantasyLeague?.league?.id}
        realLeagueExternalId={fantasyLeague?.league?.externalId}
        season={seasonNum}
        currentUserId={currentUser.id}
        myUserTeamId={myUserTeam?.id}
        initialData={draftData}
        draftDate={draftSettings?.draftDate ?? null}
      />
    </Box>
  );
}
