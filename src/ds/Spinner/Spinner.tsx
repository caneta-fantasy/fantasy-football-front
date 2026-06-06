import React from 'react'
import './Spinner.css'

export interface SpinnerProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'color'> {
  /** Diameter of the spinner in pixels. */
  size?: number
  /** Stroke color of the rotating arc. Defaults to the signature green token. */
  color?: string
  /** Stroke width of the arc in pixels. */
  stroke?: number
  /**
   * Visually-hidden text announced to assistive tech. Falls back to the
   * Portuguese "Carregando". Provide an `aria-label` to override the
   * accessible name without changing the visible (hidden) text.
   */
  label?: string
}

// Visually-hidden styling: removes the node from the visual layout while
// keeping it in the accessibility tree (so role="status" has an accessible
// name). Matches the standard sr-only recipe.
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

export function Spinner({
  size = 20,
  color = 'var(--green)',
  stroke = 2.5,
  label = 'Carregando',
  className,
  style,
  ...rest
}: SpinnerProps) {
  // Geometry: a circle inset by half the stroke so the arc never clips.
  const center = size / 2
  const radius = center - stroke / 2
  const circumference = 2 * Math.PI * radius
  // The visible arc spans ~25% of the circle; the rest is the dashed gap.
  const arc = circumference * 0.25

  return (
    <span
      role="status"
      aria-label={label}
      className={`ds-spinner inline-flex items-center justify-center ${className ?? ''}`.trim()}
      style={{ width: size, height: size, ...style }}
      {...rest}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        fill="none"
        aria-hidden="true"
        className="ds-spinner-svg"
      >
        {/* Track: a faint full ring for context. */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          opacity={0.15}
        />
        {/* Rotating arc. */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arc} ${circumference}`}
        />
      </svg>
      <span style={srOnly}>{label}</span>
    </span>
  )
}
