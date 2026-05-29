import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Stepper } from './Stepper'

/** Controlled wrapper so increment/decrement actually move the value. */
function Controlled({
  initial = 2,
  min = 1,
  max = 3,
  step = 1,
  onChange,
}: {
  initial?: number
  min?: number
  max?: number
  step?: number
  onChange?: (v: number) => void
}) {
  const [v, setV] = React.useState(initial)
  return (
    <Stepper
      label="Multiplicador do capitão"
      value={v}
      min={min}
      max={max}
      step={step}
      onChange={(next) => {
        setV(next)
        onChange?.(next)
      }}
    />
  )
}

describe('Stepper', () => {
  it('renders +/- as real <button> elements with accessible labels', () => {
    render(
      <Stepper
        label="Multiplicador"
        value={2}
        min={1}
        max={3}
        onChange={() => {}}
      />,
    )
    const inc = screen.getByRole('button', { name: /aumentar/i })
    const dec = screen.getByRole('button', { name: /diminuir/i })
    expect(inc.tagName.toLowerCase()).toBe('button')
    expect(dec.tagName.toLowerCase()).toBe('button')
    // explicit type so they never submit a surrounding form
    expect(inc).toHaveAttribute('type', 'button')
    expect(dec).toHaveAttribute('type', 'button')
  })

  it('exposes the value as a spinbutton with aria-valuemin/max/now', () => {
    render(
      <Stepper
        label="Multiplicador"
        value={2}
        min={1}
        max={3}
        onChange={() => {}}
      />,
    )
    const spin = screen.getByRole('spinbutton', { name: 'Multiplicador' })
    expect(spin).toHaveAttribute('aria-valuemin', '1')
    expect(spin).toHaveAttribute('aria-valuemax', '3')
    expect(spin).toHaveAttribute('aria-valuenow', '2')
  })

  it('increments and decrements within bounds', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={2} min={1} max={3} onChange={onChange} />)
    const spin = screen.getByRole('spinbutton')

    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }))
    expect(spin).toHaveAttribute('aria-valuenow', '3')
    expect(onChange).toHaveBeenLastCalledWith(3)

    await userEvent.click(screen.getByRole('button', { name: /diminuir/i }))
    expect(spin).toHaveAttribute('aria-valuenow', '2')
    expect(onChange).toHaveBeenLastCalledWith(2)
  })

  it('disables the increment button at the upper bound', () => {
    render(
      <Stepper label="Mult" value={3} min={1} max={3} onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /aumentar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /diminuir/i })).not.toBeDisabled()
  })

  it('disables the decrement button at the lower bound', () => {
    render(
      <Stepper label="Mult" value={1} min={1} max={3} onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /diminuir/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /aumentar/i })).not.toBeDisabled()
  })

  it('does not call onChange when clicking a disabled bound button', async () => {
    const onChange = vi.fn()
    render(
      <Stepper label="Mult" value={3} min={1} max={3} onChange={onChange} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('honors a custom step', async () => {
    const onChange = vi.fn()
    render(<Controlled initial={0} min={0} max={10} step={5} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /aumentar/i }))
    expect(onChange).toHaveBeenLastCalledWith(5)
  })

  it('supports keyboard ArrowUp / ArrowDown on the value', async () => {
    render(<Controlled initial={2} min={1} max={3} />)
    const spin = screen.getByRole('spinbutton')
    spin.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(spin).toHaveAttribute('aria-valuenow', '3')
    await userEvent.keyboard('{ArrowDown}')
    expect(spin).toHaveAttribute('aria-valuenow', '2')
  })

  it('does not exceed bounds via keyboard', async () => {
    render(<Controlled initial={3} min={1} max={3} />)
    const spin = screen.getByRole('spinbutton')
    spin.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(spin).toHaveAttribute('aria-valuenow', '3')
  })

  it('formats the displayed value when a formatValue prop is given', () => {
    render(
      <Stepper
        label="Multiplicador"
        value={2}
        min={1}
        max={3}
        onChange={() => {}}
        formatValue={(v) => `×${v}`}
      />,
    )
    expect(screen.getByText('×2')).toBeInTheDocument()
    // the raw numeric value still drives the a11y contract
    expect(screen.getByRole('spinbutton')).toHaveAttribute('aria-valuenow', '2')
  })

  it('can be fully disabled', () => {
    render(
      <Stepper label="Mult" value={2} min={1} max={3} disabled onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /aumentar/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /diminuir/i })).toBeDisabled()
  })
})
