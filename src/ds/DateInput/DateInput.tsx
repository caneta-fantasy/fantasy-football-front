import React from 'react'
import { Icon } from '../Icon/Icon'

/**
 * DateInput — a real, native `<input type="date">` styled inside the token
 * field shell. Replaces the MUI x-date-picker dependency for new code.
 *
 * a11y contract (DS §7 #4, #5):
 * - The control is always a native `<input type="date">`, never a styled
 *   `<div>` mock. It gets the browser's accessible date editing + native
 *   calendar picker for free, and pairs with a real `<label htmlFor>` (use it
 *   inside {@link FieldGroup}, or pass `aria-label`).
 * - `invalid` drives `aria-invalid` so the error state is conveyed to assistive
 *   tech, not by the red border alone (color is never the only cue).
 * - The leading calendar glyph is decorative (the native control already
 *   exposes its own picker affordance), so it is `aria-hidden`.
 * - The focus ring comes from the base layer's `:focus-visible`
 *   (`focus-within:shadow-[var(--focus-ring)]` on the shell); it is not
 *   reinvented here.
 *
 * Sizing: `md` (40px) is the canonical field height — reconciles the §7 42/38
 * conflict and matches {@link TextInput}. `sm` (32px) is the compact filter
 * variant. The size map has a default fallback (§7 #1: never throw).
 */
type Size = 'sm' | 'md'

export interface DateInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Field height. `md` (40px, default) or `sm` (32px compact). */
  size?: Size
  /** Marks the field invalid: sets `aria-invalid` and the error styling. */
  invalid?: boolean
}

const SHELL_BASE =
  'flex items-center gap-2 w-full px-3 bg-surface rounded-pill border ' +
  'border-border-strong font-sans text-text transition-colors duration-150 ' +
  'hover:border-ink-muted focus-within:border-signature ' +
  'focus-within:shadow-[var(--focus-ring)] ' +
  'has-[:disabled]:bg-surface-inset has-[:disabled]:border-border ' +
  'has-[:disabled]:cursor-not-allowed'

const SIZES: Record<Size, string> = {
  sm: 'h-[32px] text-[12px]',
  md: 'h-[40px] text-[13px]',
}

const SHELL_INVALID =
  'border-danger focus-within:border-danger bg-[color:rgba(178,58,43,0.05)]'

export const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput(
    { size = 'md', invalid = false, disabled, className, ...inputProps },
    ref,
  ) {
    // §7 #1: default fallback, never throw on an unknown size.
    const s = SIZES[size] ?? SIZES.md

    const shellCls = [SHELL_BASE, s, invalid ? SHELL_INVALID : '', className ?? '']
      .filter(Boolean)
      .join(' ')

    return (
      <div className={shellCls} data-invalid={invalid || undefined}>
        <Icon
          name="calendar"
          size={16}
          className="shrink-0 text-text-muted"
        />
        <input
          ref={ref}
          type="date"
          disabled={disabled}
          aria-invalid={invalid || undefined}
          className="min-w-0 flex-1 bg-transparent outline-none border-0 p-0 font-mono text-text placeholder:text-text-subtle disabled:cursor-not-allowed"
          {...inputProps}
        />
      </div>
    )
  },
)
