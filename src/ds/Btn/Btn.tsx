import React from 'react'
import { Spinner } from '../Spinner/Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'paper'
type Size = 'sm' | 'md' | 'lg'

export interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual style. Unknown values fall back to `primary`. */
  variant?: Variant
  /** Control height/typography. Unknown values fall back to `md`. */
  size?: Size
  /**
   * When true the button is disabled, announces `aria-busy`, and renders a
   * Spinner alongside the (still-rendered) label so its width is preserved.
   */
  loading?: boolean
}

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-lime text-ink-900 hover:bg-lime-d',
  secondary: 'bg-ink-900 text-text-on-dark hover:bg-ink-700',
  ghost:
    'bg-transparent text-text border border-border-strong hover:bg-surface-inset',
  danger:
    'bg-red text-[color:var(--color-danger-fg)] hover:bg-[color:var(--red-deep)]',
  paper: 'bg-[color:var(--paper-ink)] text-paper hover:opacity-90',
}

const SIZES: Record<Size, string> = {
  sm: 'h-[30px] text-[12px] px-3',
  md: 'h-[40px] text-[13px] px-[18px]',
  lg: 'h-[52px] text-[15px] px-[26px]',
}

const BASE =
  'font-sans font-bold uppercase tracking-[0.6px] rounded-xs inline-flex items-center justify-center gap-2 ' +
  'transition-[transform,background-color] duration-150 ease-[cubic-bezier(.2,.6,.3,1)] ' +
  'hover:-translate-y-px active:translate-y-px disabled:opacity-60 disabled:pointer-events-none cursor-pointer'

export function Btn({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: BtnProps) {
  // Default-fallback maps: an unknown variant/size resolves rather than throws.
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size] ?? SIZES.md

  return (
    <button
      className={`${BASE} ${v} ${s}${className ? ` ${className}` : ''}`}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size={size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  )
}
