import React from 'react'

export interface ScrimProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Fired when the dim backdrop (not the panel) is clicked. */
  onDismiss?: () => void
  /** Extra classes for the positioning container that holds the panel. */
  className?: string
}

/**
 * Shared backdrop + positioning layer for overlays.
 *
 * Structure matters for a11y: the dim layer is a separate `aria-hidden`
 * sibling, NOT an ancestor of the panel. If the dimmer wrapped the dialog,
 * its `aria-hidden` would hide the dialog from assistive tech too. So the
 * container is a plain positioning box, the dimmer is its first child, and
 * the overlay panel (`children`) is rendered alongside the dimmer.
 *
 * Dismissal via the backdrop is a pointer affordance only; keyboard users use
 * Esc (handled by `useOverlay`). A click is treated as a backdrop dismiss
 * when it lands on the dimmer or on the container padding around the panel
 * (i.e. not on the panel itself).
 */
export function Scrim({
  onDismiss,
  className,
  children,
  onClick,
  ...rest
}: ScrimProps) {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e)
    // Only dismiss when the click target is the container itself (the padded
    // area) — never when it bubbled up from inside the panel.
    if (e.target === e.currentTarget) onDismiss?.()
  }

  return (
    <div
      onClick={handleClick}
      className={['fixed inset-0', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {/* Dim layer: aria-hidden sibling, click dismisses. */}
      <div
        aria-hidden="true"
        onClick={onDismiss}
        className="absolute inset-0 bg-[rgba(11,15,12,0.55)] animate-[ds-scrim-in_var(--dur-150,150ms)_var(--ease-standard)]"
      />
      {children}
    </div>
  )
}
