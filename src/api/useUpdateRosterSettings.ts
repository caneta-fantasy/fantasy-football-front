import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';

export type DefenseType = 'OPEN' | 'CLOSED';

export interface RosterSettings {
    id: number;
    starterSkillSlots: number;
    minStarterMidfielders: number;
    minStarterForwards: number;
    benchSlots: number;
    starterDefenseSlots: number;
    defenseType: DefenseType;
}

export const useUpdateRosterSettings = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: RosterSettings }) =>
      axios.patch(`${apiConfig.endpoints.rosterSettings.update(id)}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    onSuccess: onSuccess,
  });
};