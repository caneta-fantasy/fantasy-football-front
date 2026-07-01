import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { PasswordField } from './PasswordField'

describe('PasswordField', () => {
  it('renders a masked password input by default', () => {
    render(<PasswordField aria-label="Senha" />)
    const input = screen.getByLabelText(/senha/i) as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('reveal toggle flips the input type and aria-pressed', async () => {
    render(<PasswordField aria-label="Senha" />)
    const input = screen.getByLabelText(/senha/i) as HTMLInputElement
    const toggle = screen.getByRole('button', { name: /mostrar/i })
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)
    expect(input.type).toBe('text')
    expect(
      screen.getByRole('button', { name: /ocultar/i }),
    ).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: /ocultar/i }))
    expect(input.type).toBe('password')
  })
})
