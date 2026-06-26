import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import SignIn from './SignIn'

const renderSignIn = () => render(<MemoryRouter><SignIn /></MemoryRouter>)

describe('SignIn', () => {
  it('renders email + password fields and a submit button', () => {
    renderSignIn()
    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('shows a validation error when submitting empty', async () => {
    renderSignIn()
    await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })

  it('toggles password visibility', async () => {
    renderSignIn()
    const pwd = screen.getByLabelText(/senha/i) as HTMLInputElement
    expect(pwd.type).toBe('password')
    await userEvent.click(screen.getByRole('button', { name: /mostrar|ocultar senha/i }))
    expect(pwd.type).toBe('text')
  })

  // ── modernista re-skin additions ──────────────────────────────────────────

  it('renders the green hero brand logo + form heading', () => {
    renderSignIn()
    // Hero now carries the Caneta brand wordmark (image) instead of a text h1.
    expect(
      screen.getByRole('img', { name: /caneta fantasy/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { level: 2, name: /entrar na\s*sua conta/i }),
    ).toBeInTheDocument()
    // The Spectral-italic subtitle copy is present.
    expect(screen.getByText(/monte o time/i)).toBeInTheDocument()
  })

  it('keeps the richer affordances (remember-me, forgot-password, OU, social)', () => {
    renderSignIn()
    expect(
      screen.getByRole('checkbox', { name: /manter conectado/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /esqueci a senha/i }),
    ).toBeInTheDocument()
    expect(screen.getByText(/^ou$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^google$/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^apple$/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cadastre-se/i })).toBeInTheDocument()
  })

  it('surfaces a single alert region on validation failure', async () => {
    renderSignIn()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /^entrar$/i }))
    const alerts = await screen.findAllByRole('alert')
    // Exactly one form-level alert region (FieldGroup errors are not used here).
    expect(alerts).toHaveLength(1)
    expect(alerts[0]).toHaveTextContent(/preencha e-?mail e senha/i)
  })

  it('reveal toggle flips the password input type and aria-pressed', async () => {
    renderSignIn()
    const pwd = screen.getByLabelText(/senha/i) as HTMLInputElement
    const toggle = screen.getByRole('button', { name: /mostrar/i })
    expect(pwd.type).toBe('password')
    expect(toggle).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(toggle)
    expect(pwd.type).toBe('text')
    expect(
      screen.getByRole('button', { name: /ocultar/i }),
    ).toHaveAttribute('aria-pressed', 'true')

    await userEvent.click(screen.getByRole('button', { name: /ocultar/i }))
    expect(pwd.type).toBe('password')
  })
})
