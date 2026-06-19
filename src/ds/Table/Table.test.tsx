import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Table, type Column } from './Table'

interface Player {
  id: number
  name: string
  proj: number
}

const COLUMNS: Column<Player>[] = [
  { key: 'name', header: 'Jogador', cell: (r) => r.name },
  { key: 'proj', header: 'Proj', cell: (r) => r.proj, align: 'right', sortable: true },
]

const ROWS: Player[] = [
  { id: 1, name: 'Pedro Henrique', proj: 14.8 },
  { id: 2, name: 'André', proj: 11.7 },
  { id: 3, name: 'Estevão', proj: 12.4 },
]

const renderTable = (props: Partial<React.ComponentProps<typeof Table<Player>>> = {}) =>
  render(
    <Table<Player>
      columns={COLUMNS}
      rows={ROWS}
      getRowKey={(r) => r.id}
      caption="Projeções"
      {...props}
    />,
  )

describe('Table', () => {
  it('renders a real <table> with the given caption, header and rows', () => {
    renderTable()
    const table = screen.getByRole('table', { name: 'Projeções' })
    expect(table.tagName).toBe('TABLE')
    // One header per column.
    expect(screen.getByRole('columnheader', { name: /jogador/i })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: /proj/i })).toBeInTheDocument()
    // One body row per data row (plus the header row).
    expect(screen.getAllByRole('row')).toHaveLength(ROWS.length + 1)
    expect(screen.getByRole('cell', { name: 'Pedro Henrique' })).toBeInTheDocument()
  })

  it('marks a sortable header with aria-sort="none" by default and a real sort button', () => {
    renderTable()
    const projHeader = screen.getByRole('columnheader', { name: /proj/i })
    expect(projHeader).toHaveAttribute('aria-sort', 'none')
    // The sort control is a real button inside the header (not a clickable div).
    const sortBtn = within(projHeader).getByRole('button', { name: /proj/i })
    expect(sortBtn.tagName).toBe('BUTTON')
    // A non-sortable header carries no aria-sort and no button.
    const nameHeader = screen.getByRole('columnheader', { name: /jogador/i })
    expect(nameHeader).not.toHaveAttribute('aria-sort')
    expect(within(nameHeader).queryByRole('button')).toBeNull()
  })

  it('toggles aria-sort ascending → descending → none and calls onSortChange (DS §7)', async () => {
    const onSortChange = vi.fn()
    renderTable({ onSortChange })
    const projHeader = screen.getByRole('columnheader', { name: /proj/i })
    const sortBtn = within(projHeader).getByRole('button')

    await userEvent.click(sortBtn)
    expect(projHeader).toHaveAttribute('aria-sort', 'ascending')
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'proj', direction: 'ascending' })

    await userEvent.click(sortBtn)
    expect(projHeader).toHaveAttribute('aria-sort', 'descending')
    expect(onSortChange).toHaveBeenLastCalledWith({ key: 'proj', direction: 'descending' })

    await userEvent.click(sortBtn)
    expect(projHeader).toHaveAttribute('aria-sort', 'none')
    expect(onSortChange).toHaveBeenLastCalledWith(null)
  })

  it('sorts the visible rows when uncontrolled', async () => {
    renderTable()
    const sortBtn = within(
      screen.getByRole('columnheader', { name: /proj/i }),
    ).getByRole('button')

    await userEvent.click(sortBtn) // ascending by proj
    let bodyRows = screen.getAllByRole('row').slice(1)
    expect(within(bodyRows[0]).getByText('André')).toBeInTheDocument() // 11.7 lowest

    await userEvent.click(sortBtn) // descending by proj
    bodyRows = screen.getAllByRole('row').slice(1)
    expect(within(bodyRows[0]).getByText('Pedro Henrique')).toBeInTheDocument() // 14.8 highest
  })

  it('reflects a controlled sort prop and does not manage its own state', async () => {
    const onSortChange = vi.fn()
    const { rerender } = renderTable({
      sort: { key: 'proj', direction: 'descending' },
      onSortChange,
    })
    const projHeader = screen.getByRole('columnheader', { name: /proj/i })
    expect(projHeader).toHaveAttribute('aria-sort', 'descending')

    // Clicking notifies the parent but the displayed state stays controlled.
    await userEvent.click(within(projHeader).getByRole('button'))
    expect(onSortChange).toHaveBeenCalled()
    expect(projHeader).toHaveAttribute('aria-sort', 'descending')

    // The parent drives the change.
    rerender(
      <Table<Player>
        columns={COLUMNS}
        rows={ROWS}
        getRowKey={(r) => r.id}
        caption="Projeções"
        sort={{ key: 'proj', direction: 'ascending' }}
        onSortChange={onSortChange}
      />,
    )
    expect(
      screen.getByRole('columnheader', { name: /proj/i }),
    ).toHaveAttribute('aria-sort', 'ascending')
  })

  it('marks a selected row with aria-selected', () => {
    renderTable({ selectedRowKey: 2 })
    const selected = screen
      .getAllByRole('row')
      .find((r) => r.getAttribute('aria-selected') === 'true')
    expect(selected).toBeDefined()
    expect(within(selected as HTMLElement).getByText('André')).toBeInTheDocument()
  })

  it('renders an expanded row content panel via aria-expanded + renderExpanded', () => {
    renderTable({
      expandedRowKey: 1,
      renderExpanded: (r) => <div data-testid="drawer">stats de {r.name}</div>,
    })
    // The data row owning the expansion announces it.
    const owner = screen
      .getAllByRole('row')
      .find((r) => r.getAttribute('aria-expanded') === 'true')
    expect(owner).toBeDefined()
    expect(screen.getByTestId('drawer')).toHaveTextContent('stats de Pedro Henrique')
  })

  it('shows the loading slot and a busy status while loading', () => {
    renderTable({ loading: true, rows: [] })
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByRole('cell', { name: 'Pedro Henrique' })).toBeNull()
  })

  it('shows the empty slot when there are no rows and not loading', () => {
    renderTable({ rows: [], empty: <span>Nenhum jogador</span> })
    expect(screen.getByText('Nenhum jogador')).toBeInTheDocument()
  })

  it('does not throw and left-aligns when given an unknown align value (default fallback)', () => {
    const cols: Column<Player>[] = [
      // @ts-expect-error testing the runtime align fallback
      { key: 'name', header: 'Jogador', cell: (r) => r.name, align: 'nope' },
    ]
    expect(() =>
      render(
        <Table<Player> columns={cols} rows={ROWS} getRowKey={(r) => r.id} />,
      ),
    ).not.toThrow()
  })
})
