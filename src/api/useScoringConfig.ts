import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/session';
import axios from 'axios';
import { apiConfig } from './config';

export interface ScoringConfigData {
  id: number;
  goalPoints: number;
  assistPoints: number;
  shotSavedPoints: number;
  shotOffTargetPoints: number;
  foulDrawnPoints: number;
  penaltyWonPoints: number;
  penaltyMissedPoints: number;
  offsidePoints: number;
  penaltySavedPoints: number;
  cleanSheetPoints: number;
  savePoints: number;
  tacklePoints: number;
  ownGoalPoints: number;
  redCardPoints: number;
  yellowCardPoints: number;
  goalConcededPoints: number;
  foulCommittedPoints: number;
  penaltyCommittedPoints: number;
}

export const useScoringConfig = (seasonId: string | undefined) => {
  return useQuery<ScoringConfigData>({
    queryKey: ['scoringConfig', seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.scoringConfig.getBySeason(seasonId!),
        { headers: { Authorization: `Bearer ${getToken()}` } },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });
};
