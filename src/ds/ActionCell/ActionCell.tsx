import React from 'react'
import { Btn } from '../Btn/Btn'
import { Chip } from '../Chip/Chip'
import { Tooltip } from '../Tooltip/Tooltip'
import { Icon } from '../Icon/Icon'

/**
 * ActionCell — the per-row action control on the Jogadores list. It covers all
 * six states the real screen needs (the prototype `app-kit2.jsx:ActionCell`
 * only modelled four):
 *
 *  - `add`      free agent, market closed → cobalt "+ Add" button
 *  - `waiver`   free agent, market open   → gold "Oferta" button
 *  - `oferta`   waiver claim already filed → disabled gold (cancel to re-bid)
 *  - `drop`     rostered by me            → "Liberar" outline danger button
 *  - `escalado` rostered by another team  → locked ghost chip
 *  - `bloqueado` match in progress this round → warning-tinted locked chip
 *  - `draft`    pre-draft                 → locked ghost chip ("Draft pendente")
 *
 * Each state carries a `Tooltip` describing the affordance, so the icon-only /
 * terse controls stay self-explanatory. Active states are real `<button>`s
 * (focusable, keyboard-operable); the locked states are `Chip`s with the lock
 * meaning in the visible label (never icon-only).
 */
export type ActionKind =
  | 'add'
  | 'waiver'
  | 'oferta'
  | 'drop'
  | 'escalado'
  | 'bloqueado'
  | 'draft'
  | 'novo'

export interface ActionCellProps {
  kind: ActionKind
  /** Click handler for the active states (add / waiver / drop). */
  onAction?: () => void
  /** Tooltip override. Each kind ships a sensible default. */
  tooltip?: React.ReactNode
  /** When `drop` is mid-flight, show the button's loading spinner. */
  loading?: boolean
  /**
   * Disables the active button (e.g. drop when no slot is resolvable). The
   * locked states are always inert.
   */
  disabled?: boolean
}

const DEFAULT_TOOLTIP: Record<ActionKind, string> = {
  add: 'Adicionar ao elenco',
  waiver: 'Fazer oferta no Mercado',
  oferta: 'Oferta já registrada — cancele para fazer outra',
  drop: 'Liberar jogador',
  escalado: 'Jogador já escalado',
  bloqueado: 'Jogador bloqueado — partida em andamento nesta rodada',
  draft: 'Disponível após o draft',
  novo: 'Jogador novo — precisa passar por um mercado para ser adicionado',
}

const ACT_BTN = { height: 30, padding: '0 12px' } as const

export function ActionCell({
  kind,
  onAction,
  tooltip,
  loading = false,
  disabled = false,
}: ActionCellProps) {
  const tip = tooltip ?? DEFAULT_TOOLTIP[kind]

  if (kind === 'add') {
    return (
      <Tooltip label={tip}>
        <Btn
          variant="cobalt"
          size="sm"
          style={ACT_BTN}
          onClick={onAction}
          disabled={disabled}
        >
          + Add
        </Btn>
      </Tooltip>
    )
  }

  if (kind === 'waiver') {
    return (
      <Tooltip label={tip}>
        <Btn
          variant="gold"
          size="sm"
          style={ACT_BTN}
          onClick={onAction}
          disabled={disabled}
        >
          <Icon name="market" size={16} aria-hidden /> Oferta
        </Btn>
      </Tooltip>
    )
  }

  if (kind === 'oferta') {
    // Claim already filed: a disabled gold button (cancel from the modal to bid
    // again). Disabled native button stays in the tree for the tooltip.
    return (
      <Tooltip label={tip}>
        <Btn variant="gold" size="sm" style={ACT_BTN} disabled>
          <Icon name="market" size={16} aria-hidden /> Oferta
        </Btn>
      </Tooltip>
    )
  }

  if (kind === 'drop') {
    return (
      <Tooltip label={tip}>
        <Btn
          variant="secondary"
          size="sm"
          style={{ ...ACT_BTN, color: 'var(--danger)', borderColor: 'var(--danger)' }}
          onClick={onAction}
          loading={loading}
          disabled={disabled}
        >
          Liberar
        </Btn>
      </Tooltip>
    )
  }

  // Locked states → ghost / warning chips. The lock meaning is in the visible
  // label; the icon is decorative. Chip is not focusable, so wrap it in an
  // inline span the Tooltip can describe via title for mouse/AT users.
  const lockedLabel =
    kind === 'bloqueado'
      ? 'Bloqueado'
      : kind === 'draft'
        ? 'Draft pendente'
        : kind === 'novo'
          ? 'Mercado'
          : 'Escalado'

  return (
    <span title={typeof tip === 'string' ? tip : undefined} className="inline-flex">
      <Chip tone={kind === 'bloqueado' || kind === 'novo' ? 'gold' : 'ghost'} aria-label={`${lockedLabel} — ${tip}`}>
        <Icon name="lock" size={16} aria-hidden /> {lockedLabel}
      </Chip>
    </span>
  )
}
