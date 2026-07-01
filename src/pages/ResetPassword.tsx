import React, { useState } from 'react'
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom'
import { FieldGroup, Help } from '@/ds'
import { AuthLayout } from '../components/auth/AuthLayout'
import { AuthButton } from '../components/auth/AuthButton'
import { PasswordField } from '../components/auth/PasswordField'
import { useResetPassword } from '../api/authQueries'
import {
  evaluatePassword,
  isPasswordAcceptable,
  passwordRulesEnforced,
} from '../utils/passwordPolicy'

/**
 * ResetPassword — modernista re-skin of the "set a new password" screen.
 *
 * View rebuilt on the shared `AuthLayout` + DS pieces, removing MUI. Data/flow
 * preserved verbatim: token comes from the query string (missing → an
 * invalid-link state linking back to /forgot-password); the password is gated
 * by the shared `passwordPolicy` (with the live requirements checklist shown
 * when rules are enforced) and must match its confirmation; on success we go to
 * /signin carrying the success message the SignIn screen surfaces.
 */
const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const { mutate: resetPassword, isPending, isError, error } = useResetPassword()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!isPasswordAcceptable(password)) {
      setLocalError(
        passwordRulesEnforced()
          ? 'A senha não atende aos requisitos.'
          : 'A senha é obrigatória.',
      )
      return
    }
    if (password !== confirm) {
      setLocalError('As senhas não coincidem.')
      return
    }

    resetPassword(
      { token, password },
      {
        onSuccess: () => {
          navigate('/signin', {
            state: { message: 'Senha redefinida com sucesso. Faça login.' },
          })
        },
      },
    )
  }

  if (!token) {
    return (
      <AuthLayout
        title={
          <>
            Link
            <br />
            inválido
          </>
        }
      >
        <Help tone="error">Link inválido ou expirado.</Help>
        <p className="mt-6 font-sans text-[13px] text-ink-muted">
          <RouterLink
            to="/forgot-password"
            className="font-bold text-signature underline underline-offset-[3px]"
          >
            Solicitar um novo link
          </RouterLink>
        </p>
      </AuthLayout>
    )
  }

  const alertMessage =
    localError ||
    (isError ? (error instanceof Error ? error.message : 'Algo deu errado.') : '')

  return (
    <AuthLayout
      title={
        <>
          Criar nova
          <br />
          senha
        </>
      }
      lead="Escolha uma senha forte para a sua conta."
    >
      {alertMessage && (
        <Help tone="error" className="mb-4">
          {alertMessage}
        </Help>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <FieldGroup
          label="Nova senha"
          htmlFor="reset-password"
          required
          className="mb-2"
        >
          <PasswordField
            name="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FieldGroup>

        {passwordRulesEnforced() && password.length > 0 && (
          <ul className="mb-4 mt-1 space-y-1">
            {evaluatePassword(password).requirements.map((req) => (
              <li
                key={req.key}
                className={`font-sans text-[12px] ${
                  req.met ? 'text-success' : 'text-ink-subtle'
                }`}
              >
                {req.met ? '✓' : '○'} {req.label}
              </li>
            ))}
          </ul>
        )}

        <FieldGroup
          label="Confirmar senha"
          htmlFor="reset-confirm"
          required
          className="mb-6"
        >
          <PasswordField
            name="confirm"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </FieldGroup>

        <AuthButton type="submit" loading={isPending}>
          Redefinir senha
        </AuthButton>
      </form>
    </AuthLayout>
  )
}

export default ResetPassword
