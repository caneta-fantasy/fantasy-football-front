import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PlayersCard } from './PlayersCard'
import type { PlayerRow } from '../PlayersTableApp/types'

const row = (over: Partial<PlayerRow> = {}): PlayerRow => ({
  id: 1,
  name: 'Yuri Alberto',
  team: 'Corinthians',
  pos: 'ATA',
  posPt: 'Atacante',
  rostered: false,
  rosteredBy: null,
  goals: 11,
  total: '142.6',
  avg: '12.9',
  action: { kind: 'add' },
  ...over,
})

describe('PlayersCard', () => {
  it('renders name, team·pos, the stat strip, and the action', () => {
    render(<PlayersCard row={row()} />)
    expect(screen.getByText('Yuri Alberto')).toBeInTheDocument()
    expect(screen.getByText(/corinthians · atacante/i)).toBeInTheDocument()
    expect(screen.getByText('Gols')).toBeInTheDocument()
    expect(screen.getByText('Pts Total')).toBeInTheDocument()
    expect(screen.getByText('Média')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('activating the card opens the player stats (onOpen)', async () => {
    const onOpen = vi.fn()
    render(<PlayersCard row={row()} onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button', { name: /ver estatísticas de yuri/i }))
    expect(onOpen).toHaveBeenCalled()
  })

  it('the action button does not bubble to the card open handler', async () => {
    const onOpen = vi.fn()
    const onAction = vi.fn()
    render(<PlayersCard row={row({ action: { kind: 'add', onAction } })} onOpen={onOpen} />)
    await userEvent.click(screen.getByRole('button', { name: /add/i }))
    expect(onAction).toHaveBeenCalled()
    expect(onOpen).not.toHaveBeenCalled()
  })
})
