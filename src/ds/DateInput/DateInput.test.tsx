import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { DateInput } from './DateInput'

describe('DateInput', () => {
  it('renders a real native date input', () => {
    render(<DateInput aria-label="Data limite" />)
    const input = screen.getByLabelText('Data limite')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('type', 'date')
  })

  it('is controlled: reflects value and calls onChange on input', () => {
    const onChange = vi.fn()
    render(
      <DateInput
        value="2026-05-29"
        onChange={onChange}
        aria-label="Data limite"
      />,
    )
    const input = screen.getByLabelText('Data limite') as HTMLInputElement
    expect(input.value).toBe('2026-05-29')
    // Native date inputs emit a single change with the new ISO value rather
    // than per-keystroke input events, so simulate the realistic change.
    fireEvent.change(input, { target: { value: '2026-06-01' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('forwards min and max bounds to the native input', () => {
    render(
      <DateInput
        aria-label="Data"
        min="2026-01-01"
        max="2026-12-31"
      />,
    )
    const input = screen.getByLabelText('Data')
    expect(input).toHaveAttribute('min', '2026-01-01')
    expect(input).toHaveAttribute('max', '2026-12-31')
  })

  it('sets aria-invalid when invalid is true', () => {
    render(<DateInput invalid aria-label="Data" />)
    expect(screen.getByLabelText('Data')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid when valid', () => {
    render(<DateInput aria-label="Data" />)
    expect(screen.getByLabelText('Data')).not.toHaveAttribute('aria-invalid')
  })

  it('reflects the disabled attribute on the real input', () => {
    render(<DateInput disabled aria-label="Data" />)
    expect(screen.getByLabelText('Data')).toBeDisabled()
  })

  it('renders a decorative leading calendar icon hidden from assistive tech', () => {
    const { container } = render(<DateInput aria-label="Data" />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeNull()
    expect(svg).toHaveAttribute('aria-hidden', 'true')
  })

  it('falls back to the default size for an unknown size without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<DateInput size="nope" aria-label="Data" />),
    ).not.toThrow()
  })

  it('forwards a ref to the underlying input element', () => {
    const ref = vi.fn()
    render(<DateInput ref={ref} aria-label="Data" />)
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('forwards arbitrary input props (name, required)', () => {
    render(<DateInput name="deadline" required aria-label="Data" />)
    const input = screen.getByLabelText('Data')
    expect(input).toHaveAttribute('name', 'deadline')
    expect(input).toBeRequired()
  })
})
