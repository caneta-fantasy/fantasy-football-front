import { useMutation, useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import { apiConfig } from './config';
import axios from 'axios';
import { User } from './fantasyLeagueQueries';

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  birthDate: string;
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: async (data: SignUpData) => {
      const response = await fetch(apiConfig.endpoints.auth.signup, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Signup failed');
      }
      return response.json();
    },
  });
};

interface SignInData {
  email: string;
  password: string;
}

export const useLogIn = () => {
  return useMutation({
    mutationFn: async (data: SignInData) => {

      const response = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      return response.json();
    },
  });
};


export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch(apiConfig.endpoints.auth.forgotPassword, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ email }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao solicitar redefinição');
      }
      return response.json();
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: { token: string; password: string }) => {
      const response = await fetch(apiConfig.endpoints.auth.resetPassword, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao redefinir a senha');
      }
      return response.json();
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch(apiConfig.endpoints.auth.verifyEmail, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify({ token }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao verificar o email');
      }
      return response.json();
    },
  });
};

export const useResendVerification = () => {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch(apiConfig.endpoints.auth.resendVerification, {
        method: 'POST',
        headers: {
          ...apiConfig.headers,
          Authorization: `Bearer ${getToken()}`,
        },
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Falha ao reenviar verificação');
      }
      return response.json();
    },
  });
};

export const useGetCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get(
        apiConfig.endpoints.auth.profile,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        }
      );
      return response.data;
    },
  });
};