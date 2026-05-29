import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('renders a real input with the search type and a leading search icon', () => {
    const { container } = render(<SearchInput aria-label="Buscar" />)
    const input = screen.getByLabelText('Buscar') as HTMLInputElement
    expect(input.tagName).toBe('INPUT')
    expect(input.type).toBe('search')
    // The leading icon is decorative.
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not render a clear button when the field is empty (uncontrolled)', () => {
    render(<SearchInput aria-label="Buscar" />)
    expect(screen.queryByRole('button', { name: /limpar/i })).not.toBeInTheDocument()
  })

  it('shows a real clear button once there is a value', () => {
    render(<SearchInput aria-label="Buscar" value="messi" onChange={() => {}} />)
    const clear = screen.getByRole('button', { name: /limpar/i })
    expect(clear.tagName).toBe('BUTTON')
    expect(clear).toHaveAttribute('type', 'button')
  })

  it('clears a controlled value: dispatches an onChange with empty value', async () => {
    const onChange = vi.fn()
    render(<SearchInput aria-label="Buscar" value="messi" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))
    expect(onChange).toHaveBeenCalled()
    const event = onChange.mock.calls[0][0]
    expect(event.target.value).toBe('')
  })

  it('calls onClear when provided', async () => {
    const onClear = vi.fn()
    render(
      <SearchInput aria-label="Buscar" value="messi" onChange={() => {}} onClear={onClear} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))
    expect(onClear).toHaveBeenCalledTimes(1)
  })

  it('clears an uncontrolled field and returns focus to the input', async () => {
    render(<SearchInput aria-label="Buscar" defaultValue="messi" />)
    const input = screen.getByLabelText('Buscar') as HTMLInputElement
    expect(input.value).toBe('messi')
    await userEvent.click(screen.getByRole('button', { name: /limpar/i }))
    expect(input.value).toBe('')
    expect(input).toHaveFocus()
  })

  it('shows a loading spinner with an accessible "Buscando" status', () => {
    render(<SearchInput aria-label="Buscar" loading />)
    expect(screen.getByRole('status', { name: /buscando/i })).toBeInTheDocument()
  })

  it('does not show the clear button while loading even with a value', () => {
    render(<SearchInput aria-label="Buscar" value="messi" onChange={() => {}} loading />)
    expect(screen.queryByRole('button', { name: /limpar/i })).not.toBeInTheDocument()
    expect(screen.getByRole('status', { name: /buscando/i })).toBeInTheDocument()
  })

  it('passes the invalid state through to aria-invalid', () => {
    render(<SearchInput invalid aria-label="Buscar" />)
    expect(screen.getByLabelText('Buscar')).toHaveAttribute('aria-invalid', 'true')
  })

  it('forwards a ref to the real input', () => {
    const ref = vi.fn()
    render(<SearchInput ref={ref} aria-label="Buscar" />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })
})
