import React from 'react'

export interface AvatarProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** Full display name. Used for the accessible label AND to derive initials. */
  name: string
  /** Optional image URL. When it loads, the avatar shows the photo; on error
   *  it falls back to the seeded initials box. */
  src?: string
  /** Edge length in px. Round roundel by design (border-radius: 50%). Defaults to 36. */
  size?: number
  /**
   * Deterministic palette seed. When omitted, the seed is derived from `name`
   * so the same person always gets the same colour.
   */
  seed?: number
}

/**
 * Seeded background/foreground palette — the modernista green/gold/cobalt set
 * (no hardcoded hex — every entry is a CSS variable). The seed indexes into
 * this list with a modulo wrap, so any integer is safe (no throw, §7 #1).
 * Each fg is the matching on-color so initials always clear 4.5:1.
 */
const PALETTE: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: 'var(--green)', fg: 'var(--on-green)' },
  { bg: 'var(--gold)', fg: 'var(--on-gold)' },
  { bg: 'var(--cobalt)', fg: '#fff' },
  { bg: 'var(--green-600)', fg: 'var(--on-green)' },
  { bg: 'var(--cobalt-deep)', fg: '#fff' },
  { bg: 'var(--gold-deep)', fg: '#fff' },
]

/** Stable, non-negative string hash so a name maps to a deterministic seed. */
function hashName(name: string): number {
  let h = 0
  for (let i = 0; i < name.length; i++) {
    h = (h * 31 + name.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

/**
 * Derive ≤2 uppercase initials from a name:
 *  - multiple words → first letter of the first + first letter of the last word
 *  - a single word  → its first two letters
 * Always truncated to 2 characters (spec: "truncate >2 chars").
 */
function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const raw =
    words.length === 1
      ? words[0].slice(0, 2)
      : words[0][0] + words[words.length - 1][0]
  return raw.slice(0, 2).toUpperCase()
}

const BASE =
  'inline-flex items-center justify-center align-middle select-none overflow-hidden ' +
  'font-display font-extrabold leading-none tracking-[-0.5px] rounded-full'

export function Avatar({
  name,
  src,
  size = 36,
  seed,
  className,
  style,
  ...rest
}: AvatarProps) {
  const [imageFailed, setImageFailed] = React.useState(false)

  // Reset the failure flag if the src changes to a new image.
  React.useEffect(() => {
    setImageFailed(false)
  }, [src])

  const resolvedSeed = seed ?? hashName(name)
  // Modulo wrap — any seed resolves; never indexes out of range.
  const swatch = PALETTE[resolvedSeed % PALETTE.length] ?? PALETTE[0]
  const initials = initialsOf(name)

  const boxStyle: React.CSSProperties = {
    width: size,
    height: size,
    background: swatch.bg,
    color: swatch.fg,
    fontSize: size * 0.42,
    ...style,
  }

  const cls = [BASE, className].filter(Boolean).join(' ')

  // Image branch: a real <img> already carries role="img"; alt = full name.
  if (src && !imageFailed) {
    return (
      <span className={cls} style={{ width: size, height: size, ...style }} {...rest}>
        <img
          src={src}
          alt={name}
          width={size}
          height={size}
          className="block h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      </span>
    )
  }

  // Initials fallback: the box itself is the labelled image.
  return (
    <span
      role="img"
      aria-label={name}
      className={cls}
      style={boxStyle}
      {...rest}
    >
      <span aria-hidden="true">{initials}</span>
    </span>
  )
}
