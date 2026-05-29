import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { TextInput } from './TextInput'

describe('TextInput', () => {
  it('renders a real <input> and forwards arbitrary inputProps', () => {
    render(<TextInput placeholder="nome@email.com" name="email" />)
    const input = screen.getByPlaceholderText('nome@email.com')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('name', 'email')
  })

  it('is a controlled input: reflects value and calls onChange on typing', async () => {
    const onChange = vi.fn()
    render(<TextInput value="abc" onChange={onChange} aria-label="Time" />)
    const input = screen.getByLabelText('Time') as HTMLInputElement
    expect(input.value).toBe('abc')
    await userEvent.type(input, 'd')
    expect(onChange).toHaveBeenCalled()
  })

  it('sets aria-invalid when invalid is true', () => {
    render(<TextInput invalid aria-label="E-mail" />)
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when valid', () => {
    render(<TextInput aria-label="E-mail" />)
    expect(screen.getByLabelText('E-mail')).not.toHaveAttribute('aria-invalid')
  })

  it('reflects the disabled attribute on the real input', () => {
    render(<TextInput disabled aria-label="Time" />)
    expect(screen.getByLabelText('Time')).toBeDisabled()
  })

  it('renders a decorative leading icon hidden from assistive tech', () => {
    const { container } = render(<TextInput leadingIcon="search" aria-label="Buscar" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders a prefix that is aria-hidden but linked to the input via aria-describedby', () => {
    render(<TextInput prefix="R$" aria-label="Orçamento" />)
    const input = screen.getByLabelText('Orçamento')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const affix = document.getElementById(describedBy!.split(' ')[0])
    expect(affix).not.toBeNull()
    expect(affix).toHaveTextContent('R$')
    expect(affix).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders a suffix linked to the input via aria-describedby', () => {
    render(<TextInput suffix="mi" aria-label="Orçamento" />)
    const input = screen.getByLabelText('Orçamento')
    const describedBy = input.getAttribute('aria-describedby')!
    const ids = describedBy.split(' ')
    const affix = ids
      .map((id) => document.getElementById(id))
      .find((el) => el?.textContent === 'mi')
    expect(affix).toBeTruthy()
    expect(affix).toHaveAttribute('aria-hidden', 'true')
  })

  it('preserves a caller-supplied aria-describedby and appends affix ids', () => {
    render(
      <TextInput suffix="mi" aria-label="Orçamento" aria-describedby="help-1" />,
    )
    const input = screen.getByLabelText('Orçamento')
    const describedBy = input.getAttribute('aria-describedby')!
    expect(describedBy.split(' ')).toContain('help-1')
    expect(describedBy.split(' ').length).toBeGreaterThan(1)
  })

  it('forwards a ref to the underlying input element', () => {
    const ref = vi.fn()
    render(<TextInput ref={ref} aria-label="E-mail" />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })
})
