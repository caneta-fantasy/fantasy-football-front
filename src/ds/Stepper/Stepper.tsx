import React from 'react'
import { Icon } from '../Icon/Icon'

/**
 * Stepper — a numeric +/- control (e.g. the captain multiplier).
 *
 * a11y contract (DS §7 #5, Task 9 catalog):
 * - The increment / decrement controls are real `<button type="button">`
 *   elements with explicit accessible labels ("Aumentar" / "Diminuir"), never
 *   styled `<div>`s. They are natively focusable and keyboard-operable.
 * - The buttons are genuinely `disabled` at the bounds (not merely greyed), so
 *   they are removed from the tab order and cannot fire `onChange`.
 * - The value display is a `role="spinbutton"` exposing
 *   `aria-valuemin` / `aria-valuemax` / `aria-valuenow` plus an
 *   `aria-valuetext` of the formatted label; it is focusable and supports the
 *   conventional ArrowUp / ArrowDown / Home / End keyboard model.
 * - `label` provides the accessible name for the spinbutton and is referenced
 *   by both buttons so screen readers announce what is being stepped.
 *
 * Controlled component: the host owns `value` and updates it from `onChange`.
 */
export interface StepperProps {
  /** Accessible name for the value (what is being stepped). Required. */
  label: string
  /** Current value (controlled). */
  value: number
  /** Lower bound. Defaults to 0. */
  min?: number
  /** Upper bound. Defaults to 100. */
  max?: number
  /** Increment per step. Defaults to 1. */
  step?: number
  /** Called with the next value when the user steps within bounds. */
  onChange?: (value: number) => void
  /** Disables the whole control. */
  disabled?: boolean
  /** Format the displayed value (e.g. `(v) => `×${v}``). Defaults to `String`. */
  formatValue?: (value: number) => React.ReactNode
  /** Extra classes on the outer group. */
  className?: string
  /** Optional id for the group wrapper. */
  id?: string
}

const GROUP_BASE =
  'inline-flex items-stretch rounded-pill border border-border-strong overflow-hidden ' +
  'bg-surface aria-disabled:opacity-60'

const BTN_BASE =
  'flex items-center justify-center w-[38px] h-[40px] bg-surface-inset text-text ' +
  'transition-colors duration-150 cursor-pointer ' +
  'hover:bg-surface-sunken disabled:opacity-40 disabled:cursor-not-allowed ' +
  'disabled:hover:bg-surface-inset'

// The increment is the primary affordance → the green signature block; the
// disabled override keeps the green from washing out into a half-tinted state.
const INC_EXTRA =
  'bg-signature text-on-green hover:bg-signature-raised border-l border-signature-line ' +
  'disabled:hover:bg-signature'
const DEC_EXTRA = 'border-r border-border'

const VALUE_BASE =
  'min-w-[56px] px-2 flex items-center justify-center font-display text-[22px] ' +
  'leading-none text-text select-none outline-none'

export function Stepper({
  label,
  value,
  min = 0,
  max = 100,
  step = 1,
  onChange,
  disabled = false,
  formatValue = (v) => String(v),
  className,
  id,
}: StepperProps) {
  const atMax = value >= max
  const atMin = value <= min
  const incDisabled = disabled || atMax
  const decDisabled = disabled || atMin

  const clamp = (n: number) => Math.min(max, Math.max(min, n))

  const inc = () => {
    if (incDisabled) return
    const next = clamp(value + step)
    if (next !== value) onChange?.(next)
  }
  const dec = () => {
    if (decDisabled) return
    const next = clamp(value - step)
    if (next !== value) onChange?.(next)
  }

  // Native spinbutton keyboard model on the value display.
  const onKeyDown = (e: React.KeyboardEvent<HTMLSpanElement>) => {
    if (disabled) return
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        inc()
        break
      case 'ArrowDown':
        e.preventDefault()
        dec()
        break
      case 'Home':
        e.preventDefault()
        if (!disabled && value !== min) onChange?.(min)
        break
      case 'End':
        e.preventDefault()
        if (!disabled && value !== max) onChange?.(max)
        break
      default:
        break
    }
  }

  const valueText = formatValue(value)
  const groupCls = [GROUP_BASE, className].filter(Boolean).join(' ')

  return (
    <div
      id={id}
      className={groupCls}
      aria-disabled={disabled || undefined}
    >
      <button
        type="button"
        className={`${BTN_BASE} ${DEC_EXTRA}`}
        aria-label={`Diminuir ${label}`}
        disabled={decDisabled}
        onClick={dec}
      >
        <Icon name="minus" size={16} />
      </button>

      <span
        role="spinbutton"
        tabIndex={disabled ? -1 : 0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={typeof valueText === 'string' ? valueText : undefined}
        aria-disabled={disabled || undefined}
        onKeyDown={onKeyDown}
        className={VALUE_BASE}
      >
        {valueText}
      </span>

      <button
        type="button"
        className={`${BTN_BASE} ${INC_EXTRA}`}
        aria-label={`Aumentar ${label}`}
        disabled={incDisabled}
        onClick={inc}
      >
        <Icon name="plus" size={16} />
      </button>
    </div>
  )
}
