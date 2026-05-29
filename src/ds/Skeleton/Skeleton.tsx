import React from 'react'
import './Skeleton.css'

type Variant = 'text' | 'rect' | 'circle'

export interface SkeletonProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * Shape of the placeholder. `text` is a short rounded bar, `rect` a sharp
   * block, `circle` a fully-round avatar stand-in. Unknown values fall back to
   * `text` (no throw — §7 #1).
   */
  variant?: Variant
  /** CSS width — a number is treated as px, a string is used verbatim (e.g. "60%"). */
  width?: number | string
  /** CSS height — a number is treated as px, a string is used verbatim. */
  height?: number | string
}

// Variant → corner-radius utility. The shimmer/colour comes from `ds-skeleton`.
const VARIANTS: Record<Variant, string> = {
  text: 'rounded-xs',
  rect: 'rounded-none',
  circle: 'rounded-full',
}

const dim = (v: number | string | undefined): string | undefined =>
  v === undefined ? undefined : typeof v === 'number' ? `${v}px` : v

/**
 * Decorative loading placeholder. It is `aria-hidden` (no role) so assistive
 * tech ignores it — the live region announcing "loading" belongs to the
 * surrounding loading container, not to each shimmer block.
 *
 * a11y contract: `aria-hidden="true"`, no role; motion via CSS only and frozen
 * by the global reduced-motion rule.
 */
export function Skeleton({
  variant = 'text',
  width,
  height,
  className,
  style,
  ...rest
}: SkeletonProps) {
  const v = VARIANTS[variant] ?? VARIANTS.text
  // `circle` defaults height to its width so a lone `width` yields a disc.
  const resolvedHeight =
    height ?? (variant === 'circle' ? width : undefined)

  return (
    <div
      aria-hidden="true"
      className={`ds-skeleton block ${v}${className ? ` ${className}` : ''}`}
      style={{ width: dim(width), height: dim(resolvedHeight), ...style }}
      {...rest}
    />
  )
}
