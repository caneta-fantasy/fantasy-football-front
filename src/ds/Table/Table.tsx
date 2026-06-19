import React, { useState } from 'react'
import { Icon } from '../Icon/Icon'
import { Spinner } from '../Spinner/Spinner'
import { Overline } from '../Overline/Overline'

/**
 * Table — a real, accessible `<table>` with a generic, typed columns/rows API.
 *
 * Features (design §3, DS `tokens-modernist.jsx` data display):
 * - **Sticky header** (bottle-green band that pins to the top of a scrolling
 *   container; labels render `on-green`).
 * - **Zebra** striping on body rows (faint `mist` stripe).
 * - **Row states:** hover (CSS-only), `selected` (cobalt-pale band + 3px gold
 *   side bar + `aria-selected`), `expanded` (a drawer row + `aria-expanded` on
 *   the owner).
 * - **Sortable headers** (DS §7): a sortable `<th>` carries `aria-sort` and a
 *   real `<button>` that cycles `none → ascending → descending → none`. The
 *   active-sort header + chevron tint to **gold** (accent). Uncontrolled by
 *   default (sorts its own copy of the rows); fully controlled when
 *   `sort`/`onSortChange` are supplied.
 * - **Empty + loading slots.**
 *
 * Typography: header + caption labels use the modernista `Overline` (tracked
 * all-caps Archivo) — Spline Sans Mono is reserved for genuine tabular numeric
 * columns (set per-cell by the consumer), never for uppercase labels.
 *
 * a11y contract: native `<table>`/`<thead>`/`<tbody>`/`<th scope>`/`<td>`; an
 * optional `<caption>` names the table; sort controls are buttons inside the
 * header cell so the focus ring (base layer) and keyboard work for free.
 */

export type SortDirection = 'ascending' | 'descending'
export type Align = 'left' | 'right' | 'center'

export interface SortState {
  /** The `key` of the column being sorted. */
  key: string
  direction: SortDirection
}

export interface Column<Row> {
  /** Stable identifier; also the default sort key for this column. */
  key: string
  /** Header label (string or node). */
  header: React.ReactNode
  /** Renders the cell content for a row. */
  cell: (row: Row) => React.ReactNode
  /** Text alignment. Unknown values fall back to `left` (never throws). */
  align?: Align
  /** When true the header becomes a sort control exposing `aria-sort`. */
  sortable?: boolean
  /**
   * Custom comparator used by the built-in (uncontrolled) sort. Defaults to a
   * sensible number/string compare on `cell(row)`. Ignored when the table is
   * controlled (parent owns ordering).
   */
  sortValue?: (row: Row) => string | number
  /** Optional fixed/min width utility class for this column (e.g. `w-[70px]`). */
  width?: string
}

export interface TableProps<Row> {
  columns: Column<Row>[]
  rows: Row[]
  /** Stable React key + identity for each row (selection/expansion lookups). */
  getRowKey: (row: Row, index: number) => React.Key
  /** Names the table for assistive tech (renders a visually-styled caption). */
  caption?: React.ReactNode
  /** Key of the currently selected row → cobalt/gold band + `aria-selected`. */
  selectedRowKey?: React.Key
  /** Key of the currently expanded row → drawer + `aria-expanded` on the owner. */
  expandedRowKey?: React.Key
  /** Renders the expansion drawer content for the expanded row. */
  renderExpanded?: (row: Row) => React.ReactNode
  /** Fires when a whole row is clicked (no-op if omitted; rows stay inert). */
  onRowClick?: (row: Row) => void
  /** Controlled sort. Provide together with `onSortChange`. */
  sort?: SortState | null
  /** Sort change callback. Receives the next `SortState` or `null` (cleared). */
  onSortChange?: (next: SortState | null) => void
  /** Loading slot: replaces the body with a centered Spinner (`role="status"`). */
  loading?: boolean
  /** Empty slot: shown when there are no rows and not loading. */
  empty?: React.ReactNode
  /** Extra classes on the scroll container. */
  className?: string
}

const ALIGN: Record<Align, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
}

// Cell-content alignment helper for the flex row in the expanded drawer etc.
function alignClass(align?: Align): string {
  return ALIGN[align as Align] ?? ALIGN.left
}

// none → ascending → descending → none
function nextSort(current: SortState | null, key: string): SortState | null {
  if (!current || current.key !== key) return { key, direction: 'ascending' }
  if (current.direction === 'ascending') return { key, direction: 'descending' }
  return null
}

function defaultSortValue<Row>(col: Column<Row>, row: Row): string | number {
  if (col.sortValue) return col.sortValue(row)
  const v = col.cell(row)
  return typeof v === 'number' ? v : String(v ?? '')
}

export function Table<Row>({
  columns,
  rows,
  getRowKey,
  caption,
  selectedRowKey,
  expandedRowKey,
  renderExpanded,
  onRowClick,
  sort,
  onSortChange,
  loading = false,
  empty,
  className,
}: TableProps<Row>) {
  // Controlled when a parent passes `sort` (even `null`); otherwise self-managed.
  const isControlled = sort !== undefined
  const [internalSort, setInternalSort] = useState<SortState | null>(null)
  const activeSort = isControlled ? sort ?? null : internalSort

  const handleSort = (key: string) => {
    const next = nextSort(activeSort, key)
    if (!isControlled) setInternalSort(next)
    onSortChange?.(next)
  }

  // Uncontrolled tables sort a copy of the rows; controlled tables render as-is
  // (the parent owns ordering).
  const visibleRows = React.useMemo(() => {
    if (isControlled || !activeSort) return rows
    const col = columns.find((c) => c.key === activeSort.key)
    if (!col) return rows
    const dir = activeSort.direction === 'ascending' ? 1 : -1
    return [...rows].sort((a, b) => {
      const av = defaultSortValue(col, a)
      const bv = defaultSortValue(col, b)
      if (av < bv) return -1 * dir
      if (av > bv) return 1 * dir
      return 0
    })
  }, [isControlled, activeSort, rows, columns])

  const colCount = columns.length
  const interactiveRows = typeof onRowClick === 'function'

  return (
    <div
      className={`overflow-auto rounded-btn border border-line bg-paper${
        className ? ` ${className}` : ''
      }`}
    >
      <table className="w-full border-collapse font-sans text-[13px] text-ink">
        {caption && (
          <caption className="px-4 py-2 text-left">
            <Overline as="span">{caption}</Overline>
          </caption>
        )}
        <thead>
          {/* Sticky bottle-green header band (pins inside a scrolling container). */}
          <tr className="sticky top-0 z-sticky bg-signature">
            {columns.map((col) => {
              const isActive = activeSort?.key === col.key
              const ariaSort = col.sortable
                ? isActive
                  ? activeSort!.direction
                  : 'none'
                : undefined
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={ariaSort}
                  className={`px-3 py-2 font-sans text-[9.5px] font-bold uppercase tracking-[1.2px] ${alignClass(
                    col.align,
                  )} ${col.width ?? ''} ${
                    isActive ? 'text-accent' : 'text-on-green'
                  }`}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => handleSort(col.key)}
                      className={`inline-flex items-center gap-1 rounded-pill font-sans text-[9.5px] font-bold uppercase tracking-[1.2px] ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      } ${isActive ? 'text-accent' : 'text-on-green'} cursor-pointer`}
                    >
                      <span>{col.header}</span>
                      <Icon
                        name={
                          isActive && activeSort!.direction === 'ascending'
                            ? 'chevron-up'
                            : 'chevron-down'
                        }
                        size={16}
                        className={
                          isActive ? 'text-accent' : 'text-on-green opacity-60'
                        }
                        aria-hidden
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-12">
                <div className="flex items-center justify-center gap-3">
                  <Spinner size={20} />
                  <Overline as="span">Carregando</Overline>
                </div>
              </td>
            </tr>
          ) : visibleRows.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-12 text-center text-ink-muted">
                {empty ?? <Overline as="span">Sem dados</Overline>}
              </td>
            </tr>
          ) : (
            visibleRows.map((row, index) => {
              const key = getRowKey(row, index)
              const isSelected = selectedRowKey !== undefined && key === selectedRowKey
              const isExpanded = expandedRowKey !== undefined && key === expandedRowKey
              const zebra = index % 2 === 1
              return (
                <React.Fragment key={key}>
                  <tr
                    aria-selected={isSelected || undefined}
                    aria-expanded={
                      renderExpanded ? isExpanded : undefined
                    }
                    onClick={interactiveRows ? () => onRowClick!(row) : undefined}
                    className={[
                      'border-b border-line transition-colors duration-150',
                      // Selected: cobalt-pale band + 3px gold side-bar (border-left).
                      isSelected
                        ? 'bg-cobalt-pale border-l-[3px] border-l-accent'
                        : `border-l-[3px] border-l-transparent ${
                            zebra ? 'bg-mist' : 'bg-paper'
                          }`,
                      // Hover state is CSS-only (reduced-motion handled globally).
                      'hover:bg-mist2',
                      interactiveRows ? 'cursor-pointer' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={`px-3 py-[11px] align-middle ${alignClass(
                          col.align,
                        )} ${col.width ?? ''}`}
                      >
                        {col.cell(row)}
                      </td>
                    ))}
                  </tr>
                  {renderExpanded && isExpanded && (
                    <tr className="border-b border-line bg-mist">
                      <td colSpan={colCount} className="px-4 py-3">
                        {renderExpanded(row)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
