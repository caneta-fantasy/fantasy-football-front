import React from 'react'
import { Icon } from '../Icon/Icon'

/**
 * Select — a real native `<select>` in a styled shell.
 *
 * a11y contract (DS §7 #5):
 * - The control is always a native `<select>` (role `combobox` in the AX tree),
 *   never a styled `<div>`. It is label-associable via `id` + `<label htmlFor>`
 *   (use {@link FieldGroup} for the canonical wiring) or `aria-label`.
 * - `invalid` drives `aria-invalid`, paired with the error border (not
 *   color-only).
 * - The chevron affix is `aria-hidden` decoration; native keyboard/open
 *   behaviour comes for free from the real element.
 * - Focus ring comes from the base layer's `:focus-within`/`:focus-visible`.
 *
 * Options can come from the typed `options` prop or as `<option>` children
 * (children win when both are present, appended after the options prop).
 */
export interface SelectOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

type Size = 'sm' | 'md' | 'lg'

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Typed option list. Each renders a native `<option>`. */
  options?: SelectOption[]
  /** Optional disabled, empty-value first option shown when nothing is chosen. */
  placeholder?: string
  /** Control height/typography. Unknown values fall back to `md`. */
  size?: Size
  /** Marks the field invalid: sets `aria-invalid` and the error border. */
  invalid?: boolean
}

const SIZES: Record<Size, string> = {
  sm: 'h-[30px] text-[12px] pl-3 pr-9',
  md: 'h-[40px] text-[13px] pl-3 pr-10',
  lg: 'h-[52px] text-[15px] pl-4 pr-11',
}

const BASE =
  'block w-full appearance-none bg-surface rounded-sm border border-border-strong ' +
  'font-sans text-text transition-colors duration-150 cursor-pointer ' +
  'hover:border-ink-500 focus:border-ink-900 focus:outline-none ' +
  'focus-visible:shadow-[var(--focus-ring)] ' +
  'disabled:bg-surface-inset disabled:border-border disabled:cursor-not-allowed disabled:opacity-60'

const INVALID = 'border-red hover:border-red focus:border-red'

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      options,
      placeholder,
      size = 'md',
      invalid = false,
      className,
      children,
      ...rest
    },
    ref,
  ) {
    // Default-fallback map: an unknown size resolves rather than throws.
    const s = SIZES[size] ?? SIZES.md

    const cls = [BASE, s, invalid ? INVALID : '', className ?? '']
      .filter(Boolean)
      .join(' ')

    return (
      <div className="relative">
        <select
          ref={ref}
          aria-invalid={invalid || undefined}
          className={cls}
          {...rest}
        >
          {placeholder != null && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options?.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        <Icon
          name="chevron-down"
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
        />
      </div>
    )
  },
)
