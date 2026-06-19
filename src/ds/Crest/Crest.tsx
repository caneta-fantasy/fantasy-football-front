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
 * Flat two-colour geometric ROUNDELS — a clean modernist mark, not a
 * collectible shield. Each entry pairs `[a, b]` (background / device fill)
 * with a `device` division motif. Colours are sourced from the design tokens
 * (no hardcoded hex). Seed selects an entry with modulo wrap.
 */
type Device = 'bar' | 'diag' | 'chevron' | 'ring' | 'vert'

const PALETTE: ReadonlyArray<[a: string, b: string, device: Device]> = [
  ['var(--green)', 'var(--gold)', 'bar'],
  ['var(--cobalt)', 'var(--paper)', 'diag'],
  ['var(--gold)', 'var(--green)', 'chevron'],
  ['var(--green-deep)', 'var(--gold-light)', 'ring'],
  ['var(--cobalt-deep)', 'var(--cobalt-light)', 'vert'],
  ['var(--danger)', 'var(--gold-pale)', 'bar'],
]

const DEFAULT_LABEL = 'Escudo do clube'

/**
 * Geometry is normalised to a 36-unit viewBox so the rendered `width`/`height`
 * track `size` while the SVG content stays resolution-independent. `S` is the
 * viewBox span; all device coordinates are derived from it (mirrors the
 * size-relative math in the modernista source).
 */
const S = 36
const R = S / 2

/** The flat division device drawn over the roundel, clipped to the circle. */
function deviceFor(device: Device, b: string): React.ReactElement {
  switch (device) {
    case 'bar':
      return <rect x="0" y={R - S * 0.1} width={S} height={S * 0.2} fill={b} />
    case 'diag':
      return (
        <path
          d={`M0 ${S} L${S} 0 L${S} ${S * 0.34} L${S * 0.34} ${S} Z`}
          fill={b}
        />
      )
    case 'chevron':
      return (
        <path
          d={`M${R} ${S * 0.28} L${S * 0.74} ${S * 0.6} L${S * 0.62} ${S * 0.6} L${R} ${S * 0.44} L${S * 0.38} ${S * 0.6} L${S * 0.26} ${S * 0.6} Z`}
          fill={b}
        />
      )
    case 'ring':
      return (
        <circle
          cx={R}
          cy={R}
          r={S * 0.26}
          fill="none"
          stroke={b}
          strokeWidth={S * 0.09}
        />
      )
    case 'vert':
      return (
        <rect x={R - S * 0.09} y="0" width={S * 0.18} height={S} fill={b} />
      )
  }
}

export function Crest({
  seed = 0,
  size = 36,
  club,
  loading = false,
  empty = false,
  className,
  ...rest
}: CrestProps) {
  // Clip id derived from the (wrapped) seed so the same seed always yields
  // byte-identical markup (deterministic per club) while distinct seeds get
  // distinct ids. Same-seed crests are visually identical, so sharing the id
  // is harmless.
  const clipId = `crest-clip-${seed % PALETTE.length}`

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
          viewBox={`0 0 ${S} ${S}`}
          fill="none"
          aria-hidden="true"
          focusable={false}
          className="block animate-pulse"
        >
          <circle
            cx={R}
            cy={R}
            r={R - 1}
            fill="var(--color-surface-inset)"
            stroke="var(--color-border)"
            strokeWidth={1.5}
          />
        </svg>
      </span>
    )
  }

  // Empty: a dashed placeholder roundel, labelled so it is not silently blank.
  if (empty) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${S} ${S}`}
        role="img"
        aria-label="Sem escudo"
        focusable={false}
        className={['block', className].filter(Boolean).join(' ')}
        {...rest}
      >
        <title>Sem escudo</title>
        <circle
          cx={R}
          cy={R}
          r={R - 1}
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

  // Seeded roundel. Modulo wrap means any seed resolves to a valid palette.
  const [a, b, device] = PALETTE[seed % PALETTE.length] ?? PALETTE[0]
  const label = club && club.trim() ? club : DEFAULT_LABEL

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${S} ${S}`}
      role="img"
      aria-label={label}
      focusable={false}
      className={['block', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <title>{label}</title>
      <defs>
        <clipPath id={clipId}>
          <circle cx={R} cy={R} r={R} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <circle cx={R} cy={R} r={R} fill={a} />
        {deviceFor(device, b)}
      </g>
      <circle
        cx={R}
        cy={R}
        r={R - 1}
        fill="none"
        stroke={a}
        strokeWidth={1.5}
        opacity={0.25}
      />
    </svg>
  )
}
