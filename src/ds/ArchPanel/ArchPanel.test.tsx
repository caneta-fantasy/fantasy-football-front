import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArchPanel } from './ArchPanel'

describe('ArchPanel', () => {
  it('renders its children as real content in the a11y tree', () => {
    render(
      <ArchPanel>
        <h2>Tabela</h2>
        <p>Rodada 12</p>
      </ArchPanel>
    )
    // Content is a real heading/paragraph — not hidden.
    expect(screen.getByRole('heading', { name: 'Tabela' })).toBeInTheDocument()
    expect(screen.getByText('Rodada 12')).toBeInTheDocument()
  })

  it('is a generic container (not aria-hidden) so content is announced', () => {
    const { container } = render(<ArchPanel>content</ArchPanel>)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.tagName).toBe('DIV')
    expect(panel).not.toHaveAttribute('aria-hidden')
  })

  it('sweeps the top corners (border-radius arch arch 0 0) and clips overflow', () => {
    const { container } = render(<ArchPanel arch={120}>x</ArchPanel>)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.borderRadius).toBe('120px 120px 0 0')
    expect(panel.style.overflow).toBe('hidden')
    // A positioned container so inner decorative layers can fill it.
    expect(panel.style.position).toBe('relative')
  })

  it('honours an explicit arch radius and a 0 (hard-edge) radius', () => {
    const { container, rerender } = render(<ArchPanel arch={80}>x</ArchPanel>)
    let panel = container.firstElementChild as HTMLElement
    expect(panel.style.borderRadius).toBe('80px 80px 0 0')
    rerender(<ArchPanel arch={0}>x</ArchPanel>)
    panel = container.firstElementChild as HTMLElement
    expect(panel.style.borderRadius).toBe('0px 0px 0 0')
  })

  it('defaults to the green tone with its contrast-paired on-green text', () => {
    const { container } = render(<ArchPanel>x</ArchPanel>)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe('var(--color-signature)')
    expect(panel.style.color).toBe('var(--color-on-signature)')
  })

  it.each([
    ['gold', 'var(--color-accent)', 'var(--color-on-accent)'],
    ['cobalt', 'var(--color-interactive)', 'var(--color-on-interactive)'],
    ['paper', 'var(--color-surface)', 'var(--color-text)'],
  ] as const)('pairs %s bg with a contrast-checked fg', (tone, bg, fg) => {
    const { container } = render(<ArchPanel tone={tone}>x</ArchPanel>)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe(bg)
    expect(panel.style.color).toBe(fg)
  })

  it('keeps the tone foreground when only bg is overridden (contrast preserved)', () => {
    const { container } = render(<ArchPanel tone="green" bg="var(--green-deep)">x</ArchPanel>)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe('var(--green-deep)')
    // fg still the on-green pairing, not flipped to ink.
    expect(panel.style.color).toBe('var(--color-on-signature)')
  })

  it('lets bg and color be overridden together for bespoke compositions', () => {
    const { container } = render(
      <ArchPanel bg="var(--gold-pale)" color="var(--gold-deep)">x</ArchPanel>
    )
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe('var(--gold-pale)')
    expect(panel.style.color).toBe('var(--gold-deep)')
  })

  it('applies the pad shorthand (DS default 32px 34px)', () => {
    const { container } = render(<ArchPanel>x</ArchPanel>)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.padding).toBe('32px 34px')
  })

  it('falls back to the default arch for an invalid/negative radius (no throw)', () => {
    let panel: HTMLElement | null = null
    expect(() => {
      const { container } = render(<ArchPanel arch={-10}>x</ArchPanel>)
      panel = container.firstElementChild as HTMLElement
    }).not.toThrow()
    expect(panel!.style.borderRadius).toBe('120px 120px 0 0')
  })

  it('falls back to the green tone for an unknown tone key (no throw)', () => {
    let panel: HTMLElement | null = null
    expect(() => {
      const { container } = render(
        // @ts-expect-error testing runtime fallback for an unknown tone key
        <ArchPanel tone="chartreuse">x</ArchPanel>
      )
      panel = container.firstElementChild as HTMLElement
    }).not.toThrow()
    expect(panel!.style.background).toBe('var(--color-signature)')
    expect(panel!.style.color).toBe('var(--color-on-signature)')
  })

  it('forwards className and merges inline style overrides', () => {
    const { container } = render(
      <ArchPanel className="shadow-e2" style={{ minHeight: '120px' }}>
        x
      </ArchPanel>
    )
    const panel = container.firstElementChild as HTMLElement
    expect(panel.className).toContain('shadow-e2')
    expect(panel.style.minHeight).toBe('120px')
  })
})
