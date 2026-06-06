import React from 'react'

export interface TabItem {
  /** Stable identifier, also used as the controlled/uncontrolled value. */
  id: string
  /** Visible tab label. */
  label: React.ReactNode
  /** Panel contents shown when this tab is selected. */
  content?: React.ReactNode
  /** A disabled tab is rendered but not selectable and is skipped by arrows. */
  disabled?: boolean
}

type Variant = 'underline' | 'scrollable'

export interface TabsProps {
  /** Tabs + their panels. */
  items: TabItem[]
  /** Controlled selected id. Pair with `onValueChange`. */
  value?: string
  /** Initial selected id when uncontrolled. Defaults to the first item. */
  defaultValue?: string
  /** Fires with the newly-selected id. */
  onValueChange?: (id: string) => void
  /**
   * `underline` (default) wraps; `scrollable` keeps tabs on one row and scrolls
   * horizontally on overflow. Unknown values fall back to `underline`.
   */
  variant?: Variant
  /** Accessible name for the tablist (recommended). */
  'aria-label'?: string
  /** Stable prefix for generated ids; pass when several Tabs share a page. */
  idBase?: string
  className?: string
}

const LIST_VARIANTS: Record<Variant, string> = {
  underline: 'flex flex-wrap',
  // overflow-x-auto keeps the row on a single line and scrolls on overflow.
  scrollable: 'flex flex-nowrap overflow-x-auto',
}

const TAB_BASE =
  'relative shrink-0 px-4 py-[10px] font-sans text-[13px] leading-none ' +
  'cursor-pointer bg-transparent border-0 whitespace-nowrap ' +
  'transition-colors duration-150 ease-[var(--ease-standard)] ' +
  'disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)]'

let counter = 0

export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'underline',
  idBase,
  className,
  ...rest
}: TabsProps & { 'aria-label'?: string }) {
  const ariaLabel = (rest as { 'aria-label'?: string })['aria-label']
  const listCls = LIST_VARIANTS[variant] ?? LIST_VARIANTS.underline

  // Stable id prefix so tab/panel ids are deterministic per instance.
  const base = React.useMemo(() => idBase ?? `ds-tabs-${++counter}`, [idBase])

  const firstEnabled = items.find((i) => !i.disabled)?.id ?? items[0]?.id
  const [internal, setInternal] = React.useState<string | undefined>(
    defaultValue ?? firstEnabled,
  )
  const selected = value ?? internal

  const refs = React.useRef<(HTMLButtonElement | null)[]>([])

  const select = (id: string) => {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  const focusTab = (index: number) => {
    const el = refs.current[index]
    el?.focus()
    const id = items[index]?.id
    if (id) select(id)
  }

  // Roving selection that skips disabled tabs and wraps around.
  const step = (from: number, dir: 1 | -1) => {
    const n = items.length
    if (n === 0) return
    let i = from
    for (let k = 0; k < n; k++) {
      i = (i + dir + n) % n
      if (!items[i]?.disabled) {
        focusTab(i)
        return
      }
    }
  }

  const edge = (dir: 'first' | 'last') => {
    const order =
      dir === 'first'
        ? items.map((_, i) => i)
        : items.map((_, i) => items.length - 1 - i)
    const target = order.find((i) => !items[i]?.disabled)
    if (target !== undefined) focusTab(target)
  }

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        step(index, 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        step(index, -1)
        break
      case 'Home':
        e.preventDefault()
        edge('first')
        break
      case 'End':
        e.preventDefault()
        edge('last')
        break
      default:
        break
    }
  }

  const activePanel = items.find((i) => i.id === selected)

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={`${listCls} border-b border-line`}
      >
        {items.map((item, i) => {
          const isSelected = item.id === selected
          return (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el
              }}
              role="tab"
              type="button"
              id={`${base}-tab-${item.id}`}
              aria-selected={isSelected}
              aria-controls={`${base}-panel-${item.id}`}
              // Roving tabindex: only the selected tab is in the tab sequence.
              tabIndex={isSelected ? 0 : -1}
              disabled={item.disabled}
              className={`${TAB_BASE} ${
                isSelected
                  ? 'font-bold text-signature'
                  : 'font-semibold text-text-muted hover:text-text'
              }`}
              onClick={() => !item.disabled && select(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {item.label}
              {/* Modernista gold rule marks the active tab (CSS-positioned). */}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-px h-[3px] bg-accent"
                />
              )}
            </button>
          )
        })}
      </div>

      {activePanel && (
        <div
          role="tabpanel"
          id={`${base}-panel-${activePanel.id}`}
          aria-labelledby={`${base}-tab-${activePanel.id}`}
          tabIndex={0}
          className="pt-4 outline-none"
        >
          {activePanel.content}
        </div>
      )}
    </div>
  )
}
