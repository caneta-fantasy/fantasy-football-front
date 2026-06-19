import React from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import { Btn } from '../Btn/Btn'

/**
 * EmptyState — the friendly "nothing here yet" surface: a bordered line-icon
 * illustration, an oversized decorative stencil numeral bleeding off the
 * corner, a display headline, body copy in the house voice, and an optional
 * primary CTA. Sources: DS `screens/09-navigation.jsx` (D · Estados vazios).
 *
 * a11y contract:
 * - The whole block is a labelled `region` (`role="region"`) whose accessible
 *   name is the heading (`aria-labelledby`), so AT users can jump to it and
 *   know why it's empty. It is NOT an `alert` — an empty list is expected, not
 *   an error (that's `ErrorState`).
 * - The illustration icon and the giant numeral are purely decorative and are
 *   `aria-hidden`; the meaning lives entirely in the heading + body text.
 * - The optional CTA is a real `<Btn>` (native `<button>`) and gets the base
 *   layer's `:focus-visible` ring for free.
 */
export interface EmptyStateProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Line icon shown in the bordered illustration box (decorative). */
  icon: IconName
  /** Decorative oversized stencil numeral bleeding off the top-right corner. */
  num?: string
  /** Display headline — the accessible name of the region. */
  title: string
  /** Supporting copy in the house voice. */
  body: string
  /** Optional CTA label. When omitted no button renders. */
  cta?: string
  /** Click handler for the CTA button. */
  onCtaClick?: () => void
}

const BASE =
  'relative overflow-hidden h-full bg-surface border border-border ' +
  'px-6 py-8 text-center'

export function EmptyState({
  icon,
  num,
  title,
  body,
  cta,
  onCtaClick,
  className,
  ...rest
}: EmptyStateProps) {
  // Stable id so the region's accessible name is the visible headline.
  const headingId = React.useId()

  return (
    <section
      role="region"
      aria-labelledby={headingId}
      className={`${BASE}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {/* Decorative oversized stencil numeral, bleeding off the corner. */}
      {num !== undefined && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-4 -top-7 font-display leading-[0.8] text-[150px] tracking-[-6px] text-[color:var(--color-border-subtle)] select-none"
        >
          {num}
        </span>
      )}

      <div className="relative">
        {/* Bordered line-icon illustration (decorative). */}
        <div className="mx-auto mb-[18px] flex h-16 w-16 items-center justify-center border-2 border-signature bg-signature-pale">
          <Icon name={icon} size={24} className="text-signature" />
        </div>

        <h3
          id={headingId}
          className="font-display uppercase tracking-[-0.4px] leading-[0.95] text-[26px] text-text"
        >
          {title}
        </h3>

        <p className="mx-auto mt-[10px] max-w-[240px] font-sans text-[12.5px] leading-[1.5] text-text-muted">
          {body}
        </p>

        {cta && (
          <div className="mt-4">
            <Btn variant="primary" size="sm" onClick={onCtaClick}>
              {cta}
            </Btn>
          </div>
        )}
      </div>
    </section>
  )
}
