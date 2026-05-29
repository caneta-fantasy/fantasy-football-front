import React from 'react'
import { Icon } from '../Icon/Icon'

/**
 * Combobox — accessible typeahead built on a real `<input>` + a `role="listbox"`
 * popup. The most-used field in the app (player search).
 *
 * a11y contract (DS §7 #5 + the §7 "real query-driven highlight" fix):
 * - The text field is a native `<input role="combobox">` with
 *   `aria-autocomplete="list"`, `aria-expanded`, `aria-controls` → the listbox,
 *   and `aria-activedescendant` → the currently highlighted `<option>` (roving
 *   focus stays on the input; DOM focus never moves into the list).
 * - The popup is a real `role="listbox"`; each row is `role="option"` with a
 *   stable id and `aria-selected` reflecting the active descendant.
 * - The match highlight is REAL and query-driven: the actual matched substring
 *   of each label is wrapped in a `<mark>` (the prototype hard-coded
 *   `label.slice(0,5)`).
 * - Keyboard model: ↑/↓ move the active option (wrapping), Enter selects the
 *   active option, Esc closes without selecting. Mouse: click selects.
 * - Focus ring comes from the base layer's `:focus-visible`.
 */
export interface ComboboxOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ComboboxProps {
  /** The searchable option set. */
  options: ComboboxOption[]
  /** Called with the chosen option when the user selects one. */
  onSelect?: (option: ComboboxOption) => void
  /** Accessible name when no external `<label htmlFor>` is wired. */
  'aria-label'?: string
  /** id for the input (links a `<label htmlFor>`; FieldGroup injects this). */
  id?: string
  /** Marks the field invalid: sets `aria-invalid` and the error border. */
  invalid?: boolean
  /** Placeholder text for the empty input. */
  placeholder?: string
  /** Disables the control. */
  disabled?: boolean
  /** Text shown when the query matches nothing. */
  emptyMessage?: React.ReactNode
  /** Extra class on the outer wrapper. */
  className?: string
  /** Merged onto the input's existing aria-describedby (FieldGroup wiring). */
  'aria-describedby'?: string
}

let comboSeq = 0

/** Case-insensitive substring filter. */
function matches(label: string, query: string): boolean {
  return label.toLowerCase().includes(query.trim().toLowerCase())
}

/**
 * Split a label around the first case-insensitive occurrence of `query` so the
 * matched run can be wrapped in a `<mark>`. Returns the three parts; the middle
 * is the real matched text (preserving the label's original casing).
 */
function highlightParts(
  label: string,
  query: string,
): { before: string; match: string; after: string } | null {
  const q = query.trim()
  if (!q) return null
  const idx = label.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return null
  return {
    before: label.slice(0, idx),
    match: label.slice(idx, idx + q.length),
    after: label.slice(idx + q.length),
  }
}

const SHELL_BASE =
  'flex items-center gap-2 w-full h-[40px] px-3 bg-surface rounded-sm border ' +
  'border-border-strong font-sans text-[13px] text-text transition-colors ' +
  'duration-150 hover:border-ink-500 focus-within:border-ink-900 ' +
  'focus-within:shadow-[var(--focus-ring)] ' +
  'has-[:disabled]:bg-surface-inset has-[:disabled]:border-border ' +
  'has-[:disabled]:cursor-not-allowed'

const SHELL_INVALID = 'border-red focus-within:border-red'

export function Combobox({
  options,
  onSelect,
  invalid = false,
  placeholder,
  disabled,
  emptyMessage = 'Nenhum resultado',
  className,
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}: ComboboxProps) {
  const [seqId] = React.useState(() => `ds-combo-${(comboSeq += 1)}`)
  const inputId = id ?? `${seqId}-input`
  const listId = `${seqId}-list`

  const [query, setQuery] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [activeIndex, setActiveIndex] = React.useState(-1)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const filtered = React.useMemo(
    () => (query.trim() ? options.filter((o) => matches(o.label, query)) : []),
    [options, query],
  )

  // Keep the active index within bounds when the filtered set changes.
  React.useEffect(() => {
    setActiveIndex((i) => (i >= filtered.length ? filtered.length - 1 : i))
  }, [filtered.length])

  // Close when clicking outside.
  React.useEffect(() => {
    if (!open) return
    function onDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open])

  const optionDomId = (index: number) => `${seqId}-opt-${index}`
  const activeDescendant =
    open && activeIndex >= 0 && activeIndex < filtered.length
      ? optionDomId(activeIndex)
      : undefined

  function commit(option: ComboboxOption) {
    if (option.disabled) return
    onSelect?.(option)
    setQuery(option.label)
    setOpen(false)
    setActiveIndex(-1)
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.value
    setQuery(next)
    setOpen(next.trim().length > 0)
    setActiveIndex(-1)
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault()
        if (!open && query.trim()) {
          setOpen(true)
          return
        }
        if (filtered.length === 0) return
        setActiveIndex((i) => (i + 1) % filtered.length)
        break
      }
      case 'ArrowUp': {
        e.preventDefault()
        if (filtered.length === 0) return
        setActiveIndex((i) => (i <= 0 ? filtered.length - 1 : i - 1))
        break
      }
      case 'Enter': {
        if (open && activeIndex >= 0 && activeIndex < filtered.length) {
          e.preventDefault()
          commit(filtered[activeIndex])
        }
        break
      }
      case 'Escape': {
        if (open) {
          e.preventDefault()
          setOpen(false)
          setActiveIndex(-1)
        }
        break
      }
      default:
        break
    }
  }

  const shellCls = [SHELL_BASE, invalid ? SHELL_INVALID : '', className ?? '']
    .filter(Boolean)
    .join(' ')

  return (
    <div ref={rootRef} className="relative">
      <div className={shellCls} data-invalid={invalid || undefined}>
        <Icon
          name="search"
          size={16}
          className="shrink-0 text-lime-deep"
        />
        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-label={ariaLabel}
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeDescendant}
          aria-invalid={invalid || undefined}
          aria-describedby={ariaDescribedBy}
          autoComplete="off"
          disabled={disabled}
          value={query}
          placeholder={placeholder}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          onFocus={() => query.trim() && setOpen(true)}
          className="min-w-0 flex-1 bg-transparent outline-none border-0 p-0 text-text placeholder:text-text-subtle disabled:cursor-not-allowed"
        />
      </div>

      {open && (
        <ul
          id={listId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-dropdown m-0 max-h-72 list-none overflow-auto rounded-md border border-border bg-surface p-0 shadow-e3"
        >
          {filtered.length === 0 ? (
            <li
              role="presentation"
              className="px-3 py-[10px] font-sans text-[13px] text-text-muted"
            >
              {emptyMessage}
            </li>
          ) : (
            filtered.map((o, i) => {
              const active = i === activeIndex
              const parts = highlightParts(o.label, query)
              return (
                <li
                  key={o.value}
                  id={optionDomId(i)}
                  role="option"
                  aria-selected={active}
                  aria-disabled={o.disabled || undefined}
                  // Use onMouseDown so selection fires before the input blurs.
                  onMouseDown={(e) => {
                    e.preventDefault()
                    commit(o)
                  }}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={[
                    'flex cursor-pointer items-center px-3 py-[10px] font-sans text-[13.5px] font-bold text-text',
                    'border-b border-border-subtle last:border-b-0',
                    active ? 'bg-[color:rgba(216,255,61,0.12)]' : '',
                    o.disabled ? 'opacity-60 cursor-not-allowed' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {parts ? (
                    <span>
                      {parts.before}
                      <mark className="bg-[color:rgba(216,255,61,0.55)] text-text">
                        {parts.match}
                      </mark>
                      {parts.after}
                    </span>
                  ) : (
                    <span>{o.label}</span>
                  )}
                </li>
              )
            })
          )}
        </ul>
      )}
    </div>
  )
}
