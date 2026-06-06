import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SlotCard, RosterSlotCard, type SlotCardProps } from './SlotCard'
import type { RosterPlayer, Slot } from './userTeamRosterQueries'

// `POSITIONS_TRANSLATION` lives in PlayerSelectModal, which stays MUI. Stub it
// so importing SlotCard does not pull MUI into the test module graph.
vi.mock('./PlayerSelectModal', () => ({
  POSITIONS_TRANSLATION: {
    Defender: 'Defensor',
    Midfielder: 'Meio-Campo',
    Attacker: 'Atacante',
    Goalkeeper: 'Goleiro',
    Defense: 'Defesa',
  },
}))

const player: RosterPlayer = {
  id: 1,
  name: 'João Silva',
  photo: '',
  position: 'Midfielder',
  team: { id: 10, name: 'Flamengo', code: 'FLA' },
}

const baseSlot = { id: 1, index: 0 } as unknown as Slot

const renderSlot = (props: Partial<SlotCardProps> = {}) =>
  render(
    <SlotCard
      slotType="starter"
      allowedPositions={[RosterSlotCard.MEI]}
      player={player}
      slot={baseSlot}
      {...props}
    />,
  )

describe('SlotCard (SlotRow)', () => {
  it('renders the player name, team code and translated position', () => {
    renderSlot()
    expect(screen.getByText('João Silva')).toBeInTheDocument()
    expect(screen.getByText(/FLA/)).toBeInTheDocument()
    expect(screen.getByText(/Meio-Campo/)).toBeInTheDocument()
  })

  it('shows "Disponível" for an empty slot', () => {
    renderSlot({ player: null })
    expect(screen.getByText('Disponível')).toBeInTheDocument()
  })

  it('maps each roster position to its spelled-out pill label', () => {
    const cases: Array<[RosterSlotCard, string]> = [
      [RosterSlotCard.GOL, 'Goleiro'],
      [RosterSlotCard.DEF, 'Defensor'],
      [RosterSlotCard.MEI, 'Meia'],
      [RosterSlotCard.ATA, 'Atacante'],
      [RosterSlotCard.BN, 'Reserva'],
    ]
    for (const [code, label] of cases) {
      const { unmount } = renderSlot({ allowedPositions: [code] })
      expect(screen.getByRole('img', { name: label })).toBeInTheDocument()
      unmount()
    }
  })

  it('renders the combo slot as a neutral "M/A" pill', () => {
    renderSlot({ allowedPositions: [RosterSlotCard.MEI, RosterSlotCard.ATA] })
    const pill = screen.getByRole('img', { name: /meia ou atacante/i })
    expect(pill).toHaveTextContent('M/A')
  })

  it('becomes a focusable button-role control when interactive and activates on Enter/Space', async () => {
    const onActivate = vi.fn()
    renderSlot({ interactive: true, onActivate })
    // The row is the control carrying tabindex (the player name lives inside it).
    const row = screen.getByText('João Silva').closest('[role="button"]') as HTMLElement
    expect(row).toBeTruthy()
    expect(row).toHaveAttribute('tabindex', '0')
    row.focus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onActivate).toHaveBeenCalledTimes(2)
  })

  it('is not a focusable control when not interactive', () => {
    renderSlot({ interactive: false, onRemovePlayer: undefined })
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('fires onRemovePlayer and stops the click from reaching the row', async () => {
    const onActivate = vi.fn()
    const onRemovePlayer = vi.fn()
    renderSlot({ interactive: true, onActivate, onRemovePlayer })
    // Exact-string name targets the inner button (the row's name is the full
    // concatenated text, so a regex would match both).
    await userEvent.click(
      screen.getByRole('button', { name: 'Liberar jogador' }),
    )
    expect(onRemovePlayer).toHaveBeenCalledTimes(1)
    expect(onActivate).not.toHaveBeenCalled()
  })
})
