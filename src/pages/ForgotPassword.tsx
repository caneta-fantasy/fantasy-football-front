import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  CircularProgress,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useForgotPassword } from '../api/authQueries';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending, isError, error } = useForgotPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    forgotPassword(email, {
      onSuccess: () => setSubmitted(true),
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          p: 3,
          maxWidth: 400,
          mx: 'auto',
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
          Redefinir senha
        </Typography>

        {submitted ? (
          <>
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              Se o email estiver cadastrado, você receberá instruções para
              redefinir sua senha.
            </Alert>
            <Link component={RouterLink} to="/signin" sx={{ fontWeight: 'bold' }}>
              Voltar para o login
            </Link>
          </>
        ) : (
          <>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Digite seu email e enviaremos um link para criar uma nova senha.
            </Typography>

            {isError && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error instanceof Error ? error.message : 'Algo deu errado.'}
              </Typography>
            )}

            <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
              <TextField
                name="email"
                label="Email"
                type="email"
                variant="outlined"
                fullWidth
                margin="normal"
                placeholder="Digite seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isPending}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  backgroundColor: '#1a1a1a',
                  '&:hover': { backgroundColor: '#333' },
                }}
              >
                {isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Enviar link'
                )}
              </Button>
            </Box>

            <Typography variant="body1" sx={{ mt: 2 }}>
              Lembrou da senha?{' '}
              <Link component={RouterLink} to="/signin" sx={{ fontWeight: 'bold' }}>
                Entrar
              </Link>
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ForgotPassword;
