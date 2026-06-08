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
    maxGk: number | null;
    maxDef: number | null;
    maxDefenders: number | null;
    maxMid: number | null;
    maxFwd: number | null;
}

export const useUpdateRosterSettings = ({ onSuccess, onError }: { onSuccess: () => void; onError?: (err: any) => void }) => {
  return useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: RosterSettings }) =>
      axios.patch(`${apiConfig.endpoints.rosterSettings.update(id)}`, updates, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      }),
    onSuccess,
    onError,
  });
};