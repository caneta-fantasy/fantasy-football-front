import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Chip } from './Chip'

describe('Chip', () => {
  it('renders a non-interactive <span> by default (no role)', () => {
    render(<Chip>Líder</Chip>)
    const el = screen.getByText('Líder')
    expect(el.tagName.toLowerCase()).toBe('span')
    // a plain span is not exposed as a button/interactive role
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('upgrades to a real <button> when interactive', () => {
    const onClick = vi.fn()
    render(
      <Chip interactive onClick={onClick}>
        Filtrar
      </Chip>,
    )
    const btn = screen.getByRole('button', { name: 'Filtrar' })
    expect(btn.tagName.toLowerCase()).toBe('button')
    // native buttons carry an implicit type, the DS sets it explicitly
    expect(btn).toHaveAttribute('type', 'button')
  })

  it('fires onClick when an interactive chip is activated', async () => {
    const onClick = vi.fn()
    render(
      <Chip interactive onClick={onClick}>
        Filtrar
      </Chip>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Filtrar' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('is keyboard-focusable and activates with Enter/Space when interactive', async () => {
    const onClick = vi.fn()
    render(
      <Chip interactive onClick={onClick}>
        Filtrar
      </Chip>,
    )
    const btn = screen.getByRole('button', { name: 'Filtrar' })
    await userEvent.tab()
    expect(btn).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await userEvent.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('falls back to the green tone for an unknown tone without throwing', () => {
    let result!: ReturnType<typeof render>
    expect(() => {
      result = render(
        // @ts-expect-error testing runtime fallback for an unknown tone
        <Chip tone="nope">x</Chip>,
      )
    }).not.toThrow()
    // the unknown tone resolves to the default `green` tone classes
    expect(result.getByText('x').className).toContain('bg-signature')
  })

  it('renders a CSS-animated live dot for the live tone', () => {
    const { container } = render(<Chip tone="live">Ao vivo</Chip>)
    const dot = container.querySelector('.ds-chip-dot')
    expect(dot).not.toBeNull()
    // decorative — must not be announced to assistive tech
    expect(dot).toHaveAttribute('aria-hidden', 'true')
  })

  it('does not render a live dot for non-live tones', () => {
    const { container } = render(<Chip tone="green">Capitão</Chip>)
    expect(container.querySelector('.ds-chip-dot')).toBeNull()
  })

  it('reconciles the reserved red tone away from white-on-card-red — §7 #3 AA fix', () => {
    render(
      <Chip tone="red">
        Vermelho
      </Chip>,
    )
    const el = screen.getByText('Vermelho')
    // The card-red carries the referee tone via the BORDER, not the fill: the
    // text is ink on the red tint (12.3:1), never white-on-card-red.
    // (Tailwind utilities aren't compiled in jsdom, so we assert the
    // token-bearing classes rather than the resolved colors.)
    expect(el.className).toContain('text-ink')
    expect(el.className).toContain('border-card-red')
    expect(el.className).not.toContain('bg-card-red')
    expect(el.className).not.toMatch(/text-white/)
  })

  it('carries a 1.5px border on every tone', () => {
    const tones = [
      'green',
      'gold',
      'cobalt',
      'success',
      'white',
      'ghost',
      'live',
      'yellow',
      'red',
    ] as const
    for (const tone of tones) {
      const { container, unmount } = render(<Chip tone={tone}>{tone}</Chip>)
      expect(container.firstElementChild?.className).toContain('border-[1.5px]')
      unmount()
    }
  })

  it('disabled interactive chip is disabled and carries a non-color cue + sr text', () => {
    render(
      <Chip interactive disabled>
        Indisponível
      </Chip>,
    )
    const btn = screen.getByRole('button', { name: /indisponível/i })
    expect(btn).toBeDisabled()
    // non-color cue: a line-through is applied (not color-only)
    expect(btn.className).toMatch(/line-through/)
    // a visually-hidden cue announces the disabled state to AT
    expect(screen.getByText('(desativado)')).toBeInTheDocument()
  })

  it('a non-interactive disabled chip exposes aria-disabled and the sr cue', () => {
    render(
      <Chip disabled>
        Esgotado
      </Chip>,
    )
    const el = screen.getByText(/esgotado/i)
    expect(el).toHaveAttribute('aria-disabled', 'true')
    expect(screen.getByText('(desativado)')).toBeInTheDocument()
  })

  it('forwards className and arbitrary props', () => {
    render(
      <Chip className="extra" data-testid="my-chip">
        Tag
      </Chip>,
    )
    const el = screen.getByTestId('my-chip')
    expect(el).toHaveClass('extra')
  })
})
