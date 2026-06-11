import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';

export interface FantasyMatchupDto {
  id: string;
  roundNumber: number;
  // Real-league round this fantasy round maps to (equals roundNumber unless skipped)
  realRound: number;
  homeTeamId: number | null;
  homeTeamName: string | null;
  homeOwnerName: string | null;
  awayTeamId: number | null;
  awayTeamName: string | null;
  awayOwnerName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: number | null;
  status: string;
  matchupType: string;
  isGhost: boolean;
  playoffStage: number | null;
  twoLegPairId: string | null;
  playoffSeed: { homeSeed: number; awaySeed: number } | null;
}

export interface ScheduleByRoundDto {
  roundNumber: number;
  matchups: FantasyMatchupDto[];
}

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

export interface StandingDto {
  teamId: number;
  teamName: string;
  ownerName?: string | null;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  pointsFor: number;
  pointsAgainst: number;
  seed: number;
}

export const useScheduleBySeason = (seasonId: string | undefined) =>
  useQuery<ScheduleByRoundDto[]>({
    queryKey: ['fantasyMatchups', seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyMatchups.bySeason(seasonId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });

export const useStandings = (seasonId: string | undefined) =>
  useQuery<StandingDto[]>({
    queryKey: ['standings', seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyMatchups.standings(seasonId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });

export interface SnapshotSlotDto {
  playerId: number;
  playerName: string | null;
  playerPhoto: string | null;
  playerPosition: string | null;
  playerTeamId: number | null;
  rosterSlot: string;
  slotType: 'starter' | 'bench';
  slotIndex: number;
  points: number;
}

export interface SnapshotTeamDto {
  teamId: number;
  teamName: string;
  score: number | null;
  slots: SnapshotSlotDto[];
}

export interface MatchupRosterSnapshotDto {
  roundNumber: number;
  homeTeam: SnapshotTeamDto | null;
  awayTeam: SnapshotTeamDto | null;
}

export const useMatchupRosterSnapshot = (matchupId: string | undefined) =>
  useQuery<MatchupRosterSnapshotDto>({
    queryKey: ['matchupRosterSnapshot', matchupId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyMatchups.rosterSnapshot(matchupId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!matchupId,
  });

export const usePlayoffMatchups = (seasonId: string | undefined) =>
  useQuery<FantasyMatchupDto[]>({
    queryKey: ['playoffs', seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.fantasyMatchups.playoffs(seasonId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });
