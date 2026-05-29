import React from 'react'

export interface CrestProps
  extends Omit<React.SVGProps<SVGSVGElement>, 'role'> {
  /**
   * Deterministic palette seed. Indexes into the crest palette with a modulo
   * wrap, so any integer is safe (no throw — §7 #1). Defaults to 0.
   */
  seed?: number
  /** Edge length in px (square). Defaults to 36. */
  size?: number
  /**
   * Club name. Drives the accessible `<title>` label. When omitted the crest
   * is labelled generically ("Escudo do clube").
   */
  club?: string
  /** Loading variant: a busy status placeholder instead of a crest. */
  loading?: boolean
  /** Empty variant: a labelled "sem escudo" placeholder (no club to show). */
  empty?: boolean
}

/**
 * Brazilian-style abstract shield palettes [shield, inner/charge], sourced from
 * the design tokens (no hardcoded hex). Seed selects a pair with modulo wrap.
 */
const PALETTE: ReadonlyArray<[shield: string, charge: string]> = [
  ['var(--caneta-lime)', 'var(--ink-900)'],
  ['var(--red)', 'var(--ink-900)'],
  ['var(--yellow)', 'var(--pitch)'],
  ['var(--pitch)', 'var(--chalk)'],
  ['var(--pos-blue)', 'var(--ink-900)'],
  ['var(--clay)', 'var(--chalk)'],
  ['var(--ink-900)', 'var(--caneta-lime)'],
  ['var(--ink-600)', 'var(--ink-100)'],
]

const DEFAULT_LABEL = 'Escudo do clube'

/** Shared shield outline path so all variants align on the same silhouette. */
const SHIELD_PATH = 'M18 1 L33 6 L33 20 Q33 30 18 35 Q3 30 3 20 L3 6 Z'

export function Crest({
  seed = 0,
  size = 36,
  club,
  loading = false,
  empty = false,
  className,
  ...rest
}: CrestProps) {
  // Loading takes priority: announce a busy status, render no crest image.
  if (loading) {
    return (
      <span
        role="status"
        aria-busy="true"
        aria-label="Carregando escudo"
        className={['inline-flex items-center justify-center align-middle', className]
          .filter(Boolean)
          .join(' ')}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 36 36"
          fill="none"
          aria-hidden="true"
          focusable={false}
          className="block animate-pulse"
        >
          <path
            d={SHIELD_PATH}
            fill="var(--color-surface-inset)"
            stroke="var(--color-border)"
            strokeWidth={1.5}
          />
        </svg>
      </span>
    )
  }

  // Empty: a dashed placeholder shield, labelled so it is not silently blank.
  if (empty) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        role="img"
        aria-label="Sem escudo"
        focusable={false}
        className={['block', className].filter(Boolean).join(' ')}
        {...rest}
      >
        <title>Sem escudo</title>
        <path
          d={SHIELD_PATH}
          fill="var(--color-surface-inset)"
          stroke="var(--color-border-strong)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
        />
        <path
          d="M14 14 L22 22 M22 14 L14 22"
          stroke="var(--color-border-strong)"
          strokeWidth={1.5}
          strokeLinecap="round"
        />
      </svg>
    )
  }

  // Seeded crest. Modulo wrap means any seed resolves to a valid palette.
  const [shield, charge] = PALETTE[seed % PALETTE.length] ?? PALETTE[0]
  const label = club && club.trim() ? club : DEFAULT_LABEL

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      role="img"
      aria-label={label}
      focusable={false}
      className={['block', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <title>{label}</title>
      <path d={SHIELD_PATH} fill={shield} stroke={charge} strokeWidth={1.5} />
      <path
        d="M18 8 L26 11 L26 20 Q26 25 18 28 Q10 25 10 20 L10 11 Z"
        fill={charge}
        opacity={0.92}
      />
      <text
        x="18"
        y="22"
        textAnchor="middle"
        fontFamily="Anton, Impact, sans-serif"
        fontSize="11"
        fill={shield}
        letterSpacing="0.5"
      >
        FC
      </text>
    </svg>
  )
}
