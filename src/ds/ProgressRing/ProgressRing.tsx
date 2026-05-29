import React from 'react'

export interface ProgressRingProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Current progress, in the same unit as `max`. Reported verbatim to AT. */
  value: number
  /** Upper bound of the scale. Defaults to 100. */
  max?: number
  /** Outer diameter in px. */
  size?: number
  /** Arc stroke width in px. */
  stroke?: number
  /** Arc colour. Defaults to the caneta lime-deep token. */
  color?: string
  /** Big numeral shown in the centre (decorative — `aria-hidden`). */
  label?: React.ReactNode
  /** Small mono caption under the label (decorative — `aria-hidden`). */
  sub?: React.ReactNode
  /** Accessible name for the ring (maps to `aria-label`). */
  ariaLabel?: string
}

/**
 * Radial progress indicator — the exported successor to the screens' local
 * `Ring` (§7: it was never a real component).
 *
 * a11y contract: `role="progressbar"` with `aria-valuenow` (the real value,
 * even if over max), `aria-valuemin=0`, `aria-valuemax=max`. The centre
 * label/sub are decorative (`aria-hidden`) so AT reads the value once, from the
 * progressbar — not the visual numeral. Motion-free (static SVG).
 */
export function ProgressRing({
  value,
  max = 100,
  size = 88,
  stroke = 6,
  color = 'var(--caneta-lime-deep)',
  label,
  sub,
  ariaLabel,
  className,
  style,
  ...rest
}: ProgressRingProps) {
  const safeMax = max > 0 ? max : 100
  // Radius inset so the stroke never clips at the SVG edge.
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  // Clamp the drawn arc to [0, 1]; aria-valuenow keeps the raw value.
  const fraction = Math.min(1, Math.max(0, value / safeMax))
  const dash = circumference * fraction
  const center = size / 2

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      className={`relative inline-flex items-center justify-center${className ? ` ${className}` : ''}`}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        // Rotate so the arc starts at 12 o'clock and fills clockwise.
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--ink-100)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          data-ds-ring-arc
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="butt"
          strokeDasharray={`${dash} ${circumference}`}
        />
      </svg>
      {(label != null || sub != null) && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center"
        >
          {label != null && (
            <span
              className="font-display leading-none text-text"
              style={{ fontSize: size * 0.26 }}
            >
              {label}
            </span>
          )}
          {sub != null && (
            <span className="font-mono text-[8px] tracking-[0.5px] text-text-muted">
              {sub}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
