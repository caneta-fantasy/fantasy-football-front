import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import ForgotPassword from './ForgotPassword'

vi.mock('../api/authQueries', () => ({
  useForgotPassword: vi.fn(),
}))

import { useForgotPassword } from '../api/authQueries'
const mockUseForgotPassword = useForgotPassword as unknown as Mock

const state = (over: Record<string, unknown> = {}) => ({
  mutate: vi.fn(),
  isPending: false,
  isError: false,
  error: null,
  ...over,
})

const renderForgot = () =>
  render(
    <MemoryRouter>
      <ForgotPassword />
    </MemoryRouter>,
  )

describe('ForgotPassword', () => {
  beforeEach(() => {
    mockUseForgotPassword.mockReset()
    mockUseForgotPassword.mockReturnValue(state())
  })

  it('renders the auth chrome, e-mail field and submit button', () => {
    renderForgot()
    expect(
      screen.getByRole('img', { name: /caneta fantasy/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /enviar link/i }),
    ).toBeInTheDocument()
  })

  it('does not submit when the e-mail is empty', async () => {
    const mutate = vi.fn()
    mockUseForgotPassword.mockReturnValue(state({ mutate }))
    renderForgot()
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }))
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits the e-mail and shows the confirmation state', async () => {
    const mutate = vi.fn(
      (_email: string, opts: { onSuccess?: () => void }) => opts.onSuccess?.(),
    )
    mockUseForgotPassword.mockReturnValue(state({ mutate }))
    renderForgot()
    await userEvent.type(screen.getByLabelText(/e-?mail/i), 'pedro@caneta.fc')
    await userEvent.click(screen.getByRole('button', { name: /enviar link/i }))
    expect(mutate).toHaveBeenCalledWith('pedro@caneta.fc', expect.anything())
    expect(await screen.findByText(/receber.. instru..es|cadastrado/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /voltar para o login/i }),
    ).toBeInTheDocument()
  })

  it('surfaces the server error message on failure', () => {
    mockUseForgotPassword.mockReturnValue(
      state({ isError: true, error: new Error('Serviço indisponível') }),
    )
    renderForgot()
    expect(screen.getByText(/indispon/i)).toBeInTheDocument()
  })
})
