import React, { useEffect, useRef } from 'react';
import { Box, Typography, Alert, Button, CircularProgress } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '../api/authQueries';
import { useAuth } from '../context/AuthContext';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { user, updateUser } = useAuth();
  const { mutate: verify, isPending, isError, error, isSuccess } = useVerifyEmail();
  const attempted = useRef(false);

  useEffect(() => {
    if (token && !attempted.current) {
      attempted.current = true;
      verify(token, {
        onSuccess: () => {
          if (user) updateUser({ emailVerifiedAt: new Date().toISOString() });
        },
      });
    }
  }, [token, verify, user, updateUser]);

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Verificação de email
      </Typography>

      {!token && (
        <Alert severity="error">Link de verificação inválido.</Alert>
      )}

      {isPending && <CircularProgress />}

      {isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Seu email foi verificado com sucesso!
        </Alert>
      )}

      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Não foi possível verificar o email.'}
        </Alert>
      )}

      {(isSuccess || isError) && (
        <Button
          component={RouterLink}
          to="/welcome"
          variant="contained"
          sx={{ mt: 2, backgroundColor: '#1a1a1a', '&:hover': { backgroundColor: '#333' } }}
        >
          Ir para o início
        </Button>
      )}
    </Box>
  );
};

export default VerifyEmail;
