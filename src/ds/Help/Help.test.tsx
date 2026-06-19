import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Help } from './Help'

describe('Help', () => {
  it('renders neutral helper text without an alert role', () => {
    render(<Help id="h1">Usamos só pra recuperar conta.</Help>)
    const node = screen.getByText('Usamos só pra recuperar conta.')
    expect(node).toBeInTheDocument()
    expect(node).not.toHaveAttribute('role', 'alert')
  })

  it('sets role="alert" when tone is error', () => {
    render(
      <Help id="h2" tone="error">
        Email inválido
      </Help>,
    )
    expect(screen.getByRole('alert')).toHaveTextContent('Email inválido')
  })

  it('does not set role="alert" for the success tone', () => {
    render(
      <Help id="h3" tone="success">
        Preenchido e válido.
      </Help>,
    )
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('forwards the id so it can be referenced by aria-describedby', () => {
    render(<Help id="my-help">contexto</Help>)
    // The id sits on the help container (the node aria-describedby points at),
    // not the inner text span.
    const container = document.getElementById('my-help')
    expect(container).not.toBeNull()
    expect(container).toHaveTextContent('contexto')
  })

  it('falls back to the neutral tone for an unknown tone without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<Help tone="nope">x</Help>),
    ).not.toThrow()
  })
})
