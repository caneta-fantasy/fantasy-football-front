import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FieldGroup } from './FieldGroup'

describe('FieldGroup', () => {
  it('wires a real <label htmlFor> to the control', () => {
    render(
      <FieldGroup label="E-mail" htmlFor="email">
        <input id="email" />
      </FieldGroup>,
    )
    const input = screen.getByLabelText('E-mail')
    expect(input.tagName).toBe('INPUT')
    expect(input).toHaveAttribute('id', 'email')
  })

  it('links helper text to the control via aria-describedby', () => {
    render(
      <FieldGroup label="E-mail" htmlFor="email" help="Usamos só pra recuperar conta.">
        <input id="email" />
      </FieldGroup>,
    )
    const input = screen.getByLabelText('E-mail')
    const describedby = input.getAttribute('aria-describedby')
    expect(describedby).toBeTruthy()
    const helpNode = document.getElementById(describedby!.split(' ')[0])
    expect(helpNode).toHaveTextContent('Usamos só pra recuperar conta.')
  })

  it('renders the error with role="alert" and links it via aria-describedby', () => {
    render(
      <FieldGroup label="E-mail" htmlFor="email" error="Email inválido">
        <input id="email" />
      </FieldGroup>,
    )
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Email inválido')
    const input = screen.getByLabelText('E-mail')
    expect(input.getAttribute('aria-describedby')).toContain(alert.id)
  })

  it('keeps the helper AND error both visible and both described (DS §7: not "replaces")', () => {
    render(
      <FieldGroup
        label="Senha"
        htmlFor="pwd"
        help="Senha precisa de 8+ caracteres."
        error="Senha muito curta"
      >
        <input id="pwd" />
      </FieldGroup>,
    )
    // Helper still shown.
    expect(screen.getByText('Senha precisa de 8+ caracteres.')).toBeInTheDocument()
    // Error shown as an alert.
    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('Senha muito curta')
    // Both ids are referenced by the control.
    const input = screen.getByLabelText('Senha')
    const describedby = input.getAttribute('aria-describedby') ?? ''
    expect(describedby.split(' ').length).toBe(2)
    expect(describedby).toContain(alert.id)
  })

  it('sets aria-required and a lime asterisk when required', () => {
    render(
      <FieldGroup label="E-mail" htmlFor="email" required>
        <input id="email" />
      </FieldGroup>,
    )
    // The required label text content is "E-mail*", so query the control by id.
    const input = document.getElementById('email')!
    expect(input).toHaveAttribute('aria-required', 'true')
    const label = screen.getByText('E-mail').closest('label')!
    const star = label.querySelector('[aria-hidden="true"]')
    expect(star).toHaveTextContent('*')
  })

  it('marks the control aria-invalid when there is an error', () => {
    render(
      <FieldGroup label="E-mail" htmlFor="email" error="Email inválido">
        <input id="email" />
      </FieldGroup>,
    )
    expect(screen.getByLabelText('E-mail')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not set aria-invalid or describedby when clean', () => {
    render(
      <FieldGroup label="Nome" htmlFor="name">
        <input id="name" />
      </FieldGroup>,
    )
    const input = screen.getByLabelText('Nome')
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).not.toHaveAttribute('aria-describedby')
  })

  it('does not clobber an aria-describedby already on the child control', () => {
    render(
      <FieldGroup label="E-mail" htmlFor="email" help="contexto">
        <input id="email" aria-describedby="external-note" />
      </FieldGroup>,
    )
    const input = screen.getByLabelText('E-mail')
    const describedby = input.getAttribute('aria-describedby') ?? ''
    expect(describedby).toContain('external-note')
    // and still includes the generated help id
    expect(describedby.split(' ').length).toBeGreaterThanOrEqual(2)
  })
})
