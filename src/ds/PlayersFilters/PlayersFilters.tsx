import React from 'react'
import { Select, type SelectOption } from '../Select/Select'
import { SearchInput } from '../SearchInput/SearchInput'

/**
 * PlayersFilters — the Jogadores filter bar: a position segmented control, a
 * free-agents segmented control, a team `Select`, and a search field.
 *
 * Source: `app/app-kit2.jsx:PlayersFilters`. The prototype renders the segments
 * as inert `<span>`s; here each segmented control is a real accessible
 * **radiogroup** — a `role="radiogroup"` wrapper of `role="radio"` buttons that
 * carry `aria-checked`, are keyboard-operable (native `<button>`), and expose a
 * group label. This is the §7 "not static divs" fix.
 *
 * a11y contract:
 * - Each segmented control is `role="radiogroup"` + `aria-label`; options are
 *   `<button role="radio" aria-checked>`; the active option also gets the
 *   color-block fill (never color-only — `aria-checked` carries the state).
 * - Team select is the native `Select`; search is the accessible `SearchInput`.
 */

export interface SegmentedOption<T extends string | boolean> {
  value: T
  label: React.ReactNode
}

export interface PlayersFiltersProps {
  /** Position filter value (e.g. 'ALL' | 'DEF' | 'MEI' | 'ATA'). */
  position: string
  positionOptions: SegmentedOption<string>[]
  onPositionChange: (value: string) => void

  /** Free-agents toggle value (false = todos, true = não escalados). */
  onlyFreeAgents: boolean
  freeAgentsOptions: SegmentedOption<boolean>[]
  onFreeAgentsChange: (value: boolean) => void

  /** Team filter: `null` = all teams. */
  teamId: number | null
  teams: { id: number; name: string }[]
  onTeamChange: (id: number | null) => void

  /** Search query (controlled). */
  search: string
  onSearchChange: (value: string) => void

  /** Stretch to a vertical layout on mobile. */
  compact?: boolean
  className?: string
}

const SEG_WRAP =
  'inline-flex overflow-hidden rounded-btn-sm border-[1.5px] border-line-strong'

function segItemCls(active: boolean, isLast: boolean): string {
  return [
    'px-[14px] py-[8px] font-sans font-bold text-[12.5px] whitespace-nowrap cursor-pointer',
    'transition-colors duration-150',
    isLast ? '' : 'border-r-[1.5px] border-line-strong',
    active
      ? 'bg-signature text-on-green'
      : 'bg-transparent text-ink-muted hover:bg-mist',
  ]
    .filter(Boolean)
    .join(' ')
}

/** A single accessible radiogroup segmented control. */
function Segmented<T extends string | boolean>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: SegmentedOption<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div role="radiogroup" aria-label={label} className={SEG_WRAP}>
      {options.map((opt, i) => {
        const active = opt.value === value
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            className={segItemCls(active, i === options.length - 1)}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

export function PlayersFilters({
  position,
  positionOptions,
  onPositionChange,
  onlyFreeAgents,
  freeAgentsOptions,
  onFreeAgentsChange,
  teamId,
  teams,
  onTeamChange,
  search,
  onSearchChange,
  compact = false,
  className,
}: PlayersFiltersProps) {
  const teamSelectOptions: SelectOption[] = [
    { value: '', label: 'Todos os times' },
    ...teams.map((t) => ({ value: String(t.id), label: t.name })),
  ]

  return (
    <div
      className={[
        'flex flex-wrap gap-3',
        compact ? 'flex-col items-stretch' : 'flex-row items-center',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Segmented
        label="Filtrar por posição"
        value={position}
        options={positionOptions}
        onChange={onPositionChange}
      />
      <Segmented
        label="Filtrar por disponibilidade"
        value={onlyFreeAgents}
        options={freeAgentsOptions}
        onChange={onFreeAgentsChange}
      />

      <div className={compact ? 'w-full' : 'min-w-[180px]'}>
        <Select
          aria-label="Filtrar por time"
          size="md"
          options={teamSelectOptions}
          value={teamId == null ? '' : String(teamId)}
          onChange={(e) => {
            const v = e.target.value
            onTeamChange(v === '' ? null : Number(v))
          }}
        />
      </div>

      <div className={compact ? 'w-full' : 'flex-1 min-w-[180px]'}>
        <SearchInput
          aria-label="Buscar jogador"
          placeholder="Buscar jogador"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
        />
      </div>
    </div>
  )
}
