// src/components/SlotCard.tsx
//
// Modernista roster row (Plan Task C3). The legacy MUI `Paper`/`Avatar`/`Chip`
// SlotCard is rewritten as `SlotCard` rendering the app-kit `SlotRow`: a token
// paper card (white surface, hairline border, 8px radius, min-h 60) with a
// DEF/BN-aware position pill, a ds `Avatar`, the player line, and an inner
// "Liberar jogador" `Btn`. The whole row is a focusable control (Enter/Space)
// when interactive — the legacy version was an inaccessible `Paper onClick`.
//
// The exported `SlotCardProps` interface and the `RosterSlotCard` enum are kept
// verbatim (both are imported by `TeamTabComponent`).
import React from 'react'
import { Avatar, Btn } from '@/ds'
import { POSITIONS_TRANSLATION } from './PlayerSelectModal'
import { RosterPlayer, Slot } from './userTeamRosterQueries'
import { OpponentInfo, formatMatchTime } from '../utils/matchUtils'

export interface SlotCardProps {
  slotType: string
  allowedPositions: RosterSlotCard[]
  player: RosterPlayer | null
  slot: Slot // contains slot.id
  onRemovePlayer?: () => void
  opponentInfo?: OpponentInfo | null
  /** Row click handler. When set the whole row becomes a focusable control. */
  onActivate?: () => void
  /**
   * Whether the row is currently actionable (has a player to inspect, or an
   * empty own-team slot to fill). Drives the focusable-control affordance.
   */
  interactive?: boolean
}

export enum RosterSlotCard {
  GOL = 'GOL',
  DEF = 'DEF',
  MEI = 'MEI',
  ATA = 'ATA',
  BN = 'BN',
}

/**
 * Roster-taxonomy position pill (GOL/DEF/MEI/ATA/BN + the MEI/ATA combo). The
 * colours follow the C3 spec, which is its OWN mapping distinct from the
 * broadcast `ds/PositionPill` (there MEI=green/ATA=gold; here the roster slots
 * read GOL=cobalt, DEF=green, MEI=gold, ATA=danger, BN=ink-muted). The combo
 * slot `['MEI','ATA']` renders a neutral "M/A". Colour is never the only cue:
 * the 3-letter glyph is always visible and an `aria-label` spells the role out.
 */
const POS_TONE: Record<string, { cls: string; label: string }> = {
  GOL: { cls: 'bg-cobalt text-on-cobalt', label: 'Goleiro' },
  DEF: { cls: 'bg-signature text-on-green', label: 'Defensor' },
  MEI: { cls: 'bg-accent text-on-gold', label: 'Meia' },
  ATA: { cls: 'bg-danger text-white', label: 'Atacante' },
  BN: { cls: 'bg-ink-muted text-white', label: 'Reserva' },
  // Multi-position (flex) slot — neutral inset so it reads as "either".
  'M/A': { cls: 'bg-mist text-ink-subtle border border-line-strong', label: 'Meia ou atacante' },
}

const POS_NEUTRAL = {
  cls: 'bg-mist text-ink-muted border border-line-strong',
  label: 'Posição',
}

function RosterPosPill({ positions }: { positions: RosterSlotCard[] }) {
  // Combo slot → "M/A"; single slot → its code.
  const label =
    positions.length > 1
      ? positions
          .map((p) => (p === 'MEI' ? 'M' : p === 'ATA' ? 'A' : p))
          .join('/')
      : positions[0] ?? ''

  const key = positions.length > 1 ? 'M/A' : String(label).toUpperCase()
  const tone = POS_TONE[key] ?? POS_NEUTRAL
  const accessibleName = POS_TONE[key]?.label ?? `Posição ${label || 'desconhecida'}`

  return (
    <span
      data-position={key}
      role="img"
      aria-label={accessibleName}
      className={`inline-flex h-[22px] w-[58px] shrink-0 items-center justify-center rounded-pill font-sans text-[11px] font-extrabold uppercase tracking-[0.6px] leading-none ${tone.cls}`}
    >
      <span aria-hidden="true">{label}</span>
    </span>
  )
}

export const SlotCard: React.FC<SlotCardProps> = ({
  allowedPositions,
  player,
  onRemovePlayer,
  opponentInfo,
  onActivate,
  interactive = false,
}) => {
  const oppTime = opponentInfo ? formatMatchTime(opponentInfo.matchDate) : null

  // Card surface is a real control only when interactive — keyboard-operable
  // (Enter/Space), focusable, button-roled. Otherwise it is a plain region.
  const isControl = interactive && !!onActivate
  const controlProps = isControl
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick: onActivate,
        onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onActivate?.()
          }
        },
      }
    : {}

  return (
    <div
      {...controlProps}
      className={`flex min-h-[60px] items-center justify-between gap-3 rounded-[8px] border border-line bg-surface px-4 py-3 ${
        isControl ? 'cursor-pointer transition-colors hover:bg-mist' : ''
      }`}
    >
      <div className="flex min-w-0 items-center gap-3.5">
        <RosterPosPill positions={allowedPositions} />
        {player ? (
          <>
            <Avatar name={player.name} src={player.photo} size={38} />
            <div className="min-w-0">
              <div className="truncate font-sans text-[15px] font-bold text-ink">
                {player.name}
              </div>
              <div className="mt-0.5 font-sans text-[11.5px] text-ink-muted">
                {player.team.code} ·{' '}
                {POSITIONS_TRANSLATION[
                  player.position as keyof typeof POSITIONS_TRANSLATION
                ] ?? player.position}
                {opponentInfo && (
                  <span className="text-ink-subtle">
                    {' '}
                    · x {opponentInfo.code} ({opponentInfo.isHome ? 'C' : 'V'})
                    {oppTime && <> · {oppTime}</>}
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <span className="font-sans text-[14px] text-ink-subtle">Disponível</span>
        )}
      </div>

      {player && onRemovePlayer && (
        <Btn
          variant="secondary"
          size="sm"
          className="shrink-0 border-danger text-danger"
          onClick={(e) => {
            // Don't let the row's activate handler fire when releasing a player.
            e.stopPropagation()
            onRemovePlayer()
          }}
        >
          Liberar jogador
        </Btn>
      )}
    </div>
  )
}
