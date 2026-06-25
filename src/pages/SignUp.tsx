import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Link,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useMutation } from '@tanstack/react-query';
import { useSignUp } from '../api/authQueries';
import { BrandCrest } from '../ds';
import Loading from '../components/Loading';

dayjs.locale('pt-br');

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  username: string;
  birthDate: string;
}

const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    birthDate: null as Dayjs | null,
    username: '',
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    firstName: false,
    lastName: false,
    birthDate: false,
    username: false,
  });

  const navigate = useNavigate();
  const { mutate: signUp, isPending } = useSignUp();

  const signUpMutation = useMutation({
    mutationFn: async (userData: SignUpFormData) => {
      const response = await fetch('http://localhost:4000/users/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha no cadastro');
      }
      return response.json();
    },
    onSuccess: () => {
      navigate('/signin', {
        state: { message: 'Cadastro realizado com sucesso! Faça login.' }
      });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      email: !formData.email,
      password: !formData.password,
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      birthDate: !formData.birthDate,
      username: !formData.username,
    };

    setErrors(newErrors);

    if (Object.values(newErrors).some(error => error)) return;
    signUp({
      ...formData,
      birthDate: formData.birthDate?.format('YYYY-MM-DD') || '',
    }, {
      onSuccess: () => {
        navigate('/signin', {
          state: { message: 'Cadastro realizado com sucesso! Faça login.' }
        });
      }
    });
  };

  if (isPending) return <Loading message="Criando sua conta..." fullScreen />;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flexGrow: 1,
          p: 3,
          maxWidth: 400,
          mx: 'auto'
        }}>
          <Box sx={{ mb: 2 }}>
            <BrandCrest size={72} />
          </Box>
          <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Crie sua conta
          </Typography>
          
          {signUpMutation.isError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {signUpMutation.error instanceof Error 
                ? signUpMutation.error.message 
                : 'Falha ao criar sua conta, tente novamente.'}
            </Typography>
          )}
          
          <Box component="form" sx={{ width: '100%' }} onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="firstName"
                label="Nome"
                variant="outlined"
                fullWidth
                margin="normal"
                placeholder="Digite seu nome"
                value={formData.firstName}
                onChange={handleChange}
                error={errors.firstName}
                helperText={errors.firstName ? "Nome é obrigatório" : ""}
                required
              />
              
              <TextField
                name="lastName"
                label="Sobrenome"
                variant="outlined"
                fullWidth
                margin="normal"
                placeholder="Digite seu sobrenome"
                value={formData.lastName}
                onChange={handleChange}
                error={errors.lastName}
                helperText={errors.lastName ? "Sobrenome é obrigatório" : ""}
                required
              />
            </Box>

            <TextField
              name="username"
              label="Apelido"
              type="text"
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Apelido"
              value={formData.username}
              onChange={handleChange}
              error={errors.username}
              helperText={errors.email ? "Email é obrigatório" : ""}
              required
            />
            
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
            
            <DatePicker
              label="Data de Nascimento"
              value={formData.birthDate}
              onChange={(newValue) => setFormData(prev => ({ ...prev, birthDate: newValue }))}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true,
                  margin: 'normal',
                  error: errors.birthDate,
                  helperText: errors.birthDate ? "Data de nascimento é obrigatória" : "",
                  required: true,
                },
              }}
            />
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={signUpMutation.isPending}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#1a1a1a',
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              {signUpMutation.isPending ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Criar Conta'
              )}
            </Button>
          </Box>
          
          <Typography variant="body1" sx={{ mt: 2 }}>
            Já tem uma conta?{' '}
            <Link component={RouterLink} to="/signin" sx={{ fontWeight: 'bold' }}>
              Entrar
            </Link>
          </Typography>
        </Box>
      </Box>
    </LocalizationProvider>
  );
};

export default SignUp;