import React from 'react'

/**
 * Card — a generic editorial surface. Light by default, with a dark variant
 * for "broadcast" moments, a parchment variant, and a lime call-to-action
 * variant.
 *
 * a11y / DS §7 #1: the tone map has a `surface` fallback so an unknown tone
 * never throws (`TONES[tone] ?? TONES.surface`).
 *
 * When `interactive` is set the card is a real, focusable `<button>` (never a
 * styled `<div>` with an onClick): it gets `type="button"`, reflects its
 * `selected` state via `aria-pressed` AND `aria-selected`, and receives the
 * base layer's `:focus-visible` ring for free. A non-interactive card is a
 * plain `<div>` and carries no button/selection ARIA.
 */
type Tone = 'surface' | 'dark' | 'paper' | 'lime'

// Tone → Tailwind utility classes mapped to the semantic/brand tokens.
// `selected` is a separate layer (a lime border) applied on top of the tone.
const TONES: Record<Tone, string> = {
  surface: 'bg-surface text-text border border-border',
  dark: 'bg-[color:var(--color-surface-dark)] text-text-on-dark border border-ink-700',
  paper:
    'bg-paper text-[color:var(--paper-ink)] border border-[color:var(--paper-2)]',
  lime: 'bg-lime text-ink-900 border border-lime-d',
}

interface CardOwnProps {
  /** Visual surface. Falls back to `surface` for any unknown value (never throws). */
  tone?: Tone
  /**
   * Upgrades the card to a real focusable `<button>` so the whole surface is
   * a single accessible control (selectable team/option cards, etc).
   */
  interactive?: boolean
  /**
   * Selected (pressed) state. On an interactive card this drives
   * `aria-pressed`/`aria-selected` and a lime selection border. Ignored
   * visually-only for non-interactive cards (no selection ARIA is emitted).
   */
  selected?: boolean
  /**
   * Padding utility class (e.g. `p-4`, `p-8`, `px-6 py-4`). Defaults to `p-4`.
   * Pass an empty string to opt out of padding entirely.
   */
  padding?: string
}

// Discriminated by `interactive` so consumers get the right native props
// (onClick/disabled on the button; div attributes otherwise) with no casting.
export type CardProps =
  | (CardOwnProps & { interactive: true } & Omit<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        'type'
      >)
  | (CardOwnProps & { interactive?: false } & React.HTMLAttributes<HTMLDivElement>)

const BASE = 'rounded-md transition-[transform,box-shadow,border-color] duration-150'
// Interactive affordances: hover lift + elevation, focus ring from the base
// layer, disabled dimming. Motion is pure CSS (reduced-motion handled globally).
const INTERACTIVE =
  'block w-full text-left cursor-pointer hover:-translate-y-0.5 hover:shadow-e1 ' +
  'active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none'
// Selection cue: a 2px lime border. Not colour-only — interactive cards also
// expose aria-pressed/aria-selected for assistive tech.
const SELECTED = 'border-2 border-lime shadow-none'

export function Card({
  tone = 'surface',
  interactive = false,
  selected = false,
  padding = 'p-4',
  className,
  children,
  ...rest
}: CardProps) {
  const toneClasses = TONES[tone] ?? TONES.surface
  const cls = [
    BASE,
    selected ? SELECTED : toneClasses,
    // Keep the tone background/text even when selected (selection only swaps
    // the border), so re-append the tone but let SELECTED's border win.
    selected ? toneClasses.replace(/border[^ ]*/g, '').trim() : '',
    interactive ? INTERACTIVE : '',
    padding,
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ')

  if (interactive) {
    const buttonProps = rest as React.ButtonHTMLAttributes<HTMLButtonElement>
    return (
      <button
        type="button"
        className={cls}
        aria-pressed={selected}
        aria-selected={selected}
        {...buttonProps}
      >
        {children}
      </button>
    )
  }

  const divProps = rest as React.HTMLAttributes<HTMLDivElement>
  return (
    <div className={cls} {...divProps}>
      {children}
    </div>
  )
}
