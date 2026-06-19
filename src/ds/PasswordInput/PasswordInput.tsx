import React from 'react'
import { TextInput, type TextInputProps } from '../TextInput/TextInput'
import { Icon } from '../Icon/Icon'

/**
 * PasswordInput — a `TextInput` wired to `type="password"` with a reveal toggle.
 *
 * a11y contract (DS §7 #5, catalog P1a):
 * - The control is the real `<input>` from `TextInput`; only its `type` flips
 *   between `password` and `text` — the component owns `type`, callers cannot
 *   override it.
 * - The reveal affordance is a REAL `<button type="button">` (never a styled
 *   `<div>`), so it is keyboard focusable and operable with Enter/Space for
 *   free. It carries `aria-pressed` (the toggle state) and an `aria-label`
 *   that flips between "mostrar senha" / "ocultar senha".
 * - `type="button"` prevents the toggle from submitting a wrapping `<form>`.
 * - The focus ring on both the field and the toggle comes from the base
 *   layer's `:focus-visible`.
 *
 * `invalid`, `leadingIcon`, `ref`, and all other input props flow straight
 * through to `TextInput`. `suffix`/`type` are owned by this component.
 */
export interface PasswordInputProps
  extends Omit<TextInputProps, 'type' | 'suffix'> {
  /** Initial reveal state for uncontrolled usage. Defaults to hidden. */
  defaultVisible?: boolean
}

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(function PasswordInput({ defaultVisible = false, className, ...rest }, ref) {
  const [visible, setVisible] = React.useState(defaultVisible)
  const label = visible ? 'ocultar senha' : 'mostrar senha'

  return (
    <div className="relative">
      <TextInput
        ref={ref}
        type={visible ? 'text' : 'password'}
        // Reserve room on the right edge so typed text never runs under the
        // overlaid toggle button.
        className={`pr-[44px] ${className ?? ''}`.trim()}
        {...rest}
      />
      <button
        type="button"
        aria-pressed={visible}
        aria-label={label}
        title={label}
        onClick={() => setVisible((v) => !v)}
        className={
          'absolute right-1 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 ' +
          'items-center justify-center rounded-pill text-text-muted ' +
          'hover:text-text hover:bg-surface-inset transition-colors ' +
          'duration-150 cursor-pointer'
        }
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={20} />
      </button>
    </div>
  )
})
