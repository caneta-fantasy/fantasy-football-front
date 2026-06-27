import { useMutation } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';
import { ScoringConfigData } from './useScoringConfig';

export const useUpdateScoringConfig = ({ onSuccess }: { onSuccess: () => void }) => {
  return useMutation({
    mutationFn: ({
      seasonId,
      updates,
    }: {
      seasonId: string;
      updates: Partial<ScoringConfigData>;
    }) =>
      axios.patch(
        apiConfig.endpoints.scoringConfig.update(seasonId),
        updates,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getToken()}`,
          },
        },
      ),
    onSuccess,
  });
};
