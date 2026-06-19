import React from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import './dropdown-menu.css'

export interface DropdownMenuItem {
  /** Stable identifier (also used as the React key). */
  id: string
  /** Visible label. */
  label: React.ReactNode
  /** Optional leading glyph from the Icon registry. */
  icon?: IconName
  /**
   * Keyboard shortcut. Shown as a hint on the right and *wired*: pressing this
   * key while the menu is open activates the item. Use a `KeyboardEvent.key`
   * value (e.g. "t", "Enter", "Backspace"); matched case-insensitively.
   */
  shortcut?: string
  /** Destructive styling (red). The label still carries the meaning. */
  danger?: boolean
  /** Non-interactive when true. */
  disabled?: boolean
  /** Invoked when the item is activated (click / Enter / Space / shortcut). */
  onSelect?: () => void
}

export interface DropdownMenuProps {
  /**
   * The element that toggles the menu. Cloned to attach the click handler and
   * `aria-haspopup="menu"` / `aria-expanded`.
   */
  trigger: React.ReactElement
  /** Menu items, top to bottom. */
  items: DropdownMenuItem[]
  /** Side of the trigger to render on. Unknown values fall back to `bottom`. */
  placement?: 'top' | 'bottom'
  /** Accessible name for the menu. */
  label?: string
}

const PLACEMENTS: Record<'top' | 'bottom', string> = {
  top: 'bottom-full right-0 mb-2',
  bottom: 'top-full right-0 mt-2',
}

// Human-friendly shortcut hint glyphs for the common keys.
const SHORTCUT_GLYPH: Record<string, string> = {
  enter: '↵',
  backspace: '⌫',
  escape: 'esc',
  arrowup: '↑',
  arrowdown: '↓',
}

let idCounter = 0

export function DropdownMenu({
  trigger,
  items,
  placement = 'bottom',
  label,
}: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(0)
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([])
  const menuId = React.useMemo(() => `ds-menu-${++idCounter}`, [])

  const place = PLACEMENTS[placement] ?? PLACEMENTS.bottom

  const enabledIndexes = React.useMemo(
    () => items.map((it, i) => (it.disabled ? -1 : i)).filter((i) => i >= 0),
    [items],
  )

  const close = React.useCallback(
    (returnFocus = true) => {
      setOpen(false)
      if (returnFocus) triggerRef.current?.focus()
    },
    [],
  )

  const activate = React.useCallback(
    (index: number) => {
      const item = items[index]
      if (!item || item.disabled) return
      item.onSelect?.()
      close()
    },
    [items, close],
  )

  // On open, reset the roving-focus origin to the first enabled item.
  // Focusing is handled by the activeIndex effect below — focusing here too
  // (previously via requestAnimationFrame) raced with keyboard navigation and
  // could steal focus back to the first item after the user had moved.
  React.useEffect(() => {
    if (!open) return
    setActiveIndex(enabledIndexes[0] ?? 0)
  }, [open, enabledIndexes])

  // Keep DOM focus in sync with the active index while open (also drives the
  // initial focus on open, since `open` is a dependency).
  React.useEffect(() => {
    if (!open) return
    itemRefs.current[activeIndex]?.focus()
  }, [activeIndex, open])

  // Outside-click closes (no focus return — focus moved outside deliberately).
  React.useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if (triggerRef.current?.contains(target)) return
      close(false)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () =>
      document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open, close])

  const moveBy = (delta: number) => {
    const pos = enabledIndexes.indexOf(activeIndex)
    const nextPos =
      (pos + delta + enabledIndexes.length) % enabledIndexes.length
    setActiveIndex(enabledIndexes[nextPos])
  }

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        moveBy(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        moveBy(-1)
        return
      case 'Home':
        e.preventDefault()
        setActiveIndex(enabledIndexes[0])
        return
      case 'End':
        e.preventDefault()
        setActiveIndex(enabledIndexes[enabledIndexes.length - 1])
        return
      case 'Enter':
      case ' ':
        e.preventDefault()
        activate(activeIndex)
        return
      case 'Escape':
        e.preventDefault()
        e.stopPropagation()
        close()
        return
      case 'Tab':
        // Tabbing out dismisses the menu (return focus handled by browser flow).
        close(false)
        return
      default:
        break
    }

    // Wired shortcuts: a non-navigation key that matches an item's shortcut
    // activates that item. Matched case-insensitively against KeyboardEvent.key.
    const key = e.key.toLowerCase()
    const match = items.findIndex(
      (it) => !it.disabled && it.shortcut?.toLowerCase() === key,
    )
    if (match >= 0) {
      e.preventDefault()
      activate(match)
    }
  }

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
    'aria-haspopup': 'menu',
    'aria-expanded': open,
    'aria-controls': open ? menuId : undefined,
    onClick: (e: React.MouseEvent) => {
      ;(childProps.onClick as ((e: React.MouseEvent) => void) | undefined)?.(e)
      setOpen((o) => !o)
    },
  })

  return (
    <span className="relative inline-flex">
      {clonedTrigger}
      {open && (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={label}
          onKeyDown={onMenuKeyDown}
          className={[
            'absolute z-popover min-w-[220px] p-[5px]',
            'rounded-btn-lg border border-line bg-surface text-text shadow-e3',
            'animate-[ds-menu-in_var(--dur-150,150ms)_var(--ease-standard)]',
            place,
          ].join(' ')}
        >
          {items.map((item, i) => {
            const isActive = i === activeIndex
            const glyph =
              item.shortcut &&
              (SHORTCUT_GLYPH[item.shortcut.toLowerCase()] ??
                item.shortcut.toUpperCase())
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                ref={(node) => {
                  itemRefs.current[i] = node
                }}
                disabled={item.disabled}
                // Roving tabindex: only the active item is in the tab order.
                tabIndex={isActive ? 0 : -1}
                onClick={() => activate(i)}
                onMouseEnter={() => !item.disabled && setActiveIndex(i)}
                className={[
                  'flex w-full items-center gap-[10px] rounded-pill px-[10px] py-2 text-left',
                  'font-sans text-[12.5px] font-semibold outline-none',
                  'disabled:opacity-60 disabled:pointer-events-none',
                  item.danger ? 'text-danger' : 'text-text',
                  isActive
                    ? 'bg-signature-pale'
                    : 'bg-transparent hover:bg-surface-inset',
                ].join(' ')}
              >
                {item.icon && <Icon name={item.icon} size={16} />}
                <span className="flex-1">{item.label}</span>
                {glyph && (
                  <span className="rounded-pill border border-line px-[5px] py-px font-mono text-[10px] text-text-muted">
                    {glyph}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </span>
  )
}
