import React, { useState } from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import { FantasyLeague, useFantasyLeagueTeams } from '../api/fantasyLeagueQueries';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { useDraftSettings } from '../api/useDraftSettings';
import SeasonStatusCard, { LeagueStatus } from './SeasonStatusCard';
import DraftOrderPanel from './DraftOrderPanel';
import DraftSettingsForm from './DraftSettingsForm';
import DraftSchedulePanel from './DraftSchedulePanel';
import { useDraft, useDraftPresence } from '../api/draftQueries';

interface Props {
  fantasyLeague: FantasyLeague;
  currentUserId: number;
}

export default function DraftTab({ fantasyLeague, currentUserId }: Props) {
  const isOwner = fantasyLeague.owner?.id === currentUserId;
  const leagueId = fantasyLeague.id;

  const { data: season, isLoading: loadingSeason, refetch: refetchSeason } = useFantasyLeagueSeasons(leagueId);
  const { data: draftSettings, refetch: refetchDraftSettings } = useDraftSettings(leagueId);
  const { data: teams, isLoading: loadingTeams } = useFantasyLeagueTeams(leagueId);
  const { data: draftData } = useDraft(leagueId, season?.seasonYear);
  const { data: presenceData } = useDraftPresence(draftData?.draft?.id);

  const [draftFormValues, setDraftFormValues] = useState(draftSettings);

  React.useEffect(() => {
    if (draftSettings) setDraftFormValues(draftSettings);
  }, [draftSettings]);

  if (loadingSeason || loadingTeams) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  const status = season?.status as LeagueStatus | undefined;
  const seasonYear = season?.seasonYear;

  const enterRoom = () => {
    if (!draftData?.draft) return;
    window.open(`/draft/${leagueId}/${seasonYear}/${draftData.draft.id}`, '_blank');
  };

  // ACTIVATED_PRESEASON: draft settings + order setup
  if (status === LeagueStatus.ACTIVATED_PRESEASON) {
    return (
      <Box>
        {isOwner && (
          <Alert severity="warning" sx={{ mb: 1 }}>
            <AlertTitle sx={{ fontWeight: 700 }}>
              Antes de agendar o draft, revise as configurações
            </AlertTitle>
            Após o draft ser realizado, várias configurações da liga não poderão
            mais ser alteradas. Recomendamos conferir as configurações desta liga
            (aba <strong>Liga</strong>) e do draft abaixo antes de agendar.
          </Alert>
        )}

        {isOwner && draftSettings && (
          <>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={700} mb={2}>
              Configurações do Draft
            </Typography>
            <Stack spacing={2}>
              <DraftSettingsForm
                values={draftFormValues ?? draftSettings}
                onChange={(field, value) =>
                  setDraftFormValues((prev: any) => ({ ...prev, [field]: value }))
                }
                id={draftSettings.id}
                refetchDraftSettings={refetchDraftSettings}
              />
            </Stack>
          </>
        )}

        {seasonYear && season && draftSettings && (
          <>
            <Divider sx={{ my: 3 }} />
            <DraftSchedulePanel
              seasonId={season.id}
              leagueId={leagueId}
              draftSettings={draftSettings}
              isOwner={isOwner}
              refetchDraftSettings={refetchDraftSettings}
            />
          </>
        )}

        {seasonYear && (
          <>
            <Divider sx={{ my: 3 }} />
            <DraftOrderPanel
              leagueId={leagueId}
              season={seasonYear}
              numberOfTeams={fantasyLeague.numberOfTeams}
              isOwner={isOwner}
              teams={teams ?? []}
            />
          </>
        )}
      </Box>
    );
  }

  // DRAFT_SCHEDULED: status card + enter room button (if room is open) + order panel
  if (status === LeagueStatus.DRAFT_SCHEDULED) {
    const draftDateFormatted = draftSettings?.draftDate
      ? new Date(draftSettings.draftDate).toLocaleString('pt-BR', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : null;

    return (
      <Box>
        <SeasonStatusCard
          season={season}
          canManage={isOwner}
          refetchSeason={refetchSeason}
          draftSettings={draftSettings}
        />

        {draftDateFormatted && (
          <Box sx={{ mt: 2, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">Draft agendado para</Typography>
            <Typography variant="h6" fontWeight={700}>{draftDateFormatted}</Typography>
          </Box>
        )}

        {draftData?.draft && (
          <>
            <Divider sx={{ my: 3 }} />
            <Box display="flex" flexDirection="column" alignItems="center" gap={1} py={2}>
              <Typography variant="body2" color="text.secondary">
                A sala do draft está aberta. Você pode entrar e aguardar o início.
              </Typography>
              <Button
                variant="contained"
                size="large"
                sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 700, px: 4 }}
                onClick={enterRoom}
              >
                Entrar na Sala do Draft
              </Button>
            </Box>
          </>
        )}

        {seasonYear && (
          <>
            <Divider sx={{ my: 3 }} />
            <DraftOrderPanel
              leagueId={leagueId}
              season={seasonYear}
              numberOfTeams={fantasyLeague.numberOfTeams}
              isOwner={isOwner}
              teams={teams ?? []}
            />
          </>
        )}
      </Box>
    );
  }

  // DRAFT_LIVE: enter button at top + order panel below
  if (status === LeagueStatus.DRAFT_LIVE) {
    return (
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2} py={2}>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              O Draft está ao vivo!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Clique para entrar na sala e fazer suas escolhas.
            </Typography>
          </Box>
          {draftData?.draft ? (
            <Button
              variant="contained"
              size="large"
              sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 700, px: 4 }}
              onClick={enterRoom}
            >
              Entrar no Draft
            </Button>
          ) : (
            <CircularProgress size={24} />
          )}
        </Box>

        {seasonYear && (
          <>
            <Divider sx={{ my: 2 }} />
            <DraftOrderPanel
              leagueId={leagueId}
              season={seasonYear}
              numberOfTeams={fantasyLeague.numberOfTeams}
              isOwner={isOwner}
              teams={teams ?? []}
              connectedUserIds={presenceData?.connectedUserIds ?? []}
            />
          </>
        )}
      </Box>
    );
  }

  // DRAFT_DONE
  if (status === LeagueStatus.DRAFT_DONE) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" py={6} gap={2}>
        <Typography variant="h5" fontWeight={700}>
          Draft concluído!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Todos os times foram montados. Acesse a aba Time para ver seu elenco.
        </Typography>
        {draftData?.draft && (
          <Button
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none', borderRadius: 4 }}
            onClick={enterRoom}
          >
            Ver histórico de escolhas
          </Button>
        )}
      </Box>
    );
  }

  // SCHEDULED / ACTIVE / ARCHIVED
  return (
    <Box>
      <SeasonStatusCard
        season={season}
        canManage={isOwner}
        refetchSeason={refetchSeason}
      />
      <Box mt={3}>
        <Typography variant="body2" color="text.secondary">
          O draft desta temporada já foi realizado.
        </Typography>
      </Box>
    </Box>
  );
}
