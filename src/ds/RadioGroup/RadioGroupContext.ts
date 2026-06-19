import React from 'react'

/** Shared state a RadioGroup provides to its Radio children. */
export interface RadioGroupContextValue {
  /** Shared `name` so the native radios form one mutually-exclusive set. */
  name: string
  /** Currently-selected value (controlled). */
  value: string | undefined
  /** Disable the whole group. */
  disabled: boolean
  /** Called by a Radio when it is selected. */
  onSelect: (value: string) => void
  /** Roving tabindex: the value that owns `tabindex=0`. */
  tabbableValue: string | undefined
  /** ArrowUp/Down/Left/Right handler, wired on each radio. */
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>, value: string) => void
}

/**
 * Stable registry callbacks, kept in a SEPARATE context so they never change
 * identity across RadioGroup re-renders. A Radio's registration effect depends
 * only on these (not on the state object), which avoids a register → re-render
 * → register feedback loop.
 */
export interface RadioRegistryValue {
  register: (value: string, disabled: boolean) => void
  unregister: (value: string) => void
}

export const RadioGroupContext =
  React.createContext<RadioGroupContextValue | null>(null)

export const RadioRegistryContext =
  React.createContext<RadioRegistryValue | null>(null)

export function useRadioGroup(): RadioGroupContextValue | null {
  return React.useContext(RadioGroupContext)
}

export function useRadioRegistry(): RadioRegistryValue | null {
  return React.useContext(RadioRegistryContext)
}
