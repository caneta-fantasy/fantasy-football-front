import React from 'react'

type Tone = 'lime' | 'yellow' | 'red'

export interface ProgressBarProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Current progress, in the same unit as `max`. Reported verbatim to AT. */
  value: number
  /** Upper bound of the scale. Defaults to 100. */
  max?: number
  /**
   * Force a fill colour. Omit to let the value drive a threshold colour
   * (lime → yellow → red). Unknown values fall back to `lime` (no throw — §7 #1).
   */
  tone?: Tone
  /** Accessible name for the bar (maps to `aria-label`). */
  label?: string
  /** Track height in px. */
  height?: number
}

// Tone → fill utility class mapped to tokens.
// §7: red bars carry the danger-fg contract elsewhere; the bar itself is a
// solid fill, so plain token backgrounds are correct here.
const TONES: Record<Tone, string> = {
  lime: 'bg-lime',
  yellow: 'bg-yellow',
  red: 'bg-red',
}

// Value-driven threshold (as a fraction of max): used when `tone` is omitted.
// Below 0.75 → lime (healthy), 0.75–0.9 → yellow (warning), above → red.
function thresholdTone(fraction: number): Tone {
  if (fraction >= 0.9) return 'red'
  if (fraction >= 0.75) return 'yellow'
  return 'lime'
}

/**
 * Linear progress indicator.
 *
 * a11y contract: `role="progressbar"` with `aria-valuenow` (the real value,
 * even if it exceeds max), `aria-valuemin=0`, `aria-valuemax=max`. The visual
 * fill width is clamped to 0–100% so an over-budget value cannot overflow the
 * track, while AT still hears the true number.
 */
export function ProgressBar({
  value,
  max = 100,
  tone,
  label,
  height = 10,
  className,
  ...rest
}: ProgressBarProps) {
  const safeMax = max > 0 ? max : 100
  const fraction = value / safeMax
  // Clamp the *drawn* fill to [0, 1]; aria-valuenow keeps the raw value.
  const clamped = Math.min(1, Math.max(0, fraction))
  const widthPct = `${clamped * 100}%`

  const resolvedTone = tone
    ? (TONES[tone] ?? TONES.lime)
    : TONES[thresholdTone(fraction)]

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      className={`relative overflow-hidden rounded-xs bg-ink-100${className ? ` ${className}` : ''}`}
      style={{ height }}
      {...rest}
    >
      <div
        data-ds-progress-fill
        className={`absolute left-0 top-0 bottom-0 ${resolvedTone} transition-[width] duration-300 ease-[var(--ease-standard)]`}
        style={{ width: widthPct }}
      />
    </div>
  )
}
