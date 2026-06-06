import React from 'react'

/**
 * Default arch radius in px — the sweep of the top corners (DS
 * `tokens-modernist.jsx` `ArchPanel`: `120px 120px 0 0`). A non-positive/invalid
 * value falls back to this (no throw).
 */
const DEFAULT_ARCH = 120

/** Default padding (DS `ArchPanel`). */
const DEFAULT_PAD = '32px 34px'

/**
 * Token-paired tones. Each `bg` is matched to an `color` (fg) that clears the
 * WCAG-AA contrast bar on it, so a caller cannot accidentally pick an
 * unreadable pairing by setting only the background:
 * - `green`  → `--on-green`  (warm-white on bottle green)
 * - `gold`   → `--on-gold`   (near-black on heritage gold)
 * - `cobalt` → `--on-cobalt` (warm-white on azulejo cobalt)
 * - `paper`  → `--color-text` (ink on white)
 * The `bg`/`color` props still override either side for bespoke compositions.
 */
type ToneToken = 'green' | 'gold' | 'cobalt' | 'paper'

const TONES: Record<ToneToken, { bg: string; color: string }> = {
  green: { bg: 'var(--color-signature)', color: 'var(--color-on-signature)' },
  gold: { bg: 'var(--color-accent)', color: 'var(--color-on-accent)' },
  cobalt: { bg: 'var(--color-interactive)', color: 'var(--color-on-interactive)' },
  paper: { bg: 'var(--color-surface)', color: 'var(--color-text)' },
}

export interface ArchPanelProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'> {
  /** The panel content — real content that stays in the accessibility tree. */
  children?: React.ReactNode
  /**
   * Semantic tone (`green | gold | cobalt | paper`) — picks a contrast-checked
   * bg/fg pair. Defaults to `green` (the signature broadcast surface). An
   * explicit `bg`/`color` overrides the tone's value on that side.
   */
  tone?: ToneToken
  /**
   * Background color, as a token-backed CSS value. Defaults to the resolved
   * `tone` background. Pass another token to override only the surface.
   */
  bg?: string
  /**
   * Foreground (text) color, as a token-backed CSS value. Defaults to the
   * resolved `tone` foreground — kept paired with `bg` so contrast holds.
   */
  color?: string
  /**
   * Sweep radius of the top corners in px (DS default 120). Non-positive/invalid
   * falls back to 120 (no throw). Pass `0` for a hard-edged panel.
   */
  arch?: number
  /** Padding shorthand (DS default `32px 34px`). */
  pad?: React.CSSProperties['padding']
}

/**
 * `ArchPanel` — a **content container** whose top is swept into a Niemeyer
 * curve (`borderRadius: <arch>px <arch>px 0 0`, `overflow: hidden`), the
 * signature modernista header surface (DS `tokens-modernist.jsx` `ArchPanel`).
 * Unlike `ArchShape` (a pure decorative graphic), this carries real content —
 * eyebrows, headings, scores — so it stays fully in the accessibility tree.
 *
 * `overflow: hidden` clips inner decorative layers (`Azulejo`, `PitchLines`,
 * `ArchShape`) to the swept silhouette; those layers must be `aria-hidden` +
 * `pointer-events: none` by their own contract, so the panel never traps focus
 * or announces decoration.
 *
 * a11y contract:
 * - The panel is a generic container (`div`); its `children` are real content
 *   and are **not** hidden. Give it a `role`/heading via `children` as needed.
 * - `bg`/`color` ship as a **contrast-checked pair** via `tone`, so the on-color
 *   text always clears AA on the chosen surface (warm-white on green/cobalt,
 *   near-black on gold, ink on white). Overriding only `bg` keeps the tone's
 *   fg — override both for a bespoke pairing and re-check contrast yourself.
 * - Decorative children remain the caller's responsibility but inherit the
 *   clip; pass them already `aria-hidden`.
 */
export function ArchPanel({
  children,
  tone = 'green',
  bg,
  color,
  arch = DEFAULT_ARCH,
  pad = DEFAULT_PAD,
  className,
  style,
  ...rest
}: ArchPanelProps) {
  // Resolve a non-negative arch radius; an invalid/negative value falls back to
  // the DS default so a bad prop never yields a broken border-radius (§7).
  const r =
    Number.isFinite(arch) && (arch as number) >= 0 ? (arch as number) : DEFAULT_ARCH

  // Tone provides the contrast-checked baseline; an explicit bg/color overrides
  // its side. `?? green` guards an unknown tone key (never throws).
  const t = TONES[tone] ?? TONES.green
  const background = bg ?? t.bg
  const fg = color ?? t.color

  return (
    <div
      className={className}
      style={{
        background,
        color: fg,
        borderRadius: `${r}px ${r}px 0 0`,
        padding: pad,
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}
