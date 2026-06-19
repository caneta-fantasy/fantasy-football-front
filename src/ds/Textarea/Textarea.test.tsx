import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { Textarea } from './Textarea'

describe('Textarea', () => {
  it('renders a real textarea element', () => {
    render(<Textarea aria-label="Comentário" />)
    const el = screen.getByRole('textbox', { name: 'Comentário' })
    expect(el).toBeInTheDocument()
    expect(el.tagName).toBe('TEXTAREA')
  })

  it('is controllable and calls onChange', async () => {
    const onChange = vi.fn()
    render(<Textarea aria-label="Comentário" value="" onChange={onChange} />)
    await userEvent.type(screen.getByRole('textbox'), 'oi')
    expect(onChange).toHaveBeenCalled()
  })

  it('renders no counter when maxLength is not given', () => {
    render(<Textarea aria-label="Comentário" defaultValue="texto" />)
    expect(screen.queryByText(/\d+\s*\/\s*\d+/)).not.toBeInTheDocument()
  })

  it('renders a character counter as current / max when maxLength is set', () => {
    render(
      <Textarea aria-label="Comentário" maxLength={280} defaultValue="abc" />,
    )
    expect(screen.getByText('3 / 280')).toBeInTheDocument()
  })

  it('links the counter to the textarea via aria-describedby', () => {
    render(<Textarea aria-label="Comentário" maxLength={280} defaultValue="abc" />)
    const el = screen.getByRole('textbox')
    const described = el.getAttribute('aria-describedby')
    expect(described).toBeTruthy()
    const counter = screen.getByText('3 / 280')
    // The counter element (or its container) carries the referenced id.
    const ids = (described ?? '').split(' ')
    const linked = ids.some(
      (id) => counter.id === id || counter.closest(`#${id}`) !== null,
    )
    expect(linked).toBe(true)
  })

  it('preserves a caller-supplied aria-describedby and appends the counter id', () => {
    render(
      <Textarea
        aria-label="Comentário"
        aria-describedby="external-help"
        maxLength={280}
        defaultValue="abc"
      />,
    )
    const described = screen.getByRole('textbox').getAttribute('aria-describedby')
    expect(described).toContain('external-help')
    expect((described ?? '').split(' ').length).toBeGreaterThan(1)
  })

  it('updates the counter as the user types (controlled)', async () => {
    function Wrap() {
      const [v, setV] = useState('')
      return (
        <Textarea
          aria-label="Comentário"
          maxLength={10}
          value={v}
          onChange={(e) => setV(e.target.value)}
        />
      )
    }
    render(<Wrap />)
    expect(screen.getByText('0 / 10')).toBeInTheDocument()
    await userEvent.type(screen.getByRole('textbox'), 'hello')
    expect(screen.getByText('5 / 10')).toBeInTheDocument()
  })

  it('shows the near-limit warning state as the value approaches max', () => {
    // 9 of 10 -> >= 80% near-limit warning (yellow), not over.
    render(<Textarea aria-label="Comentário" maxLength={10} defaultValue="123456789" />)
    const counter = screen.getByText('9 / 10')
    expect(counter).toHaveAttribute('data-counter-state', 'near')
  })

  it('flags over-limit and sets aria-invalid when the value exceeds max', () => {
    // hardLimit defaults off so the value can exceed maxLength.
    render(
      <Textarea
        aria-label="Comentário"
        maxLength={5}
        hardLimit={false}
        defaultValue="abcdefgh"
      />,
    )
    const counter = screen.getByText('8 / 5')
    expect(counter).toHaveAttribute('data-counter-state', 'over')
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not let the native control exceed max when hardLimit is set', () => {
    render(
      <Textarea
        aria-label="Comentário"
        maxLength={5}
        hardLimit
        defaultValue="abc"
      />,
    )
    // hardLimit relies on the native maxLength attribute on the textarea.
    expect(screen.getByRole('textbox')).toHaveAttribute('maxlength', '5')
  })

  it('reflects an explicit invalid prop on the control', () => {
    render(<Textarea aria-label="Comentário" invalid />)
    expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true')
  })

  it('exposes a neutral counter state below the warning threshold', () => {
    render(<Textarea aria-label="Comentário" maxLength={100} defaultValue="abc" />)
    expect(screen.getByText('3 / 100')).toHaveAttribute(
      'data-counter-state',
      'ok',
    )
  })

  it('forwards a ref to the underlying textarea', () => {
    const ref = { current: null as HTMLTextAreaElement | null }
    render(<Textarea aria-label="Comentário" ref={ref} />)
    expect(ref.current).toBeInstanceOf(HTMLTextAreaElement)
  })
})
