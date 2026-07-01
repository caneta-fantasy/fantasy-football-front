import React, { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import { FieldGroup, Help, TextInput } from '@/ds'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthButton } from '../components/auth/AuthButton'
import { useForgotPassword } from '../api/authQueries'

/**
 * ForgotPassword — modernista re-skin of the "request a reset link" screen.
 *
 * View rebuilt on the shared `AuthLayout` + DS pieces, removing MUI. Data/flow
 * preserved: a non-empty e-mail is posted via `useForgotPassword`, and on
 * success the form is swapped for a neutral confirmation (which never reveals
 * whether the address exists). Links back to /signin are kept.
 */
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const { mutate: forgotPassword, isPending, isError, error } =
    useForgotPassword()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    forgotPassword(email, {
      onSuccess: () => setSubmitted(true),
    })
  }

  return (
    <AuthLayout
      title={
        <>
          Redefinir
          <br />
          senha
        </>
      }
      lead={
        submitted
          ? undefined
          : 'Enviaremos um link para você criar uma nova senha.'
      }
    >
      {submitted ? (
        <>
          <Help tone="success">
            Se o e-mail estiver cadastrado, você receberá instruções para
            redefinir sua senha.
          </Help>
          <p className="mt-6 font-sans text-[13px] text-ink-muted">
            <RouterLink
              to="/signin"
              className="font-bold text-signature underline underline-offset-[3px]"
            >
              Voltar para o login
            </RouterLink>
          </p>
        </>
      ) : (
        <>
          {isError && (
            <Help tone="error" className="mb-4">
              {error instanceof Error ? error.message : 'Algo deu errado.'}
            </Help>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup
              label="E-mail"
              htmlFor="forgot-email"
              required
              className="mb-6"
            >
              <TextInput
                name="email"
                type="email"
                placeholder="pedro@caneta.fc"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </FieldGroup>

            <AuthButton type="submit" loading={isPending}>
              Enviar link
            </AuthButton>
          </form>

          <p className="mt-8 text-center font-sans text-[13px] text-ink-muted">
            Lembrou da senha?{' '}
            <RouterLink
              to="/signin"
              className="font-bold text-signature underline underline-offset-[3px]"
            >
              Entrar
            </RouterLink>
          </p>
        </>
      )}
    </AuthLayout>
  )
}

export default ForgotPassword
