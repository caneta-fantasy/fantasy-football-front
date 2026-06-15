import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Link,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useLogIn } from '../api/authQueries';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';

const SignIn: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false,
  });

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = (location.state as { message?: string })?.message;
  const { mutate: signIn, isPending, isError, error } = useLogIn();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate fields
    const newErrors = {
      email: !formData.email,
      password: !formData.password,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) return;

    signIn(formData, {
      onSuccess: (data) => {
        login(data.access_token, data.user);
      
        const redirect = localStorage.getItem('postLoginRedirect');

        if (redirect) {
          localStorage.removeItem('postLoginRedirect');
          navigate(redirect);
        } else {
          navigate('/welcome');
        }
      }
    });
  };

  if (isPending) return <Loading message="Entrando na sua conta..." fullScreen />;

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
          mx: 'auto'
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
          Entrar na sua conta
        </Typography>
        
        {successMessage && (
          <Typography color="success.main" sx={{ mb: 2 }}>
            {successMessage}
          </Typography>
        )}

        {isError && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Falha no login. Verifique suas credenciais.'}
          </Typography>
        )}
        
        <Box 
          component="form" 
          sx={{ width: '100%' }} 
          onSubmit={handleSubmit}
        >
          <TextField
            name="email"
            label="Email"
            type="email"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Digite seu email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            helperText={errors.email ? "Email é obrigatório" : ""}
            required
          />
          
          <TextField
            name="password"
            label="Senha"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            placeholder="Digite sua senha"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            helperText={errors.password ? "Senha é obrigatória" : ""}
            required
          />

          <Box sx={{ textAlign: 'right', mt: 1 }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Esqueceu a senha?
            </Link>
          </Box>

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
              '&:hover': {
                backgroundColor: '#333',
              }
            }}
          >
            {isPending ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Continuar'
            )}
          </Button>
        </Box>
        
        <Typography variant="body1" sx={{ mt: 2 }}>
          Não tem uma conta?{' '}
          <Link component={RouterLink} to="/signup" sx={{ fontWeight: 'bold' }}>
            Cadastre-se
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignIn;