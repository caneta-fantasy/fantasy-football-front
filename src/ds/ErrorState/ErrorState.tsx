import React from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import { Btn } from '../Btn/Btn'

/**
 * ErrorState — the full-surface failure screen in the house voice. Three
 * variants: `404` (not found), `500` (server fault, dark "broadcast" tone) and
 * `offline` (no connection). Sources: DS `screens/09-navigation.jsx`
 * (E · Estados de erro).
 *
 * DS §7 fixes applied:
 * - Every variant ships a **retry CTA** (the prototype had none) so the user
 *   always has a way forward. It's a real `<Btn>`/native button.
 * - The whole block is `role="alert"` so assistive tech announces the failure
 *   the moment it renders.
 * - The offline variant uses a **labelled glyph** (`role="img"` + accessible
 *   name) rather than the prototype's decorative `∅` numeral, so screen-reader
 *   users learn the connection dropped.
 * - The variant map has a `404` **default fallback** (`MAP[variant] ?? MAP['404']`)
 *   so an unknown variant resolves instead of throwing (DS §7 #1 pattern).
 */
type Variant = '404' | '500' | 'offline'

interface VariantSpec {
  /** Large display string in the corner / hero slot. */
  code: string
  /** Display headline. */
  title: string
  /** Body copy in the house voice. */
  body: string
  /** Dark "broadcast" surface vs. light paper. */
  dark: boolean
  /**
   * When set, the hero shows a meaningful labelled glyph (role="img" + this
   * accessible name) instead of a decorative oversized code numeral.
   */
  glyph?: { name: IconName; label: string }
}

const VARIANTS: Record<Variant, VariantSpec> = {
  '404': {
    code: '404',
    title: 'Bola fora',
    body: 'Essa página saiu pela linha de fundo. Não tem nada aqui, craque.',
    dark: false,
  },
  '500': {
    code: '500',
    title: 'Caneta no sistema',
    body: 'Deu ruim do nosso lado. A gente já tá no VAR resolvendo.',
    dark: true,
  },
  offline: {
    code: '∅',
    title: 'Sem conexão',
    body: 'Caiu o sinal. Confere o wi-fi e tenta de novo daqui a pouco.',
    dark: false,
    glyph: { name: 'warning', label: 'Sem conexão' },
  },
}

const BASE = 'relative overflow-hidden h-full px-6 py-7 border'
const LIGHT = 'bg-bg text-text border-border'
const DARK = 'bg-ink-900 text-text-on-dark border-ink-700'

export interface ErrorStateProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Which failure to show. Unknown values fall back to `404` (never throws). */
  variant?: Variant
  /** Retry handler wired to the always-present CTA. */
  onRetry?: () => void
  /** Override the default "Tentar de novo" retry label. */
  retryLabel?: string
}

export function ErrorState({
  variant = '404',
  onRetry,
  retryLabel = 'Tentar de novo',
  className,
  ...rest
}: ErrorStateProps) {
  // Default-fallback map: an unknown variant resolves to 404 rather than throwing.
  const spec = VARIANTS[variant] ?? VARIANTS['404']
  const surface = spec.dark ? DARK : LIGHT

  return (
    <section
      role="alert"
      className={`${BASE} ${surface}${className ? ` ${className}` : ''}`}
      {...rest}
    >
      {/* Top accent stripe — pure decoration. */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 top-0 h-[5px] ${spec.dark ? 'bg-red' : 'bg-lime'}`}
      />

      <div className="relative">
        {spec.glyph ? (
          // Offline: a meaningful, labelled glyph (DS §7).
          <Icon
            name={spec.glyph.name}
            size={24}
            title={spec.glyph.label}
            className="text-red"
          />
        ) : (
          // 404 / 500: an oversized decorative code numeral.
          <span
            aria-hidden="true"
            className={`block font-display leading-[0.8] tracking-[-3px] text-[88px] ${spec.dark ? 'text-lime' : 'text-ink-900'}`}
          >
            {spec.code}
          </span>
        )}

        <h2
          className={`mt-2 font-display uppercase tracking-[-0.3px] text-[24px] ${spec.dark ? 'text-text-on-dark' : 'text-text'}`}
        >
          {spec.title}
        </h2>

        <p
          className={`mt-2 max-w-[250px] font-sans text-[12.5px] leading-[1.5] ${spec.dark ? 'text-[color:var(--ink-300)]' : 'text-text-muted'}`}
        >
          {spec.body}
        </p>

        <div className="mt-5">
          <Btn
            variant={spec.dark ? 'primary' : 'secondary'}
            size="sm"
            onClick={onRetry}
          >
            {retryLabel}
          </Btn>
        </div>
      </div>
    </section>
  )
}
