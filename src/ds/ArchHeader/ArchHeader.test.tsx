import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ArchHeader } from './ArchHeader'

describe('ArchHeader', () => {
  it('renders the title as a real heading in the document outline (default h2)', () => {
    render(<ArchHeader title="Tabela" />)
    const heading = screen.getByRole('heading', { name: 'Tabela', level: 2 })
    expect(heading.tagName).toBe('H2')
  })

  it('honours the level prop to set the heading rank', () => {
    render(<ArchHeader title="Jogadores" level={1} />)
    const heading = screen.getByRole('heading', { name: 'Jogadores', level: 1 })
    expect(heading.tagName).toBe('H1')
  })

  it('lets `as` override level to pick the heading element', () => {
    render(<ArchHeader title="Times" as="h3" level={1} />)
    // `as` wins over level.
    const heading = screen.getByRole('heading', { name: 'Times', level: 3 })
    expect(heading.tagName).toBe('H3')
  })

  it('falls back to h2 for an out-of-range level (no throw)', () => {
    render(
      // @ts-expect-error testing runtime fallback for an invalid level
      <ArchHeader title="Fallback" level={9} />,
    )
    expect(
      screen.getByRole('heading', { name: 'Fallback', level: 2 }),
    ).toBeInTheDocument()
  })

  it('renders the eyebrow as a sibling label, NOT folded into the heading text', () => {
    render(<ArchHeader eyebrow="Rodada 12" title="Tabela" />)
    // The eyebrow text is present and announceable…
    const eyebrow = screen.getByText('Rodada 12')
    expect(eyebrow).toBeInTheDocument()
    // …but the heading's accessible name is ONLY the title (outline is clean).
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveAccessibleName('Tabela')
    expect(heading).not.toHaveTextContent('Rodada 12')
    // The eyebrow is a separate node from the heading.
    expect(heading.contains(eyebrow)).toBe(false)
  })

  it('omits the eyebrow when none is given', () => {
    render(<ArchHeader title="Sem eyebrow" />)
    // Only the heading is present; no stray overline node.
    const heading = screen.getByRole('heading', { name: 'Sem eyebrow' })
    expect(heading).toBeInTheDocument()
  })

  it('renders the optional right slot content in the a11y tree', () => {
    render(
      <ArchHeader
        title="Meu Time"
        right={<button type="button">Editar</button>}
      />,
    )
    expect(
      screen.getByRole('button', { name: 'Editar' }),
    ).toBeInTheDocument()
  })

  it('renders the azulejo pattern layer as decorative (aria-hidden + non-interactive)', () => {
    const { container } = render(
      <ArchHeader title="Com azulejo" pattern="azulejo" />,
    )
    const decor = container.querySelector('[aria-hidden="true"]')
    expect(decor).not.toBeNull()
    expect(decor).toHaveStyle({ pointerEvents: 'none' })
    // Decoration carries no announceable text.
    expect(decor).toHaveTextContent('')
  })

  it('renders the pitch pattern layer as a decorative aria-hidden svg', () => {
    const { container } = render(
      <ArchHeader title="Com pitch" pattern="pitch" />,
    )
    const decor = container.querySelector('svg[aria-hidden="true"]')
    expect(decor).not.toBeNull()
    expect(decor).toHaveStyle({ pointerEvents: 'none' })
  })

  it('renders no decorative layer when pattern is none (the default)', () => {
    const { container } = render(<ArchHeader title="Sem padrão" />)
    expect(container.querySelector('[aria-hidden="true"]')).toBeNull()
  })

  it('defaults to the green tone surface with on-green title', () => {
    const { container } = render(<ArchHeader title="Verde" />)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe('var(--color-signature)')
    // Panel fg is the on-green pair; the heading also takes the on-color.
    expect(panel.style.color).toBe('var(--color-on-signature)')
    const heading = within(panel).getByRole('heading', { name: 'Verde' })
    expect(heading.style.color).toBe('var(--color-on-signature)')
  })

  it.each([
    ['gold', 'var(--color-accent)', 'var(--color-on-accent)'],
    ['cobalt', 'var(--color-interactive)', 'var(--color-on-interactive)'],
    ['paper', 'var(--color-surface)', 'var(--color-text)'],
  ] as const)(
    'forwards the %s tone bg/fg pair to the underlying panel and title',
    (tone, bg, fg) => {
      const { container } = render(<ArchHeader title="X" tone={tone} />)
      const panel = container.firstElementChild as HTMLElement
      expect(panel.style.background).toBe(bg)
      expect(panel.style.color).toBe(fg)
      const heading = within(panel).getByRole('heading', { name: 'X' })
      expect(heading.style.color).toBe(fg)
    },
  )

  it('forwards a bg override to the panel while keeping the tone on-color title', () => {
    const { container } = render(
      <ArchHeader title="Custom" tone="green" bg="var(--green-deep)" />,
    )
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe('var(--green-deep)')
    // Title stays the on-green pairing (contrast preserved).
    const heading = within(panel).getByRole('heading', { name: 'Custom' })
    expect(heading.style.color).toBe('var(--color-on-signature)')
  })

  it('uses an explicit color override for both the panel and the title', () => {
    const { container } = render(
      <ArchHeader title="Bespoke" bg="var(--gold-pale)" color="var(--gold-deep)" />,
    )
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.background).toBe('var(--gold-pale)')
    expect(panel.style.color).toBe('var(--gold-deep)')
    const heading = within(panel).getByRole('heading', { name: 'Bespoke' })
    expect(heading.style.color).toBe('var(--gold-deep)')
  })

  it('forwards the arch radius to the swept panel', () => {
    const { container } = render(<ArchHeader title="Curva" arch={80} />)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.borderRadius).toBe('80px 80px 0 0')
    expect(panel.style.overflow).toBe('hidden')
  })

  it('keeps the default DS arch (120) when arch is not provided', () => {
    const { container } = render(<ArchHeader title="Padrão" />)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.style.borderRadius).toBe('120px 120px 0 0')
  })

  it('renders the eyebrow accent swatch as decorative (aria-hidden)', () => {
    render(<ArchHeader eyebrow="Rodada" title="Tabela" accent="var(--gold)" />)
    const eyebrow = screen.getByText('Rodada')
    const swatch = eyebrow.querySelector('[aria-hidden="true"]')
    expect(swatch).not.toBeNull()
    expect(swatch).toHaveStyle({ background: 'var(--gold)' })
  })

  it('is a generic container (panel not aria-hidden) so its content is announced', () => {
    const { container } = render(<ArchHeader title="Announce" />)
    const panel = container.firstElementChild as HTMLElement
    expect(panel.tagName).toBe('DIV')
    expect(panel).not.toHaveAttribute('aria-hidden')
  })

  it('forwards className and merges inline style on the panel', () => {
    const { container } = render(
      <ArchHeader title="X" className="shadow-e2" style={{ minHeight: '160px' }} />,
    )
    const panel = container.firstElementChild as HTMLElement
    expect(panel.className).toContain('shadow-e2')
    expect(panel.style.minHeight).toBe('160px')
  })

  it('falls back to the green tone preset for an unknown tone (no throw)', () => {
    let panel: HTMLElement | null = null
    expect(() => {
      const { container } = render(
        // @ts-expect-error testing runtime fallback for an unknown tone key
        <ArchHeader title="X" tone="chartreuse" />,
      )
      panel = container.firstElementChild as HTMLElement
    }).not.toThrow()
    expect(panel!.style.background).toBe('var(--color-signature)')
  })
})
