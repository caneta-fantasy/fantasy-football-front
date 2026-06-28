import { useMutation } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export interface DraftSettings {
    draftType: 'snake' | 'linear';
    draftDate: string;
    pickTimer: number;
    rounds: number;
    season: number;
  };

export const useUpdateDraftSettings = (
  { onSuccess }: { onSuccess?: () => void } = {},
) => {
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: DraftSettings }) =>
      axios.patch(`${apiConfig.endpoints.draftSettings.update(id)}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
      }),
    onSuccess,
  });
};