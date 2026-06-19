import React from 'react'
import './popover.css'

type Placement = 'top' | 'bottom' | 'left' | 'right'

export interface PopoverProps {
  /**
   * The element that toggles the popover. Cloned to attach the click handler
   * and `aria-haspopup` / `aria-expanded`. Must be a single focusable element.
   */
  trigger: React.ReactElement
  /** Popover body. */
  children: React.ReactNode
  /**
   * Accessible name for the panel (the panel is `role="dialog"`). When omitted
   * the panel still works but has no name — prefer providing one or a heading.
   */
  label?: string
  /** Side of the trigger to render on. Unknown values fall back to `bottom`. */
  placement?: Placement
  /** Controlled open state. When omitted the popover manages its own state. */
  open?: boolean
  /** Called whenever the open state should change (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void
}

// Panel positioning relative to the trigger. Default fallback covers unknowns.
const PLACEMENTS: Record<Placement, string> = {
  top: 'bottom-full left-0 mb-2',
  bottom: 'top-full left-0 mt-2',
  left: 'right-full top-0 mr-2',
  right: 'left-full top-0 ml-2',
}

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

let idCounter = 0

export function Popover({
  trigger,
  children,
  label,
  placement = 'bottom',
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const panelRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const labelId = React.useMemo(() => `ds-popover-${++idCounter}`, [])

  const place = PLACEMENTS[placement] ?? PLACEMENTS.bottom

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setUncontrolledOpen(next)
      onOpenChange?.(next)
    },
    [isControlled, onOpenChange],
  )

  // Move focus into the panel on open; return it to the trigger on close.
  React.useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    const opener = triggerRef.current
    if (panel) {
      const focusables = panel.querySelectorAll<HTMLElement>(FOCUSABLE)
      if (focusables.length > 0) {
        focusables[0].focus()
      } else {
        if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1')
        panel.focus()
      }
    }
    return () => {
      // Return focus to the trigger only if focus is still within the popover.
      const active = document.activeElement
      if (
        opener &&
        (panelRef.current?.contains(active) || active === document.body)
      ) {
        opener.focus()
      }
    }
  }, [open])

  // Esc to close + outside-click (pointerdown) to close.
  React.useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        setOpen(false)
      }
    }
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (panelRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('pointerdown', onPointerDown, true)
    }
  }, [open, setOpen])

  const child = trigger as React.ReactElement<Record<string, unknown>>
  const childProps = child.props

  const clonedTrigger = React.cloneElement(child, {
    ref: (node: HTMLElement | null) => {
      triggerRef.current = node
      const r = (child as { ref?: unknown }).ref
      if (typeof r === 'function') r(node)
      else if (r && typeof r === 'object')
        (r as { current: unknown }).current = node
    },
    'aria-haspopup': 'dialog',
    'aria-expanded': open,
    onClick: (e: React.MouseEvent) => {
      ;(childProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e)
      setOpen(!open)
    },
  })

  return (
    <span className="relative inline-flex">
      {clonedTrigger}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label={label}
          aria-labelledby={label ? undefined : labelId}
          className={[
            'absolute z-popover min-w-[200px] outline-none',
            'rounded-btn-lg border border-line bg-surface p-[14px] text-text shadow-e3',
            'animate-[ds-popover-in_var(--dur-150,150ms)_var(--ease-standard)]',
            place,
          ].join(' ')}
        >
          {children}
        </div>
      )}
    </span>
  )
}
