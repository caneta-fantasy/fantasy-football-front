import React from 'react'
import './Switch.css'

export interface SwitchProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'onChange' | 'type' | 'value'
  > {
  /** Accessible label for the switch. Rendered beside the track. */
  label: React.ReactNode
  /** Controlled on/off state. Omit for uncontrolled (use `defaultChecked`). */
  checked?: boolean
  /** Initial state when uncontrolled. */
  defaultChecked?: boolean
  /** Fires with the NEXT boolean state after a toggle. */
  onChange?: (checked: boolean) => void
}

/**
 * Switch — a real `<button role="switch">` with `aria-checked`.
 *
 * a11y contract:
 * - `role="switch"` + `aria-checked` reflecting on/off.
 * - Native `<button type="button">`: Space/Enter toggle it for free, and it
 *   never submits an enclosing form.
 * - Label is associated via `aria-labelledby` so the button has an accessible
 *   name regardless of where the visible text sits.
 * - Disabled blocks toggling and is conveyed via the native `disabled` attr.
 * - Focus ring comes from the base layer's `:focus-visible`.
 *
 * Works controlled (`checked` + `onChange`) or uncontrolled (`defaultChecked`).
 */
export function Switch({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled,
  className,
  id,
  ...rest
}: SwitchProps) {
  const reactId = React.useId()
  const labelId = `${id ?? `ds-switch-${reactId}`}-label`

  const isControlled = checked !== undefined
  const [internal, setInternal] = React.useState(defaultChecked)
  const on = isControlled ? checked : internal

  const toggle = () => {
    if (disabled) return
    const next = !on
    if (!isControlled) setInternal(next)
    onChange?.(next)
  }

  return (
    <span className="inline-flex items-center gap-[10px] font-sans text-[12.5px] text-text">
      <button
        type="button"
        role="switch"
        id={id}
        aria-checked={on}
        aria-labelledby={labelId}
        disabled={disabled}
        onClick={toggle}
        className={[
          'ds-switch',
          disabled ? 'ds-switch--disabled' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        data-checked={on || undefined}
        {...rest}
      >
        <span className="ds-switch-thumb" aria-hidden="true" />
      </button>
      <span id={labelId}>{label}</span>
    </span>
  )
}
