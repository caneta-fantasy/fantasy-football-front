import { Icon } from '../Icon/Icon'
import { Chip } from '../Chip/Chip'
import './RoundSelector.css'

/**
 * RoundSelector — the modernista round navigator (Source: ScheduleTab.tsx /
 * RodadaTab.tsx). A prev/next arrow pair flanking a native `<select>` styled as
 * a white pill on the strong neutral hairline, carrying "Rodada N" plus an
 * optional `Atual` (cobalt) and `Mata-mata` (gold) chip.
 *
 * a11y contract:
 * - The control is a **real native `<select>`** (keyboard-operable, exposed with
 *   the listbox/combobox role) labelled by `aria-label` (default "Selecionar
 *   rodada"). The visible "Rodada N" text + chips are a decorative overlay
 *   (`aria-hidden`) painted on top; the select itself carries the same option
 *   text so assistive tech reads the real values.
 * - The arrows are real `<button>`s with explicit `aria-label`s ("Rodada
 *   anterior" / "Próxima rodada") and a native `disabled` at the bounds, so they
 *   get the base-layer focus ring and are skipped when unavailable.
 * - Chips ride the decorative overlay; the select's option text already conveys
 *   round number, so nothing meaningful is lost when the overlay is hidden.
 */
export interface RoundSelectorProps {
  /** The full ordered list of round numbers to choose from. */
  rounds: number[]
  /** The currently-selected round number (controlled). */
  value: number
  /** Called with the newly-chosen round number. */
  onChange: (round: number) => void
  /**
   * Predicate marking a round as a playoff ("Mata-mata") round — renders the
   * gold chip and is reflected in each option's label.
   */
  isPlayoff?: (round: number) => boolean
  /**
   * The "current"/live round number — renders the cobalt "Atual" chip when it
   * matches the selected value, and tags that option.
   */
  currentRound?: number | null
  /** Accessible name for the select. Defaults to "Selecionar rodada". */
  label?: string
  className?: string
}

const ARROW =
  'inline-flex items-center justify-center w-9 h-9 rounded-btn-sm ' +
  'border-[1.5px] border-line-strong text-ink-muted bg-white ' +
  'transition-colors duration-150 hover:bg-mist ' +
  'disabled:opacity-40 disabled:pointer-events-none cursor-pointer'

export function RoundSelector({
  rounds,
  value,
  onChange,
  isPlayoff,
  currentRound,
  label = 'Selecionar rodada',
  className,
}: RoundSelectorProps) {
  const index = rounds.indexOf(value)
  const atStart = index <= 0
  const atEnd = index < 0 || index >= rounds.length - 1

  const playoff = isPlayoff?.(value) ?? false
  const isCurrent = currentRound != null && value === currentRound

  const go = (delta: number) => {
    const next = rounds[index + delta]
    if (next !== undefined) onChange(next)
  }

  return (
    <div className={`flex items-center gap-[10px] ${className ?? ''}`.trim()}>
      <button
        type="button"
        className={ARROW}
        aria-label="Rodada anterior"
        disabled={atStart}
        onClick={() => go(-1)}
      >
        <Icon name="chevron-left" size={16} aria-hidden />
      </button>

      {/* The select is the real control; the visible label + chips are a
          decorative overlay painted on top of the transparent native select. */}
      <div className="relative inline-flex">
        <select
          aria-label={label}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="ds-round-select peer absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        >
          {rounds.map((r) => {
            const tags: string[] = []
            if (isPlayoff?.(r)) tags.push('Mata-mata')
            if (currentRound != null && r === currentRound) tags.push('Atual')
            return (
              <option key={r} value={r}>
                {`Rodada ${r}${tags.length ? ` (${tags.join(', ')})` : ''}`}
              </option>
            )
          })}
        </select>

        <div
          aria-hidden="true"
          className="ds-round-display flex items-center gap-[9px] h-[38px] px-4 min-w-[160px] bg-white border-[1.5px] border-line-strong rounded-btn-sm"
        >
          <span className="font-sans font-bold text-[14px] text-ink">
            Rodada {value}
          </span>
          {isCurrent && (
            <Chip tone="cobalt" className="px-2 py-0.5 text-[9.5px]">
              Atual
            </Chip>
          )}
          {playoff && (
            <Chip tone="gold" className="px-2 py-0.5 text-[9.5px]">
              Mata-mata
            </Chip>
          )}
          <span className="ml-auto text-ink-subtle">
            <Icon name="chevron-down" size={16} aria-hidden />
          </span>
        </div>
      </div>

      <button
        type="button"
        className={ARROW}
        aria-label="Próxima rodada"
        disabled={atEnd}
        onClick={() => go(1)}
      >
        <Icon name="chevron-right" size={16} aria-hidden />
      </button>
    </div>
  )
}
