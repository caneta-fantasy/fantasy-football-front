import React from 'react'
import { Icon } from '../Icon/Icon'
import './Checkbox.css'

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Visible label text, associated with the input via `<label htmlFor>`. */
  label: React.ReactNode
  /**
   * Tri-state visual: when true the box shows a dash and the native node's
   * `.indeterminate` is set (it is not a real HTML attribute, so it is
   * applied imperatively to the DOM node).
   */
  indeterminate?: boolean
}

/**
 * Checkbox — a real native `<input type="checkbox">` wrapped in a `<label>`
 * so the whole row is clickable and the label is programmatically associated.
 *
 * a11y contract:
 * - Real `<input type="checkbox">` (never a styled div); exposed with the
 *   `checkbox` role and the label as its accessible name.
 * - The visual box is purely decorative (`aria-hidden`); the native input is
 *   the source of truth and stays focusable so the base-layer focus ring shows.
 * - `indeterminate` drives the DOM node's `.indeterminate` property.
 * - Focus ring comes from the base layer's `:focus-visible`.
 */
export function Checkbox({
  label,
  indeterminate = false,
  id,
  className,
  disabled,
  ...rest
}: CheckboxProps) {
  const reactId = React.useId()
  const inputId = id ?? `ds-checkbox-${reactId}`
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label
      htmlFor={inputId}
      className={[
        'ds-checkbox inline-flex items-center gap-2 font-sans text-[12.5px] text-text select-none',
        disabled
          ? 'opacity-[var(--opacity-disabled)] cursor-not-allowed'
          : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Real input — visually hidden but in the a11y tree and focusable. */}
      <input
        ref={inputRef}
        id={inputId}
        type="checkbox"
        className="ds-checkbox-input"
        disabled={disabled}
        {...rest}
      />
      {/* Decorative box mirrors the input's state via sibling selectors. */}
      <span className="ds-checkbox-box" aria-hidden="true">
        <Icon name="check" size={16} className="ds-checkbox-check" />
        <span className="ds-checkbox-dash" />
      </span>
      <span>{label}</span>
    </label>
  )
}
