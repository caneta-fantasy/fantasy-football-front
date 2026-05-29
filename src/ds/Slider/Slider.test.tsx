import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import React from 'react'
import { Slider } from './Slider'

describe('Slider', () => {
  it('renders a real <input type="range"> with the slider role', () => {
    render(<Slider aria-label="Preço" />)
    const slider = screen.getByRole('slider', { name: 'Preço' })
    expect(slider.tagName.toLowerCase()).toBe('input')
    expect(slider).toHaveAttribute('type', 'range')
  })

  it('exposes aria-valuemin / aria-valuemax / aria-valuenow', () => {
    render(
      <Slider aria-label="Preço" min={1} max={9} value={5} onChange={() => {}} />,
    )
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '1')
    expect(slider).toHaveAttribute('aria-valuemax', '9')
    expect(slider).toHaveAttribute('aria-valuenow', '5')
  })

  it('defaults to the 0–100 range when min/max are omitted', () => {
    render(<Slider aria-label="Volume" value={40} onChange={() => {}} />)
    const slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuemin', '0')
    expect(slider).toHaveAttribute('aria-valuemax', '100')
    expect(slider).toHaveAttribute('aria-valuenow', '40')
  })

  // jsdom does not implement the native range keyboard model (ArrowRight does
  // not move the value), so a controlled move is simulated with a change event —
  // the same path the browser's keyboard/drag interactions ultimately fire.
  it('keeps aria-valuenow in sync when the value changes', () => {
    function Controlled() {
      const [v, setV] = React.useState(5)
      return (
        <Slider
          aria-label="Preço"
          min={0}
          max={10}
          value={v}
          onChange={(e) => setV(Number(e.target.value))}
        />
      )
    }
    render(<Controlled />)
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '6' } })
    expect(slider).toHaveAttribute('aria-valuenow', '6')
  })

  it('fires onChange when the value moves', () => {
    const onChange = vi.fn()
    render(
      <Slider aria-label="Preço" min={0} max={10} value={5} onChange={onChange} />,
    )
    const slider = screen.getByRole('slider')
    fireEvent.change(slider, { target: { value: '6' } })
    expect(onChange).toHaveBeenCalled()
  })

  it('exposes the fill percentage via a CSS custom property for the track', () => {
    const { container } = render(
      <Slider aria-label="Preço" min={0} max={10} value={5} onChange={() => {}} />,
    )
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement
    // 5 of 0..10 → 50%; the value-driven fill is exposed for the gradient track.
    expect(slider.style.getPropertyValue('--ds-slider-fill')).toBe('50%')
  })

  it('clamps the fill percentage for an out-of-range value without throwing', () => {
    const { container } = render(
      <Slider aria-label="Preço" min={0} max={10} value={20} onChange={() => {}} />,
    )
    const slider = container.querySelector('input[type="range"]') as HTMLInputElement
    expect(slider.style.getPropertyValue('--ds-slider-fill')).toBe('100%')
  })

  it('can be disabled', () => {
    render(<Slider aria-label="Preço" disabled />)
    expect(screen.getByRole('slider')).toBeDisabled()
  })

  it('forwards id so a <label htmlFor> can associate', () => {
    render(
      <>
        <label htmlFor="price">Preço</label>
        <Slider id="price" />
      </>,
    )
    expect(screen.getByLabelText('Preço')).toHaveAttribute('type', 'range')
  })
})
