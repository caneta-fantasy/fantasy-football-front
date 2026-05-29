import React, { useContext, useState } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from '@tanstack/react-query'
import {
  Btn,
  Checkbox,
  FieldGroup,
  Halftone,
  Help,
  Icon,
  PitchLines,
  StencilNum,
  TextInput,
} from '@/ds'
import { useLogIn } from '../api/authQueries'
import { AuthContext } from '../context/AuthContext'

/**
 * SignIn — first screen migrated onto the design system (Plan Task 11).
 *
 * View layer rebuilt entirely from `src/ds` + Tailwind token utilities; the
 * data/flow is unchanged: `useLogIn()` posts the credentials and, on success,
 * `useAuth().login` stores the session and we navigate to the post-login
 * destination (a stored redirect, else `/welcome`).
 *
 * The screen root carries `data-ds` so the scoped base layer (reset +
 * `:focus-visible` ring) applies without leaking into the un-migrated MUI
 * screens that still share the app.
 */

// Editorial overline (the prototype's <SectionLabel>). Decorative accent bar +
// uppercase mono-tracked label. Built from token utilities, not a DS export.
function SectionLabel({
  children,
  color,
}: {
  children: React.ReactNode
  color: string
}) {
  return (
    <div
      className="flex items-center gap-2 font-sans text-[11px] font-bold uppercase tracking-[2px]"
      style={{ color }}
    >
      <span
        aria-hidden="true"
        className="inline-block h-[2px] w-6"
        style={{ background: color }}
      />
      {children}
    </div>
  )
}

// The Caneta wordmark used in the hero (the prototype's <CanetaWordmark>).
function CanetaWordmark() {
  return (
    <div className="font-display text-[28px] uppercase leading-none tracking-[-0.5px] text-text">
      Caneta<span className="text-lime-deep">.</span>
    </div>
  )
}

interface HeroStat {
  label: string
  value: string
  live?: boolean
}

const HERO_STATS: HeroStat[] = [
  { label: 'Jogadores ativos', value: '12.408' },
  { label: 'Ligas criadas', value: '2.179' },
  { label: 'Drafts ao vivo', value: '23', live: true },
]

// The hero stat figure is conveyed as functional text here (StencilNum is
// decorative/aria-hidden), so the value reads correctly to assistive tech.
function HeroStatItem({ label, value, live }: HeroStat) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[1px] text-text-subtle">
        {label}
      </div>
      <div
        className="flex items-center gap-[10px] font-display text-[34px] leading-none tracking-[-1px]"
        style={{ color: live ? 'var(--caneta-lime-deep)' : 'var(--color-text)' }}
      >
        {live && (
          <span
            aria-hidden="true"
            className="inline-block h-[9px] w-[9px] rounded-full"
            style={{ background: 'var(--red)', boxShadow: '0 0 12px var(--red)' }}
          />
        )}
        {value}
      </div>
    </div>
  )
}

interface PasswordFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  invalid?: boolean
}

/**
 * Password field built on the DS `TextInput` with a real `<button>` reveal
 * toggle. The toggle's accessible name flips "Mostrar" ↔ "Ocultar" (matching
 * the prototype's literal affordance) — deliberately not "…senha", so the
 * field label "Senha" stays the unique `getByLabelText(/senha/i)` match while
 * the toggle is still reachable as a button by name.
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
        className="pr-[68px]"
      />
      <button
        type="button"
        aria-pressed={visible}
        aria-label={label}
        title={label}
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1 rounded-xs font-sans text-[11px] font-bold uppercase tracking-[1px] text-text-muted transition-colors duration-150 hover:text-text"
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
      className="grid min-h-screen w-full grid-cols-1 overflow-hidden bg-bg text-text sm:grid-cols-[1.15fr_1fr]"
    >
      {/* LEFT — editorial hero */}
      <section className="relative flex flex-col justify-between overflow-hidden bg-bg p-8 sm:p-12">
        <PitchLines opacity={0.08} />

        {/* Giant stencil watermark numeral (decorative). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-10 -top-16 select-none"
        >
          <StencilNum value="10" size={420} color="var(--color-border-subtle)" />
        </div>

        <div className="relative z-[2]">
          <CanetaWordmark />
        </div>

        <div className="relative z-[2] max-w-[540px]">
          <SectionLabel color="var(--caneta-lime-deep)">
            Temporada 2026 — Brasileirão
          </SectionLabel>
          <h1 className="my-[18px] font-display text-[64px] uppercase leading-[0.88] tracking-[-2px] text-text sm:text-[92px]">
            Drible
            <br />
            seus amigos
            <br />
            <span className="text-lime-deep">na caneta</span>.
          </h1>
          <p className="m-0 max-w-[460px] font-sans text-[17px] leading-[1.5] text-text-muted">
            Monte seu time, escalone na rodada, e prove quem entende mesmo do
            jogo. Fantasy do Brasileirão pra liga entre amigos — sem dó, sem
            trégua.
          </p>
        </div>

        <div className="relative z-[2] flex items-center gap-6">
          {HERO_STATS.map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <div
                  aria-hidden="true"
                  className="h-9 w-px"
                  style={{ background: 'var(--ink-700)' }}
                />
              )}
              <HeroStatItem {...stat} />
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* RIGHT — parchment form */}
      <section className="relative flex flex-col justify-center bg-paper px-7 py-12 sm:px-14 sm:py-16">
        <Halftone color="var(--clay)" size={3} opacity={0.04} />

        <div
          aria-hidden="true"
          className="absolute right-7 top-6 font-mono text-[10px] uppercase tracking-[1.5px]"
          style={{ color: 'var(--clay)' }}
        >
          Acesso → temporada · 2026
        </div>

        <div className="relative w-full max-w-[380px]">
          <SectionLabel color="var(--clay)">Entrar</SectionLabel>
          <h2
            className="my-[16px] mb-2 font-display text-[44px] uppercase leading-[0.92] tracking-[-1.2px] sm:text-[64px]"
            style={{ color: 'var(--paper-ink)' }}
          >
            Bem-vindo
            <br />
            de volta, craque.
          </h2>
          <p
            className="mb-8 mt-0 font-sans text-[14px]"
            style={{ color: 'rgba(26,24,18,0.6)' }}
          >
            Sua liga te espera. Entra aí.
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
                className="font-sans text-[12px] font-semibold underline underline-offset-[3px]"
                style={{ color: 'var(--clay)' }}
              >
                Esqueci a senha
              </RouterLink>
            </div>

            <Btn
              type="submit"
              variant="paper"
              size="lg"
              loading={isPending}
              className="w-full !justify-between"
            >
              <span>Entrar na liga</span>
              <span
                aria-hidden="true"
                className="font-display text-[22px] tracking-[-1px]"
                style={{ color: 'var(--caneta-lime)' }}
              >
                →
              </span>
            </Btn>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div
              aria-hidden="true"
              className="h-px flex-1"
              style={{ background: 'rgba(26,24,18,0.15)' }}
            />
            <span
              className="font-mono text-[10px] tracking-[1.5px]"
              style={{ color: 'rgba(26,24,18,0.45)' }}
            >
              OU
            </span>
            <div
              aria-hidden="true"
              className="h-px flex-1"
              style={{ background: 'rgba(26,24,18,0.15)' }}
            />
          </div>

          <div className="flex gap-2">
            <Btn type="button" variant="ghost" size="md" className="flex-1">
              Google
            </Btn>
            <Btn type="button" variant="ghost" size="md" className="flex-1">
              Apple
            </Btn>
          </div>

          <p
            className="mt-8 font-sans text-[13px]"
            style={{ color: 'rgba(26,24,18,0.6)' }}
          >
            Novo no Caneta?{' '}
            <RouterLink
              to="/signup"
              className="font-bold underline underline-offset-[3px]"
              style={{ color: 'var(--paper-ink)' }}
            >
              Crie uma conta →
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
