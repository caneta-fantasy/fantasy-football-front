import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PlayersTableApp } from './PlayersTableApp'
import type { PlayerRow } from './types'

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
  next: 'x PAL (C)',
  action: { kind: 'add' },
  ...over,
})

const noop = () => {}

describe('PlayersTableApp', () => {
  it('desktop: full 8-col table incl. Escalado + Próx. when showNext', () => {
    render(
      <PlayersTableApp bp="d" rows={[row()]} sort={null} onSortChange={noop} showNext />,
    )
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(
      expect.arrayContaining([
        'Jogador', 'Time', 'Posição', 'Escalado', 'Próx.', 'Gols', 'Pts Total', 'Média', 'Ação',
      ]),
    )
  })

  it('desktop: hides Próx. when showNext is false', () => {
    render(<PlayersTableApp bp="d" rows={[row()]} sort={null} onSortChange={noop} />)
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).not.toContain('Próx.')
  })

  it('tablet: reduced columns (drops Escalado + Gols)', () => {
    render(<PlayersTableApp bp="t" rows={[row()]} sort={null} onSortChange={noop} showNext />)
    const headers = screen.getAllByRole('columnheader').map((h) => h.textContent)
    expect(headers).toEqual(
      expect.arrayContaining(['Jogador', 'Time', 'Pos', 'Pts Total', 'Média', 'Ação']),
    )
    expect(headers).not.toContain('Escalado')
    expect(headers).not.toContain('Gols')
  })

  it('mobile: stacked cards — no <table>', () => {
    const { container } = render(
      <PlayersTableApp bp="m" rows={[row()]} sort={null} onSortChange={noop} />,
    )
    expect(container.querySelector('table')).toBeNull()
    // The card still surfaces the player, stat strip, and action.
    expect(screen.getByText('Yuri Alberto')).toBeInTheDocument()
    expect(screen.getByText('Pts Total')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('only the numeric columns are sortable; clicking emits a SortState', async () => {
    const onSortChange = vi.fn()
    render(
      <PlayersTableApp bp="d" rows={[row()]} sort={null} onSortChange={onSortChange} showNext />,
    )
    // "Jogador" header is not a sort button.
    expect(screen.queryByRole('button', { name: /^jogador$/i })).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /pts total/i }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'totalPoints', direction: 'ascending' })
  })

  it('renders the empty slot when there are no rows', () => {
    render(
      <PlayersTableApp
        bp="d"
        rows={[]}
        sort={null}
        onSortChange={noop}
        empty={<div>Nenhum jogador</div>}
      />,
    )
    expect(screen.getByText('Nenhum jogador')).toBeInTheDocument()
  })

  it('row name activation calls onOpen (stats)', async () => {
    const onOpen = vi.fn()
    render(
      <PlayersTableApp bp="d" rows={[row({ onOpen })]} sort={null} onSortChange={noop} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /ver estatísticas de yuri/i }))
    expect(onOpen).toHaveBeenCalled()
  })
})
