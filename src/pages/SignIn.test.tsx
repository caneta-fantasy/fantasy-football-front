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
    expect(screen.getByRole('button', { name: /entrar na liga/i })).toBeInTheDocument()
  })
  it('shows a validation error when submitting empty', async () => {
    renderSignIn()
    await userEvent.click(screen.getByRole('button', { name: /entrar na liga/i }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
  it('toggles password visibility', async () => {
    renderSignIn()
    const pwd = screen.getByLabelText(/senha/i) as HTMLInputElement
    expect(pwd.type).toBe('password')
    await userEvent.click(screen.getByRole('button', { name: /mostrar|ocultar senha/i }))
    expect(pwd.type).toBe('text')
  })
})
