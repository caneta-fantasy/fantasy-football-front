import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Checkbox } from './Checkbox'

describe('Checkbox', () => {
  it('renders a real native checkbox input', () => {
    render(<Checkbox label="Manter conectado" />)
    const cb = screen.getByRole('checkbox', { name: 'Manter conectado' })
    expect(cb).toBeInTheDocument()
    expect(cb.tagName).toBe('INPUT')
    expect(cb).toHaveAttribute('type', 'checkbox')
  })

  it('associates the label with the input (clicking the label toggles it)', async () => {
    render(<Checkbox label="Aceito os termos" />)
    const cb = screen.getByRole('checkbox') as HTMLInputElement
    expect(cb.checked).toBe(false)
    await userEvent.click(screen.getByText('Aceito os termos'))
    expect(cb.checked).toBe(true)
  })

  it('fires onChange with the native event', async () => {
    const onChange = vi.fn()
    render(<Checkbox label="Notificações" onChange={onChange} />)
    await userEvent.click(screen.getByRole('checkbox'))
    expect(onChange).toHaveBeenCalledTimes(1)
  })

  it('reflects the indeterminate state on the DOM node', () => {
    render(<Checkbox label="Selecionar todos" indeterminate />)
    const cb = screen.getByRole('checkbox') as HTMLInputElement
    expect(cb.indeterminate).toBe(true)
  })

  it('honors the disabled state', () => {
    render(<Checkbox label="Travado" disabled />)
    expect(screen.getByRole('checkbox')).toBeDisabled()
  })

  it('respects a caller-provided id and links the label to it', () => {
    render(<Checkbox id="terms" label="Termos" />)
    const cb = screen.getByRole('checkbox')
    expect(cb).toHaveAttribute('id', 'terms')
    expect(screen.getByText('Termos').closest('label')).toHaveAttribute(
      'for',
      'terms',
    )
  })

  it('supports a controlled checked state', () => {
    render(<Checkbox label="Ligado" checked readOnly />)
    expect((screen.getByRole('checkbox') as HTMLInputElement).checked).toBe(true)
  })
})
