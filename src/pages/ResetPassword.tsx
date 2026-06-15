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
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../api/authQueries';

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localError, setLocalError] = useState('');
  const { mutate: resetPassword, isPending, isError, error } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 8) {
      setLocalError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setLocalError('As senhas não coincidem.');
      return;
    }

    resetPassword(
      { token, password },
      {
        onSuccess: () => {
          navigate('/signin', {
            state: { message: 'Senha redefinida com sucesso. Faça login.' },
          });
        },
      },
    );
  };

  if (!token) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{ flexGrow: 1, p: 3, maxWidth: 400, mx: 'auto', mt: 8 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Link inválido ou expirado.
          </Alert>
          <Link component={RouterLink} to="/forgot-password" sx={{ fontWeight: 'bold' }}>
            Solicitar um novo link
          </Link>
        </Box>
      </Box>
    );
  }

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
          Criar nova senha
        </Typography>

        {(isError || localError) && (
          <Typography color="error" sx={{ mb: 2 }}>
            {localError ||
              (error instanceof Error ? error.message : 'Algo deu errado.')}
          </Typography>
        )}

        <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
          <TextField
            name="password"
            label="Nova senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <TextField
            name="confirm"
            label="Confirmar senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
              'Redefinir senha'
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ResetPassword;
