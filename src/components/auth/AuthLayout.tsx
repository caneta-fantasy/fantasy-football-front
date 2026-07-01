import React from 'react'
import { ArchShape, Azulejo, Overline, Wordmark } from '@/ds'

/**
 * AuthLayout — the shared modernista chrome for the auth/account screens
 * (SignUp, ForgotPassword, ResetPassword, VerifyEmail, AcceptInvite).
 *
 * It reproduces the SignIn reference migration's split shell: a GREEN
 * color-block brand hero on the left/top (faint `Azulejo` tile lattice + one
 * gold `ArchShape` Niemeyer curve + the Caneta `Wordmark` under a season
 * `Overline` and a Spectral-italic tagline) and a clean white panel on the
 * right/bottom that carries the page's own title, lead, and content.
 *
 * The brand hero is constant across every auth page; only the white panel
 * (`title` / `lead` / `children`) varies. The root carries `data-ds` so the
 * scoped base layer (reset + `:focus-visible` ring) applies without leaking
 * into the still-MUI screens that share the app.
 */

// The poster-display recipe (variable Archivo, heavy + wide). Kept in sync with
// the SignIn reference: font-size drives the optical width axis.
function displayStyle(
  size: number,
  opts: { wght?: number; wdth?: number; lh?: number; ls?: number; color: string },
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

export interface AuthLayoutProps {
  /** White-panel headline — rendered as the page's level-2 heading. */
  title: React.ReactNode
  /** Optional Spectral-italic subtitle under the title. */
  lead?: React.ReactNode
  /** The form or status content for the white panel. */
  children: React.ReactNode
}

export function AuthLayout({ title, lead, children }: AuthLayoutProps) {
  return (
    <div
      data-ds
      className="grid min-h-screen w-full grid-cols-1 overflow-hidden bg-bg font-sans text-ink sm:grid-cols-2"
    >
      {/* LEFT / TOP — green color-block brand hero (constant across auth pages) */}
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
          <Wordmark
            variant="dark"
            height={92}
            className="mt-4 -ml-1"
            alt="Caneta Fantasy"
          />
          <p className="mt-4 font-serif text-[16px] italic text-on-green-mute sm:text-[18px]">
            Monte o time. Vença a rodada.
          </p>
        </div>
      </section>

      {/* RIGHT / BOTTOM — white panel */}
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
            {title}
          </h2>
          {lead && (
            <p className="mb-7 mt-3 font-serif text-[16px] italic text-ink-muted">
              {lead}
            </p>
          )}

          {children}
        </div>
      </section>
    </div>
  )
}
