import React, { useState } from 'react';
import { Alert, Button, Snackbar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useResendVerification } from '../api/authQueries';

const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const { mutate: resend, isPending } = useResendVerification();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Only show for logged-in users whose email is not yet verified.
  if (!user || user.emailVerifiedAt) return null;

  const handleResend = () => {
    resend(undefined, {
      onSuccess: () => setFeedback('Email de verificação reenviado.'),
      onError: (e) =>
        setFeedback(e instanceof Error ? e.message : 'Falha ao reenviar.'),
    });
  };

  return (
    <>
      <Alert
        severity="warning"
        sx={{ borderRadius: 0 }}
        action={
          <Button color="inherit" size="small" onClick={handleResend} disabled={isPending}>
            Reenviar
          </Button>
        }
      >
        Seu email ainda não foi verificado. Verifique sua caixa de entrada para
        receber os convites das ligas.
      </Alert>
      <Snackbar
        open={!!feedback}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        message={feedback}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default EmailVerificationBanner;
