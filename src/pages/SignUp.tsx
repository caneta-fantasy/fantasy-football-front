import React, { useContext, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { Btn, DateInput, FieldGroup, Help, Spinner, TextInput } from '@/ds'
import { AuthLayout } from '../components/auth/AuthLayout'
import { PasswordField } from '../components/auth/PasswordField'
import { useSignUp, useLogIn } from '../api/authQueries'
import { AuthContext } from '../context/AuthContext'
import {
  evaluatePassword,
  isPasswordAcceptable,
  passwordRulesEnforced,
} from '../utils/passwordPolicy'

interface SignUpFormData {
  firstName: string
  lastName: string
  email: string
  password: string
  username: string
  birthDate: string
}

/**
 * SignUp — modernista re-skin of the account-creation screen.
 *
 * View rebuilt on the shared `AuthLayout` + DS pieces, removing MUI (including
 * the MUI x-date-pickers/dayjs stack — `birthDate` is now a plain YYYY-MM-DD
 * string via the DS `DateInput`). Data/flow preserved: per-field required
 * validation, the shared `passwordPolicy` gate + live requirements checklist,
 * confirm-password match, and success auto-login (create account → log in →
 * /welcome; on login failure, fall back to /signin with a success message).
 */
const SignUp: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    birthDate: '',
    username: '',
  })

  const [errors, setErrors] = useState({
    email: false,
    password: false,
    confirmPassword: false,
    firstName: false,
    lastName: false,
    birthDate: false,
    username: false,
  })
  const [submitError, setSubmitError] = useState<string | null>(null)

  const navigate = useNavigate()
  const auth = useContext(AuthContext)
  const { mutate: signUp, isPending } = useSignUp()
  const { mutateAsync: logIn, isPending: isLoggingIn } = useLogIn()

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: false }))
    setSubmitError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    const passwordsMismatch =
      !!formData.password && formData.password !== formData.confirmPassword
    const passwordWeak = !isPasswordAcceptable(formData.password)

    const newErrors = {
      email: !formData.email,
      password: !formData.password || passwordWeak,
      confirmPassword: !formData.confirmPassword || passwordsMismatch,
      firstName: !formData.firstName,
      lastName: !formData.lastName,
      birthDate: !formData.birthDate,
      username: !formData.username,
    }

    setErrors(newErrors)
    if (formData.password && passwordWeak) {
      setSubmitError('A senha não atende aos requisitos.')
      return
    }
    if (passwordsMismatch) {
      setSubmitError('As senhas não coincidem.')
      return
    }
    if (Object.values(newErrors).some((err) => err)) return

    const payload: SignUpFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      username: formData.username,
      birthDate: formData.birthDate,
    }

    signUp(payload, {
      onSuccess: async () => {
        // Auto-login right after signup instead of bouncing to /signin.
        try {
          const data = await logIn({
            email: formData.email,
            password: formData.password,
          })
          auth?.login(data.access_token, data.user)
          navigate('/welcome')
        } catch {
          // Account created but auto-login failed — fall back to /signin.
          navigate('/signin', {
            state: { message: 'Cadastro realizado com sucesso! Faça login.' },
          })
        }
      },
      onError: (err) => {
        setSubmitError(
          err instanceof Error
            ? err.message
            : 'Falha ao criar sua conta, tente novamente.',
        )
      },
    })
  }

  if (isPending || isLoggingIn) {
    return (
      <div
        data-ds
        className="flex min-h-screen w-full flex-col items-center justify-center gap-4 bg-bg font-sans text-ink-muted"
      >
        <Spinner size={32} />
        <span className="font-sans text-[14px]">Criando sua conta…</span>
      </div>
    )
  }

  const requirements =
    passwordRulesEnforced() && formData.password.length > 0
      ? evaluatePassword(formData.password).requirements
      : null

  return (
    <AuthLayout
      title={
        <>
          Crie sua
          <br />
          conta
        </>
      }
      lead="Entre na sua liga do Brasileirão."
    >
      {submitError && (
        <Help tone="error" className="mb-4">
          {submitError}
        </Help>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup
            label="Nome"
            htmlFor="signup-firstName"
            required
            className="mb-4"
            error={errors.firstName ? 'Nome é obrigatório' : undefined}
          >
            <TextInput
              name="firstName"
              placeholder="Pedro"
              autoComplete="given-name"
              value={formData.firstName}
              onChange={handleChange}
              invalid={errors.firstName}
            />
          </FieldGroup>

          <FieldGroup
            label="Sobrenome"
            htmlFor="signup-lastName"
            required
            className="mb-4"
            error={errors.lastName ? 'Sobrenome é obrigatório' : undefined}
          >
            <TextInput
              name="lastName"
              placeholder="Silva"
              autoComplete="family-name"
              value={formData.lastName}
              onChange={handleChange}
              invalid={errors.lastName}
            />
          </FieldGroup>
        </div>

        <FieldGroup
          label="Apelido"
          htmlFor="signup-username"
          required
          className="mb-4"
          error={errors.username ? 'Apelido é obrigatório' : undefined}
        >
          <TextInput
            name="username"
            placeholder="pedrinho"
            autoComplete="username"
            value={formData.username}
            onChange={handleChange}
            invalid={errors.username}
          />
        </FieldGroup>

        <FieldGroup
          label="E-mail"
          htmlFor="signup-email"
          required
          className="mb-4"
          error={errors.email ? 'E-mail é obrigatório' : undefined}
        >
          <TextInput
            name="email"
            type="email"
            placeholder="pedro@caneta.fc"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            invalid={errors.email}
          />
        </FieldGroup>

        <FieldGroup
          label="Senha"
          htmlFor="signup-password"
          required
          className="mb-2"
          error={
            errors.password && !formData.password
              ? 'Senha é obrigatória'
              : undefined
          }
        >
          <PasswordField
            name="password"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={formData.password}
            onChange={handleChange}
            invalid={errors.password}
          />
        </FieldGroup>

        {requirements && (
          <ul className="mb-4 mt-1 space-y-1">
            {requirements.map((req) => (
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
          label="Repita a senha"
          htmlFor="signup-confirmPassword"
          required
          className="mb-4"
          error={
            errors.confirmPassword
              ? formData.confirmPassword
                ? 'As senhas não coincidem'
                : 'Confirme sua senha'
              : undefined
          }
        >
          <PasswordField
            name="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••••"
            value={formData.confirmPassword}
            onChange={handleChange}
            invalid={errors.confirmPassword}
          />
        </FieldGroup>

        <FieldGroup
          label="Data de nascimento"
          htmlFor="signup-birthDate"
          required
          className="mb-6"
          error={
            errors.birthDate ? 'Data de nascimento é obrigatória' : undefined
          }
        >
          <DateInput
            name="birthDate"
            value={formData.birthDate}
            onChange={handleChange}
            invalid={errors.birthDate}
          />
        </FieldGroup>

        <Btn type="submit" variant="primary" size="lg" className="w-full">
          Criar conta
        </Btn>
      </form>

      <p className="mt-8 text-center font-sans text-[13px] text-ink-muted">
        Já tem uma conta?{' '}
        <RouterLink
          to="/signin"
          className="font-bold text-signature underline underline-offset-[3px]"
        >
          Entrar
        </RouterLink>
      </p>
    </AuthLayout>
  )
}

export default SignUp
