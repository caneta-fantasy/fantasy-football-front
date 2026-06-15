// pages/Welcome.tsx
import { useEffect, useState } from 'react';
import { Box, Typography, Button, Stack, Alert } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateLeagueModal from '../components/CreateLeagueModal';
import JoinLeagueModal from '../components/JoinLeagueModal';
import { UserFantasyLeaguesList } from '../components/UserFantasyLeaguesList';
import { useGetMyLeagues } from '../api/fantasyLeagueQueries';
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons';
import { apiConfig } from '../api/config';
import { useMutation } from '@tanstack/react-query';
import Loading from '../components/Loading';

const Welcome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Use the React Query hook
  const { data: fantasyLeagues, isLoading, isError, error } = useGetMyLeagues();

  // Use first available league's season to get real-round budget info for CreateLeagueModal
  const firstLeagueId = fantasyLeagues?.[0]?.id ?? 0; // 0 disables the query (enabled: !!leagueId)
  const { data: firstLeagueSeason } = useFantasyLeagueSeasons(firstLeagueId);

const acceptInviteMutation = useMutation({
  mutationFn: async (token: string) => {
    const res = await fetch(`${apiConfig.endpoints.fantasyLeagueInvites.accept}?token=${token}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to accept invite');
    }

    return res.json();
  },
  onSuccess: () => {
    localStorage.removeItem('league_invite_token');
    window.location.reload();
  },
  onError: (error: Error) => {
    setErrorMessage(error.message);
  },
});

  useEffect(() => {
    const token = localStorage.getItem('league_invite_token');
    if (token) {
      localStorage.removeItem('league_invite_token');
      acceptInviteMutation.mutate(token);
    }
  }, [acceptInviteMutation]);

  if (!user) {
    navigate('/signin');
    return null;
  }

  const handleFantasyLeagueSelect = (fantasyLeagueId: number) => {
    if (fantasyLeagueId === 0) {
      setIsModalOpen(true);
    } else {
      navigate(`/fantasy-league/${fantasyLeagueId}`);
    }
  };

  if (acceptInviteMutation.isPending) {
    return <Loading message="Aceitando convite para a liga..." fullScreen />;
  }

  if (acceptInviteMutation.isError) {
    return (
      <Stack spacing={2} sx={{ maxWidth: 520, mx: 'auto', mt: 6 }}>
        <Alert severity="error">
          {acceptInviteMutation.error instanceof Error
            ? acceptInviteMutation.error.message
            : 'Algo deu errado ao aceitar o convite para a liga.'}
        </Alert>

        <Button
          variant="contained"
          onClick={() => {
            const token = localStorage.getItem('league_invite_token');
            if (token) {
              acceptInviteMutation.reset();
              acceptInviteMutation.mutate(token);
            } else {
              navigate('/welcome');
            }
          }}
        >
          Tente novamente
        </Button>
      </Stack>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        p: { xs: 2, md: 3 },
        maxWidth: 800,
        mx: 'auto',
        textAlign: 'center'
      }}>
        <Typography variant="h3" component="h1" sx={{ mb: 3, fontSize: { xs: '2rem', md: '3rem' } }}>
          Bem-vindo, {user.firstName} {user.lastName}!
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 4 }}>
          Você está logado com o email: {user.email}
        </Typography>

        {isLoading ? (
          <Loading message="Carregando as ligas..." fullScreen />
        ) : isError ? (
          <Typography color="error">
            {error instanceof Error ? error.message : 'Não foi possível carregar as ligas'}
          </Typography>
        ) : (
          <>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
          <Button
            onClick={() => setIsModalOpen(true)}
            sx={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Criar Nova Liga
          </Button>
          <Button
            variant="outlined"
            onClick={() => setIsJoinModalOpen(true)}
            sx={{
              padding: '10px 20px',
              borderRadius: '8px',
              fontSize: '16px',
              textTransform: 'none',
              borderColor: '#1976d2',
              color: '#1976d2',
            }}
          >
            Entrar com código
          </Button>
        </Stack>
          <UserFantasyLeaguesList 
            fantasyLeagues={fantasyLeagues || []} 
            onFantasyLeagueSelect={handleFantasyLeagueSelect} 
          />
          </>
        )}
      </Box>

      <CreateLeagueModal
        open={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        realCurrentRound={firstLeagueSeason?.realCurrentRound ?? null}
        maxRealRound={firstLeagueSeason?.maxRealRound ?? null}
      />

      <JoinLeagueModal
        open={isJoinModalOpen}
        handleClose={() => setIsJoinModalOpen(false)}
      />

      {errorMessage && (
        <Typography color="error" sx={{ mt: 2 }}>
          {errorMessage}
        </Typography>
      )}
    </Box>
  );
};

export default Welcome;