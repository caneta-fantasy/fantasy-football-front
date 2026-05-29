import React from 'react'

export interface BreadcrumbItem {
  /** Visible label for the crumb. */
  label: React.ReactNode
  /**
   * Destination. Omit on the last (current) crumb — it renders as plain text
   * marked `aria-current="page"`, never a link.
   */
  href?: string
}

export interface BreadcrumbsProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'aria-label'> {
  /** Ordered trail from root to the current page. */
  items: BreadcrumbItem[]
  /** Accessible name for the nav landmark. */
  'aria-label'?: string
  /**
   * Collapse the middle of long trails to first + ellipsis + last once the
   * trail exceeds this count. Defaults to 4. The ellipsis is inert text.
   */
  maxItems?: number
}

const SEP = '/'
const ELLIPSIS = '…'

type Rendered =
  | { kind: 'crumb'; item: BreadcrumbItem; isLast: boolean }
  | { kind: 'ellipsis' }

// Collapse to [first, …, last] when over the cap; otherwise pass through.
function collapse(items: BreadcrumbItem[], maxItems: number): Rendered[] {
  if (items.length <= maxItems || items.length <= 2) {
    return items.map((item, i) => ({
      kind: 'crumb',
      item,
      isLast: i === items.length - 1,
    }))
  }
  return [
    { kind: 'crumb', item: items[0], isLast: false },
    { kind: 'ellipsis' },
    { kind: 'crumb', item: items[items.length - 1], isLast: true },
  ]
}

const LINK_CLS =
  'font-sans text-[12.5px] font-medium text-text-muted no-underline ' +
  'hover:text-text hover:underline rounded-xs'

const CURRENT_CLS =
  'font-sans text-[12.5px] font-bold text-text max-w-[18ch] truncate inline-block align-bottom'

export function Breadcrumbs({
  items,
  maxItems = 4,
  className,
  ...rest
}: BreadcrumbsProps) {
  const ariaLabel =
    (rest as { 'aria-label'?: string })['aria-label'] ?? 'Trilha de navegação'
  delete (rest as { 'aria-label'?: string })['aria-label']

  const rendered = collapse(items, maxItems)

  return (
    <nav aria-label={ariaLabel} className={className} {...rest}>
      <ol className="flex flex-wrap items-center gap-2 list-none m-0 p-0">
        {rendered.map((node, i) => {
          const showSep = i < rendered.length - 1
          if (node.kind === 'ellipsis') {
            return (
              <li key="ellipsis" className="flex items-center gap-2">
                {/* Inert: not a link or button, hidden from assistive tech. */}
                <span
                  aria-hidden="true"
                  className="font-sans text-[12.5px] text-text-muted select-none"
                >
                  {ELLIPSIS}
                </span>
                {showSep && (
                  <span
                    data-ds-sep
                    aria-hidden="true"
                    className="font-sans text-[12.5px] text-[color:var(--ink-400)] select-none"
                  >
                    {SEP}
                  </span>
                )}
              </li>
            )
          }

          const { item, isLast } = node
          return (
            <li key={i} className="flex items-center gap-2 min-w-0">
              {isLast || !item.href ? (
                <span aria-current="page" className={CURRENT_CLS}>
                  {item.label}
                </span>
              ) : (
                <a href={item.href} className={LINK_CLS}>
                  {item.label}
                </a>
              )}
              {showSep && (
                <span
                  data-ds-sep
                  aria-hidden="true"
                  className="font-sans text-[12.5px] text-[color:var(--ink-400)] select-none"
                >
                  {SEP}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
