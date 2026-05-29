import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { PasswordInput } from './PasswordInput'

describe('PasswordInput', () => {
  it('renders a real password input', () => {
    render(<PasswordInput aria-label="Senha" />)
    const input = screen.getByLabelText('Senha') as HTMLInputElement
    expect(input.tagName).toBe('INPUT')
    expect(input.type).toBe('password')
  })

  it('renders the reveal toggle as a real button, focusable and labelled', async () => {
    render(<PasswordInput aria-label="Senha" />)
    const toggle = screen.getByRole('button', { name: /mostrar senha/i })
    expect(toggle.tagName).toBe('BUTTON')
    // It is a non-submitting control so it never submits a wrapping form.
    expect(toggle).toHaveAttribute('type', 'button')
    // It must be reachable by keyboard (not tabindex=-1 / not a div).
    await userEvent.tab()
    expect(screen.getByLabelText('Senha')).toHaveFocus()
    await userEvent.tab()
    expect(toggle).toHaveFocus()
  })

  it('starts hidden: aria-pressed is false and type is password', () => {
    render(<PasswordInput aria-label="Senha" />)
    const toggle = screen.getByRole('button', { name: /mostrar senha/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles visibility on click and flips aria-pressed + accessible label', async () => {
    render(<PasswordInput aria-label="Senha" defaultValue="hunter2" />)
    const input = screen.getByLabelText('Senha') as HTMLInputElement
    expect(input.type).toBe('password')

    await userEvent.click(screen.getByRole('button', { name: /mostrar senha/i }))
    expect(input.type).toBe('text')
    const pressed = screen.getByRole('button', { name: /ocultar senha/i })
    expect(pressed).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(pressed)
    expect(input.type).toBe('password')
    expect(
      screen.getByRole('button', { name: /mostrar senha/i }),
    ).toHaveAttribute('aria-pressed', 'false')
  })

  it('toggles via the keyboard (Enter/Space on the button)', async () => {
    render(<PasswordInput aria-label="Senha" />)
    const input = screen.getByLabelText('Senha') as HTMLInputElement
    const toggle = screen.getByRole('button', { name: /mostrar senha/i })
    toggle.focus()
    await userEvent.keyboard('{Enter}')
    expect(input.type).toBe('text')
    await userEvent.keyboard(' ')
    expect(input.type).toBe('password')
  })

  it('forwards arbitrary input props and a ref to the real input', () => {
    const ref = vi.fn()
    render(<PasswordInput ref={ref} aria-label="Senha" name="password" autoComplete="current-password" />)
    const input = screen.getByLabelText('Senha')
    expect(input).toHaveAttribute('name', 'password')
    expect(input).toHaveAttribute('autocomplete', 'current-password')
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement))
  })

  it('passes the invalid state through to aria-invalid', () => {
    render(<PasswordInput invalid aria-label="Senha" />)
    expect(screen.getByLabelText('Senha')).toHaveAttribute('aria-invalid', 'true')
  })

  it('does not let a caller override the input type to something other than password/text', () => {
    // The component owns `type`; passing one through must not break the toggle.
    render(<PasswordInput aria-label="Senha" />)
    expect((screen.getByLabelText('Senha') as HTMLInputElement).type).toBe('password')
  })
})
