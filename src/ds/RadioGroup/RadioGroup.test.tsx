import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RadioGroup } from './RadioGroup'
import { Radio } from '../Radio/Radio'

const renderGroup = (props: Partial<React.ComponentProps<typeof RadioGroup>> = {}) =>
  render(
    <RadioGroup label="Tipo de draft" name="draft" {...props}>
      <Radio value="snake" label="Snake" />
      <Radio value="linear" label="Linear" />
      <Radio value="auction" label="Auction" />
    </RadioGroup>,
  )

describe('RadioGroup / Radio', () => {
  it('renders a radiogroup labelled by its label', () => {
    renderGroup()
    expect(
      screen.getByRole('radiogroup', { name: 'Tipo de draft' }),
    ).toBeInTheDocument()
  })

  it('renders real native radio inputs for each option', () => {
    renderGroup()
    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
    radios.forEach((r) => {
      expect(r.tagName).toBe('INPUT')
      expect(r).toHaveAttribute('type', 'radio')
    })
  })

  it('shares the group name across all radios', () => {
    renderGroup()
    screen
      .getAllByRole('radio')
      .forEach((r) => expect(r).toHaveAttribute('name', 'draft'))
  })

  it('checks the radio matching the controlled value', () => {
    renderGroup({ value: 'linear' })
    expect(screen.getByRole('radio', { name: 'Linear' })).toBeChecked()
    expect(screen.getByRole('radio', { name: 'Snake' })).not.toBeChecked()
  })

  it('reports the selected value through onChange', async () => {
    const onChange = vi.fn()
    renderGroup({ value: 'snake', onChange })
    await userEvent.click(screen.getByRole('radio', { name: 'Auction' }))
    expect(onChange).toHaveBeenCalledWith('auction')
  })

  it('implements roving tabindex: only the selected radio is tabbable', () => {
    renderGroup({ value: 'linear' })
    expect(screen.getByRole('radio', { name: 'Linear' })).toHaveAttribute(
      'tabindex',
      '0',
    )
    expect(screen.getByRole('radio', { name: 'Snake' })).toHaveAttribute(
      'tabindex',
      '-1',
    )
  })

  it('when nothing is selected, only the first radio is tabbable', () => {
    renderGroup()
    const radios = screen.getAllByRole('radio')
    expect(radios[0]).toHaveAttribute('tabindex', '0')
    expect(radios[1]).toHaveAttribute('tabindex', '-1')
  })

  it('moves focus and selection with ArrowDown/ArrowRight (roving)', async () => {
    const onChange = vi.fn()
    renderGroup({ value: 'snake', onChange })
    const snake = screen.getByRole('radio', { name: 'Snake' })
    snake.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith('linear')
    expect(screen.getByRole('radio', { name: 'Linear' })).toHaveFocus()
  })

  it('wraps from the last to the first with ArrowDown', async () => {
    const onChange = vi.fn()
    renderGroup({ value: 'auction', onChange })
    const auction = screen.getByRole('radio', { name: 'Auction' })
    auction.focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith('snake')
  })

  it('moves backwards with ArrowUp/ArrowLeft', async () => {
    const onChange = vi.fn()
    renderGroup({ value: 'linear', onChange })
    const linear = screen.getByRole('radio', { name: 'Linear' })
    linear.focus()
    await userEvent.keyboard('{ArrowUp}')
    expect(onChange).toHaveBeenLastCalledWith('snake')
  })

  it('skips disabled radios during arrow navigation', async () => {
    const onChange = vi.fn()
    render(
      <RadioGroup label="Modo" name="modo" value="a" onChange={onChange}>
        <Radio value="a" label="A" />
        <Radio value="b" label="B" disabled />
        <Radio value="c" label="C" />
      </RadioGroup>,
    )
    screen.getByRole('radio', { name: 'A' }).focus()
    await userEvent.keyboard('{ArrowDown}')
    expect(onChange).toHaveBeenLastCalledWith('c')
  })

  it('marks the group required via aria-required', () => {
    renderGroup({ required: true })
    expect(screen.getByRole('radiogroup')).toHaveAttribute(
      'aria-required',
      'true',
    )
  })
})
