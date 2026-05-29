import React from 'react'
import { Icon } from '../Icon/Icon'
import { Scrim } from '../overlay/Scrim'
import { useOverlay } from '../overlay/useOverlay'
import '../overlay/overlay.css'

type Size = 'sm' | 'md' | 'lg'

export interface ModalProps {
  /** Controls mount/visibility. The modal renders nothing when false. */
  open: boolean
  /** Called on Esc, scrim click, and the close button. */
  onClose: () => void
  /**
   * Visible heading. Becomes the dialog's accessible name via
   * `aria-labelledby`. Omit `title` and pass `aria-label` via `labelledById`
   * if you render your own heading.
   */
  title?: React.ReactNode
  /** Mono sub-label under the title (e.g. "MÉDIO · 480 × auto"). */
  subtitle?: React.ReactNode
  /** Footer slot, typically action buttons. */
  footer?: React.ReactNode
  /** Width preset. Unknown values fall back to `md` (no throw — §7 #1). */
  size?: Size
  /** Dismiss on Escape. Defaults to true. */
  closeOnEsc?: boolean
  /** Dismiss on backdrop click. Defaults to true. */
  closeOnScrimClick?: boolean
  /** If you provide your own labelled element id, set it here. */
  labelledById?: string
  children?: React.ReactNode
}

const SIZES: Record<Size, string> = {
  sm: 'max-w-[360px]',
  md: 'max-w-[480px]',
  lg: 'max-w-[720px]',
}

let idCounter = 0

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  footer,
  size = 'md',
  closeOnEsc = true,
  closeOnScrimClick = true,
  labelledById,
  children,
}: ModalProps) {
  const panelRef = useOverlay<HTMLDivElement>({
    open,
    onClose,
    closeOnEsc,
  })

  // Stable id for aria-labelledby when we render the title ourselves.
  const titleId = React.useMemo(() => `ds-modal-title-${++idCounter}`, [])

  if (!open) return null

  const sizeCls = SIZES[size] ?? SIZES.md
  const labelId = labelledById ?? (title != null ? titleId : undefined)

  return (
    <Scrim
      className="z-modal flex items-start justify-center overflow-y-auto p-4 sm:items-center"
      onDismiss={closeOnScrimClick ? onClose : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelId}
        className={[
          'relative z-[1] my-12 w-full bg-surface text-text shadow-e3',
          'rounded-sm outline-none',
          'animate-[ds-modal-in_var(--dur-200,200ms)_var(--ease-emphasized)]',
          sizeCls,
        ].join(' ')}
      >
        {(title != null || subtitle != null) && (
          <header className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
            <div>
              {title != null && (
                <h2
                  id={titleId}
                  className="font-display text-[22px] uppercase leading-none tracking-[-0.3px] text-text"
                >
                  {title}
                </h2>
              )}
              {subtitle != null && (
                <p className="mt-[5px] font-mono text-[10.5px] text-text-muted">
                  {subtitle}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="-mr-2 inline-flex h-7 w-7 flex-none items-center justify-center rounded-xs text-text-muted hover:bg-surface-inset"
            >
              <Icon name="x" size={16} />
            </button>
          </header>
        )}

        {/* When there is no header, still expose a close affordance. */}
        {title == null && subtitle == null && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-xs text-text-muted hover:bg-surface-inset"
          >
            <Icon name="x" size={16} />
          </button>
        )}

        <div className="px-6 py-5">{children}</div>

        {footer != null && (
          <footer className="flex justify-end gap-2 border-t border-border px-6 py-4">
            {footer}
          </footer>
        )}
      </div>
    </Scrim>
  )
}
