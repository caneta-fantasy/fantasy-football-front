import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Combobox } from './Combobox'

const PLAYERS = [
  { value: 'pedro-henrique', label: 'Pedro Henrique' },
  { value: 'pedro', label: 'Pedro' },
  { value: 'pedrinho', label: 'Pedrinho' },
  { value: 'gabriel', label: 'Gabriel' },
]

describe('Combobox', () => {
  it('renders a real input with role=combobox and the listbox contract attrs', () => {
    render(<Combobox aria-label="Jogador" options={PLAYERS} />)
    const input = screen.getByRole('combobox', { name: 'Jogador' })
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(input).toHaveAttribute('aria-autocomplete', 'list')
  })

  it('opens the listbox on typing and filters options by query (substring, case-insensitive)', async () => {
    render(<Combobox aria-label="Jogador" options={PLAYERS} />)
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'pedr')
    expect(input).toHaveAttribute('aria-expanded', 'true')
    const list = screen.getByRole('listbox')
    const opts = within(list).getAllByRole('option')
    // Pedro Henrique, Pedro, Pedrinho match — Gabriel does not.
    expect(opts).toHaveLength(3)
    expect(within(list).queryByText('Gabriel')).not.toBeInTheDocument()
  })

  it('highlights the real matched substring with a <mark> (§7 query-driven highlight)', async () => {
    render(<Combobox aria-label="Jogador" options={PLAYERS} />)
    await userEvent.type(screen.getByRole('combobox'), 'ped')
    const list = screen.getByRole('listbox')
    const marks = within(list).getAllByText('Ped', { selector: 'mark' })
    // Each matching option highlights the actual matched run.
    expect(marks.length).toBeGreaterThan(0)
    marks.forEach((m) => expect(m.tagName).toBe('MARK'))
  })

  it('moves the active descendant with ArrowDown/ArrowUp (roving via aria-activedescendant)', async () => {
    render(<Combobox aria-label="Jogador" options={PLAYERS} />)
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'pedr')
    await userEvent.keyboard('{ArrowDown}')
    const firstActive = input.getAttribute('aria-activedescendant')
    expect(firstActive).toBeTruthy()
    const activeOpt = document.getElementById(firstActive as string)
    expect(activeOpt).toHaveAttribute('aria-selected', 'true')

    await userEvent.keyboard('{ArrowDown}')
    expect(input.getAttribute('aria-activedescendant')).not.toBe(firstActive)

    await userEvent.keyboard('{ArrowUp}')
    expect(input.getAttribute('aria-activedescendant')).toBe(firstActive)
  })

  it('selects the active option with Enter and calls onSelect, then closes', async () => {
    const onSelect = vi.fn()
    render(
      <Combobox aria-label="Jogador" options={PLAYERS} onSelect={onSelect} />,
    )
    const input = screen.getByRole('combobox') as HTMLInputElement
    await userEvent.type(input, 'pedr')
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(onSelect).toHaveBeenCalledWith(PLAYERS[0])
    expect(input.value).toBe('Pedro Henrique')
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
  })

  it('selects an option on click', async () => {
    const onSelect = vi.fn()
    render(
      <Combobox aria-label="Jogador" options={PLAYERS} onSelect={onSelect} />,
    )
    await userEvent.type(screen.getByRole('combobox'), 'pedr')
    // Pedrinho is the third filtered option (Pedro Henrique, Pedro, Pedrinho).
    const opts = within(screen.getByRole('listbox')).getAllByRole('option')
    await userEvent.click(opts[2])
    expect(onSelect).toHaveBeenCalledWith(PLAYERS[2])
  })

  it('closes the listbox on Escape without selecting', async () => {
    const onSelect = vi.fn()
    render(
      <Combobox aria-label="Jogador" options={PLAYERS} onSelect={onSelect} />,
    )
    const input = screen.getByRole('combobox')
    await userEvent.type(input, 'pedr')
    expect(screen.getByRole('listbox')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
    expect(input).toHaveAttribute('aria-expanded', 'false')
    expect(onSelect).not.toHaveBeenCalled()
  })

  it('shows an empty-state message when nothing matches', async () => {
    render(<Combobox aria-label="Jogador" options={PLAYERS} />)
    await userEvent.type(screen.getByRole('combobox'), 'zzzz')
    expect(screen.queryByRole('option')).not.toBeInTheDocument()
    expect(screen.getByText(/nenhum/i)).toBeInTheDocument()
  })

  it('sets aria-invalid when invalid', () => {
    render(<Combobox aria-label="Jogador" invalid options={PLAYERS} />)
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not throw on empty options', () => {
    expect(() =>
      render(<Combobox aria-label="Jogador" options={[]} />),
    ).not.toThrow()
  })
})
