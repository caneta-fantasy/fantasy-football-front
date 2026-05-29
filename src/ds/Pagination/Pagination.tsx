import React from 'react'
import { Icon } from '../Icon/Icon'

export interface PaginationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'onChange'> {
  /** 1-based current page. Clamped into [1, pageCount]. */
  page: number
  /** Total number of pages (>= 1). */
  pageCount: number
  /** Fires with the requested 1-based page. */
  onPageChange: (page: number) => void
  /**
   * How many page numbers to show around the current one. Defaults to 1
   * (e.g. 1 … 4 [5] 6 … 10).
   */
  siblingCount?: number
  /** Accessible name for the nav landmark. */
  'aria-label'?: string
}

const ELLIPSIS = '…'
type Slot = number | 'ellipsis'

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max)
}

// Build the slot list: always first + last, a window around current, and
// ellipses bridging the gaps. Ellipses are placeholders, never page numbers.
function buildSlots(
  page: number,
  pageCount: number,
  siblingCount: number,
): Slot[] {
  const total = Math.max(1, pageCount)
  // First page, last page, current ± siblings, and the two boundary neighbours.
  const boundaries = 1
  const totalNumbers = siblingCount * 2 + 3 + boundaries * 2
  if (totalNumbers >= total) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const left = Math.max(page - siblingCount, boundaries + 2)
  const right = Math.min(page + siblingCount, total - boundaries - 1)
  const showLeftEllipsis = left > boundaries + 2
  const showRightEllipsis = right < total - boundaries - 1

  const slots: Slot[] = [1]
  if (showLeftEllipsis) {
    slots.push('ellipsis')
  } else {
    for (let i = 2; i < left; i++) slots.push(i)
  }
  for (let i = left; i <= right; i++) slots.push(i)
  if (showRightEllipsis) {
    slots.push('ellipsis')
  } else {
    for (let i = right + 1; i < total; i++) slots.push(i)
  }
  slots.push(total)
  return slots
}

const ARROW_CLS =
  'inline-flex items-center justify-center w-8 h-8 rounded-sm bg-surface ' +
  'border border-border-strong text-text cursor-pointer ' +
  'transition-colors duration-150 ease-[var(--ease-standard)] ' +
  'hover:bg-surface-inset ' +
  'disabled:cursor-not-allowed disabled:opacity-[var(--opacity-disabled)] ' +
  'disabled:hover:bg-surface'

const PAGE_BASE =
  'inline-flex items-center justify-center min-w-8 h-8 px-2 rounded-sm ' +
  'font-mono text-[12.5px] font-bold cursor-pointer ' +
  'transition-colors duration-150 ease-[var(--ease-standard)]'

const PAGE_INACTIVE =
  'bg-transparent border border-border text-text-muted hover:text-text hover:bg-surface-inset'
const PAGE_ACTIVE = 'border-0 bg-lime text-ink-900'

export function Pagination({
  page,
  pageCount,
  onPageChange,
  siblingCount = 1,
  className,
  ...rest
}: PaginationProps) {
  const ariaLabel =
    (rest as { 'aria-label'?: string })['aria-label'] ?? 'Paginação'
  delete (rest as { 'aria-label'?: string })['aria-label']

  const total = Math.max(1, pageCount)
  const current = clamp(page, 1, total)
  const slots = buildSlots(current, total, Math.max(0, siblingCount))

  const go = (n: number) => {
    const next = clamp(n, 1, total)
    if (next !== current) onPageChange(next)
  }

  const atStart = current <= 1
  const atEnd = current >= total

  return (
    <nav aria-label={ariaLabel} className={className} {...rest}>
      <ul className="flex items-center gap-[6px] list-none m-0 p-0">
        <li className="flex">
          <button
            type="button"
            aria-label="Página anterior"
            className={ARROW_CLS}
            disabled={atStart}
            onClick={() => go(current - 1)}
          >
            <Icon name="chevron-left" size={16} />
          </button>
        </li>

        {slots.map((slot, i) => {
          if (slot === 'ellipsis') {
            return (
              <li key={`e-${i}`} className="flex">
                {/* Inert text — never a button, hidden from assistive tech (§7). */}
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center min-w-8 h-8 font-mono text-[12.5px] text-text-muted select-none"
                >
                  {ELLIPSIS}
                </span>
              </li>
            )
          }
          const isCurrent = slot === current
          return (
            <li key={slot} className="flex">
              <button
                type="button"
                aria-label={`Página ${slot}`}
                aria-current={isCurrent ? 'page' : undefined}
                className={`${PAGE_BASE} ${isCurrent ? PAGE_ACTIVE : PAGE_INACTIVE}`}
                onClick={() => go(slot)}
              >
                {slot}
              </button>
            </li>
          )
        })}

        <li className="flex">
          <button
            type="button"
            aria-label="Próxima página"
            className={ARROW_CLS}
            disabled={atEnd}
            onClick={() => go(current + 1)}
          >
            <Icon name="chevron-right" size={16} />
          </button>
        </li>
      </ul>
    </nav>
  )
}
