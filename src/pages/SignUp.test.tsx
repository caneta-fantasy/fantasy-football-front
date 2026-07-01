import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import SignUp from './SignUp'

vi.mock('../api/authQueries', () => ({
  useSignUp: vi.fn(),
  useLogIn: vi.fn(),
}))

import { useSignUp, useLogIn } from '../api/authQueries'
const mockUseSignUp = useSignUp as unknown as Mock
const mockUseLogIn = useLogIn as unknown as Mock

const renderSignUp = () =>
  render(
    <MemoryRouter initialEntries={['/signup']}>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/welcome" element={<div>WELCOME PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  )

const fillValidForm = async () => {
  await userEvent.type(screen.getByLabelText(/^nome\b/i), 'Pedro')
  await userEvent.type(screen.getByLabelText(/sobrenome/i), 'Silva')
  await userEvent.type(screen.getByLabelText(/apelido/i), 'pedrinho')
  await userEvent.type(screen.getByLabelText(/e-?mail/i), 'pedro@caneta.fc')
  await userEvent.type(screen.getByLabelText(/^senha\b/i), 'segredo123')
  await userEvent.type(screen.getByLabelText(/repita/i), 'segredo123')
  fireEvent.change(screen.getByLabelText(/nascimento/i), {
    target: { value: '1990-05-15' },
  })
}

describe('SignUp', () => {
  beforeEach(() => {
    mockUseSignUp.mockReset()
    mockUseLogIn.mockReset()
    mockUseSignUp.mockReturnValue({ mutate: vi.fn(), isPending: false })
    mockUseLogIn.mockReturnValue({ mutateAsync: vi.fn(), isPending: false })
  })

  it('renders the auth chrome and all sign-up fields', () => {
    renderSignUp()
    expect(
      screen.getByRole('img', { name: /caneta fantasy/i }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/^nome\b/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/sobrenome/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/apelido/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/e-?mail/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha\b/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/repita/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/nascimento/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /criar conta/i }),
    ).toBeInTheDocument()
  })

  it('does not submit when required fields are empty', async () => {
    const signUp = vi.fn()
    mockUseSignUp.mockReturnValue({ mutate: signUp, isPending: false })
    renderSignUp()
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(signUp).not.toHaveBeenCalled()
  })

  it('blocks submit and warns when the passwords do not match', async () => {
    const signUp = vi.fn()
    mockUseSignUp.mockReturnValue({ mutate: signUp, isPending: false })
    renderSignUp()
    await fillValidForm()
    await userEvent.clear(screen.getByLabelText(/repita/i))
    await userEvent.type(screen.getByLabelText(/repita/i), 'outrasenha9')
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(signUp).not.toHaveBeenCalled()
    expect(screen.getAllByText(/coincidem/i).length).toBeGreaterThan(0)
  })

  it('submits the full payload and auto-logs-in on success', async () => {
    const signUp = vi.fn(
      (_payload: unknown, opts: { onSuccess?: () => void }) =>
        opts.onSuccess?.(),
    )
    const logIn = vi.fn(() =>
      Promise.resolve({ access_token: 't', user: { id: 1 } }),
    )
    mockUseSignUp.mockReturnValue({ mutate: signUp, isPending: false })
    mockUseLogIn.mockReturnValue({ mutateAsync: logIn, isPending: false })
    renderSignUp()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))

    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        firstName: 'Pedro',
        lastName: 'Silva',
        username: 'pedrinho',
        email: 'pedro@caneta.fc',
        password: 'segredo123',
        birthDate: '1990-05-15',
      }),
      expect.anything(),
    )
    expect(await screen.findByText(/welcome page/i)).toBeInTheDocument()
  })

  it('surfaces the server error when sign-up fails', async () => {
    const signUp = vi.fn(
      (_payload: unknown, opts: { onError?: (e: Error) => void }) =>
        opts.onError?.(new Error('E-mail já cadastrado')),
    )
    mockUseSignUp.mockReturnValue({ mutate: signUp, isPending: false })
    renderSignUp()
    await fillValidForm()
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }))
    expect(await screen.findByText(/cadastrado/i)).toBeInTheDocument()
  })
})
