import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import VerifyEmail from './VerifyEmail'

vi.mock('../api/authQueries', () => ({
  useVerifyEmail: vi.fn(),
}))

import { useVerifyEmail } from '../api/authQueries'
const mockUseVerifyEmail = useVerifyEmail as unknown as Mock

const state = (over: Record<string, unknown> = {}) => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  isSuccess: false,
  error: null,
  ...over,
})

const renderVerify = (route = '/verify-email?token=abc') =>
  render(
    <MemoryRouter initialEntries={[route]}>
      <VerifyEmail />
    </MemoryRouter>,
  )

describe('VerifyEmail', () => {
  beforeEach(() => {
    mockUseVerifyEmail.mockReset()
    mockUseVerifyEmail.mockReturnValue(state())
  })

  it('renders inside the modernista auth chrome', () => {
    renderVerify()
    expect(
      screen.getByRole('img', { name: /caneta fantasy/i }),
    ).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument()
  })

  it('auto-submits the token on mount', () => {
    const mutate = vi.fn()
    mockUseVerifyEmail.mockReturnValue(state({ mutate }))
    renderVerify('/verify-email?token=tok123')
    expect(mutate).toHaveBeenCalledWith('tok123')
  })

  it('does not submit and shows an invalid-link error when the token is missing', () => {
    const mutate = vi.fn()
    mockUseVerifyEmail.mockReturnValue(state({ mutate }))
    renderVerify('/verify-email')
    expect(mutate).not.toHaveBeenCalled()
    expect(screen.getByText(/link de verifica/i)).toBeInTheDocument()
  })

  it('shows the success state with a link to the home screen', () => {
    mockUseVerifyEmail.mockReturnValue(state({ isSuccess: true }))
    renderVerify()
    expect(screen.getByText(/verificado com sucesso/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /ir para o in/i }),
    ).toBeInTheDocument()
  })

  it('surfaces the server error message on failure', () => {
    mockUseVerifyEmail.mockReturnValue(
      state({ isError: true, error: new Error('Token expirado') }),
    )
    renderVerify()
    expect(screen.getByText(/token expirado/i)).toBeInTheDocument()
  })
})
