import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';
import { authHeader } from './httpClient';

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
  username?: string;
}

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const res = await axios.put(
        `${apiConfig.baseUrl}/users/me`,
        data,
        { headers: authHeader() },
      );
      return res.data;
    },
  });
};

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const res = await axios.post(
        `${apiConfig.baseUrl}/users/me/change-password`,
        data,
        { headers: authHeader() },
      );
      return res.data;
    },
  });
};
