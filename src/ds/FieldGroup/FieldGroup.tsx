import React from 'react'
import { Label } from '../Label/Label'
import { Help } from '../Help/Help'

export interface FieldGroupProps {
  /** Visible field label text. */
  label: React.ReactNode
  /** id of the control — links the `<label htmlFor>` and is the base for helper/error ids. */
  htmlFor: string
  /** Marks the field required: lime `*` on the label + `aria-required` on the control. */
  required?: boolean
  /** Neutral helper text. Shows together with `error` (DS §7: error does NOT replace it). */
  help?: React.ReactNode
  /** Validation error. Renders with `role="alert"` and is linked via `aria-describedby`. */
  error?: React.ReactNode
  /** The single form control (input/select/textarea). Aria attrs are injected onto it. */
  children: React.ReactNode
  /** Extra class on the wrapping group. */
  className?: string
}

// A control that may receive injected aria-* + id.
type ControlProps = {
  id?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean | 'true' | 'false'
  'aria-required'?: boolean | 'true' | 'false'
}

/**
 * Canonical field skeleton: `<label>` → control → helper → error.
 *
 * a11y contract:
 * - Real `<label htmlFor>` association via {@link Label}.
 * - `error` renders with `role="alert"` (via {@link Help}) and is linked to the
 *   control through `aria-describedby`.
 * - Helper AND error can both be present — the helper stays and the error is
 *   appended (DS §7 fix: error does not "replace" the helper).
 * - `required` adds a lime `*` and `aria-required` on the control.
 * - `error` adds `aria-invalid` on the control.
 * - Any `aria-describedby` already on the child control is preserved (merged).
 */
export function FieldGroup({
  label,
  htmlFor,
  required = false,
  help,
  error,
  children,
  className,
}: FieldGroupProps) {
  const helpId = `${htmlFor}-help`
  const errorId = `${htmlFor}-error`

  const describedIds: string[] = []
  if (help) describedIds.push(helpId)
  if (error) describedIds.push(errorId)

  let control = children
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<ControlProps>
    // Merge with any aria-describedby the caller already set on the control.
    const existing = child.props['aria-describedby']
    const merged = [existing, ...describedIds].filter(Boolean).join(' ')

    control = React.cloneElement(child, {
      id: child.props.id ?? htmlFor,
      'aria-describedby': merged || undefined,
      'aria-invalid': error ? true : child.props['aria-invalid'],
      'aria-required': required ? true : child.props['aria-required'],
    })
  }

  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {control}
      {help && (
        <Help id={helpId} tone="neutral">
          {help}
        </Help>
      )}
      {error && (
        <Help id={errorId} tone="error">
          {error}
        </Help>
      )}
    </div>
  )
}
