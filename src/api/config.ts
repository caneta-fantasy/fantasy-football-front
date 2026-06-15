
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const endpoints = {
  auth: {
    signup: `${API_BASE_URL}/users/signup`,
    signin: `${API_BASE_URL}/users/signin`,
    login: `${API_BASE_URL}/auth/login`,
    refresh: `${API_BASE_URL}/auth/refresh`,
    profile: `${API_BASE_URL}/auth/profile`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    verifyEmail: `${API_BASE_URL}/users/verify-email`,
    resendVerification: `${API_BASE_URL}/users/me/resend-verification`,
  },
  users: {
    update: `${API_BASE_URL}/users/update`,
    findUserFantasyLeagueTeam: (id: number, fantasyLeagueId: number) => `${API_BASE_URL}/users/${id}/fantasy-leagues/${fantasyLeagueId}`,
  },
  fantasyLeagues: {
    create: `${API_BASE_URL}/fantasy-leagues`,
    get: `${API_BASE_URL}/fantasy-leagues`,
    myLeagues: `${API_BASE_URL}/fantasy-leagues/my-leagues`,
    join: `${API_BASE_URL}/fantasy-leagues/join`,
    byCode: (code: string) => `${API_BASE_URL}/fantasy-leagues/by-code/${code}`,
    getLeague: `${API_BASE_URL}/fantasy-leagues`,
    update: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}`,
    getInvitesByLeagueId: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}/invites`,
    getLeagueTeams: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}/teams`,
    getRosterSettings: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}/roster-settings`,
    getDraftSettings: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}/draft-settings`,
    getFantasyLeagueSeasons: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}/fantasy-league-seasons`,
    delete: (id: number) => `${API_BASE_URL}/fantasy-leagues/${id}`,
  },
  fantasyLeagueInvites: {
    invite: `${API_BASE_URL}/fantasy-league-invitations/invite-by-email`,
    accept: `${API_BASE_URL}/fantasy-league-invitations/accept`,
    cancel: (inviteId: number) => `${API_BASE_URL}/fantasy-league-invitations/${inviteId}`,
  },
  fantasyLeagueSeasons: {
    create: `${API_BASE_URL}/fantasy-league-seasons`,
    byLeague: (leagueId: number) => `${API_BASE_URL}/fantasy-league-seasons/by-league/${leagueId}`,
    get: (seasonId: string) => `${API_BASE_URL}/fantasy-league-seasons/${seasonId}`,
    activate: (seasonId: string) => `${API_BASE_URL}/fantasy-league-seasons/${seasonId}/activate`,
    update: (id: number) => `${API_BASE_URL}/fantasy-league-seasons/${id}`,
    scheduleDraft: (seasonId: string) => `${API_BASE_URL}/fantasy-league-seasons/${seasonId}/schedule-draft`,
  },
  rosterSettings: {
    update: (id: number) => `${API_BASE_URL}/roster-settings/${id}`,
  },
  draftSettings: {
    update: (id: number) => `${API_BASE_URL}/draft-settings/${id}`,
  },
  userTeams: {
    delete: (id: number) => `${API_BASE_URL}/user-teams/${id}`,
  },
  players: {
    getAll: `${API_BASE_URL}/players`,
    getFilters: `${API_BASE_URL}/players/filters/data`,
    squad: (teamId: number) => `${API_BASE_URL}/players/squad/${teamId}`,
  },
  drafts: {
    get: (leagueId: number, season: number) => `${API_BASE_URL}/drafts/${leagueId}/${season}`,
    presence: (draftId: string) => `${API_BASE_URL}/drafts/${draftId}/presence`,
    resetTimer: (draftId: string) => `${API_BASE_URL}/drafts/${draftId}/reset-timer`,
    freeze: (draftId: string) => `${API_BASE_URL}/drafts/${draftId}/freeze`,
    unfreeze: (draftId: string) => `${API_BASE_URL}/drafts/${draftId}/unfreeze`,
    frozen: (draftId: string) => `${API_BASE_URL}/drafts/${draftId}/frozen`,
  },
  draftOrder: {
    get: (leagueId: number, season: number) => `${API_BASE_URL}/fantasy-leagues/${leagueId}/draft-order?season=${season}`,
    set: (leagueId: number) => `${API_BASE_URL}/fantasy-leagues/${leagueId}/draft-order`,
  },
  fantasyMatchups: {
    bySeason: (seasonId: string) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}`,
    byRound: (seasonId: string, round: number) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/round/${round}`,
    byTeam: (seasonId: string, teamId: number) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/team/${teamId}`,
    standings: (seasonId: string) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/standings`,
    playoffs: (seasonId: string) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/playoffs`,
    rosterSnapshot: (matchupId: string) => `${API_BASE_URL}/fantasy-matchups/${matchupId}/roster-snapshot`,
    scoreAll: (seasonId: string) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/score-all`,
    validateConfig: `${API_BASE_URL}/fantasy-matchups/validate-config`,
    delete: (seasonId: string) => `${API_BASE_URL}/fantasy-matchups/season/${seasonId}`,
  },
  roundMappings: {
    calendar: (seasonId: string) =>
      `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/round-calendar`,
    skip: (seasonId: string, realRound: number) =>
      `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/skip/${realRound}`,
    unskip: (seasonId: string, realRound: number) =>
      `${API_BASE_URL}/fantasy-matchups/season/${seasonId}/unskip/${realRound}`,
  },
  fantasyRoundGames: {
    lockedTeams: (leagueExternalId: number, seasonYear: number, roundNumber: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/round/${roundNumber}/locked-teams`,
    syncAll: (leagueExternalId: number, seasonYear: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/sync-all`,
    syncFromRealRound: (leagueExternalId: number, seasonYear: number, roundNumber: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/round/${roundNumber}/sync`,
    listMatches: (leagueExternalId: number, seasonYear: number, roundNumber: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/round/${roundNumber}/matches`,
    addMatch: (leagueExternalId: number, seasonYear: number, roundNumber: number, matchId: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/round/${roundNumber}/matches/${matchId}`,
    removeMatch: (leagueExternalId: number, seasonYear: number, roundNumber: number, matchId: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/round/${roundNumber}/matches/${matchId}`,
    orphaned: (leagueExternalId: number, seasonYear: number) =>
      `${API_BASE_URL}/fantasy-round-games/league/${leagueExternalId}/season/${seasonYear}/orphaned`,
  },
  matches: {
    byRound: (seasonYear: number, roundNumber: number) =>
      `${API_BASE_URL}/matches/by-round?seasonYear=${seasonYear}&roundNumber=${roundNumber}`,
    venues: (leagueExternalId: number, seasonYear: number) =>
      `${API_BASE_URL}/matches/venues?leagueExternalId=${leagueExternalId}&seasonYear=${seasonYear}`,
    patch: (matchId: number) => `${API_BASE_URL}/matches/${matchId}`,
  },
  syncMatchInfo: {
    refreshRound: (leagueExternalId: number, seasonYear: number, roundNumber: number) =>
      `${API_BASE_URL}/sync/matches/league/${leagueExternalId}/season/${seasonYear}/round/${roundNumber}/refresh-info`,
  },
  syncPlayers: {
    syncTeam: (teamExternalId: number) =>
      `${API_BASE_URL}/sync/players/team/${teamExternalId}`,
    syncAll: (leagueExternalId: number, seasonYear: number) =>
      `${API_BASE_URL}/sync/players/league/${leagueExternalId}/season/${seasonYear}`,
  },
  scoringConfig: {
    getBySeason: (seasonId: string) => `${API_BASE_URL}/scoring-config/season/${seasonId}`,
    update: (seasonId: string) => `${API_BASE_URL}/scoring-config/season/${seasonId}`,
  },
  playerFantasyPoints: {
    computeSeason: (seasonId: string) => `${API_BASE_URL}/player-fantasy-points/compute/season/${seasonId}`,
    rankings: (seasonId: string) => `${API_BASE_URL}/player-fantasy-points/rankings/season/${seasonId}`,
    redraft: (seasonId: string) => `${API_BASE_URL}/player-fantasy-points/redraft/season/${seasonId}`,
    playerHistory: (playerId: number, seasonId: string) => `${API_BASE_URL}/player-fantasy-points/player/${playerId}/season/${seasonId}`,
    byRound: (seasonId: string, roundNumber: number) => `${API_BASE_URL}/player-fantasy-points/season/${seasonId}/round/${roundNumber}`,
  },
  waiver: {
    placeClaim: `${API_BASE_URL}/waiver/claims`,
    cancelClaim: (claimId: string) => `${API_BASE_URL}/waiver/claims/${claimId}`,
    claimsBySeason: (seasonId: string) => `${API_BASE_URL}/waiver/claims/season/${seasonId}`,
    historyBySeason: (seasonId: string) => `${API_BASE_URL}/waiver/claims/season/${seasonId}/history`,
    budgetsBySeason: (seasonId: string) => `${API_BASE_URL}/waiver/budgets/season/${seasonId}`,
    windowStatus: (leagueExternalId: number, seasonYear: number) => `${API_BASE_URL}/waiver/status/${leagueExternalId}/${seasonYear}`,
  },
  roundFlow: {
    list: `${API_BASE_URL}/round-flow`,
    byId: (id: number) => `${API_BASE_URL}/round-flow/${id}`,
    activate: `${API_BASE_URL}/round-flow/activate`,
    update: (id: number) => `${API_BASE_URL}/round-flow/${id}`,
    triggerLiveStart: (id: number) => `${API_BASE_URL}/round-flow/${id}/trigger-live-start`,
    triggerRoundEnd: (id: number) => `${API_BASE_URL}/round-flow/${id}/trigger-round-end`,
    triggerWaiverOpen: (id: number) => `${API_BASE_URL}/round-flow/${id}/trigger-waiver-open`,
    triggerWaiverResolve: (id: number) => `${API_BASE_URL}/round-flow/${id}/trigger-waiver-resolve`,
    cancel: (id: number) => `${API_BASE_URL}/round-flow/${id}/cancel`,
  },
  marketTransactions: {
    bySeason: (seasonId: string) => `${API_BASE_URL}/market-transactions/season/${seasonId}`,
  },
  trades: {
    bySeason: (seasonId: string) => `${API_BASE_URL}/trades/season/${seasonId}`,
    byId: (id: string) => `${API_BASE_URL}/trades/${id}`,
    propose: `${API_BASE_URL}/trades`,
    accept: (id: string) => `${API_BASE_URL}/trades/${id}/accept`,
    reject: (id: string) => `${API_BASE_URL}/trades/${id}/reject`,
    cancel: (id: string) => `${API_BASE_URL}/trades/${id}/cancel`,
    veto: (id: string) => `${API_BASE_URL}/trades/${id}/veto`,
    process: (id: string) => `${API_BASE_URL}/trades/${id}/process`,
  },
  simulator: {
    leagues: `${API_BASE_URL}/simulator/leagues`,
    league: `${API_BASE_URL}/simulator/league`,
    deleteLeague: (leagueId: number) => `${API_BASE_URL}/simulator/leagues/${leagueId}`,
    recreateLeague: (leagueId: number) => `${API_BASE_URL}/simulator/leagues/${leagueId}/recreate`,
    start: (seasonId: string) => `${API_BASE_URL}/simulator/seasons/${seasonId}/start`,
    advance: (seasonId: string) => `${API_BASE_URL}/simulator/seasons/${seasonId}/advance`,
    lockedTeams: (seasonId: string) => `${API_BASE_URL}/simulator/seasons/${seasonId}/locked-teams`,
  },
  currentSeason: `${API_BASE_URL}/current-season`,
  usersTeamsRoster: {
    addPlayer: `${API_BASE_URL}/user-team-rosters`,
    replacePlayer: `${API_BASE_URL}/user-team-rosters/replace`,
    deletePlayer: (id: number) => `${API_BASE_URL}/user-team-rosters/${id}`,
    movePlayer: `${API_BASE_URL}/user-team-rosters/move`,
    getRoster: (userTeamId: number, season: number) => `${API_BASE_URL}/user-team-rosters/team/${userTeamId}/season/${season}`,
  },
};

const headers = {
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const queryConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
};

export const apiConfig = {
  baseUrl: API_BASE_URL,
  endpoints,
  headers,
  queryConfig,
};