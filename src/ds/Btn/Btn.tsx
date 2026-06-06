import React from 'react'
import { Spinner } from '../Spinner/Spinner'

type Variant = 'primary' | 'gold' | 'cobalt' | 'secondary' | 'danger' | 'ghost'
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

// Modernista variants: green is the signature primary; gold + cobalt are the
// signature color-block alternates; secondary is a transparent outline on the
// strong neutral hairline; danger is the brick functional hue (NOT card-red);
// ghost is bare green text.
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-signature text-on-green hover:bg-signature-raised',
  gold: 'bg-accent text-on-gold hover:bg-accent-deep',
  cobalt: 'bg-cobalt text-white hover:bg-cobalt-deep',
  secondary:
    'bg-transparent text-ink border-[1.5px] border-line-strong hover:bg-mist',
  danger: 'bg-danger text-white hover:opacity-90',
  ghost: 'bg-transparent text-signature hover:bg-signature-pale',
}

const SIZES: Record<Size, string> = {
  sm: 'h-[36px] text-[12.5px] px-[15px] rounded-btn-sm',
  md: 'h-[46px] text-[13.5px] px-[22px] rounded-btn',
  lg: 'h-[56px] text-[15px] px-[30px] rounded-btn-lg',
}

const BASE =
  'font-sans font-bold tracking-[0.3px] inline-flex items-center justify-center gap-2 leading-none ' +
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
      {/* Inherit the button's foreground so the spinner stays visible on every
          variant (green/cobalt/danger blocks as well as the light outlines). */}
      {loading && (
        <Spinner size={size === 'lg' ? 20 : 16} color="currentColor" />
      )}
      {children}
    </button>
  )
}
