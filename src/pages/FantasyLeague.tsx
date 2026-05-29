import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetFantasyLeague } from '../api/fantasyLeagueQueries';
import LeagueSidebar from '../components/FantasyLeaguesSidebar';
import InviteToLeagueModal from '../components/InviteToFantasyLeagueModal';
import { useInviteUserToFantasyLeague } from '../api/fantasyLeagueQueries';
import { Snackbar, Alert, Box, Button, useMediaQuery, useTheme } from '@mui/material';
import LeagueTabs from '../components/FantasyLeagueTabs';
import ViewInvitesModal from '../components/ViewInvitesModal';
import FantasyLeagueInfo from '../components/FantasyLeagueInfo';
import PlayersList from '../components/PlayersList';
import WaiverClaimsPanel from '../components/WaiverClaimsPanel';
import WaiverHistoryModal from '../components/WaiverHistoryModal';
import { TeamTab } from '../components/TeamTabComponent';
import { useFindUserFantasyLeagueTeam } from '../api/userTeamsQueries';
import Loading from '../components/Loading';
import DraftTab from '../components/DraftTab';
import ScheduleTab from '../components/ScheduleTab';
import TradesTab from '../components/TradesTab';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { useCurrentSeason } from '../api/currentSeasonQueries';
import { useWaiverClaims, useWaiverBudgets, useWaiverWindowStatus, useMarketHistory } from '../api/waiverQueries';
import { useTrades } from '../api/tradeQueries';
import ScoringConfigForm from '../components/ScoringConfigForm';
import RodadaTab from '../components/RodadaTab';

const FantasyLeaguePage = ({ currentUserId }: { currentUserId: number }) => {
  const { fantasyLeagueId } = useParams<{ fantasyLeagueId: string }>();
  const { data: fantasyLeague, isLoading, isError, error } = useGetFantasyLeague(Number(fantasyLeagueId));
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [selectedTab, setSelectedTab] = useState('draft');
  const [defaultTabSet, setDefaultTabSet] = useState(false);
  const [viewInvitesModalOpen, setViewInvitesModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { mutate: inviteUserToFantasyLeague, isPending: isInvitingUser, isError: isInvitingUserError, error: invitingUserError } = useInviteUserToFantasyLeague(Number(fantasyLeagueId));
  const { data: userTeam, isLoading: isLoadingUserTeam, isError: isLoadingUserTeamError, error: errorUserTeam } = useFindUserFantasyLeagueTeam(currentUserId, Number(fantasyLeagueId));
  const { data: fantasyLeagueSeason } = useFantasyLeagueSeasons(Number(fantasyLeagueId));

  const POST_DRAFT_STATUSES = ['DRAFT_DONE', 'SCHEDULED', 'ACTIVE', 'SEASON_ENDED', 'ARCHIVED'];
  useEffect(() => {
    if (!defaultTabSet && fantasyLeagueSeason?.status) {
      if (POST_DRAFT_STATUSES.includes(fantasyLeagueSeason.status)) {
        setSelectedTab('rodada');
      }
      setDefaultTabSet(true);
    }
  }, [fantasyLeagueSeason?.status, defaultTabSet]);

  const { data: currentSeasonData } = useCurrentSeason();
  const seasonYear = fantasyLeagueSeason?.seasonYear ?? currentSeasonData?.year ?? new Date().getFullYear();

  const leagueExternalId = fantasyLeagueSeason?.fantasyLeague?.league?.externalId;
  const { data: waiverWindowStatus } = useWaiverWindowStatus(
    selectedTab === 'players' ? leagueExternalId : null,
    selectedTab === 'players' ? fantasyLeagueSeason?.seasonYear : null,
  );
  const isWaiverWindowOpen = waiverWindowStatus?.isOpen ?? false;

  const { data: waiverClaims } = useWaiverClaims(
    selectedTab === 'players' && fantasyLeagueSeason?.id ? fantasyLeagueSeason.id : undefined,
  );
  const { data: waiverBudgets } = useWaiverBudgets(
    selectedTab === 'players' && fantasyLeagueSeason?.id ? fantasyLeagueSeason.id : undefined,
  );
  const { data: marketHistory = [], isLoading: isHistoryLoading } = useMarketHistory(
    selectedTab === 'players' ? fantasyLeagueSeason?.id : undefined,
  );

  const { data: trades = [] } = useTrades(fantasyLeagueSeason?.id);
  const pendingTradesCount = trades.filter(
    (t) =>
      t.status === 'PENDING_ACCEPTANCE' &&
      t.participants.some((p) => p.userTeam.id === userTeam?.id && !p.accepted),
  ).length;


  const handleInvite = (email: string) => {
    inviteUserToFantasyLeague(email, {
      onSuccess: () => {
        setSnackbar({
          open: true,
          message: 'Convite enviado com sucesso!',
          severity: 'success',
        });
      },
      onError: (err: Error) => {
        setSnackbar({
          open: true,
          message: `Erro ao enviar convite: ${err.message}`,
          severity: 'error',
        });
      },
    });
  };

  if (isLoading || isLoadingUserTeam) return <Loading message="Carregando a liga..." fullScreen />;
  if (isInvitingUser) return <Loading message="Enviando convite..." />;
  if (isInvitingUserError) return <p>Algo deu errado ao enviar o convite.</p>;
  if (!fantasyLeague) return <p>Algo deu errado ao carregar a liga.</p>;

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? 'column' : 'row'}
      width="100%"
      minHeight="100vh"
    >
      <Box
        flexShrink={0}
        width={isMobile ? '100%' : 280}
        px={isMobile ? 2 : 3}
        py={2}
      >
        <LeagueSidebar
          fantasyLeague={fantasyLeague}
          currentUserId={currentUserId}
          onInviteClick={() => setInviteModalOpen(true)}
          onViewInvitesClick={() => setViewInvitesModalOpen(true)}
        />
      </Box>

      <Box
        component="main"
        flexGrow={1}
        px={isMobile ? 2 : 4}
        py={isMobile ? 2 : 4}
      >
        <LeagueTabs selected={selectedTab} onChange={setSelectedTab} pendingTradesCount={pendingTradesCount} />

        <Box mt={4}>
          {selectedTab === 'draft' && <DraftTab fantasyLeague={fantasyLeague} currentUserId={currentUserId} />}
          {selectedTab === 'team' && <TeamTab seasonYear={seasonYear} seasonId={fantasyLeagueSeason?.id} userTeam={userTeam} fantasyLeague={fantasyLeague} />}
          {selectedTab === 'schedule' && <ScheduleTab seasonId={fantasyLeagueSeason?.id} userTeamId={userTeam?.id} seasonYear={seasonYear} currentRound={fantasyLeagueSeason?.currentRound ?? null} playoffStartRound={fantasyLeagueSeason?.playoffStartRound ?? null} numberOfRounds={fantasyLeagueSeason?.numberOfRounds ?? null} />}
          {selectedTab === 'rodada' && <RodadaTab seasonId={fantasyLeagueSeason?.id} userTeamId={userTeam?.id} seasonYear={seasonYear} currentRound={fantasyLeagueSeason?.currentRound ?? null} playoffStartRound={fantasyLeagueSeason?.playoffStartRound ?? null} numberOfRounds={fantasyLeagueSeason?.numberOfRounds ?? null} />}
          {selectedTab === 'league' && <FantasyLeagueInfo currentUserId={currentUserId} fantasyLeague={fantasyLeague} />}
          {selectedTab === 'players' && (
            <Box display="flex" flexDirection="column" gap={2}>
              {fantasyLeagueSeason?.id && (
                <Box display="flex" justifyContent="flex-end">
                  <Button variant="outlined" size="small" onClick={() => setHistoryOpen(true)}>
                    Histórico do Mercado
                  </Button>
                </Box>
              )}
              {isWaiverWindowOpen && fantasyLeagueSeason?.id && (
                <WaiverClaimsPanel
                  seasonId={fantasyLeagueSeason.id}
                  currentUserId={currentUserId}
                  claims={waiverClaims ?? []}
                  budgets={waiverBudgets ?? []}
                  isWindowOpen={isWaiverWindowOpen}
                />
              )}
              <PlayersList fantasyLeague={fantasyLeague} seasonYear={seasonYear} userTeamId={userTeam.id} seasonId={fantasyLeagueSeason?.id} />
            </Box>
          )}
          {selectedTab === 'trades' && (
            <TradesTab
              seasonId={fantasyLeagueSeason?.id}
              seasonYear={seasonYear}
              userTeam={userTeam}
              fantasyLeague={fantasyLeague}
              currentUserId={currentUserId}
              currentRound={fantasyLeagueSeason?.currentRound}
              tradeDeadlineRound={fantasyLeagueSeason?.tradeDeadlineRound}
            />
          )}
          {selectedTab === 'scores' && (
            <ScoringConfigForm
              seasonId={fantasyLeagueSeason?.id}
              seasonStatus={fantasyLeagueSeason?.status}
              isOwner={false}
            />
          )}
        </Box>
      </Box>

      <WaiverHistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        transactions={marketHistory}
        isLoading={isHistoryLoading}
      />

      <InviteToLeagueModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSubmit={handleInvite}
      />

      <ViewInvitesModal
        fantasyLeagueId={Number(fantasyLeagueId)}
        open={viewInvitesModalOpen}
        onClose={() => setViewInvitesModalOpen(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {isError && (
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Algo deu errado ao carregar a liga.'}
        </Alert>
      )}

      {isLoadingUserTeamError && (
        <Alert severity="error">
          {errorUserTeam instanceof Error ? errorUserTeam.message : 'Algo deu errado ao carregar o time do usuário.'}
        </Alert>
      )}

      {isInvitingUserError && (
        <Alert severity="error">
          {typeof invitingUserError === 'object' && invitingUserError !== null && 'message' in invitingUserError
            ? (invitingUserError as { message: string }).message
            : 'Algo deu errado ao enviar o convite.'}
        </Alert>
      )}

    </Box>
  );
};

export default FantasyLeaguePage;
