import { Select, type SelectOption } from '../Select/Select'
import { Pagination } from '../Pagination/Pagination'

/**
 * ResultsBar — the Jogadores pagination footer: a rows-per-page `Select`, a
 * "1–N de TOTAL" range readout, and the ds `Pagination` control. Source:
 * `app/screens.jsx:ScreenJogadores` (pagination footer) — restyled to real,
 * accessible controls.
 *
 * Paging is **1-based** (matching ds `Pagination`); the parent owns page state.
 * The range readout is computed from `page`/`rowsPerPage`/`total`.
 *
 * a11y contract: native `Select` (labelled), the range is plain text, and the
 * pager is the ds `Pagination` nav landmark.
 */
export interface ResultsBarProps {
  /** 1-based current page. */
  page: number
  /** Rows shown per page. */
  rowsPerPage: number
  /** Total row count across all pages. */
  total: number
  rowsPerPageOptions?: number[]
  onPageChange: (page: number) => void
  onRowsPerPageChange: (rows: number) => void
  compact?: boolean
  className?: string
}

export function ResultsBar({
  page,
  rowsPerPage,
  total,
  rowsPerPageOptions = [10, 25, 50],
  onPageChange,
  onRowsPerPageChange,
  compact = false,
  className,
}: ResultsBarProps) {
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage))
  const from = total === 0 ? 0 : (page - 1) * rowsPerPage + 1
  const to = Math.min(page * rowsPerPage, total)

  const rppOptions: SelectOption[] = rowsPerPageOptions.map((n) => ({
    value: String(n),
    label: String(n),
  }))

  return (
    <div
      className={[
        'mt-4 flex items-center gap-4 font-sans text-[12.5px] text-ink-muted',
        compact ? 'justify-between' : 'justify-end',
        className ?? '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <label className="flex items-center gap-2 whitespace-nowrap">
        <span>Linhas por página:</span>
        <Select
          aria-label="Linhas por página"
          size="sm"
          className="w-[72px]"
          options={rppOptions}
          value={String(rowsPerPage)}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        />
      </label>

      <div className="flex items-center gap-3">
        <span className="tabular-nums whitespace-nowrap">
          {`${from}–${to} de ${total}`}
        </span>
        <Pagination
          page={page}
          pageCount={pageCount}
          onPageChange={onPageChange}
          siblingCount={0}
          aria-label="Paginação de jogadores"
        />
      </div>
    </div>
  )
}
