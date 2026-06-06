import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ─── Mock the data layer. Each hook is a vi.fn() we drive per-test; the query
//     keys/args are exercised by asserting the call arguments where it matters. ─
const useRoster = vi.fn()
const useFantasyLeagueTeams = vi.fn()
const useFantasyLeagueSeasons = vi.fn()
const useRealMatchesByRound = vi.fn()
const useLockedTeams = vi.fn()

vi.mock('./userTeamRosterQueries', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return { ...actual, useRoster: (...a: unknown[]) => useRoster(...a) }
})
vi.mock('../api/fantasyLeagueQueries', () => ({
  useFantasyLeagueTeams: (...a: unknown[]) => useFantasyLeagueTeams(...a),
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

// `POSITIONS_TRANSLATION` (imported transitively by SlotCard) lives in the
// still-MUI PlayerSelectModal; stub it so MUI never enters the module graph.
vi.mock('./PlayerSelectModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="player-select-modal" /> : null,
  POSITIONS_TRANSLATION: {
    Defender: 'Defensor',
    Midfielder: 'Meio-Campo',
    Attacker: 'Atacante',
    Goalkeeper: 'Goleiro',
    Defense: 'Defesa',
  },
}))
vi.mock('./MovePlayerModal', () => ({
  __esModule: true,
  default: ({ open }: { open: boolean }) =>
    open ? <div data-testid="move-player-modal" /> : null,
}))
vi.mock('./PlayerStatsModal', () => ({
  __esModule: true,
  default: ({ playerId }: { playerId: number | null }) =>
    playerId != null ? <div data-testid="player-stats-modal" /> : null,
}))

import { TeamTab } from './TeamTabComponent'

const userTeam = { id: 1, name: 'Galácticos do Bar', owner: {} } as any
const fantasyLeague = {
  id: 99,
  name: 'Liga',
  league: { id: 5, externalId: 555, name: 'Brasileirão' },
} as any

const makePlayer = (id: number, name: string) => ({
  id,
  name,
  photo: '',
  position: 'Midfielder',
  team: { id: id + 100, name: 'Time', code: 'TMC' },
})

const STARTER = {
  id: 1,
  index: 0,
  slotType: 'starter',
  allowedPositions: ['MEI'],
  player: makePlayer(1, 'João Silva'),
}
const EMPTY_STARTER = {
  id: 2,
  index: 1,
  slotType: 'starter',
  allowedPositions: ['ATA'],
  player: null,
}
const BENCH = {
  id: 3,
  index: 2,
  slotType: 'bench',
  allowedPositions: ['BN'],
  player: makePlayer(2, 'Carlos Souza'),
}

const renderTab = () =>
  render(
    <TeamTab
      userTeam={userTeam}
      fantasyLeague={fantasyLeague}
      seasonYear={2024}
      seasonId="s-1"
    />,
  )

beforeEach(() => {
  vi.clearAllMocks()
  // Sensible defaults; tests override useRoster as needed.
  useFantasyLeagueTeams.mockReturnValue({ data: [{ id: 1, name: 'Galácticos do Bar', user: { firstName: 'Gus', lastName: 'T' } }] })
  useFantasyLeagueSeasons.mockReturnValue({ data: { currentFantasyRound: 12, currentRealRound: 12, numberOfRounds: 38 } })
  useRealMatchesByRound.mockReturnValue({ data: [] })
  useLockedTeams.mockReturnValue({ data: { lockedTeamIds: [] } })
  useRoster.mockReturnValue({
    data: [STARTER, EMPTY_STARTER, BENCH],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })
})

describe('TeamTab (Times)', () => {
  it('renders the converted screen with no @mui (data-ds root + Titulares/Reservas split)', () => {
    const { container } = renderTab()
    expect(container.querySelector('[data-ds]')).toBeTruthy()
    expect(screen.getByRole('heading', { name: /titulares/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /reservas/i })).toBeInTheDocument()
    // Starter player in Titulares, bench player in Reservas.
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText('Carlos Souza')).toBeInTheDocument()
  })

  it('passes the selected team id + season year to useRoster', () => {
    renderTab()
    expect(useRoster).toHaveBeenCalledWith({ userTeamId: 1, seasonYear: 2024 })
  })

  it('shows Skeleton rows while loading (no spinner text leak on screen)', () => {
    useRoster.mockReturnValue({ data: undefined, isLoading: true, isError: false, error: null, refetch: vi.fn() })
    const { container } = renderTab()
    expect(container.querySelector('[aria-busy="true"]')).toBeTruthy()
    expect(container.querySelector('.ds-skeleton')).toBeTruthy()
    // The two section headings still render under the loading state.
    expect(screen.getByRole('heading', { name: /titulares/i })).toBeInTheDocument()
  })

  it('renders an ErrorState with a retry button when the roster query fails', async () => {
    const refetch = vi.fn()
    useRoster.mockReturnValue({ data: undefined, isLoading: false, isError: true, error: new Error('boom'), refetch })
    renderTab()
    expect(screen.getByRole('alert')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /tentar de novo/i }))
    expect(refetch).toHaveBeenCalled()
  })

  it('renders an EmptyState when the roster has no slots', () => {
    useRoster.mockReturnValue({ data: [], isLoading: false, isError: false, error: null, refetch: vi.fn() })
    renderTab()
    expect(screen.getByRole('heading', { name: /sem elenco/i })).toBeInTheDocument()
  })

  it('hides the team switcher when there is a single team', () => {
    renderTab()
    expect(screen.queryByRole('button', { name: /meu time/i })).not.toBeInTheDocument()
  })

  it('shows the team switcher and switches the viewed team (refetching for the new id)', async () => {
    useFantasyLeagueTeams.mockReturnValue({
      data: [
        { id: 1, name: 'Galácticos do Bar', user: { firstName: 'Gus', lastName: 'T' } },
        { id: 2, name: 'Os Galácticos', user: { firstName: 'Ana', lastName: 'P' } },
      ],
    })
    renderTab()
    const otherTeam = screen.getByRole('button', { name: /os galácticos/i })
    expect(screen.getByRole('button', { name: /meu time/i })).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(otherTeam)
    // After switching, useRoster is re-invoked for team id 2.
    expect(useRoster).toHaveBeenLastCalledWith({ userTeamId: 2, seasonYear: 2024 })
    // Non-own team shows the owner caption.
    expect(screen.getByText(/time de ana p/i)).toBeInTheDocument()
  })

  it('opens the PlayerStats modal when a filled row is activated by keyboard', async () => {
    renderTab()
    // The filled starter row is a focusable button-role control.
    const johnRow = screen.getByText('João Silva').closest('[role="button"]') as HTMLElement
    expect(johnRow).toBeTruthy()
    johnRow.focus()
    await userEvent.keyboard('{Enter}')
    expect(screen.getByTestId('player-stats-modal')).toBeInTheDocument()
  })

  it('opens the PlayerSelect modal when an empty own-team slot is activated', async () => {
    renderTab()
    const emptyRow = screen.getByText('Disponível').closest('[role="button"]') as HTMLElement
    await userEvent.click(emptyRow)
    expect(screen.getByTestId('player-select-modal')).toBeInTheDocument()
  })
})
