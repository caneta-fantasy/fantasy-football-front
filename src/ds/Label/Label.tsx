import React from 'react'

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** The id of the control this label is associated with. */
  htmlFor: string
  /** When true, appends a lime asterisk and is announced as required by the field. */
  required?: boolean
  children: React.ReactNode
}

// Editorial overline: uppercase, heavy tracking, muted (functional-contrast)
// color — never textSubtle for this functional label (DS §7 #4).
const BASE =
  'block font-sans font-bold text-[11px] uppercase tracking-[2px] text-text-muted mb-2'

/**
 * Field label — a real `<label htmlFor>`. The required marker is a lime `*`
 * that is `aria-hidden` so screen readers do not announce a bare asterisk;
 * the requiredness is conveyed on the control itself via `aria-required`
 * (see FieldGroup).
 */
export function Label({
  htmlFor,
  required = false,
  className,
  children,
  ...rest
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`${BASE} ${className ?? ''}`.trim()}
      {...rest}
    >
      {children}
      {required && (
        <span className="text-lime-deep ml-[3px]" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}
