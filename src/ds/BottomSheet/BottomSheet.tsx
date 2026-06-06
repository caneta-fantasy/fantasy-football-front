import React from 'react'
import { Scrim } from '../overlay/Scrim'
import { useOverlay } from '../overlay/useOverlay'
import '../overlay/overlay.css'

export interface BottomSheetProps {
  /** Controls mount/visibility. Renders nothing when false. */
  open: boolean
  /** Called on Esc, scrim click, drag-dismiss, and handle activation. */
  onClose: () => void
  /** Visible heading; becomes the dialog accessible name via aria-labelledby. */
  title?: React.ReactNode
  /** Dismiss on Escape. Defaults to true. */
  closeOnEsc?: boolean
  /** Dismiss on backdrop click. Defaults to true. */
  closeOnScrimClick?: boolean
  /**
   * Downward drag distance (px) past which release dismisses the sheet.
   * Defaults to 80.
   */
  dragDismissThreshold?: number
  children?: React.ReactNode
}

let idCounter = 0

export function BottomSheet({
  open,
  onClose,
  title,
  closeOnEsc = true,
  closeOnScrimClick = true,
  dragDismissThreshold = 80,
  children,
}: BottomSheetProps) {
  const panelRef = useOverlay<HTMLDivElement>({ open, onClose, closeOnEsc })
  const titleId = React.useMemo(() => `ds-sheet-title-${++idCounter}`, [])

  // Drag-to-dismiss: track the live downward offset and pin to the panel via
  // transform so the gesture feels direct. Release past the threshold closes.
  // `dragYRef` holds the authoritative live value (state is async and would be
  // stale inside the pointer-up handler).
  const [dragY, setDragY] = React.useState(0)
  const dragYRef = React.useRef(0)
  const dragStartY = React.useRef<number | null>(null)
  // Set when a pointer gesture moved at all, so we can swallow the synthetic
  // click the browser fires after a drag (otherwise a sub-threshold drag would
  // still close via the handle's onClick).
  const draggedRef = React.useRef(false)

  if (!open) return null

  const labelId = title != null ? titleId : undefined

  const onPointerDown = (e: React.PointerEvent) => {
    dragStartY.current = e.clientY
    draggedRef.current = false
    // Capture so moves keep arriving even if the pointer leaves the handle.
    e.currentTarget.setPointerCapture?.(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragStartY.current == null) return
    // Only allow dragging the sheet downward.
    const delta = Math.max(0, e.clientY - dragStartY.current)
    if (delta > 4) draggedRef.current = true
    dragYRef.current = delta
    setDragY(delta)
  }
  const endDrag = () => {
    if (dragStartY.current == null) return
    const shouldDismiss = dragYRef.current > dragDismissThreshold
    dragStartY.current = null
    dragYRef.current = 0
    setDragY(0)
    if (shouldDismiss) onClose()
  }
  const onHandleClick = () => {
    // A click that followed a drag gesture is swallowed; a genuine tap/keyboard
    // activation (no movement) dismisses.
    if (draggedRef.current) {
      draggedRef.current = false
      return
    }
    onClose()
  }

  return (
    <Scrim
      className="z-modal flex items-end justify-center"
      onDismiss={closeOnScrimClick ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        style={{
          transform: dragY ? `translateY(${dragY}px)` : undefined,
          // Disable the entry animation/transition while actively dragging so
          // the panel tracks the finger; snap-back is handled by the class.
          transition: dragY ? 'none' : undefined,
        }}
        className={[
          'relative z-[1] flex max-h-[85vh] w-full max-w-[640px] flex-col',
          'rounded-t-[18px] border border-line bg-surface text-text shadow-e3 outline-none',
          'pt-3',
          dragY
            ? ''
            : 'animate-[ds-sheet-in_var(--dur-300,300ms)_var(--ease-decelerate)]',
        ].join(' ')}
      >
        {/* Drag handle is a real button: pointer-drag to dismiss, and an
            equivalent click/keyboard activation for non-pointer users. */}
        <button
          type="button"
          aria-label="Fechar"
          onClick={onHandleClick}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className="mx-auto mb-3 flex h-6 w-16 flex-none touch-none cursor-grab items-center justify-center rounded-full active:cursor-grabbing"
        >
          <span
            aria-hidden="true"
            className="h-1 w-10 rounded-full bg-line-strong"
          />
        </button>

        {title != null && (
          <div className="border-b border-line px-[18px] pb-2">
            <h2
              id={titleId}
              // Archivo poster voice (wide + heavy) — sentence-case, not Anton.
              className="font-display text-[18px] text-text"
              style={{
                fontWeight: 800,
                fontVariationSettings: '"wght" 800, "wdth" 112',
                lineHeight: 1.05,
                letterSpacing: '-0.3px',
              }}
            >
              {title}
            </h2>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-4">{children}</div>
      </div>
    </Scrim>
  )
}
