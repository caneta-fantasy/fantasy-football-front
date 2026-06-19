import React from 'react'

/**
 * Shared overlay machinery for Modal / Drawer / BottomSheet.
 *
 * One hook owns the behaviours every dismissible scrim-backed surface needs,
 * so the three components stay consistent and the a11y contract is identical:
 *   - focus trap: Tab / Shift+Tab cycle stays inside the panel
 *   - focus return: focus goes back to whatever was focused before opening
 *   - initial focus: first focusable element (or the panel itself) on open
 *   - Esc to close
 *   - body scroll-lock while open (and restored on close/unmount)
 *
 * The scrim click-to-dismiss is wired by each component on its backdrop node
 * (it is a trivial onClick), but the helpers here cover everything that needs
 * DOM/lifecycle coordination.
 */

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
  ).filter(
    (el) =>
      el.offsetWidth > 0 ||
      el.offsetHeight > 0 ||
      el === document.activeElement,
  )
}

export interface UseOverlayOptions {
  /** Whether the overlay is currently mounted/open. */
  open: boolean
  /** Invoked on Esc keydown (when `closeOnEsc`) and used by scrim handlers. */
  onClose?: () => void
  /** Close when Escape is pressed. Defaults to true. */
  closeOnEsc?: boolean
  /** Lock body scroll while open. Defaults to true. */
  lockScroll?: boolean
}

/**
 * Returns a ref to attach to the overlay PANEL (the element whose focusable
 * descendants should be trapped). Mount the panel only while `open` is true.
 */
export function useOverlay<T extends HTMLElement = HTMLElement>({
  open,
  onClose,
  closeOnEsc = true,
  lockScroll = true,
}: UseOverlayOptions): React.RefObject<T | null> {
  const panelRef = React.useRef<T | null>(null)
  // Element to restore focus to when the overlay closes.
  const returnFocusRef = React.useRef<HTMLElement | null>(null)

  // Capture the previously-focused element and move focus into the panel.
  React.useEffect(() => {
    if (!open) return
    returnFocusRef.current = document.activeElement as HTMLElement | null

    const panel = panelRef.current
    if (panel) {
      const focusables = getFocusable(panel)
      if (focusables.length > 0) {
        focusables[0].focus()
      } else {
        // Nothing focusable inside — focus the panel itself so the trap and
        // screen-reader context land somewhere sensible.
        if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1')
        panel.focus()
      }
    }

    return () => {
      // Restore focus to the opener on close/unmount.
      const toRestore = returnFocusRef.current
      if (toRestore && typeof toRestore.focus === 'function') {
        toRestore.focus()
      }
    }
  }, [open])

  // Body scroll-lock.
  React.useEffect(() => {
    if (!open || !lockScroll) return
    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'
    return () => {
      body.style.overflow = previousOverflow
    }
  }, [open, lockScroll])

  // Key handling: Esc to close + Tab focus trap.
  React.useEffect(() => {
    if (!open) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape' && closeOnEsc) {
        e.stopPropagation()
        onClose?.()
        return
      }
      if (e.key !== 'Tab') return

      const panel = panelRef.current
      if (!panel) return
      const focusables = getFocusable(panel)
      if (focusables.length === 0) {
        // Keep focus pinned on the panel; nothing to cycle through.
        e.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement

      if (e.shiftKey) {
        if (active === first || !panel.contains(active)) {
          e.preventDefault()
          last.focus()
        }
      } else {
        if (active === last || !panel.contains(active)) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [open, closeOnEsc, onClose])

  return panelRef
}
