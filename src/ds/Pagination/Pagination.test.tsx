import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Pagination } from './Pagination'

describe('Pagination', () => {
  it('renders inside a labelled navigation landmark', () => {
    render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />)
    expect(
      screen.getByRole('navigation', { name: /paginação/i }),
    ).toBeInTheDocument()
  })

  it('renders prev/next buttons with aria-labels', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />)
    expect(
      screen.getByRole('button', { name: /página anterior/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /próxima página/i }),
    ).toBeInTheDocument()
  })

  it('disables prev on the first page', () => {
    render(<Pagination page={1} pageCount={5} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: /página anterior/i })).toBeDisabled()
    expect(
      screen.getByRole('button', { name: /próxima página/i }),
    ).toBeEnabled()
  })

  it('disables next on the last page', () => {
    render(<Pagination page={5} pageCount={5} onPageChange={() => {}} />)
    expect(
      screen.getByRole('button', { name: /próxima página/i }),
    ).toBeDisabled()
    expect(screen.getByRole('button', { name: /página anterior/i })).toBeEnabled()
  })

  it('marks the current page button with aria-current', () => {
    render(<Pagination page={2} pageCount={5} onPageChange={() => {}} />)
    const current = screen.getByRole('button', { name: /página 2/i })
    expect(current).toHaveAttribute('aria-current', 'page')
  })

  it('calls onPageChange with the chosen page number', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /página 3/i }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('advances/retreats via next and prev', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={3} pageCount={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /próxima página/i }))
    expect(onPageChange).toHaveBeenCalledWith(4)
    await userEvent.click(screen.getByRole('button', { name: /página anterior/i }))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('does not call onPageChange when a disabled bound button is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} pageCount={5} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: /página anterior/i }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('renders an ellipsis as inert text, not a button (§7)', () => {
    // 1 … 4 [5] 6 … 10  → ellipses appear
    render(<Pagination page={5} pageCount={10} onPageChange={() => {}} />)
    const ellipses = screen.getAllByText('…')
    expect(ellipses.length).toBeGreaterThan(0)
    ellipses.forEach((el) => {
      expect(el.tagName).not.toBe('BUTTON')
      expect(el).toHaveAttribute('aria-hidden', 'true')
    })
    // ellipsis must not be reachable as a button
    expect(
      screen.queryByRole('button', { name: '…' }),
    ).not.toBeInTheDocument()
  })

  it('renders every page button when the count is small', () => {
    render(<Pagination page={1} pageCount={4} onPageChange={() => {}} />)
    ;[1, 2, 3, 4].forEach((n) =>
      expect(
        screen.getByRole('button', { name: new RegExp(`página ${n}`, 'i') }),
      ).toBeInTheDocument(),
    )
    expect(screen.queryByText('…')).not.toBeInTheDocument()
  })

  it('clamps an out-of-range page without throwing', () => {
    expect(() =>
      render(<Pagination page={99} pageCount={5} onPageChange={() => {}} />),
    ).not.toThrow()
    expect(
      screen.getByRole('button', { name: /próxima página/i }),
    ).toBeDisabled()
  })
})
