import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { LeagueStandings, type StandingRow } from './LeagueStandings'

const ROWS: StandingRow[] = [
  { id: 'a', rank: 1, team: 'Caneta FC', seed: 3, points: 1184, movement: 0, form: ['V', 'V', 'E', 'V', 'V'] },
  { id: 'b', rank: 2, team: 'Churrasco XI', seed: 1, points: 1142, movement: 1, form: ['V', 'D', 'V', 'V', 'E'] },
  { id: 'c', rank: 3, team: 'Zona Mista', seed: 6, points: 1098, movement: -1, form: ['E', 'V', 'D', 'V', 'V'] },
]

// The Crest renders the club name into an SVG <title>, so a plain getByText
// also matches the crest label. Query the visible cell <span> only.
const teamCell = (name: string) =>
  screen.getByText(name, { selector: 'span' })

describe('LeagueStandings', () => {
  it('renders a real accessible table with one row per standing', () => {
    render(<LeagueStandings rows={ROWS} caption="Classificação" />)
    const table = screen.getByRole('table', { name: /classificação/i })
    expect(table).toBeInTheDocument()
    // 3 data rows + 1 header row
    expect(within(table).getAllByRole('row')).toHaveLength(4)
    expect(teamCell('Caneta FC')).toBeInTheDocument()
    expect(teamCell('Churrasco XI')).toBeInTheDocument()
  })

  it('exposes column headers for rank, team, points and movement', () => {
    render(<LeagueStandings rows={ROWS} />)
    expect(screen.getByRole('columnheader', { name: /time/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /pts/i })).toBeInTheDocument()
  })

  it('marks the current-user row as selected via aria-selected', () => {
    render(<LeagueStandings rows={ROWS} currentUserRowId="b" />)
    const userRow = teamCell('Churrasco XI').closest('tr')!
    expect(userRow).toHaveAttribute('aria-selected', 'true')
    // Non-current rows are not selected.
    const otherRow = teamCell('Zona Mista').closest('tr')!
    expect(otherRow).not.toHaveAttribute('aria-selected', 'true')
  })

  it('highlights the rank-1 row with an accessible leader cue', () => {
    render(<LeagueStandings rows={ROWS} />)
    // The leader is announced by text, not colour alone (§7 colour-cue rule).
    expect(screen.getByText(/líder/i)).toBeInTheDocument()
  })

  it('renders the movement as text (not colour-only): up/down/steady', () => {
    render(<LeagueStandings rows={ROWS} />)
    // Steady row (movement 0) gets a "sem mudança" accessible label.
    expect(screen.getByLabelText(/sem mudança/i)).toBeInTheDocument()
    // Movement up/down carry an accessible direction word.
    expect(screen.getByLabelText(/subiu 1/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/caiu 1/i)).toBeInTheDocument()
  })

  it('shows the loading slot when loading', () => {
    render(<LeagueStandings rows={[]} loading />)
    // The Table loading slot renders a Spinner (role="status", name "Carregando").
    expect(
      screen.getByRole('status', { name: /carregando/i }),
    ).toBeInTheDocument()
  })

  it('shows an empty slot when there are no rows', () => {
    render(<LeagueStandings rows={[]} />)
    expect(screen.getByText(/nenhum time na classificação/i)).toBeInTheDocument()
  })

  it('does not throw on a row with an unknown form result', () => {
    const weird: StandingRow[] = [
      // @ts-expect-error testing runtime fallback for an unknown form code
      { id: 'x', rank: 1, team: 'Test FC', seed: 0, points: 100, movement: 0, form: ['?'] },
    ]
    expect(() => render(<LeagueStandings rows={weird} />)).not.toThrow()
  })

  it('fires onRowClick with the clicked standing', async () => {
    const onRowClick = vi.fn()
    render(<LeagueStandings rows={ROWS} onRowClick={onRowClick} />)
    await userEvent.click(teamCell('Zona Mista'))
    expect(onRowClick).toHaveBeenCalledWith(expect.objectContaining({ id: 'c' }))
  })
})
