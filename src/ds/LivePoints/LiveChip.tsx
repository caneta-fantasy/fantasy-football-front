import React from 'react'
import './LivePoints.css'

export type LiveStatus = 'live' | 'disconnected' | 'stale'

interface LiveChipBaseProps {
  /**
   * Connection state.
   * - `live` (default): pulsing dot + "AO VIVO".
   * - `disconnected`: no pulse, "SEM CONEXÃO" cue (the realtime link dropped).
   * - `stale`: no pulse, "DESATUALIZADO" cue (link up but data is old).
   * Unknown values fall back to `live` (no throw — §7 #1).
   */
  status?: LiveStatus
  /**
   * Override the live-state label (e.g. `"AO VIVO · 67'"` to surface the match
   * minute). Ignored for the disconnected/stale states, which use their own
   * descriptive text so the state is never communicated by color alone.
   */
  label?: string
  /**
   * Whether the chip is its own `role="status"` live region (default `true`).
   * Set `false` when embedding inside another live region (e.g. `LivePoints`)
   * so a single region announces the change rather than two nested ones.
   */
  asStatus?: boolean
}

export type LiveChipProps = LiveChipBaseProps &
  Omit<React.HTMLAttributes<HTMLSpanElement>, keyof LiveChipBaseProps>

// status → { tailwind classes, default label }.
// §7 #3 fix: the red live tone uses the ink900 danger foreground, never
// white-on-red. Disconnected/stale use a muted, non-alarming treatment AND a
// distinct text label, so the state is conveyed by text, not color alone (§7).
const STATUS: Record<LiveStatus, { cls: string; label: string }> = {
  live: {
    cls: 'bg-red text-[color:var(--color-danger-fg)]',
    label: 'AO VIVO',
  },
  disconnected: {
    cls: 'bg-surface-inset text-text-muted border border-[color:var(--color-border-strong)]',
    label: 'SEM CONEXÃO',
  },
  stale: {
    cls: 'bg-surface-inset text-text-muted border border-[color:var(--color-border-strong)]',
    label: 'DESATUALIZADO',
  },
}

const BASE =
  'inline-flex items-center gap-[5px] font-sans font-bold uppercase ' +
  'tracking-[1px] text-[10px] leading-none px-[7px] py-[3px] rounded-xs ' +
  'align-middle whitespace-nowrap select-none'

/**
 * Compact "AO VIVO" status chip with a CSS-pulsing dot (reduced-motion safe —
 * the pulse is neutralized globally by the DS base layer). Exposed as a
 * `role="status"` + `aria-live="polite"` region so state changes (live →
 * disconnected/stale) are announced. The disconnected and stale states drop
 * the pulse and swap to descriptive text, so the state never depends on color.
 */
export function LiveChip({
  status = 'live',
  label,
  asStatus = true,
  className,
  ...rest
}: LiveChipProps) {
  const s = STATUS[status] ?? STATUS.live
  const isLive = (STATUS[status] ?? STATUS.live) === STATUS.live
  // Custom labels only apply to the live state (the minute clock). The
  // disconnected/stale states keep their own non-color text cue.
  const text = isLive && label ? label : s.label

  const cls = [BASE, s.cls, className].filter(Boolean).join(' ')

  // When embedded in another live region, drop the role/aria-live so a single
  // region announces the change rather than two nested ones.
  const liveRegionProps = asStatus
    ? ({ role: 'status', 'aria-live': 'polite' } as const)
    : {}

  return (
    <span className={cls} {...liveRegionProps} {...rest}>
      {isLive && <span className="ds-live-dot" aria-hidden="true" />}
      {text}
    </span>
  )
}
