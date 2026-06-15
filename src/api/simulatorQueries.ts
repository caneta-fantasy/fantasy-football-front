import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { apiConfig } from './config';

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

export type SimulationFillMode = 'AUTO_FILL' | 'MANUAL_DRAFT';

export type SimulationPlayoffEvent = 'BRACKET_GENERATED' | 'ADVANCED' | 'CHAMPION' | null;

export interface SimulationState {
  leagueId: number;
  leagueName: string;
  seasonId: string;
  seasonYear: number;
  status: string;
  fillMode: SimulationFillMode | null;
  numberOfTeams: number;
  numberOfRounds: number;
  playoffStartRound: number | null;
  currentFantasyRound: number | null;
  currentRealRound: number | null;
  maxAvailableRealRound: number;
  championTeamId: number | null;
  championTeamName: string | null;
}

export interface SimulationMatchup {
  id: string;
  roundNumber: number;
  homeTeamId: number | null;
  homeTeamName: string | null;
  awayTeamId: number | null;
  awayTeamName: string | null;
  homeScore: number | null;
  awayScore: number | null;
  winnerId: number | null;
  status: string;
  isGhost: boolean;
}

export interface AdvanceRoundResult {
  fantasyRound: number;
  realRound: number;
  matchups: SimulationMatchup[];
  playoffEvent: SimulationPlayoffEvent;
  championTeamId: number | null;
  seasonStatus: string;
  nextFantasyRound: number | null;
}

export interface AdvanceSimulationResponse {
  results: AdvanceRoundResult[];
  error: string | null;
  state: SimulationState;
}

export type SimulationDefenseType = 'CLOSED' | 'OPEN';

export type SimulationPlayoffFormat =
  | 'single_game'
  | 'two_leg_single_game_final'
  | 'two_leg_all';

export interface CreateSimulationLeagueInput {
  name: string;
  numberOfTeams: number;
  numberOfRounds?: number;
  fillMode: SimulationFillMode;
  defenseType?: SimulationDefenseType;
  playoffTeams?: number;
  playoffFormat?: SimulationPlayoffFormat;
}

export interface SimulationLockedTeam {
  id: number;
  name: string;
  logoUrl: string | null;
  locked: boolean;
}

// Query keys the league pages depend on — invalidated after every sim mutation
// so the normal league UI reflects advances immediately
const LEAGUE_PAGE_KEYS = [
  ['myLeagues'],
  ['fantasyMatchups'],
  ['fantasyLeagueSeasons'],
  ['standings'],
  ['roundCalendar'],
];

function invalidateLeaguePages(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['simulation'] });
  LEAGUE_PAGE_KEYS.forEach((key) => qc.invalidateQueries({ queryKey: key }));
}

export function useSimulationLeague() {
  return useQuery<SimulationState | null>({
    queryKey: ['simulation', 'league'],
    queryFn: async () => {
      const res = await axios.get(apiConfig.endpoints.simulator.league, {
        headers: authHeader(),
      });
      return res.data || null;
    },
  });
}

export function useCreateSimulationLeague() {
  const qc = useQueryClient();
  return useMutation<SimulationState, Error, CreateSimulationLeagueInput>({
    mutationFn: async (input) => {
      const res = await axios.post(apiConfig.endpoints.simulator.leagues, input, {
        headers: authHeader(),
      });
      return res.data;
    },
    onSuccess: () => invalidateLeaguePages(qc),
  });
}

export function useStartSimulationSeason() {
  const qc = useQueryClient();
  return useMutation<SimulationState, Error, string>({
    mutationFn: async (seasonId) => {
      const res = await axios.post(
        apiConfig.endpoints.simulator.start(seasonId),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: () => invalidateLeaguePages(qc),
  });
}

export function useAdvanceSimulation() {
  const qc = useQueryClient();
  return useMutation<
    AdvanceSimulationResponse,
    Error,
    { seasonId: string; rounds?: number; toPlayoffs?: boolean }
  >({
    mutationFn: async ({ seasonId, rounds, toPlayoffs }) => {
      const res = await axios.post(
        apiConfig.endpoints.simulator.advance(seasonId),
        { rounds, toPlayoffs },
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: () => invalidateLeaguePages(qc),
  });
}

export function useSimulationLockedTeams(seasonId: string | null | undefined) {
  return useQuery<{ teams: SimulationLockedTeam[] }>({
    queryKey: ['simulation', 'lockedTeams', seasonId],
    queryFn: async () => {
      const res = await axios.get(
        apiConfig.endpoints.simulator.lockedTeams(seasonId!),
        { headers: authHeader() },
      );
      return res.data;
    },
    enabled: !!seasonId,
  });
}

export function useSetSimulationLockedTeams() {
  const qc = useQueryClient();
  return useMutation<void, Error, { seasonId: string; teamIds: number[] }>({
    mutationFn: async ({ seasonId, teamIds }) => {
      await axios.put(
        apiConfig.endpoints.simulator.lockedTeams(seasonId),
        { teamIds },
        { headers: authHeader() },
      );
    },
    onSuccess: (_data, { seasonId }) => {
      qc.invalidateQueries({ queryKey: ['simulation', 'lockedTeams', seasonId] });
      qc.invalidateQueries({ queryKey: ['lockedTeams'] });
    },
  });
}

export function useDeleteSimulationLeague() {
  const qc = useQueryClient();
  return useMutation<{ deleted: true }, Error, number>({
    mutationFn: async (leagueId) => {
      const res = await axios.delete(
        apiConfig.endpoints.simulator.deleteLeague(leagueId),
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: () => invalidateLeaguePages(qc),
  });
}

export function useRecreateSimulationLeague() {
  const qc = useQueryClient();
  return useMutation<SimulationState, Error, number>({
    mutationFn: async (leagueId) => {
      const res = await axios.post(
        apiConfig.endpoints.simulator.recreateLeague(leagueId),
        {},
        { headers: authHeader() },
      );
      return res.data;
    },
    onSuccess: () => invalidateLeaguePages(qc),
  });
}
