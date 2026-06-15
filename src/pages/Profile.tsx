import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Divider,
  CircularProgress,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import {
  useUpdateProfile,
  useChangePassword,
} from '../api/userQueries';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    username: user?.username ?? '',
  });
  const [profileSaved, setProfileSaved] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdLocalError, setPwdLocalError] = useState('');

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaved(false);
    updateProfile.mutate(profile, {
      onSuccess: (updated) => {
        updateUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          email: updated.email,
          username: updated.username,
        });
        setProfileSaved(true);
      },
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdSaved(false);
    setPwdLocalError('');

    if (pwd.newPassword.length < 8) {
      setPwdLocalError('A nova senha deve ter no mínimo 8 caracteres.');
      return;
    }
    if (pwd.newPassword !== pwd.confirm) {
      setPwdLocalError('As senhas não coincidem.');
      return;
    }

    changePassword.mutate(
      { currentPassword: pwd.currentPassword, newPassword: pwd.newPassword },
      {
        onSuccess: () => {
          setPwd({ currentPassword: '', newPassword: '', confirm: '' });
          setPwdSaved(true);
        },
      },
    );
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        Minha conta
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Dados pessoais
        </Typography>

        {profileSaved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Perfil atualizado com sucesso.
          </Alert>
        )}
        {updateProfile.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {updateProfile.error instanceof Error
              ? updateProfile.error.message
              : 'Falha ao atualizar o perfil.'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleProfileSubmit}>
          <TextField
            label="Nome"
            fullWidth
            margin="normal"
            value={profile.firstName}
            onChange={(e) => setProfile((p) => ({ ...p, firstName: e.target.value }))}
          />
          <TextField
            label="Sobrenome"
            fullWidth
            margin="normal"
            value={profile.lastName}
            onChange={(e) => setProfile((p) => ({ ...p, lastName: e.target.value }))}
          />
          <TextField
            label="Nome de usuário"
            fullWidth
            margin="normal"
            value={profile.username}
            onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
          />
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            value={profile.email}
            onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={updateProfile.isPending}
            sx={{ mt: 2, backgroundColor: '#1a1a1a', '&:hover': { backgroundColor: '#333' } }}
          >
            {updateProfile.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Salvar alterações'
            )}
          </Button>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Alterar senha
        </Typography>

        {pwdSaved && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Senha alterada com sucesso.
          </Alert>
        )}
        {(changePassword.isError || pwdLocalError) && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {pwdLocalError ||
              (changePassword.error instanceof Error
                ? changePassword.error.message
                : 'Falha ao alterar a senha.')}
          </Alert>
        )}

        <Box component="form" onSubmit={handlePasswordSubmit}>
          <TextField
            label="Senha atual"
            type="password"
            fullWidth
            margin="normal"
            value={pwd.currentPassword}
            onChange={(e) => setPwd((p) => ({ ...p, currentPassword: e.target.value }))}
            required
          />
          <Divider sx={{ my: 1 }} />
          <TextField
            label="Nova senha"
            type="password"
            fullWidth
            margin="normal"
            value={pwd.newPassword}
            onChange={(e) => setPwd((p) => ({ ...p, newPassword: e.target.value }))}
            required
          />
          <TextField
            label="Confirmar nova senha"
            type="password"
            fullWidth
            margin="normal"
            value={pwd.confirm}
            onChange={(e) => setPwd((p) => ({ ...p, confirm: e.target.value }))}
            required
          />
          <Button
            type="submit"
            variant="contained"
            disabled={changePassword.isPending}
            sx={{ mt: 2, backgroundColor: '#1a1a1a', '&:hover': { backgroundColor: '#333' } }}
          >
            {changePassword.isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Alterar senha'
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Profile;
