import React from 'react'
import { Icon } from '../Icon/Icon'
import { Scrim } from '../overlay/Scrim'
import { useOverlay } from '../overlay/useOverlay'
import '../overlay/overlay.css'

type Side = 'left' | 'right'

export interface DrawerProps {
  /** Controls mount/visibility. Renders nothing when false. */
  open: boolean
  /** Called on Esc, scrim click, and the close button. */
  onClose: () => void
  /** Visible heading; becomes the dialog accessible name via aria-labelledby. */
  title?: React.ReactNode
  /** Side the sheet docks to. Unknown values fall back to `right` (§7 #1). */
  side?: Side
  /** Footer slot, typically a primary action. */
  footer?: React.ReactNode
  /** Dismiss on Escape. Defaults to true. */
  closeOnEsc?: boolean
  /** Dismiss on backdrop click. Defaults to true. */
  closeOnScrimClick?: boolean
  /** Width of the panel in px. Defaults to 320. */
  width?: number
  children?: React.ReactNode
}

// Full utility strings are written out (not interpolated) so Tailwind's JIT
// scanner can see them at build time.
const SIDES: Record<Side, string> = {
  right:
    'right-0 animate-[ds-drawer-in-right_var(--dur-300,300ms)_var(--ease-decelerate)]',
  left: 'left-0 animate-[ds-drawer-in-left_var(--dur-300,300ms)_var(--ease-decelerate)]',
}

let idCounter = 0

export function Drawer({
  open,
  onClose,
  title,
  side = 'right',
  footer,
  closeOnEsc = true,
  closeOnScrimClick = true,
  width = 320,
  children,
}: DrawerProps) {
  const panelRef = useOverlay<HTMLDivElement>({ open, onClose, closeOnEsc })
  const titleId = React.useMemo(() => `ds-drawer-title-${++idCounter}`, [])

  if (!open) return null

  const sideCls = SIDES[side] ?? SIDES.right
  const labelId = title != null ? titleId : undefined

  return (
    <Scrim
      className="z-drawer"
      onDismiss={closeOnScrimClick ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        style={{ width }}
        className={[
          'absolute bottom-0 top-0 z-[1] flex max-w-full flex-col',
          'bg-surface text-text shadow-e3 outline-none',
          sideCls,
        ].join(' ')}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-[18px] py-4">
          {title != null ? (
            <h2
              id={titleId}
              // Archivo poster voice (wide + heavy) — sentence-case, not Anton.
              className="font-display text-[20px] text-text"
              style={{
                fontWeight: 800,
                fontVariationSettings: '"wght" 800, "wdth" 112',
                lineHeight: 1,
                letterSpacing: '-0.4px',
              }}
            >
              {title}
            </h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="-mr-1 inline-flex h-7 w-7 flex-none items-center justify-center rounded-pill text-text-muted hover:bg-surface-inset"
          >
            <Icon name="x" size={16} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">{children}</div>

        {footer != null && (
          <footer className="border-t border-line px-4 py-4">{footer}</footer>
        )}
      </div>
    </Scrim>
  )
}
