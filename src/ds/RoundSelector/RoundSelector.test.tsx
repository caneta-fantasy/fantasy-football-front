import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { RoundSelector } from './RoundSelector'

const ROUNDS = [10, 11, 12, 13]

describe('RoundSelector', () => {
  it('renders a labelled native select with one option per round', () => {
    render(<RoundSelector rounds={ROUNDS} value={12} onChange={() => {}} />)
    const select = screen.getByRole('combobox', { name: /selecionar rodada/i })
    expect(select).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(ROUNDS.length)
  })

  it('shows the selected round number in the display and reflects it on the select', () => {
    render(<RoundSelector rounds={ROUNDS} value={12} onChange={() => {}} />)
    // The visible display span + the matching <option> both read "Rodada 12".
    expect(screen.getAllByText('Rodada 12').length).toBeGreaterThan(0)
    expect(
      screen.getByRole('combobox', { name: /selecionar rodada/i }),
    ).toHaveValue('12')
  })

  it('emits onChange with the previous round when the back arrow is clicked', async () => {
    const onChange = vi.fn()
    render(<RoundSelector rounds={ROUNDS} value={12} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /rodada anterior/i }))
    expect(onChange).toHaveBeenCalledWith(11)
  })

  it('emits onChange with the next round when the forward arrow is clicked', async () => {
    const onChange = vi.fn()
    render(<RoundSelector rounds={ROUNDS} value={12} onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /próxima rodada/i }))
    expect(onChange).toHaveBeenCalledWith(13)
  })

  it('disables the back arrow at the first round and the forward arrow at the last', () => {
    const { rerender } = render(
      <RoundSelector rounds={ROUNDS} value={10} onChange={() => {}} />,
    )
    expect(screen.getByRole('button', { name: /rodada anterior/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /próxima rodada/i })).toBeEnabled()

    rerender(<RoundSelector rounds={ROUNDS} value={13} onChange={() => {}} />)
    expect(screen.getByRole('button', { name: /rodada anterior/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /próxima rodada/i })).toBeDisabled()
  })

  it('emits onChange when a new option is selected', async () => {
    const onChange = vi.fn()
    render(<RoundSelector rounds={ROUNDS} value={12} onChange={onChange} />)
    await userEvent.selectOptions(
      screen.getByRole('combobox', { name: /selecionar rodada/i }),
      '13',
    )
    expect(onChange).toHaveBeenCalledWith(13)
  })

  it('renders the Atual chip on the current round and the Mata-mata chip on playoff rounds', () => {
    render(
      <RoundSelector
        rounds={ROUNDS}
        value={13}
        currentRound={13}
        isPlayoff={(r) => r >= 13}
        onChange={() => {}}
      />,
    )
    expect(screen.getByText('Atual')).toBeInTheDocument()
    expect(screen.getByText('Mata-mata')).toBeInTheDocument()
  })
})
