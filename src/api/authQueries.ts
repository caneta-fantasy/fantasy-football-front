import { useMutation, useQuery } from '@tanstack/react-query';
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


export const useGetCurrentUser = () => {
  return useQuery<User>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await axios.get(
        apiConfig.endpoints.auth.profile,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    },
  });
};