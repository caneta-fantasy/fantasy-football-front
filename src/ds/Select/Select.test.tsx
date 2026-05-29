import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Select } from './Select'

const OPTIONS = [
  { value: '4-3-3', label: '4-3-3' },
  { value: '4-4-2', label: '4-4-2' },
  { value: '3-5-2', label: '3-5-2' },
]

describe('Select', () => {
  it('renders a real native <select> with its options', () => {
    render(
      <Select aria-label="Formação" options={OPTIONS} defaultValue="4-3-3" />,
    )
    const select = screen.getByRole('combobox', { name: 'Formação' })
    expect(select.tagName).toBe('SELECT')
    expect(screen.getByRole('option', { name: '4-4-2' })).toBeInTheDocument()
  })

  it('associates with a label via id (getByLabelText)', () => {
    render(
      <>
        <label htmlFor="formacao">Formação</label>
        <Select id="formacao" options={OPTIONS} />
      </>,
    )
    expect(screen.getByLabelText('Formação').tagName).toBe('SELECT')
  })

  it('renders an optional placeholder as a disabled first option', () => {
    render(
      <Select aria-label="Posição" placeholder="Selecione…" options={OPTIONS} />,
    )
    const placeholder = screen.getByRole('option', {
      name: 'Selecione…',
    }) as HTMLOptionElement
    expect(placeholder.disabled).toBe(true)
    expect(placeholder.value).toBe('')
  })

  it('supports option children in addition to the options prop', () => {
    render(
      <Select aria-label="Time">
        <option value="pal">Palmeiras</option>
        <option value="fla">Flamengo</option>
      </Select>,
    )
    expect(screen.getByRole('option', { name: 'Palmeiras' })).toBeInTheDocument()
  })

  it('sets aria-invalid when invalid is true', () => {
    render(<Select aria-label="Formação" invalid options={OPTIONS} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when valid', () => {
    render(<Select aria-label="Formação" options={OPTIONS} />)
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-invalid')
  })

  it('fires onChange and is controllable', async () => {
    const onChange = vi.fn()
    render(
      <Select
        aria-label="Formação"
        value="4-3-3"
        onChange={onChange}
        options={OPTIONS}
      />,
    )
    await userEvent.selectOptions(screen.getByRole('combobox'), '4-4-2')
    expect(onChange).toHaveBeenCalled()
  })

  it('disables the control when disabled', () => {
    render(<Select aria-label="Formação" disabled options={OPTIONS} />)
    expect(screen.getByRole('combobox')).toBeDisabled()
  })

  it('falls back to the md size for an unknown size without throwing', () => {
    expect(() =>
      render(
        // @ts-expect-error testing runtime fallback
        <Select aria-label="x" size="nope" options={OPTIONS} />,
      ),
    ).not.toThrow()
  })
})
