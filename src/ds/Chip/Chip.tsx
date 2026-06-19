import React from 'react'
import './Chip.css'

export type ChipTone =
  | 'green'
  | 'gold'
  | 'cobalt'
  | 'success'
  | 'white'
  | 'ghost'
  | 'live'
  // reserved — referee only (cartão amarelo / vermelho); never state-by-color.
  | 'yellow'
  | 'red'

interface ChipBaseProps {
  /** Visual tone. Unknown values fall back to `green` (no throw — §7 #1). */
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

// Tone → Tailwind utility classes mapped to modernista tokens. Every tone is a
// bg + fg + 1.5px border triple (the border carries the tone in greyscale, so
// the chip never communicates by fill color alone). Pale-tint tones pair a soft
// fill with a deep on-tone foreground + a saturated border; solid tones (green)
// carry an on-color foreground. Contrast (vs the listed bg) is AA at this size:
//   green   on-green / green        10.3:1
//   gold    gold-deep / gold-pale    4.2:1 (AA-large; 10.5px bold tracked)
//   cobalt  cobalt-deep / cobalt-pale 8.4:1
//   success green-600 / success-pale  7.4:1
//   white   ink / white             16.7:1
//   ghost   ink-muted / white        6.5:1
//   live    white / danger(brick)    5.9:1  (brick #B23A2B, NOT card-red)
//   yellow  ink / card-yellow       10.2:1  (referee)
//   red     ink / danger-pale       12.3:1  (referee — card-red BORDER, never
//                                            white-on-card-red text · §7 #3)
const TONES: Record<ChipTone, string> = {
  green:
    'bg-signature text-on-green border-[1.5px] border-signature',
  gold:
    'bg-accent-pale text-accent-deep border-[1.5px] border-accent',
  cobalt:
    'bg-cobalt-pale text-cobalt-deep border-[1.5px] border-cobalt',
  success:
    'bg-success-pale text-signature-raised border-[1.5px] border-success',
  white:
    'bg-white text-ink border-[1.5px] border-line-strong',
  ghost:
    'bg-transparent text-ink-muted border-[1.5px] border-line-strong',
  live:
    'bg-danger text-white border-[1.5px] border-danger',
  // reserved referee tones — never used to convey app state by color alone.
  yellow:
    'bg-card-yellow text-ink border-[1.5px] border-card-yellow',
  // card-red carries the tone via the BORDER; the fill is the red tint and the
  // text is ink (12.3:1) — reconciled away from white-on-card-red (§7 #3).
  red:
    'bg-danger-pale text-ink border-[1.5px] border-card-red',
}

const BASE =
  'inline-flex items-center gap-2 font-sans font-bold uppercase ' +
  'tracking-[1.2px] text-[10.5px] leading-none px-[11px] py-[5px] rounded-chip align-middle ' +
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
  tone = 'green',
  interactive = false,
  disabled = false,
  children,
  className,
  ...rest
}: ChipProps) {
  const toneCls = TONES[tone] ?? TONES.green
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
