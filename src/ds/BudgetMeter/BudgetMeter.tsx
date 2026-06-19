import React from 'react'

type Threshold = 'green' | 'warning' | 'danger'

export interface BudgetMeterProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Amount spent, in the same unit as `max`. Reported verbatim to AT. */
  value: number
  /** The budget cap. Defaults to 100; a non-positive value coerces to 100. */
  max?: number
  /** Accessible name for the meter (maps to `aria-label`). */
  label?: string
  /** Track height in px. */
  height?: number
  /**
   * Currency prefix for the spent/cap caption (e.g. `R$`). When omitted along
   * with `unit`, the numeric caption is hidden and only the bar renders.
   */
  currency?: string
  /** Unit suffix for the caption (e.g. `mi`). */
  unit?: string
  /** Hide the auto-generated spent/cap caption even when currency/unit is set. */
  hideCaption?: boolean
  /** Optional secondary note (e.g. the transfer penalty: `+1 transfer = -4 pts`). */
  hint?: string
}

// Threshold (fill) → background utility mapped to modernista tokens. The states
// use their OWN functional hues (never the referee card colours): healthy =
// signature green, running-low = warning amber, near/over cap = brick danger.
const FILLS: Record<Threshold, string> = {
  green: 'bg-signature',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

/**
 * Spend fraction → threshold colour.
 * Healthy under 0.75 → green; 0.75–0.95 → warning (running low); near/at/over the
 * cap (>=0.95, incl. over-budget) → danger. Over-budget (>1) always reads danger.
 */
function thresholdFor(fraction: number): Threshold {
  if (fraction >= 0.95) return 'danger'
  if (fraction >= 0.75) return 'warning'
  return 'green'
}

/**
 * Format a number for the caption without depending on a locale lib: trims a
 * trailing `.0`, keeps at most one decimal, uses a comma as the pt-BR separator.
 */
function fmt(n: number): string {
  const rounded = Math.round(n * 10) / 10
  const str = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
  return str.replace('.', ',')
}

/**
 * Budget spend meter for fantasy patterns.
 *
 * DS §7 #6 fix: the fill WIDTH is driven by `value/max` (never always-full).
 * Threshold colour shifts green → warning → danger as spend approaches the cap,
 * and an over-budget spend (value > max) gets a clear treatment: the drawn fill
 * is clamped to 100%, the bar turns brick danger, and `data-over-budget` is
 * exposed (the functional brick #B23A2B, never the referee card-red).
 *
 * a11y contract: `role="progressbar"` with `aria-valuenow` (the real spend,
 * even past max), `aria-valuemin=0`, `aria-valuemax=max`. The over-budget state
 * is announced via the `aria-label` (the colour is never the only cue).
 */
export function BudgetMeter({
  value,
  max = 100,
  label,
  height = 12,
  currency,
  unit,
  hideCaption = false,
  hint,
  className,
  ...rest
}: BudgetMeterProps) {
  const safeMax = max > 0 ? max : 100
  const fraction = value / safeMax
  const overBudget = value > safeMax
  // Clamp the *drawn* fill to [0, 1]; aria-valuenow keeps the raw value.
  const clamped = Math.min(1, Math.max(0, fraction))
  const widthPct = `${clamped * 100}%`

  // Over-budget always reads danger; otherwise the threshold heuristic decides.
  const threshold: Threshold = overBudget ? 'danger' : thresholdFor(fraction)
  const fill = FILLS[threshold] ?? FILLS.green

  const unitSuffix = unit ? ` ${unit}` : ''
  const showCaption = !hideCaption && (currency != null || unit != null)
  const spentText = `${currency ? `${currency} ` : ''}${fmt(value)}${unitSuffix}`
  const capText = `${fmt(safeMax)}${unitSuffix}`

  // Build an accessible name: an explicit label wins; otherwise derive one that
  // states the over-budget condition so colour is never the sole signal.
  const accessibleName =
    label ?? (overBudget ? `Orçamento estourado: ${spentText} de ${capText}` : undefined)

  return (
    <div className={className} {...rest}>
      <div
        role="progressbar"
        aria-label={accessibleName}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        data-over-budget={overBudget || undefined}
        className="relative overflow-hidden rounded-pill bg-surface-inset"
        style={{ height }}
      >
        <div
          data-ds-budget-fill
          className={`absolute left-0 top-0 bottom-0 ${fill} transition-[width] duration-300 ease-[var(--ease-standard)]`}
          style={{ width: widthPct }}
        />
        {/* Cap marker: a hairline at the budget ceiling, hidden once over. */}
        {!overBudget && (
          <span
            aria-hidden="true"
            className="absolute top-0 bottom-0 w-px bg-[color:var(--color-border-strong)]"
            style={{ left: '100%' }}
          />
        )}
      </div>

      {(showCaption || hint) && (
        <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] font-bold">
          {showCaption && (
            <span className={overBudget ? 'text-danger' : 'text-text-muted'}>
              {spentText} / {capText}
              {overBudget ? ' — estourando' : ''}
            </span>
          )}
          {hint && <span className="text-text-muted">{hint}</span>}
        </div>
      )}
    </div>
  )
}
