import React, { useState } from 'react'
import { Icon, TextInput } from '@/ds'

export interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean
}

/**
 * Password field built on the DS `TextInput` with a real `<button>` reveal
 * toggle. The toggle's accessible name flips "Mostrar" ↔ "Ocultar" (a literal
 * affordance) — deliberately NOT "…senha", so a `getByLabelText(/senha/i)`
 * field query stays unique while the toggle is still reachable as a button by
 * name. Shared by the auth pages (SignUp, ResetPassword); mirrors the local
 * field the SignIn reference migration introduced.
 */
export function PasswordField({ invalid, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const label = visible ? 'Ocultar' : 'Mostrar'

  return (
    <div className="relative">
      <TextInput
        {...inputProps}
        type={visible ? 'text' : 'password'}
        invalid={invalid}
        className="!pr-11"
      />
      <button
        type="button"
        aria-pressed={visible}
        aria-label={label}
        title={label}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-pill p-1 text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={20} aria-hidden="true" />
      </button>
    </div>
  )
}
