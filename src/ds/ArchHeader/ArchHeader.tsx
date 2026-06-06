import React from 'react'
import { ArchPanel, type ArchPanelProps } from '../ArchPanel/ArchPanel'
import { Overline } from '../Overline/Overline'
import { Azulejo } from '../Azulejo/Azulejo'
import { PitchLines } from '../PitchLines/PitchLines'

/**
 * Token-paired tones, re-exported from `ArchPanel`. Each `bg` is matched to an
 * on-color (`color`) that clears WCAG-AA on it, so the eyebrow + title + body
 * always read on the chosen surface:
 * - `green`  → `--on-green`  (warm-white on bottle green) — the default
 * - `gold`   → `--on-gold`   (near-black on heritage gold)
 * - `cobalt` → `--on-cobalt` (warm-white on azulejo cobalt)
 * - `paper`  → `--color-text` (ink on white)
 */
export type ArchHeaderTone = 'green' | 'gold' | 'cobalt' | 'paper'

/**
 * Background pattern layer painted behind the header content:
 * - `azulejo` (default decorative texture when set) — the faint Bulcão
 *   quarter-arc tile lattice (`Azulejo`), capped at the decorative opacity max.
 * - `pitch` — the soccer-pitch markings watermark (`PitchLines`), also capped.
 * - `none` (default) — no pattern layer at all.
 * Both pattern layers are purely decorative: `aria-hidden` + `pointer-events:
 * none`, clipped to the swept silhouette by the panel's `overflow: hidden`.
 */
export type ArchHeaderPattern = 'azulejo' | 'pitch' | 'none'

/**
 * Per-tone defaults for the eyebrow + title + pattern so the composed header
 * lands the modernista anatomy without the caller wiring every color. The
 * eyebrow leans on the contrasting accent; the title takes the panel's
 * on-color; the pattern stroke is the most legible accent on that ground.
 */
const TONE_PRESET: Record<
  ArchHeaderTone,
  { eyebrow: string; accent: string; title: string; pattern: string }
> = {
  // On bottle green: gold eyebrow + gold rule, warm-white title, cobalt-free
  // pale-chalk-style azulejo in the on-green warm-white for a faint texture.
  green: {
    eyebrow: 'var(--gold-light)',
    accent: 'var(--gold)',
    title: 'var(--color-on-signature)',
    pattern: 'var(--on-green)',
  },
  // On gold: near-black eyebrow + deep-green rule, near-black title, green
  // pattern strokes (cobalt would vibrate on gold).
  gold: {
    eyebrow: 'var(--on-gold)',
    accent: 'var(--green)',
    title: 'var(--color-on-accent)',
    pattern: 'var(--green)',
  },
  // On cobalt: warm-white eyebrow + gold rule, warm-white title, on-cobalt
  // pattern strokes.
  cobalt: {
    eyebrow: 'var(--on-cobalt)',
    accent: 'var(--gold-light)',
    title: 'var(--color-on-interactive)',
    pattern: 'var(--on-cobalt)',
  },
  // On white: muted-ink eyebrow + green rule, ink title, cobalt pattern (the
  // azulejo's home hue) reads on white at the capped opacity.
  paper: {
    eyebrow: 'var(--ink-muted)',
    accent: 'var(--green)',
    title: 'var(--color-text)',
    pattern: 'var(--cobalt)',
  },
}

export interface ArchHeaderProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'color' | 'title'> {
  /**
   * The display title — the **real heading** of the section. Rendered as a
   * genuine heading element (`as`/`level`) so it joins the document outline.
   * Required.
   */
  title: React.ReactNode
  /**
   * Optional small all-caps eyebrow label rendered as a sibling **above** the
   * title (an `Overline`, not part of the heading text — so the document
   * outline carries only the title). Stays in the a11y tree.
   */
  eyebrow?: React.ReactNode
  /**
   * Decorative accent color for the eyebrow's rule swatch (and the eyebrow text
   * leans on a tone default). When omitted the tone's preset accent is used.
   * The swatch itself is `aria-hidden` (it lives inside `Overline`).
   */
  accent?: string
  /**
   * Semantic tone — picks a contrast-checked bg/fg pair for the whole header
   * (`green | gold | cobalt | paper`). Defaults to `green` (the signature
   * broadcast surface). Passed through to the underlying `ArchPanel`.
   */
  tone?: ArchHeaderTone
  /**
   * Background color override, as a token-backed CSS value. Defaults to the
   * resolved tone background. Forwarded to `ArchPanel`.
   */
  bg?: string
  /**
   * Foreground (title/body) color override. Defaults to the resolved tone
   * on-color so contrast holds. Forwarded to `ArchPanel`; also used as the
   * title color unless the title node sets its own.
   */
  color?: string
  /**
   * Optional trailing slot — a `Crest`/`Avatar`/actions cluster rendered at the
   * end of the header row, opposite the title. Real content; stays in the a11y
   * tree. Lay out interactive actions here (e.g. a `Btn`).
   */
  right?: React.ReactNode
  /**
   * Sweep radius of the top corners in px (DS default 120). Forwarded to
   * `ArchPanel`; non-positive/invalid falls back there. Pass `0` for a hard edge.
   */
  arch?: number
  /**
   * Decorative background pattern layer: `azulejo` (Bulcão tile lattice),
   * `pitch` (pitch-marking watermark), or `none` (default). The layer is
   * `aria-hidden` + non-interactive and clipped to the arch.
   */
  pattern?: ArchHeaderPattern
  /**
   * Heading level (1–6) for the title. Drives the rendered element
   * (`h1`…`h6`) and thus the document outline. Default `2`. Ignored when `as`
   * is set explicitly.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Explicit element for the title heading (e.g. `'h1'`). Overrides `level`.
   * Use to align the title with the surrounding outline.
   */
  as?: React.ElementType
}

/** Resolve the heading element: explicit `as` wins, else `h{level}`. */
function headingTag(as: React.ElementType | undefined, level: number): React.ElementType {
  if (as) return as
  const l = Number.isInteger(level) && level >= 1 && level <= 6 ? level : 2
  return `h${l}` as React.ElementType
}

/**
 * `ArchHeader` — the composed modernista screen header. It stacks an
 * `ArchPanel` (the swept Niemeyer surface) carrying an optional `Overline`
 * eyebrow, a **real display heading**, and an optional trailing slot
 * (`Crest`/`Avatar`/actions), over an optional `aria-hidden` background pattern
 * (`azulejo`/`pitch`). This is the header used at the top of the Tabela /
 * Times / Jogadores screens.
 *
 * a11y contract:
 * - The **title renders as a genuine heading** (`as` or `h{level}`, default
 *   `h2`) so it participates in the document outline. The eyebrow is a **sibling
 *   label** (`Overline`), never folded into the heading text — the outline
 *   carries only the title.
 * - Tone ships a contrast-checked bg/fg pair via `ArchPanel`; the title takes
 *   the on-color so it clears AA on the surface. `bg`/`color` override per side.
 * - The background `pattern` layer (`azulejo`/`pitch`) is **purely decorative**:
 *   `aria-hidden="true"` + `pointer-events: none`, capped at the decorative
 *   opacity max, and clipped to the arch by the panel's `overflow: hidden`. It
 *   is never announced and never trappable.
 * - The `eyebrow`, `title`, and `right` content stay in the a11y tree.
 */
export function ArchHeader({
  title,
  eyebrow,
  accent,
  tone = 'green',
  bg,
  color,
  right,
  arch,
  pattern = 'none',
  level = 2,
  as,
  className,
  style,
  ...rest
}: ArchHeaderProps) {
  // Unknown tone falls back to green (no throw — §7 #1), mirroring ArchPanel.
  const preset = TONE_PRESET[tone] ?? TONE_PRESET.green

  const Heading = headingTag(as, level)
  const titleColor = color ?? preset.title
  const eyebrowAccent = accent ?? preset.accent

  // ArchPanel owns the swept surface + contrast-checked tone pair. We forward
  // tone/bg/color/arch and only pass arch when defined so ArchPanel keeps its
  // own DS default (120) otherwise.
  const panelProps: ArchPanelProps = {
    tone,
    bg,
    color,
    ...(arch !== undefined ? { arch } : {}),
  }

  return (
    <ArchPanel {...panelProps} className={className} style={style} {...rest}>
      {/* Decorative background pattern — aria-hidden, non-interactive, clipped
          to the arch by ArchPanel's overflow:hidden. */}
      {pattern === 'azulejo' && (
        <Azulejo color={preset.pattern} opacity={0.1} />
      )}
      {pattern === 'pitch' && (
        <PitchLines color={preset.pattern} opacity={0.1} />
      )}

      {/* Content sits above the pattern layer. `relative` lifts it over the
          absolutely-positioned decorative layer; the row holds the heading
          stack and the optional trailing slot. */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <div style={{ minWidth: 0 }}>
          {eyebrow != null && eyebrow !== '' && (
            <Overline color={preset.eyebrow} accent={eyebrowAccent}>
              {eyebrow}
            </Overline>
          )}
          <Heading
            className="font-display"
            style={{
              margin: eyebrow != null && eyebrow !== '' ? '10px 0 0' : 0,
              color: titleColor,
              fontVariationSettings: '"wght" 850, "wdth" 118',
              fontSize: 34,
              lineHeight: 0.92,
              letterSpacing: '-0.5px',
            }}
          >
            {title}
          </Heading>
        </div>

        {right != null && right !== false && (
          <div
            style={{
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {right}
          </div>
        )}
      </div>
    </ArchPanel>
  )
}
