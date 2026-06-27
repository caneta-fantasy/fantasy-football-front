import React, { useContext, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Link,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/pt-br';
import { useSignUp, useLogIn } from '../api/authQueries';
import { AuthContext } from '../context/AuthContext';
import { BrandCrest } from '../ds';
import Loading from '../components/Loading';
import {
  evaluatePassword,
  isPasswordAcceptable,
  passwordRulesEnforced,
} from '../utils/passwordPolicy';

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
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: null as Dayjs | null,
    username: '',
  });

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
    birthDate: false,
    username: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  const { mutate: signUp, isPending } = useSignUp();
  const { mutateAsync: logIn, isPending: isLoggingIn } = useLogIn();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: false }));
    setSubmitError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const passwordsMismatch =
      !!formData.password && formData.password !== formData.confirmPassword;
    const passwordWeak = !isPasswordAcceptable(formData.password);

    // Validate all fields
    const newErrors = {
      email: !formData.email,
      password: !formData.password || passwordWeak,
      confirmPassword: !formData.confirmPassword || passwordsMismatch,
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      birthDate: !formData.birthDate,
      username: !formData.username,
    };

    setErrors(newErrors);
    if (formData.password && passwordWeak) {
      setSubmitError('A senha não atende aos requisitos.');
      return;
    }
    if (passwordsMismatch) {
      setSubmitError('As senhas não coincidem.');
      return;
    }
    if (Object.values(newErrors).some(error => error)) return;

    const payload: SignUpFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      username: formData.username,
      birthDate: formData.birthDate?.format('YYYY-MM-DD') || '',
    };

    signUp(payload, {
      onSuccess: async () => {
        // Auto-login right after signup instead of bouncing to /signin.
        try {
          const data = await logIn({
            email: formData.email,
            password: formData.password,
          });
          auth?.login(data.access_token, data.user);
          navigate('/welcome');
        } catch {
          // Account was created but auto-login failed — fall back to /signin.
          navigate('/signin', {
            state: {
              message: 'Cadastro realizado com sucesso! Faça login.',
            },
          });
        }
      },
      onError: (err) => {
        setSubmitError(
          err instanceof Error ? err.message : 'Falha ao criar sua conta, tente novamente.',
        );
      },
    });
  };

  if (isPending || isLoggingIn)
    return <Loading message="Criando sua conta..." fullScreen />;

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
          
          {submitError && (
            <Typography color="error" sx={{ mb: 2 }}>
              {submitError}
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
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Digite sua senha"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              helperText={errors.password ? "Senha é obrigatória" : ""}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      onClick={() => setShowPassword((v) => !v)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Live requirements checklist — only when rules are enforced (prod). */}
            {passwordRulesEnforced() && formData.password.length > 0 && (
              <Box sx={{ mt: 0.5, mb: 0.5 }}>
                {evaluatePassword(formData.password).requirements.map((req) => (
                  <Typography
                    key={req.key}
                    variant="caption"
                    component="div"
                    sx={{
                      color: req.met ? 'success.main' : 'text.secondary',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                    }}
                  >
                    {req.met ? '✓' : '○'} {req.label}
                  </Typography>
                ))}
              </Box>
            )}

            <TextField
              name="confirmPassword"
              label="Repita a senha"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              fullWidth
              margin="normal"
              placeholder="Repita sua senha"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              helperText={
                errors.confirmPassword
                  ? formData.confirmPassword
                    ? 'As senhas não coincidem'
                    : 'Confirme sua senha'
                  : ''
              }
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
              disabled={isPending || isLoggingIn}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: '#1a1a1a',
                '&:hover': { backgroundColor: '#333' }
              }}
            >
              {isPending || isLoggingIn ? (
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