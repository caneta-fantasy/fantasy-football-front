import React from 'react'
import './Slider.css'

/**
 * Slider — a real, styled `<input type="range">`.
 *
 * a11y contract (DS §7 #5, Task 9 catalog):
 * - The control is always a native `<input type="range">`, never a styled
 *   `<div>`; it carries the implicit `slider` role and full native keyboard
 *   model (arrows, Home/End, PageUp/PageDown) for free.
 * - `aria-valuemin` / `aria-valuemax` / `aria-valuenow` are set explicitly from
 *   `min` / `max` / `value` so the announced range is correct even when the host
 *   relies on the attributes rather than inferring from the input.
 * - Labelling is the caller's responsibility via `id` + `<label htmlFor>` (e.g.
 *   through `FieldGroup`) or an `aria-label` / `aria-labelledby`; the component
 *   forwards all of these untouched.
 * - The focus ring comes from the base layer's `:focus-visible`.
 *
 * The track fill is value-driven: the component computes the value's position
 * as a percentage and exposes it as the `--ds-slider-fill` custom property the
 * CSS gradient track reads, so the lime fill always matches the real value.
 *
 * Defaults to the conventional 0–100 range when `min`/`max` are omitted.
 */
export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Lower bound. Defaults to 0. */
  min?: number
  /** Upper bound. Defaults to 100. */
  max?: number
}

function clampPct(value: number, min: number, max: number): number {
  if (!Number.isFinite(value) || max <= min) return 0
  const pct = ((value - min) / (max - min)) * 100
  // Guard against out-of-range values driving the fill past the rail.
  return Math.min(100, Math.max(0, pct))
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  function Slider(
    { min = 0, max = 100, value, defaultValue, className, style, ...rest },
    ref,
  ) {
    // Resolve the value used for the fill + aria-valuenow. Controlled `value`
    // wins; otherwise fall back to defaultValue, then the midpoint of the range.
    const raw = value ?? defaultValue ?? (min + max) / 2
    const numeric = Number(raw)
    const fill = clampPct(numeric, Number(min), Number(max))

    const cls = ['ds-slider', className].filter(Boolean).join(' ')

    return (
      <input
        ref={ref}
        type="range"
        min={min}
        max={max}
        value={value}
        defaultValue={defaultValue}
        className={cls}
        style={{ ['--ds-slider-fill' as string]: `${fill}%`, ...style }}
        aria-valuemin={Number(min)}
        aria-valuemax={Number(max)}
        aria-valuenow={Number.isFinite(numeric) ? numeric : undefined}
        {...rest}
      />
    )
  },
)
