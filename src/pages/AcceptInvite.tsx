// pages/invite/accept.tsx

import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { apiConfig } from '../api/config';
import { isAuthenticated } from '../utils/auth';
import { useMutation } from '@tanstack/react-query';

const InviteAcceptPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');
  const isUserAuthenticated = isAuthenticated();
  const hasAttempted = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  const acceptInviteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${apiConfig.endpoints.fantasyLeagueInvites.accept}?token=${token}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Falha ao aceitar o convite');
      }

      return res.json();
    },
    onSuccess: () => {
      localStorage.removeItem('league_invite_token');
      // setTimeout(() => navigate('/welcome'), 3000);
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  useEffect(() => {
    if (!token) return;

    if (!isUserAuthenticated) {
      localStorage.setItem('league_invite_token', token);
      navigate('/login');
    } else if (!hasAttempted.current) {
      hasAttempted.current = true;
      acceptInviteMutation.mutate();
    }
  }, [token, isUserAuthenticated, navigate, acceptInviteMutation]);


  if (errorMessage) return <p>{errorMessage}</p>;

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <CircularProgress />
      <Typography mt={2}>Aceitando convite...</Typography>
    </Box>
  );
};

export default InviteAcceptPage;
