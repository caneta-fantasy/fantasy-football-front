import React from 'react'
import {
  useRadioGroup,
  useRadioRegistry,
} from '../RadioGroup/RadioGroupContext'
import './Radio.css'

export interface RadioProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'type' | 'name' | 'value' | 'checked' | 'defaultChecked' | 'onChange' | 'size'
  > {
  /** Value submitted / reported when this radio is the selected one. */
  value: string
  /** Visible label, associated with the input via `<label htmlFor>`. */
  label: React.ReactNode
}

/**
 * Radio — a real native `<input type="radio">`. Designed to live inside a
 * {@link RadioGroup}, which supplies the shared `name`, the selected value,
 * roving tabindex, and arrow-key navigation via context.
 *
 * a11y contract:
 * - Real `<input type="radio">` (never a styled div).
 * - Exactly one radio in the group is tabbable (`tabindex=0`); the rest are
 *   `tabindex=-1` and reached with the arrow keys (roving focus).
 * - The visual dot is decorative (`aria-hidden`); the input is focusable so the
 *   base-layer focus ring shows.
 */
export function Radio({
  value,
  label,
  id,
  className,
  disabled: ownDisabled,
  ...rest
}: RadioProps) {
  const group = useRadioGroup()
  const registry = useRadioRegistry()
  const reactId = React.useId()
  const inputId = id ?? `ds-radio-${reactId}`
  const inputRef = React.useRef<HTMLInputElement>(null)

  const disabled = ownDisabled || group?.disabled || false

  // Register with the group so it can seed roving order + skip disabled. Depend
  // ONLY on the stable registry callbacks (not the state object) so this runs
  // once per mount / per actual value-or-disabled change — never in a loop.
  const register = registry?.register
  const unregister = registry?.unregister
  React.useEffect(() => {
    register?.(value, disabled)
    return () => unregister?.(value)
  }, [register, unregister, value, disabled])

  const checked = group ? group.value === value : undefined
  const tabbable = group ? group.tabbableValue === value : undefined

  return (
    <label
      htmlFor={inputId}
      className={[
        'ds-radio inline-flex items-center gap-2 font-sans text-[12.5px] text-text select-none',
        disabled
          ? 'opacity-[var(--opacity-disabled)] cursor-not-allowed'
          : 'cursor-pointer',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <input
        ref={inputRef}
        id={inputId}
        type="radio"
        className="ds-radio-input"
        name={group?.name}
        value={value}
        checked={checked}
        disabled={disabled}
        tabIndex={group ? (tabbable ? 0 : -1) : undefined}
        onChange={() => group?.onSelect(value)}
        onKeyDown={(e) => group?.onKeyDown(e, value)}
        {...rest}
      />
      <span className="ds-radio-dot" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
}
