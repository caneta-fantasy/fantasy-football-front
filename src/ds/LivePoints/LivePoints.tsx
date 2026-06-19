import React from 'react'
import { LiveChip, type LiveStatus } from './LiveChip'
import './LivePoints.css'

interface LivePointsBaseProps {
  /**
   * The points total. A number is formatted to one decimal place
   * (`116` → `"116.0"`); a string is rendered verbatim (e.g. `"—"` for
   * not-yet-available).
   */
  value: number | string
  /**
   * Connection state, forwarded to the embedded `LiveChip`.
   * - `live` (default): pulsing indicator + breathing number.
   * - `disconnected`: realtime link dropped; the last value stays visible.
   * - `stale`: link up but the data is old; the last value stays visible.
   * Unknown values fall back to `live` (no throw — §7 #1).
   */
  status?: LiveStatus
  /**
   * Visible caption above the number AND the accessible name of the live
   * region. Defaults to `"Pontos ao vivo"`.
   */
  label?: string
}

export type LivePointsProps = LivePointsBaseProps &
  Omit<React.HTMLAttributes<HTMLDivElement>, keyof LivePointsBaseProps | 'children'>

// Tone of the whole tile per status. Live = the signature bottle-green broadcast
// hero treatment (warm-white on-green text); disconnected/stale dim to a muted
// surface so the staleness reads without relying on color alone (the LiveChip
// text carries the actual state).
const TILE: Record<LiveStatus, string> = {
  live: 'bg-signature text-on-green',
  disconnected: 'bg-surface-inset text-text-muted',
  stale: 'bg-surface-inset text-text-muted',
}

const BASE =
  'relative flex items-center justify-between gap-4 overflow-hidden ' +
  'px-4 py-[14px] rounded-pill'

function formatValue(value: number | string): string {
  return typeof value === 'number' ? value.toFixed(1) : value
}

/**
 * Live-points hero tile: a big display number paired with a `LiveChip`
 * indicator. The whole tile is a single `role="status"` + `aria-live="polite"`
 * region (labelled by `label`) so the value is announced as it changes, and
 * the embedded chip is rendered non-announcing (`asStatus={false}`) to avoid
 * nested live regions.
 *
 * In the live state the number breathes via a CSS animation (neutralized under
 * `prefers-reduced-motion` by the DS base layer). In the disconnected/stale
 * states the animation stops, the tile dims, and the chip swaps to descriptive
 * text — so the state is never communicated by color or motion alone.
 */
export function LivePoints({
  value,
  status = 'live',
  label = 'Pontos ao vivo',
  className,
  ...rest
}: LivePointsProps) {
  const isLive = status === 'live'
  const tileCls = TILE[status] ?? TILE.live
  const cls = [BASE, tileCls, className].filter(Boolean).join(' ')

  const valueCls = [
    'font-display leading-[0.85] tracking-[-2px] text-[52px] tabular-nums',
    isLive ? 'ds-live-value--pulsing' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className={cls}
      {...rest}
    >
      <div className="relative flex flex-col gap-[6px]">
        <LiveChip status={status} asStatus={false} />
        {/* Overline-anatomy caption in Archivo (font-sans), not mono — it
            inherits the tile's foreground via currentColor. */}
        <span className="font-sans font-bold uppercase tracking-[1.6px] text-[10px]">
          {label}
        </span>
      </div>
      <div className={valueCls}>{formatValue(value)}</div>
    </div>
  )
}
