import React, { useEffect, useRef } from 'react';
import { Box, Typography, Alert, Button, CircularProgress, Link } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useVerifyEmail } from '../api/authQueries';
import { useAuth } from '../context/AuthContext';
import { SUPPORT_EMAIL } from '../utils/support';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { user, updateUser } = useAuth();
  // Drive the UI off the mutation's own state (isPending/isSuccess/isError) so it
  // can't get stuck: per-call mutate() callbacks are fragile under StrictMode's
  // mount/unmount, but the hook's status is reliable.
  const { mutate: verify, isPending, isSuccess, isError, error } =
    useVerifyEmail();
  const fired = useRef(false);

  // Fire exactly once. A ref guard would reset on StrictMode's remount, so this
  // also tolerates a double-fire because the backend verify is now idempotent.
  useEffect(() => {
    if (!token || fired.current) return;
    fired.current = true;
    verify(token);
  }, [token, verify]);

  // On success, reconcile the local session so the banner clears immediately.
  useEffect(() => {
    if (isSuccess && user && !user.emailVerifiedAt) {
      updateUser({ emailVerifiedAt: new Date().toISOString() });
    }
  }, [isSuccess, user, updateUser]);

  // Treat "already verified" (a consumed/replayed token while logged in as a
  // verified user) as success rather than a misleading error.
  const verified = isSuccess || (isError && !!user?.emailVerifiedAt);
  const failed = isError && !verified;
  const showSpinner = !token ? false : isPending || (!verified && !failed);

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 8, p: 3, textAlign: 'center' }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Verificação de email
      </Typography>

      {!token && <Alert severity="error">Link de verificação inválido.</Alert>}

      {showSpinner && <CircularProgress />}

      {verified && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Seu email foi verificado com sucesso!
        </Alert>
      )}

      {failed && (
        <>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error
              ? error.message
              : 'Não foi possível verificar o email.'}
          </Alert>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Problemas? Fale com a gente:{' '}
            <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>
          </Typography>
        </>
      )}

      {(verified || failed || !token) && (
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
