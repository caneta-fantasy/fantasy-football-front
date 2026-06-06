import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PlayersFilters } from './PlayersFilters'

const baseProps = {
  position: 'ALL',
  positionOptions: [
    { value: 'ALL', label: 'TODOS' },
    { value: 'DEF', label: 'DEF' },
    { value: 'MEI', label: 'MEI' },
    { value: 'ATA', label: 'ATA' },
  ],
  onPositionChange: vi.fn(),
  onlyFreeAgents: false,
  freeAgentsOptions: [
    { value: false, label: 'Todos' },
    { value: true, label: 'Não escalados' },
  ],
  onFreeAgentsChange: vi.fn(),
  teamId: null,
  teams: [{ id: 7, name: 'Palmeiras' }],
  onTeamChange: vi.fn(),
  search: '',
  onSearchChange: vi.fn(),
}

describe('PlayersFilters', () => {
  it('renders accessible radiogroups for position + availability', () => {
    render(<PlayersFilters {...baseProps} />)
    expect(screen.getByRole('radiogroup', { name: /posição/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup', { name: /disponibilidade/i })).toBeInTheDocument()
    // The active option exposes aria-checked (state never color-only).
    const todos = screen.getByRole('radio', { name: 'TODOS' })
    expect(todos).toHaveAttribute('aria-checked', 'true')
  })

  it('changing a position fires onPositionChange with the value', async () => {
    const onPositionChange = vi.fn()
    render(<PlayersFilters {...baseProps} onPositionChange={onPositionChange} />)
    await userEvent.click(screen.getByRole('radio', { name: 'ATA' }))
    expect(onPositionChange).toHaveBeenCalledWith('ATA')
  })

  it('changing availability fires onFreeAgentsChange(true)', async () => {
    const onFreeAgentsChange = vi.fn()
    render(<PlayersFilters {...baseProps} onFreeAgentsChange={onFreeAgentsChange} />)
    await userEvent.click(screen.getByRole('radio', { name: /não escalados/i }))
    expect(onFreeAgentsChange).toHaveBeenCalledWith(true)
  })

  it('team select + search are labelled accessible controls', async () => {
    const onTeamChange = vi.fn()
    const onSearchChange = vi.fn()
    render(
      <PlayersFilters
        {...baseProps}
        onTeamChange={onTeamChange}
        onSearchChange={onSearchChange}
      />,
    )
    await userEvent.selectOptions(
      screen.getByLabelText(/filtrar por time/i),
      '7',
    )
    expect(onTeamChange).toHaveBeenCalledWith(7)
    await userEvent.type(screen.getByLabelText(/buscar jogador/i), 'a')
    expect(onSearchChange).toHaveBeenCalledWith('a')
  })
})
