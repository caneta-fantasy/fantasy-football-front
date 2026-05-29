import React from 'react'
import './Chip.css'

export type ChipTone =
  | 'lime'
  | 'yellow'
  | 'red'
  | 'ink'
  | 'paper'
  | 'ghost'
  | 'live'

interface ChipBaseProps {
  /** Visual tone. Unknown values fall back to `ink` (no throw — §7 #1). */
  tone?: ChipTone
  /**
   * Upgrade from a decorative `<span>` to a real `<button>` so the chip is
   * focusable, keyboard-operable, and exposed with the button role.
   */
  interactive?: boolean
  /**
   * Disabled adds a NON-COLOR cue (line-through + reduced opacity) plus a
   * visually-hidden "(desativado)" announcement — never color-only.
   */
  disabled?: boolean
  children?: React.ReactNode
}

export type ChipProps = ChipBaseProps &
  Omit<
    React.HTMLAttributes<HTMLSpanElement> &
      React.ButtonHTMLAttributes<HTMLButtonElement>,
    keyof ChipBaseProps
  >

// Tone → Tailwind utility classes mapped to tokens.
// §7 #3 fix: red/live use the danger-fg token (ink900) — never white-on-red.
const TONES: Record<ChipTone, string> = {
  lime: 'bg-lime text-[color:var(--color-on-lime)]',
  yellow: 'bg-yellow text-[color:var(--color-on-lime)]',
  red: 'bg-red text-[color:var(--color-danger-fg)]',
  ink: 'bg-ink-900 text-text-on-dark',
  paper: 'bg-paper text-[color:var(--paper-ink)]',
  ghost:
    'bg-transparent text-text-muted border border-[color:var(--color-border-strong)]',
  live: 'bg-red text-[color:var(--color-danger-fg)]',
}

const BASE =
  'inline-flex items-center gap-2 font-sans font-semibold uppercase ' +
  'tracking-[1.2px] text-[11px] leading-none px-[9px] py-1 rounded-xs align-middle ' +
  'whitespace-nowrap select-none'

// Visually-hidden recipe: out of the visual flow, still in the a11y tree.
const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function Chip({
  tone = 'ink',
  interactive = false,
  disabled = false,
  children,
  className,
  ...rest
}: ChipProps) {
  const toneCls = TONES[tone] ?? TONES.ink
  // Non-color disabled cue: strike the label and dim it. The cue is the
  // line-through (not just a lighter color), so it reads without color.
  const disabledCls = disabled
    ? 'line-through opacity-[var(--opacity-disabled)]'
    : ''
  const interactiveCls = interactive
    ? 'cursor-pointer transition-[transform,opacity] duration-150 ' +
      'ease-[var(--ease-standard)] hover:-translate-y-px active:translate-y-px ' +
      'disabled:cursor-not-allowed disabled:hover:translate-y-0'
    : ''

  const cls = [BASE, toneCls, disabledCls, interactiveCls, className]
    .filter(Boolean)
    .join(' ')

  const dot =
    tone === 'live' ? (
      <span className="ds-chip-dot" aria-hidden="true" />
    ) : null

  const srCue = disabled ? <span style={srOnly}>(desativado)</span> : null

  if (interactive) {
    return (
      <button type="button" className={cls} disabled={disabled} {...rest}>
        {dot}
        {children}
        {srCue}
      </button>
    )
  }

  return (
    <span
      className={cls}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {dot}
      {children}
      {srCue}
    </span>
  )
}
