import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AuthLayout } from './AuthLayout'

describe('AuthLayout', () => {
  it('renders the green brand hero (wordmark + season eyebrow + tagline)', () => {
    render(<AuthLayout title="Teste">conteúdo</AuthLayout>)
    expect(
      screen.getByRole('img', { name: /caneta fantasy/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/temporada 2026/i)).toBeInTheDocument()
    expect(screen.getByText(/monte o time/i)).toBeInTheDocument()
  })

  it('renders the form-panel title as a level-2 heading', () => {
    render(<AuthLayout title="Criar sua conta">x</AuthLayout>)
    expect(
      screen.getByRole('heading', { level: 2, name: /criar sua conta/i }),
    ).toBeInTheDocument()
  })

  it('renders the optional lead and the children', () => {
    render(
      <AuthLayout title="T" lead="uma legenda">
        <p>corpo do formulário</p>
      </AuthLayout>,
    )
    expect(screen.getByText(/uma legenda/i)).toBeInTheDocument()
    expect(screen.getByText(/corpo do formulário/i)).toBeInTheDocument()
  })

  it('exposes a data-ds root so the scoped base layer applies', () => {
    const { container } = render(<AuthLayout title="T">x</AuthLayout>)
    expect(container.querySelector('[data-ds]')).not.toBeNull()
  })
})
