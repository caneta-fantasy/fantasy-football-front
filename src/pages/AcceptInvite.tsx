// pages/invite/accept.tsx

import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { Help, Spinner } from '@/ds'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthButton } from '../components/auth/AuthButton'
import { apiConfig } from '../api/config'
import { getToken } from '../utils/session'
import { isAuthenticated } from '../utils/auth'

/**
 * AcceptInvite — modernista re-skin of the league-invite acceptance screen.
 *
 * View rebuilt on the shared `AuthLayout` + DS pieces, removing MUI. Data/flow
 * preserved: the `token` comes from the query string; an unauthenticated user
 * has the token stashed and is bounced to /login (so the invite resumes after
 * sign-in); an authenticated user auto-accepts once (ref-guarded). The view is
 * now driven off the mutation status, which also fixes the previous
 * stuck-on-spinner after a successful accept.
 */
const InviteAcceptPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get('token')
  const isUserAuthenticated = isAuthenticated()
  const hasAttempted = useRef(false)

  const acceptInvite = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `${apiConfig.endpoints.fantasyLeagueInvites.accept}?token=${token}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      )

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.detail || 'Falha ao aceitar o convite')
      }

      return res.json()
    },
    onSuccess: () => {
      localStorage.removeItem('league_invite_token')
    },
  })

  const { mutate, isPending, isSuccess, isError, error } = acceptInvite

  useEffect(() => {
    if (!token) return

    if (!isUserAuthenticated) {
      localStorage.setItem('league_invite_token', token)
      navigate('/login')
    } else if (!hasAttempted.current) {
      hasAttempted.current = true
      mutate()
    }
  }, [token, isUserAuthenticated, navigate, mutate])

  return (
    <AuthLayout
      title={
        <>
          Aceitar
          <br />
          convite
        </>
      }
      lead="Você foi convidado para uma liga do Caneta Fantasy."
    >
      {!token && <Help tone="error">Link de convite inválido.</Help>}

      {token && isPending && (
        <div className="flex items-center gap-3 text-ink-muted">
          <Spinner size={22} />
          <span className="font-sans text-[14px]">Aceitando o convite…</span>
        </div>
      )}

      {isSuccess && (
        <Help tone="success">Convite aceito! Bem-vindo à liga.</Help>
      )}

      {isError && (
        <Help tone="error">
          {error instanceof Error
            ? error.message
            : 'Não foi possível aceitar o convite.'}
        </Help>
      )}

      {(isSuccess || isError || !token) && (
        <AuthButton
          type="button"
          className="mt-6"
          onClick={() => navigate('/welcome')}
        >
          Ir para o início
        </AuthButton>
      )}
    </AuthLayout>
  )
}

export default InviteAcceptPage
