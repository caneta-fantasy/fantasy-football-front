import React from 'react'
import './tooltip.css'

type Placement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /**
   * The tooltip text. Becomes the trigger's accessible description via
   * `aria-describedby` while visible (it is never the trigger's *name*).
   */
  label: React.ReactNode
  /**
   * The interactive element the tooltip describes. Must be a single focusable
   * element (e.g. a `<button>`); the tooltip clones it to attach handlers and
   * `aria-describedby`.
   */
  children: React.ReactElement
  /** Side of the trigger to render on. Unknown values fall back to `top`. */
  placement?: Placement
  /** Delay (ms) before showing on hover. Defaults to 0 (instant). */
  openDelay?: number
}

// Placement → arrow + panel positioning. Default fallback covers unknown keys.
const PLACEMENTS: Record<
  Placement,
  { panel: string; arrow: string }
> = {
  top: {
    panel: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    arrow:
      'bottom-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-b border-r',
  },
  bottom: {
    panel: 'top-full left-1/2 -translate-x-1/2 mt-2',
    arrow: 'top-[-4px] left-1/2 -translate-x-1/2 rotate-45 border-t border-l',
  },
  left: {
    panel: 'right-full top-1/2 -translate-y-1/2 mr-2',
    arrow: 'right-[-4px] top-1/2 -translate-y-1/2 rotate-45 border-t border-r',
  },
  right: {
    panel: 'left-full top-1/2 -translate-y-1/2 ml-2',
    arrow: 'left-[-4px] top-1/2 -translate-y-1/2 rotate-45 border-b border-l',
  },
}

let idCounter = 0

export function Tooltip({
  label,
  children,
  placement = 'top',
  openDelay = 0,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false)
  const tipId = React.useMemo(() => `ds-tooltip-${++idCounter}`, [])
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const place = PLACEMENTS[placement] ?? PLACEMENTS.top

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }
  }

  const show = () => {
    clearTimer()
    if (openDelay > 0) {
      timer.current = setTimeout(() => setOpen(true), openDelay)
    } else {
      setOpen(true)
    }
  }
  const hide = () => {
    clearTimer()
    setOpen(false)
  }

  React.useEffect(() => clearTimer, [])

  // Esc dismisses while visible (a11y contract).
  React.useEffect(() => {
    if (!open) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') hide()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const child = React.Children.only(children) as React.ReactElement<
    Record<string, unknown>
  >
  const childProps = child.props

  // Compose our handlers with any the trigger already had.
  const compose =
    <E,>(theirs: ((e: E) => void) | undefined, ours: (e: E) => void) =>
    (e: E) => {
      theirs?.(e)
      ours(e)
    }

  const trigger = React.cloneElement(child, {
    // While open, the trigger is described by the tooltip text.
    'aria-describedby': open
      ? [childProps['aria-describedby'], tipId].filter(Boolean).join(' ')
      : (childProps['aria-describedby'] as string | undefined),
    onMouseEnter: compose(
      childProps.onMouseEnter as ((e: unknown) => void) | undefined,
      show,
    ),
    onMouseLeave: compose(
      childProps.onMouseLeave as ((e: unknown) => void) | undefined,
      hide,
    ),
    onFocus: compose(
      childProps.onFocus as ((e: unknown) => void) | undefined,
      show,
    ),
    onBlur: compose(
      childProps.onBlur as ((e: unknown) => void) | undefined,
      hide,
    ),
  })

  return (
    <span className="relative inline-flex">
      {trigger}
      {open && (
        <span
          role="tooltip"
          id={tipId}
          className={[
            'pointer-events-none absolute z-popover whitespace-nowrap',
            'rounded-pill bg-ink px-[11px] py-[7px]',
            'font-sans text-[11px] font-medium text-on-green shadow-e3',
            'animate-[ds-tooltip-in_var(--dur-150,150ms)_var(--ease-standard)]',
            place.panel,
          ].join(' ')}
        >
          {label}
          <span
            aria-hidden="true"
            className={[
              'absolute h-[8px] w-[8px] bg-ink border-ink',
              place.arrow,
            ].join(' ')}
          />
        </span>
      )}
    </span>
  )
}
