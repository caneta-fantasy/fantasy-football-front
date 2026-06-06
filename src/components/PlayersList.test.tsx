import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock the data layer. Each hook is a vi.fn() driven per-test; query
//     keys/args are asserted from the call arguments where it matters. ─────────
const usePlayers = vi.fn()
const usePlayersFilters = vi.fn()
const useRoster = vi.fn()
const useRemovePlayer = vi.fn()
const useFantasyLeagueSeasons = vi.fn()
const useRealMatchesByRound = vi.fn()
const useLockedTeams = vi.fn()
const useWaiverWindowStatus = vi.fn()
const useWaiverBudgets = vi.fn()
const useWaiverClaims = vi.fn()

let removePlayerSpy = vi.fn()

vi.mock('../api/playersQueries', () => ({
  usePlayers: (...a: unknown[]) => usePlayers(...a),
  usePlayersFilters: (...a: unknown[]) => usePlayersFilters(...a),
}))
vi.mock('./userTeamRosterQueries', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useRoster: (...a: unknown[]) => useRoster(...a) }
})
vi.mock('../api/userTeamRosterMutations', () => ({
  useRemovePlayer: (...a: unknown[]) => useRemovePlayer(...a),
}))
vi.mock('../api/useFantasyLeagueSeasons', () => ({
  useFantasyLeagueSeasons: (...a: unknown[]) => useFantasyLeagueSeasons(...a),
}))
vi.mock('../api/matchesQueries', () => ({
  useRealMatchesByRound: (...a: unknown[]) => useRealMatchesByRound(...a),
}))
vi.mock('../api/fantasyRoundGameQueries', () => ({
  useLockedTeams: (...a: unknown[]) => useLockedTeams(...a),
}))
vi.mock('../api/waiverQueries', () => ({
  useWaiverWindowStatus: (...a: unknown[]) => useWaiverWindowStatus(...a),
  useWaiverBudgets: (...a: unknown[]) => useWaiverBudgets(...a),
  useWaiverClaims: (...a: unknown[]) => useWaiverClaims(...a),
}))

// Out-of-scope child modals stay MUI — stub them so MUI never enters the test
// module graph. Each renders a marker when open so handler wiring is testable.
vi.mock('./AddPlayerModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="add-player-modal" /> : null,
}))
vi.mock('./PlayerStatsModal', () => ({
  __esModule: true,
  default: ({ playerId }: { playerId: number | null }) =>
    playerId != null ? <div data-testid="player-stats-modal" /> : null,
}))
vi.mock('./WaiverClaimModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="waiver-claim-modal" /> : null,
}))

import PlayersList from './PlayersList'
import { LeagueStatus } from './SeasonStatusCard'

const fantasyLeague = {
  id: 99,
  name: 'Liga',
  league: { id: 5, externalId: 555, name: 'Brasileirão' },
} as any

const makePlayer = (over: Partial<any> = {}) => ({
  player_id: 1,
  player_name: 'Yuri Alberto',
  player_position: 'Attacker',
  player_photo: '',
  team_name: 'Corinthians',
  team_id: 10,
  goals: 11,
  totalPoints: 142.6,
  avgPoints: 12.9,
  is_rostered: false,
  rostered_by_user_team_id: undefined,
  rostered_by_user_team_name: undefined,
  ...over,
})

const playerResponse = (players: any[], total = players.length) => ({
  data: players,
  meta: { total, page: 1, limit: 10, totalPages: 1, sortBy: 'totalPoints', order: 'desc' },
})

const renderList = (props: Partial<React.ComponentProps<typeof PlayersList>> = {}) =>
  render(
    <PlayersList
      fantasyLeague={fantasyLeague}
      seasonYear={2024}
      userTeamId={1}
      seasonId="s-1"
      currentRound={12}
      {...props}
    />,
  )

beforeEach(() => {
  vi.clearAllMocks()
  removePlayerSpy = vi.fn()

  useFantasyLeagueSeasons.mockReturnValue({
    data: {
      currentRound: 12,
      numberOfRounds: 38,
      status: LeagueStatus.ACTIVE,
      initialWaiverBudget: 100,
      fantasyLeague: { league: { externalId: 555 } },
      seasonYear: 2024,
    },
  })
  useRealMatchesByRound.mockReturnValue({ data: [] })
  useLockedTeams.mockReturnValue({ data: { lockedTeamIds: [] } })
  useWaiverWindowStatus.mockReturnValue({ data: { isOpen: false } })
  useWaiverBudgets.mockReturnValue({ data: [] })
  useWaiverClaims.mockReturnValue({ data: [] })
  usePlayersFilters.mockReturnValue({
    data: { teams: [{ id: 7, name: 'Palmeiras' }] },
    isLoading: false,
  })
  useRoster.mockReturnValue({ data: [], isLoading: false, refetch: vi.fn() })
  useRemovePlayer.mockReturnValue({ mutate: removePlayerSpy, isPending: false })
  usePlayers.mockReturnValue({
    data: playerResponse([makePlayer()]),
    isLoading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
  })
})

describe('PlayersList (Jogadores)', () => {
  it('renders the title, filters, and a data-ds root with no @mui', () => {
    const { container } = renderList()
    expect(container.querySelector('[data-ds]')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /jogadores/i })).toBeInTheDocument()
    // Position radiogroup + free-agents radiogroup are accessible controls.
    expect(screen.getByRole('radiogroup', { name: /posição/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /disponibilidade/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/buscar jogador/i)).toBeInTheDocument()
  })

  it('renders the desktop table with 8 columns incl. Escalado + Próx.', () => {
    renderList()
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(
      expect.arrayContaining([
        'Jogador', 'Time', 'Posição', 'Escalado', 'Próx.', 'Gols', 'Pts Total', 'Média', 'Ação',
      ]),
    )
  })

  it('passes paging/sort/onlyFreeAgents args to usePlayers (1-based page, default sort)', () => {
    renderList()
    expect(usePlayers).toHaveBeenCalledWith(
      expect.objectContaining({
        page: 1,
        limit: 10,
        sortBy: 'totalPoints',
        order: 'desc',
        onlyFreeAgents: false,
        leagueId: 5,
        fantasyLeagueId: 99,
      }),
    )
  })

  it('toggles sort args via the table sort buttons (totalPoints desc → asc)', async () => {
    renderList()
    const sortBtn = screen.getByRole('button', { name: /pts total/i })
    await userEvent.click(sortBtn)
    expect(usePlayers).toHaveBeenLastCalledWith(
      expect.objectContaining({ sortBy: 'totalPoints', order: 'asc' }),
    )
  })

  it('resets to page 1 when the search changes', async () => {
    useRemovePlayer.mockReturnValue({ mutate: removePlayerSpy, isPending: false })
    renderList()
    await userEvent.type(screen.getByLabelText(/buscar jogador/i), 'yu')
    // Last call carries the search term and page 1 (reset effect).
    expect(usePlayers).toHaveBeenLastCalledWith(
      expect.objectContaining({ search: 'yu', page: 1 }),
    )
  })

  it('ActionCell shows + Add for a free agent (market closed)', () => {
    renderList()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('ActionCell shows Oferta when the market is open', () => {
    useWaiverWindowStatus.mockReturnValue({ data: { isOpen: true } })
    renderList()
    expect(screen.getByRole('button', { name: /oferta/i })).toBeInTheDocument()
    // The "Mercado aberto" chip surfaces remaining budget.
    expect(screen.getByText(/mercado aberto/i)).toBeInTheDocument()
  })

  it('ActionCell shows Escalado for a player rostered by another team', () => {
    usePlayers.mockReturnValue({
      data: playerResponse([
        makePlayer({ is_rostered: true, rostered_by_user_team_id: 2, rostered_by_user_team_name: 'Os Galácticos' }),
      ]),
      isLoading: false, isFetching: false, error: null, refetch: vi.fn(),
    })
    renderList()
    // The locked chip carries an aria-label describing who rostered the player
    // (distinct from the "Escalado" column header text).
    expect(
      screen.getByLabelText(/escalado — escalado por os galácticos/i),
    ).toBeInTheDocument()
  })

  it('ActionCell shows Bloqueado when the team is locked this round', () => {
    useLockedTeams.mockReturnValue({ data: { lockedTeamIds: [10] } })
    renderList()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
  })

  it('ActionCell shows Draft pendente before the draft', () => {
    useFantasyLeagueSeasons.mockReturnValue({
      data: {
        currentRound: 12, numberOfRounds: 38, status: LeagueStatus.DRAFT_SCHEDULED,
        initialWaiverBudget: 100, fantasyLeague: { league: { externalId: 555 } }, seasonYear: 2024,
      },
    })
    renderList()
    expect(screen.getByText('Draft pendente')).toBeInTheDocument()
  })

  it('confirm-drop flow: Liberar opens a confirm modal and removePlayer fires', async () => {
    useRoster.mockReturnValue({
      data: [{ id: 55, player: { id: 1 } }],
      isLoading: false, refetch: vi.fn(),
    })
    usePlayers.mockReturnValue({
      data: playerResponse([
        makePlayer({ is_rostered: true, rostered_by_user_team_id: 1, rostered_by_user_team_name: 'Meu Time' }),
      ]),
      isLoading: false, isFetching: false, error: null, refetch: vi.fn(),
    })
    renderList()
    await userEvent.click(screen.getByRole('button', { name: /liberar/i }))
    // The confirm dialog appears.
    const dialog = await screen.findByRole('dialog')
    expect(within(dialog).getByText(/confirmar remoção/i)).toBeInTheDocument()
    await userEvent.click(within(dialog).getByRole('button', { name: /^liberar$/i }))
    expect(removePlayerSpy).toHaveBeenCalledWith(55)
  })

  it('renders an EmptyState when there are no players', () => {
    usePlayers.mockReturnValue({
      data: playerResponse([], 0),
      isLoading: false, isFetching: false, error: null, refetch: vi.fn(),
    })
    renderList()
    expect(screen.getByRole('heading', { name: /nenhum jogador/i })).toBeInTheDocument()
  })

  it('renders an ErrorState with retry when the players query fails (no prior data)', async () => {
    const refetch = vi.fn()
    usePlayers.mockReturnValue({
      data: undefined, isLoading: false, isFetching: false, error: new Error('boom'), refetch,
    })
    renderList()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /tentar de novo/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('opens the player stats modal when a row name is activated', async () => {
    renderList()
    await userEvent.click(screen.getByRole('button', { name: /ver estatísticas de yuri/i }))
    expect(screen.getByTestId('player-stats-modal')).toBeInTheDocument()
  })

  it('paginates 1-based via the results bar', () => {
    usePlayers.mockReturnValue({
      data: playerResponse([makePlayer()], 134),
      isLoading: false, isFetching: false, error: null, refetch: vi.fn(),
    })
    renderList()
    // page 1, rowsPerPage 10, total 134 → "1–10 de 134".
    expect(screen.getByText('1–10 de 134')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: /pagina/i })).toBeInTheDocument()
  })
})
