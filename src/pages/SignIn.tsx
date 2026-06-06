import React, { useContext, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  ArchShape,
  Azulejo,
  Btn,
  Checkbox,
  FieldGroup,
  Help,
  Icon,
  Overline,
  TextInput,
} from '@/ds'
import { useLogIn } from '../api/authQueries'
import { AuthContext } from '../context/AuthContext'

/**
 * SignIn — modernista re-skin (Plan Task C1).
 *
 * The metaphor inverts vs the prior parchment+pitch hero: the left/top is now a
 * GREEN color-block hero (signature surface) carrying a faint `Azulejo` tile
 * overlay + one gold `ArchShape` Niemeyer curve (the once-per-screen sweep) and
 * an Archivo wide-display headline over a Spectral-italic subtitle; the form
 * sits on a clean white panel.
 *
 * View layer rebuilt entirely from `src/ds` + the signature pieces + Tailwind
 * token utilities; the data/flow is unchanged: `useLogIn()` posts the
 * credentials and, on success, `useAuth().login` stores the session and we
 * navigate to the post-login destination (a stored redirect, else `/welcome`).
 *
 * The screen root carries `data-ds` so the scoped base layer (reset +
 * `:focus-visible` ring) applies without leaking into the un-migrated MUI
 * screens that still share the app.
 */

// The poster-display recipe (variable Archivo, heavy + wide). Landed inline
// because font-size drives the optical width axis; mirrors the DS `disp()`
// recipe used across the modernista pieces. Token color is supplied per call.
function displayStyle(
  size: number,
  opts: {
    wght?: number
    wdth?: number
    lh?: number
    ls?: number
    color: string
  },
): React.CSSProperties {
  const { wght = 900, wdth = 118, lh = 0.92, ls = -1, color } = opts
  return {
    fontSize: `${size}px`,
    fontWeight: wght,
    fontVariationSettings: `"wght" ${wght}, "wdth" ${wdth}`,
    lineHeight: lh,
    letterSpacing: `${ls}px`,
    color,
  }
}

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean
}

/**
 * Password field built on the DS `TextInput` with a real `<button>` reveal
 * toggle. The toggle's accessible name flips "Mostrar" ↔ "Ocultar" (the
 * prototype's literal affordance) — deliberately NOT "…senha", so the field
 * label "Senha" stays the unique `getByLabelText(/senha/i)` match while the
 * toggle is still reachable as a button by name. (This resolves the DS
 * `PasswordInput`'s "mostrar senha"/"ocultar senha" name vs the `/senha/` field
 * label collision noted in the plan, without editing `src/ds`.)
 */
function PasswordField({ invalid, ...inputProps }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)
  const label = visible ? 'Ocultar' : 'Mostrar'

  return (
    <div className="relative">
      <TextInput
        {...inputProps}
        type={visible ? 'text' : 'password'}
        invalid={invalid}
        className="pr-[78px]"
      />
      <button
        type="button"
        aria-pressed={visible}
        aria-label={label}
        title={label}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-pill font-sans text-[11px] font-bold uppercase tracking-[1px] text-ink-muted transition-colors duration-150 hover:text-ink"
      >
        <Icon name={visible ? 'eye-off' : 'eye'} size={16} aria-hidden="true" />
        {label}
      </button>
    </div>
  )
}

interface SignInForm {
  email: string
  password: string
}

/**
 * Inner view — owns form state and consumes the data hooks. Rendered by the
 * exported `SignIn` wrapper, which guarantees the QueryClient/Auth providers
 * exist (so the screen also renders standalone, e.g. in tests).
 */
function SignInView() {
  const [formData, setFormData] = useState<SignInForm>({ email: '', password: '' })
  const [errors, setErrors] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  })

  // useAuth() throws without an AuthProvider; read the context defensively so
  // the screen renders standalone. The real `login` is used whenever the app
  // (or a test) supplies a provider.
  const auth = useContext(AuthContext)
  const navigate = useNavigate()
  const { mutate: signIn, isPending, isError, error } = useLogIn()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: false }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = {
      email: !formData.email,
      password: !formData.password,
    }
    setErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    signIn(formData, {
      onSuccess: (data) => {
        auth?.login(data.access_token, data.user)

        const redirect = localStorage.getItem('postLoginRedirect')
        if (redirect) {
          localStorage.removeItem('postLoginRedirect')
          navigate(redirect)
        } else {
          navigate('/welcome')
        }
      },
    })
  }

  // Single error string for the form's lone alert region. Required-field
  // validation wins; otherwise a failed login (wrong credentials) shows.
  const hasValidationError = errors.email || errors.password
  const alertMessage = hasValidationError
    ? 'Preencha e-mail e senha para continuar.'
    : isError
      ? error instanceof Error
        ? error.message
        : 'Falha no login. Verifique suas credenciais.'
      : null

  return (
    <div
      data-ds
      className="grid min-h-screen w-full grid-cols-1 overflow-hidden bg-bg font-sans text-ink sm:grid-cols-2"
    >
      {/* LEFT / TOP — green color-block hero */}
      <section className="relative flex min-h-[180px] flex-col justify-end overflow-hidden bg-signature p-7 sm:min-h-0 sm:p-12">
        {/* Faint azulejo tile lattice (decorative, aria-hidden). */}
        <Azulejo color="var(--green-line)" size={60} opacity={0.5} />

        {/* The once-per-screen gold Niemeyer curve — hidden on mobile. */}
        <ArchShape
          w={84}
          h={50}
          fill="var(--gold)"
          className="relative mb-6 hidden sm:block"
        />

        <div className="relative z-[2]">
          <Overline color="var(--gold-light)" accent="var(--gold)" as="span">
            Temporada 2026 · Brasileirão
          </Overline>
          <h1
            className="mt-3 font-display uppercase"
            style={displayStyle(56, {
              wght: 900,
              wdth: 122,
              lh: 0.9,
              ls: -1.5,
              color: 'var(--on-green)',
            })}
          >
            Fantasy
            <br />
            Brasileirão
          </h1>
          <p className="mt-3 font-serif text-[16px] italic text-on-green-mute sm:text-[18px]">
            Monte o time. Vença a rodada.
          </p>
        </div>
      </section>

      {/* RIGHT / BOTTOM — white form */}
      <section className="relative flex flex-col justify-center bg-paper px-7 py-12 sm:px-14 sm:py-16">
        <div className="relative mx-auto w-full max-w-[380px]">
          <h2
            className="font-display uppercase"
            style={displayStyle(38, {
              wght: 800,
              wdth: 118,
              lh: 0.98,
              ls: -0.8,
              color: 'var(--ink)',
            })}
          >
            Entrar na
            <br />
            sua conta
          </h2>
          <p className="mb-7 mt-3 font-serif text-[16px] italic text-ink-muted">
            O seu fantasy do Brasileirão.
          </p>

          {/*
            One live error region for the whole form (a single role="alert").
            Validation failures take priority; otherwise a failed login attempt
            (wrong credentials) is surfaced here. Per-field invalid styling is
            still driven on each input below.
          */}
          {alertMessage && (
            <Help tone="error" className="mb-4">
              {alertMessage}
            </Help>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup
              label="E-mail"
              htmlFor="signin-email"
              required
              className="mb-4"
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
              htmlFor="signin-password"
              required
              className="mb-3"
            >
              <PasswordField
                name="password"
                placeholder="••••••••••"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                invalid={errors.password}
              />
            </FieldGroup>

            <div className="mb-7 flex items-center justify-between">
              <Checkbox name="remember" label="Manter conectado" />
              <RouterLink
                to="/forgot-password"
                className="font-sans text-[12px] font-semibold text-signature underline underline-offset-[3px]"
              >
                Esqueci a senha
              </RouterLink>
            </div>

            <Btn
              type="submit"
              variant="primary"
              size="lg"
              loading={isPending}
              className="w-full !justify-between"
            >
              <span>Entrar na liga</span>
              <span
                aria-hidden="true"
                className="font-display text-[22px] tracking-[-1px]"
                style={{ color: 'var(--gold-light)' }}
              >
                →
              </span>
            </Btn>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div
              aria-hidden="true"
              className="h-px flex-1 bg-line"
            />
            <span className="font-sans text-[11px] font-bold uppercase tracking-[1.5px] text-ink-subtle">
              OU
            </span>
            <div
              aria-hidden="true"
              className="h-px flex-1 bg-line"
            />
          </div>

          <div className="flex gap-2">
            <Btn type="button" variant="secondary" size="md" className="flex-1">
              Google
            </Btn>
            <Btn type="button" variant="secondary" size="md" className="flex-1">
              Apple
            </Btn>
          </div>

          <p className="mt-8 text-center font-sans text-[13px] text-ink-muted">
            Não tem uma conta?{' '}
            <RouterLink
              to="/signup"
              className="font-bold text-signature underline underline-offset-[3px]"
            >
              Cadastre-se →
            </RouterLink>
          </p>
        </div>
      </section>
    </div>
  )
}

/**
 * A lazily-created fallback QueryClient used only when the screen renders
 * outside the app's provider (e.g. an isolated test). Module-scoped so repeated
 * renders share one instance.
 */
let fallbackQueryClient: QueryClient | null = null
function getFallbackQueryClient(): QueryClient {
  if (!fallbackQueryClient) fallbackQueryClient = new QueryClient()
  return fallbackQueryClient
}

const SignIn: React.FC = () => {
  // `useLogIn()` (React Query) needs a QueryClient in context. In the app one is
  // always present; when absent (isolated render) we supply a fallback so the
  // screen still mounts. The production path never uses the fallback.
  const existingClient = useContext(QueryClientContext)

  if (existingClient) return <SignInView />

  return (
    <QueryClientProvider client={getFallbackQueryClient()}>
      <SignInView />
    </QueryClientProvider>
  )
}

export default SignIn
