import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ResetPassword from './ResetPassword'

vi.mock('../api/authQueries', () => ({
  useResetPassword: vi.fn(),
}))

import { useResetPassword } from '../api/authQueries'
const mockUseResetPassword = useResetPassword as unknown as Mock

const state = (over: Record<string, unknown> = {}) => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  ...over,
})

const renderReset = (route = '/reset-password?token=abc') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/signin" element={<div>SIGNIN PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  )

describe('ResetPassword', () => {
  beforeEach(() => {
    mockUseResetPassword.mockReset()
    mockUseResetPassword.mockReturnValue(state())
  })

  it('shows an invalid-link error and no form when the token is missing', () => {
    renderReset('/reset-password')
    expect(screen.getByText(/inv..lido|expirado/i)).toBeInTheDocument()
    expect(screen.queryByLabelText(/nova senha/i)).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /novo link/i }),
    ).toBeInTheDocument()
  })

  it('renders both password fields with a valid token', () => {
    renderReset()
    expect(screen.getByLabelText(/nova senha/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /redefinir senha/i }),
    ).toBeInTheDocument()
  })

  it('rejects an empty password (policy gate)', async () => {
    const mutate = vi.fn()
    mockUseResetPassword.mockReturnValue(state({ mutate }))
    renderReset()
    await userEvent.click(
      screen.getByRole('button', { name: /redefinir senha/i }),
    )
    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText(/obrigat|requisitos/i)).toBeInTheDocument()
  })

  it('rejects when the two passwords do not match', async () => {
    const mutate = vi.fn()
    mockUseResetPassword.mockReturnValue(state({ mutate }))
    renderReset()
    await userEvent.type(screen.getByLabelText(/nova senha/i), 'longenough1')
    await userEvent.type(screen.getByLabelText(/confirmar senha/i), 'different1')
    await userEvent.click(
      screen.getByRole('button', { name: /redefinir senha/i }),
    )
    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText(/coincidem/i)).toBeInTheDocument()
  })

  it('submits a valid password and redirects to sign in', async () => {
    const mutate = vi.fn(
      (_data: unknown, opts: { onSuccess?: () => void }) => opts.onSuccess?.(),
    )
    mockUseResetPassword.mockReturnValue(state({ mutate }))
    renderReset('/reset-password?token=tok9')
    await userEvent.type(screen.getByLabelText(/nova senha/i), 'longenough1')
    await userEvent.type(screen.getByLabelText(/confirmar senha/i), 'longenough1')
    await userEvent.click(
      screen.getByRole('button', { name: /redefinir senha/i }),
    )
    expect(mutate).toHaveBeenCalledWith(
      { token: 'tok9', password: 'longenough1' },
      expect.anything(),
    )
    expect(await screen.findByText(/signin page/i)).toBeInTheDocument()
  })
})
