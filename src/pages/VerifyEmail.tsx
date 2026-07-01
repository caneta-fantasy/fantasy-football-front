import React, { useContext, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Btn, Help, Spinner } from '@/ds'
import { AuthLayout } from '../components/auth/AuthLayout'
import { useVerifyEmail } from '../api/authQueries'
import { AuthContext } from '../context/AuthContext'
import { SUPPORT_EMAIL } from '../utils/support'

/**
 * VerifyEmail — modernista re-skin of the e-mail confirmation screen.
 *
 * View rebuilt on the shared `AuthLayout` + DS pieces; the data/flow is
 * unchanged. The `token` comes from the query string and is auto-submitted
 * once (fire-once ref; the backend verify is idempotent so a StrictMode
 * double-fire is harmless). The UI is driven off the mutation's own status so
 * it can't get stuck. On success the local session is reconciled so the
 * "verify your e-mail" banner clears; an "already verified" replay (error while
 * the logged-in user is verified) is treated as success rather than an error.
 * `AuthContext` is read defensively so the screen renders standalone.
 */
const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const user = auth?.user
  const { mutate: verify, isPending, isSuccess, isError, error } =
    useVerifyEmail()
  const fired = useRef(false)

  // Fire exactly once.
  useEffect(() => {
    if (!token || fired.current) return
    fired.current = true
    verify(token)
  }, [token, verify])

  // On success, reconcile the local session so the banner clears immediately.
  useEffect(() => {
    if (isSuccess && user && !user.emailVerifiedAt) {
      auth?.updateUser({ emailVerifiedAt: new Date().toISOString() })
    }
  }, [isSuccess, user, auth])

  // Treat "already verified" (a consumed/replayed token while logged in as a
  // verified user) as success rather than a misleading error.
  const verified = isSuccess || (isError && !!user?.emailVerifiedAt)
  const failed = isError && !verified
  const showSpinner = !token ? false : isPending || (!verified && !failed)

  return (
    <AuthLayout
      title={
        <>
          Confirmar
          <br />
          e-mail
        </>
      }
      lead="Estamos ativando o seu acesso à liga."
    >
      {!token && <Help tone="error">Link de verificação inválido.</Help>}

      {showSpinner && (
        <div className="flex items-center gap-3 text-ink-muted">
          <Spinner size={22} />
          <span className="font-sans text-[14px]">
            Verificando o seu e-mail…
          </span>
        </div>
      )}

      {verified && (
        <Help tone="success">Seu e-mail foi verificado com sucesso!</Help>
      )}

      {failed && (
        <>
          <Help tone="error">
            {error instanceof Error
              ? error.message
              : 'Não foi possível verificar o e-mail.'}
          </Help>
          <p className="mt-3 font-sans text-[13px] text-ink-muted">
            Problemas? Fale com a gente:{' '}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-semibold text-signature underline underline-offset-[3px]"
            >
              {SUPPORT_EMAIL}
            </a>
          </p>
        </>
      )}

      {(verified || failed || !token) && (
        <Btn
          type="button"
          variant="primary"
          size="lg"
          className="mt-6 w-full"
          onClick={() => navigate('/welcome')}
        >
          Ir para o início
        </Btn>
      )}
    </AuthLayout>
  )
}

export default VerifyEmail
