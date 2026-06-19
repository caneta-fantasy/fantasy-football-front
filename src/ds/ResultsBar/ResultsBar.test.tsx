import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ResultsBar } from './ResultsBar'

describe('ResultsBar', () => {
  it('renders a 1-based range readout', () => {
    render(
      <ResultsBar page={1} rowsPerPage={10} total={134} onPageChange={() => {}} onRowsPerPageChange={() => {}} />,
    )
    expect(screen.getByText('1–10 de 134')).toBeInTheDocument()
  })

  it('computes the range for a middle page', () => {
    render(
      <ResultsBar page={3} rowsPerPage={10} total={134} onPageChange={() => {}} onRowsPerPageChange={() => {}} />,
    )
    expect(screen.getByText('21–30 de 134')).toBeInTheDocument()
  })

  it('shows 0–0 de 0 when empty', () => {
    render(
      <ResultsBar page={1} rowsPerPage={10} total={0} onPageChange={() => {}} onRowsPerPageChange={() => {}} />,
    )
    expect(screen.getByText('0–0 de 0')).toBeInTheDocument()
  })

  it('pages are 1-based via the ds Pagination', async () => {
    const onPageChange = vi.fn()
    render(
      <ResultsBar page={1} rowsPerPage={10} total={134} onPageChange={onPageChange} onRowsPerPageChange={() => {}} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /próxima página/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('rows-per-page select fires onRowsPerPageChange', async () => {
    const onRowsPerPageChange = vi.fn()
    render(
      <ResultsBar page={1} rowsPerPage={10} total={134} onPageChange={() => {}} onRowsPerPageChange={onRowsPerPageChange} />,
    )
    await userEvent.selectOptions(screen.getByLabelText(/linhas por página/i), '25')
    expect(onRowsPerPageChange).toHaveBeenCalledWith(25)
  })
})
