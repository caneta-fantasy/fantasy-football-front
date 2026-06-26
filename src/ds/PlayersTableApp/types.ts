import type { ActionKind } from '../ActionCell/ActionCell'

/** Position tag taxonomy for the Jogadores list (mapped from the backend). */
export type PosTagCode = 'GOL' | 'DEF' | 'MEI' | 'ATA'

export interface PlayerRowAction {
  kind: ActionKind
  onAction?: () => void
  loading?: boolean
  disabled?: boolean
  tooltip?: React.ReactNode
}

/**
 * View-model for one player row, shared by the desktop/tablet `PlayersTableApp`
 * and the mobile `PlayersCard`. The screen adapts the API `Player` into this.
 */
export interface PlayerRow {
  /** Stable id (player id) for React keys + row identity. */
  id: number
  name: string
  photo?: string
  team: string
  /** Short position tag (GOL/DEF/MEI/ATA). */
  pos: PosTagCode
  /** Localized position label (e.g. "Atacante"). */
  posPt: string
  rostered: boolean
  /** Fantasy team name when rostered (else null → "Livre"). */
  rosteredBy: string | null
  goals: React.ReactNode
  total: React.ReactNode
  avg: React.ReactNode
  /** Next-opponent cell (the `Próx.` column the prototype omits). */
  next?: React.ReactNode
  action: PlayerRowAction
  /** New/returning player: shows a "Novo" badge next to the name. */
  isNew?: boolean
  /** Opens the player stats (row/card activation). */
  onOpen?: () => void
}
