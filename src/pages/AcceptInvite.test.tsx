import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AcceptInvite from './AcceptInvite'

vi.mock('../utils/auth', () => ({ isAuthenticated: vi.fn() }))
vi.mock('../utils/session', () => ({ getToken: vi.fn(() => 'jwt') }))

import { isAuthenticated } from '../utils/auth'
const mockIsAuthenticated = isAuthenticated as unknown as Mock

const renderInvite = (route = '/invite?token=abc') => {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/invite" element={<AcceptInvite />} />
          <Route path="/login" element={<div>LOGIN PAGE</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('AcceptInvite', () => {
  beforeEach(() => {
    mockIsAuthenticated.mockReset()
    localStorage.clear()
  })
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the loading state inside the auth chrome while accepting', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {}))) // never resolves
    renderInvite()
    expect(
      screen.getByRole('img', { name: /caneta fantasy/i }),
    ).toBeInTheDocument()
    expect(await screen.findByText(/aceitando/i)).toBeInTheDocument()
  })

  it('stores the token and redirects to login when unauthenticated', async () => {
    mockIsAuthenticated.mockReturnValue(false)
    renderInvite('/invite?token=xyz')
    expect(await screen.findByText(/login page/i)).toBeInTheDocument()
    expect(localStorage.getItem('league_invite_token')).toBe('xyz')
  })

  it('shows a success state and clears the stored token when accepted', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    localStorage.setItem('league_invite_token', 'abc')
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({}) }),
      ),
    )
    renderInvite()
    expect(await screen.findByText(/convite aceito/i)).toBeInTheDocument()
    expect(localStorage.getItem('league_invite_token')).toBeNull()
  })

  it('surfaces the server error message when accepting fails', async () => {
    mockIsAuthenticated.mockReturnValue(true)
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          json: () => Promise.resolve({ detail: 'Convite expirado' }),
        }),
      ),
    )
    renderInvite()
    expect(await screen.findByText(/convite expirado/i)).toBeInTheDocument()
  })
})
