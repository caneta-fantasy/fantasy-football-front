import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { EmptyState } from './EmptyState'

describe('EmptyState', () => {
  it('renders the title as a heading and shows the body copy', () => {
    render(
      <EmptyState
        icon="jersey"
        title="Time vazio"
        body="Você ainda não draftou ninguém."
      />,
    )
    expect(
      screen.getByRole('heading', { name: 'Time vazio' }),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Você ainda não draftou ninguém.'),
    ).toBeInTheDocument()
  })

  it('is exposed as a region labelled by its title', () => {
    render(<EmptyState icon="market" title="Mercado limpo" body="Nada aqui." />)
    // The region's accessible name comes from the title heading.
    expect(
      screen.getByRole('region', { name: 'Mercado limpo' }),
    ).toBeInTheDocument()
  })

  it('renders the illustration icon as decorative (aria-hidden)', () => {
    const { container } = render(
      <EmptyState icon="bell" title="Sem novidades" body="Tudo quieto." />,
    )
    const svg = container.querySelector('svg[aria-hidden="true"]')
    expect(svg).toBeInTheDocument()
  })

  it('renders an optional CTA button and fires onCtaClick', async () => {
    const onCtaClick = vi.fn()
    render(
      <EmptyState
        icon="jersey"
        title="Time vazio"
        body="Bora montar."
        cta="Ir ao mercado"
        onCtaClick={onCtaClick}
      />,
    )
    const btn = screen.getByRole('button', { name: 'Ir ao mercado' })
    await userEvent.click(btn)
    expect(onCtaClick).toHaveBeenCalledTimes(1)
  })

  it('omits the CTA button when no cta label is given', () => {
    render(<EmptyState icon="bell" title="Sem novidades" body="Tudo quieto." />)
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('renders the decorative stencil numeral when num is provided', () => {
    render(
      <EmptyState icon="market" num="00" title="Mercado limpo" body="Nada." />,
    )
    // The big numeral is decorative; assert it is present but hidden from AT.
    const numeral = screen.getByText('00')
    expect(numeral).toHaveAttribute('aria-hidden', 'true')
  })

  it('forwards a className and arbitrary props onto the region', () => {
    render(
      <EmptyState
        icon="bell"
        title="Sem novidades"
        body="Tudo quieto."
        className="my-empty"
        data-testid="empty-x"
      />,
    )
    const el = screen.getByTestId('empty-x')
    expect(el).toHaveClass('my-empty')
  })
})
