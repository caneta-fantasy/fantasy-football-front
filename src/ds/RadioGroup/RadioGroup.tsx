import React from 'react'
import {
  RadioGroupContext,
  RadioRegistryContext,
} from './RadioGroupContext'

export interface RadioGroupProps {
  /** Visible group label; becomes the radiogroup's accessible name. */
  label: React.ReactNode
  /** Shared `name` for the native radios — makes them one exclusive set. */
  name: string
  /** Controlled selected value. */
  value?: string
  /** Fires with the newly-selected value. */
  onChange?: (value: string) => void
  /** Disable every radio in the group. */
  disabled?: boolean
  /** Marks the group required (adds `aria-required`). */
  required?: boolean
  /** Radio children. */
  children: React.ReactNode
  /** Extra class on the group wrapper. */
  className?: string
}

/**
 * RadioGroup — owns a set of {@link Radio} children.
 *
 * a11y contract:
 * - `role="radiogroup"` labelled by the group `label`; `aria-required` when
 *   required.
 * - Children are real native radios sharing one `name` (exclusive selection).
 * - Roving tabindex: exactly one radio is tabbable. Tab enters/leaves the whole
 *   group; ArrowDown/ArrowRight move to (and select) the next enabled radio,
 *   ArrowUp/ArrowLeft the previous, wrapping at the ends and skipping disabled
 *   radios — the standard WAI-ARIA radiogroup keyboard model.
 */
export function RadioGroup({
  label,
  name,
  value,
  onChange,
  disabled = false,
  required = false,
  children,
  className,
}: RadioGroupProps) {
  const reactId = React.useId()
  const labelId = `ds-radiogroup-${reactId}-label`

  const groupRef = React.useRef<HTMLDivElement>(null)
  // Registry of value → disabled, populated by the children's mount effects.
  // It seeds the roving order before the DOM is queryable on first paint.
  const registry = React.useRef<Map<string, boolean>>(new Map())
  const [, force] = React.useReducer((n: number) => n + 1, 0)

  // Stable callbacks: only force a re-render when the registry truly changed,
  // so a child re-registering with the same flags cannot create a loop.
  const register = React.useCallback((val: string, dis: boolean) => {
    if (registry.current.get(val) === dis && registry.current.has(val)) return
    registry.current.set(val, dis)
    force()
  }, [])
  const unregister = React.useCallback((val: string) => {
    if (!registry.current.has(val)) return
    registry.current.delete(val)
    force()
  }, [])
  const registryApi = React.useMemo(
    () => ({ register, unregister }),
    [register, unregister],
  )

  /** Enabled radio values in DOM order (falls back to registry pre-paint). */
  const enabledValues = React.useCallback((): string[] => {
    const el = groupRef.current
    if (el) {
      const inputs = Array.from(
        el.querySelectorAll<HTMLInputElement>('input[type="radio"]'),
      )
      if (inputs.length) return inputs.filter((i) => !i.disabled).map((i) => i.value)
    }
    return [...registry.current.entries()]
      .filter(([, dis]) => !dis)
      .map(([v]) => v)
  }, [])

  // The tabbable radio: the selected one (if enabled), else the first enabled.
  const enabled = enabledValues()
  const tabbableValue =
    value !== undefined && enabled.includes(value) ? value : enabled[0]

  const focusRadio = (val: string) => {
    const el = groupRef.current
    if (!el) return
    const input = el.querySelector<HTMLInputElement>(
      `input[type="radio"][value="${CSS.escape(val)}"]`,
    )
    input?.focus()
  }

  const onSelect = React.useCallback(
    (val: string) => {
      if (disabled) return
      onChange?.(val)
    },
    [disabled, onChange],
  )

  const onKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    current: string,
  ) => {
    const order = enabledValues()
    if (order.length === 0) return
    let dir = 0
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        dir = 1
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        dir = -1
        break
      default:
        return
    }
    event.preventDefault()
    const idx = order.indexOf(current)
    const from = idx === -1 ? 0 : idx
    const nextIdx = (from + dir + order.length) % order.length
    const next = order[nextIdx]
    focusRadio(next)
    onSelect(next)
  }

  const state = React.useMemo(
    () => ({ name, value, disabled, onSelect, tabbableValue, onKeyDown }),
    // onKeyDown closes over enabledValues/onSelect which are stable; the inputs
    // that actually affect behavior are listed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [name, value, disabled, onSelect, tabbableValue],
  )

  return (
    <div
      ref={groupRef}
      role="radiogroup"
      aria-labelledby={labelId}
      aria-required={required || undefined}
      className={className}
    >
      <span
        id={labelId}
        className="block font-sans font-bold text-[11px] uppercase tracking-[2px] text-text-muted mb-3"
      >
        {label}
        {required && (
          <span className="text-lime-deep ml-[3px]" aria-hidden="true">
            *
          </span>
        )}
      </span>
      <div className="flex flex-col gap-3">
        <RadioRegistryContext.Provider value={registryApi}>
          <RadioGroupContext.Provider value={state}>
            {children}
          </RadioGroupContext.Provider>
        </RadioRegistryContext.Provider>
      </div>
    </div>
  )
}
