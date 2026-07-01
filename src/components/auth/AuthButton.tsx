import React from 'react'
import { Spinner } from '@/ds'

export interface AuthButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Shows a spinner and disables the button. */
  loading?: boolean
}

/**
 * AuthButton — the full-width green primary CTA for the auth screens.
 *
 * Deliberately an inline-styled `<button>` (green fill, gold border, cream
 * text) rather than the DS `Btn`: the `[data-ds] button` reset in `base.css`
 * sets `background-color: transparent` at a higher specificity than the
 * `bg-*` utility classes the DS `Btn` relies on, so solid `Btn` variants render
 * with no fill inside a `data-ds` scope. Inline styles win over the reset — the
 * same workaround the SignIn reference migration uses for its submit button.
 */
export function AuthButton({
  loading = false,
  disabled,
  children,
  className,
  type = 'button',
  ...rest
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`flex w-full items-center justify-center gap-2 rounded-btn-lg px-[30px] font-sans text-[15px] font-bold tracking-[0.3px] transition-transform duration-150 hover:-translate-y-px active:translate-y-px disabled:opacity-60${
        className ? ` ${className}` : ''
      }`}
      style={{
        height: '56px',
        backgroundColor: '#14402C', // green (signature)
        color: '#F2F1E8', // cream (on-green)
        border: '2px solid #C79A2B', // gold border
      }}
      {...rest}
    >
      {loading ? <Spinner size={20} /> : children}
    </button>
  )
}
