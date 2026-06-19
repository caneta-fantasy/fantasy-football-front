import React from 'react'

/**
 * Overline (alias `SectionLabel`) — the small all-caps tracked Archivo label
 * that headlines a section or captions a block. This is the canonical
 * replacement for the old stripped mono captions: Spline Sans Mono is reserved
 * for genuine tabular numerics, never for uppercase labels.
 *
 * Anatomy (DS `tokens-modernist.jsx` `Overline`/`SectionLabel`): Archivo,
 * 11px, weight 700, 2.2px tracking, uppercase, `inline-flex` with a 9px gap so
 * an optional decorative rule swatch sits beside the text.
 *
 * a11y contract:
 * - The text **stays in the accessibility tree** — it is real label content,
 *   not a decorative flourish. It renders as a generic element (default `div`;
 *   override with `as` to make it a real heading or `<span>` inline).
 * - The default color is `--ink-muted` (#566059), which clears 4.5:1 on white
 *   at this 11px size; `--ink-subtle` would fail, so it is not the default.
 * - The optional `accent` rule is purely **decorative**: it is `aria-hidden`
 *   with `pointer-events: none` so it is never announced and never trappable.
 */
export interface OverlineProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  /** The label text — real content that stays in the a11y tree. */
  children: React.ReactNode
  /**
   * Text color, as a token-backed CSS value. Defaults to `var(--ink-muted)`,
   * the muted functional ink that clears 4.5:1 on white at 11px. Pass another
   * token (e.g. `var(--on-green)` on a dark band, `var(--gold-deep)`) to recolor.
   */
  color?: string
  /**
   * Optional decorative 16×3 rule swatch rendered before the text. Pass a
   * token-backed CSS color (e.g. `var(--gold)`); the swatch is `aria-hidden`
   * and non-interactive.
   */
  accent?: string
  /**
   * The element to render as. Defaults to `div`. Use a heading (`h2`, `h3`, …)
   * when the overline is the accessible heading of a section, or `span` when it
   * must sit inline.
   */
  as?: React.ElementType
}

// Archivo, 11px / weight 700 / 2.2px tracking, uppercase, inline-flex with a
// 9px gap. Tracking + size land as arbitrary values (no token utility exists
// for this exact pairing) on top of `font-sans`.
const BASE =
  'inline-flex items-center gap-[9px] font-sans font-bold text-[11px] leading-none uppercase tracking-[2.2px]'

export function Overline({
  children,
  color = 'var(--ink-muted)',
  accent,
  as: Tag = 'div',
  className,
  style,
  ...rest
}: OverlineProps) {
  return (
    <Tag
      className={`${BASE} ${className ?? ''}`.trim()}
      style={{ color, ...style }}
      {...rest}
    >
      {accent && (
        <span
          aria-hidden="true"
          className="inline-block w-[16px] h-[3px] shrink-0"
          style={{ background: accent, pointerEvents: 'none' }}
        />
      )}
      {children}
    </Tag>
  )
}

/** `SectionLabel` is the semantic alias used where the overline names a section. */
export const SectionLabel = Overline
