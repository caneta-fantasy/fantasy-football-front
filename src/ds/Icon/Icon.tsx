import React from 'react'

/**
 * Caneta icon set — line icons on a 24×24 grid, 1.75px stroke, miter joins,
 * flat (butt) terminations. Geometry echoes the stencil numerals: angular,
 * upright, no soft rounding. One registry is the single source of truth.
 *
 * DS §7 #8: `sub-arrow`, `external-link`, `card-yellow`, `card-red` are
 * first-class registry entries (the prototype referenced them as undefined
 * names / a special-case branch). Unknown names warn at dev time and fall
 * back to the `info` glyph instead of throwing.
 */
const ICON_PATHS = {
  // ─── NAV ───
  home: (
    <>
      <path d="M3 10 L12 3 L21 10" />
      <path d="M5 9 V21 H19 V9" />
      <path d="M10 21 V14 H14 V21" />
    </>
  ),
  league: (
    <>
      <path d="M12 3 L20 7 V12 C20 17 16 20 12 22 C8 20 4 17 4 12 V7 Z" />
      <path d="M9 11 L11 13 L15 9" />
    </>
  ),
  market: (
    <>
      <path d="M3 6 H21 L19 11 H5 Z" />
      <path d="M5 11 V20 H19 V11" />
      <path d="M9 6 V4 H15 V6" />
      <path d="M10 20 V14 H14 V20" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21 C4 16 8 14 12 14 C16 14 20 16 20 21" />
    </>
  ),
  draft: (
    <>
      <path d="M5 3 H19 V21 L12 17 L5 21 Z" />
      <path d="M9 8 H15" />
      <path d="M9 12 H15" />
    </>
  ),

  // ─── ACTIONS ───
  edit: (
    <>
      <path d="M4 20 H9 L19 10 L14 5 L4 15 Z" />
      <path d="M13 6 L18 11" />
    </>
  ),
  swap: (
    <>
      <path d="M4 8 H17 L13 4" />
      <path d="M20 16 H7 L11 20" />
    </>
  ),
  share: (
    <>
      <circle cx="6" cy="12" r="2.6" />
      <circle cx="18" cy="5" r="2.6" />
      <circle cx="18" cy="19" r="2.6" />
      <path d="M8.4 11 L15.6 6.2" />
      <path d="M8.4 13 L15.6 17.8" />
    </>
  ),
  copy: (
    <>
      <path d="M8 8 H20 V20 H8 Z" />
      <path d="M4 16 V4 H16" />
    </>
  ),
  delete: (
    <>
      <path d="M5 6 H19" />
      <path d="M7 6 V20 H17 V6" />
      <path d="M10 3 H14 V6 H10 Z" />
      <path d="M10 10 V16" />
      <path d="M14 10 V16" />
    </>
  ),
  save: (
    <>
      <path d="M4 4 H17 L20 7 V20 H4 Z" />
      <path d="M7 4 V10 H15 V4" />
      <path d="M8 20 V14 H16 V20" />
    </>
  ),
  plus: (
    <>
      <path d="M12 4 V20" />
      <path d="M4 12 H20" />
    </>
  ),
  minus: <path d="M4 12 H20" />,
  check: <path d="M4 12 L10 18 L20 6" />,
  x: (
    <>
      <path d="M5 5 L19 19" />
      <path d="M19 5 L5 19" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5 L21 21" />
    </>
  ),
  filter: <path d="M3 5 H21 L14 13 V20 L10 18 V13 Z" />,
  sort: (
    <>
      <path d="M7 4 V20" />
      <path d="M4 8 L7 4 L10 8" />
      <path d="M14 16 L17 20 L20 16" />
      <path d="M17 20 V4" />
    </>
  ),

  // ─── DOMAIN ───
  ball: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 L15.5 9.5 L14 13.5 H10 L8.5 9.5 Z" />
      <path d="M12 7 V3.2" />
      <path d="M15.5 9.5 L19.5 8.5" />
      <path d="M14 13.5 L16.5 17.5" />
      <path d="M10 13.5 L7.5 17.5" />
      <path d="M8.5 9.5 L4.5 8.5" />
    </>
  ),
  whistle: (
    <>
      <path d="M3 9 H13 L13 13 A5 5 0 1 1 8 17 H7 V9" />
      <path d="M13 9 L20 6 V11 L13 12" />
      <circle cx="8" cy="17" r="1.4" />
    </>
  ),
  jersey: (
    <>
      <path d="M8 3 L4 6 L6 9 L8 8 V21 H16 V8 L18 9 L20 6 L16 3 L14 5 H10 Z" />
      <path d="M10 3 C10 6 14 6 14 3" />
    </>
  ),
  boot: (
    <>
      <path d="M3 7 H9 L11 13 H19 C21 13 21 17 19 17 H4 V7" />
      <path d="M4 17 V20 H20 V17" />
      <path d="M9 9 H13" />
    </>
  ),
  // The two cartão glyphs are the only filled icons in the set (DS §7 #8).
  'card-yellow': <rect x="6" y="3" width="12" height="18" />,
  'card-red': <rect x="6" y="3" width="12" height="18" />,
  'captain-c': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M15 9 A4 4 0 1 0 15 15" />
    </>
  ),
  'sub-arrow': (
    <>
      <path d="M7 4 V14 L4 11" />
      <path d="M7 14 L10 11" />
      <path d="M17 20 V10 L20 13" />
      <path d="M17 10 L14 13" />
    </>
  ),
  formation: (
    <>
      <rect x="3" y="3" width="18" height="18" />
      <path d="M3 12 H21" />
      <circle cx="12" cy="12" r="3" />
      <path d="M9 3 V6 H15 V3" />
      <path d="M9 21 V18 H15 V21" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" />
      <path d="M3 9 H21" />
      <path d="M8 3 V7" />
      <path d="M16 3 V7" />
      <path d="M7 13 H9" />
      <path d="M11 13 H13" />
      <path d="M15 13 H17" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 V12 L16 14" />
    </>
  ),
  fire: <path d="M12 3 C13 7 17 8 17 13 A5 5 0 0 1 7 13 C7 10 9 9 9 7 C11 8 11 10 11 11 C12 10 12 6 12 3 Z" />,
  trophy: (
    <>
      <path d="M7 4 H17 V9 A5 5 0 0 1 7 9 Z" />
      <path d="M7 6 H4 V8 A3 3 0 0 0 7 11" />
      <path d="M17 6 H20 V8 A3 3 0 0 1 17 11" />
      <path d="M12 14 V18" />
      <path d="M8 21 H16 L15 18 H9 Z" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="15" r="5.5" />
      <path d="M9 11 L6 3 H10 L12 8" />
      <path d="M15 11 L18 3 H14 L12 8" />
      <path d="M12 13 L13 15 H15 L13.5 16.5 L14 18.5 L12 17.5 L10 18.5 L10.5 16.5 L9 15 H11 Z" />
    </>
  ),
  ranking: (
    <>
      <path d="M4 20 H8 V12 H4 Z" />
      <path d="M10 20 H14 V4 H10 Z" />
      <path d="M16 20 H20 V9 H16 Z" />
    </>
  ),

  // ─── SYSTEM ───
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2 L13.5 5 H10.5 Z" />
      <path d="M12 22 L10.5 19 H13.5 Z" />
      <path d="M2 12 L5 10.5 V13.5 Z" />
      <path d="M22 12 L19 13.5 V10.5 Z" />
      <path d="M5 5 L8 6 L6 8 Z" />
      <path d="M19 19 L16 18 L18 16 Z" />
      <path d="M19 5 L16 6 L18 8 Z" />
      <path d="M5 19 L8 18 L6 16 Z" />
    </>
  ),
  bell: (
    <>
      <path d="M6 16 V10 A6 6 0 0 1 18 10 V16 L20 19 H4 Z" />
      <path d="M10 19 A2 2 0 0 0 14 19" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 6 L12 13 L21 6" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10" width="14" height="11" />
      <path d="M8 10 V7 A4 4 0 0 1 16 7 V10" />
      <path d="M12 14 V17" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12 C5 6 9 4 12 4 C15 4 19 6 22 12 C19 18 15 20 12 20 C9 20 5 18 2 12 Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M4 5 L20 19" />
      <path d="M2 12 C4 8 6 6 8.5 5" />
      <path d="M11 4.2 C11.3 4 11.7 4 12 4 C15 4 19 6 22 12 C21 14 20 15.5 18.5 16.8" />
      <path d="M14.5 14.5 A3 3 0 0 1 9.5 9.5" />
      <path d="M6 9 C4.5 10 3 11 2 12 C5 18 9 20 12 20 C13.3 20 14.7 19.6 16 18.8" />
    </>
  ),
  'chevron-up': <path d="M5 15 L12 8 L19 15" />,
  'chevron-down': <path d="M5 9 L12 16 L19 9" />,
  'chevron-left': <path d="M15 5 L8 12 L15 19" />,
  'chevron-right': <path d="M9 5 L16 12 L9 19" />,
  'external-link': (
    <>
      <path d="M14 4 H20 V10" />
      <path d="M20 4 L11 13" />
      <path d="M18 14 V20 H4 V6 H10" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 V8" />
      <path d="M12 11 V17" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 L22 20 H2 Z" />
      <path d="M12 9 V14" />
      <path d="M12 16 V17" />
    </>
  ),
  alert: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7 V13" />
      <path d="M12 16 V17" />
    </>
  ),
  'success-check': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12 L11 15 L16 9" />
    </>
  ),
} satisfies Record<string, React.ReactNode>

export type IconName = keyof typeof ICON_PATHS
export type IconSize = 16 | 20 | 24

const SIZES: Record<number, number> = { 16: 16, 20: 20, 24: 24 }
const DEFAULT_SIZE = 24

// The two cartão glyphs are the only filled icons; they read as solid cards.
const CARD_FILL: Record<string, { fill: string; stroke: string }> = {
  'card-yellow': { fill: 'var(--yellow)', stroke: 'var(--ink-900)' },
  'card-red': { fill: 'var(--red)', stroke: 'var(--ink-900)' },
}

export interface IconProps extends Omit<React.SVGProps<SVGSVGElement>, 'name'> {
  /** Registry key for the glyph to render. Unknown names warn (dev) and fall back to `info`. */
  name: IconName
  /** 16, 20 or 24 px. Defaults to 24. */
  size?: IconSize
  /**
   * Accessible label. When provided the icon is meaningful: `role="img"` + a
   * `<title>`. When omitted the icon is decorative: `aria-hidden`.
   */
  title?: string
}

export function Icon({ name, size = 24, title, className, ...rest }: IconProps) {
  const body = ICON_PATHS[name]

  if (process.env.NODE_ENV !== 'production' && body === undefined) {
    // DS §7 #8: dev-time warning, never throw.
    console.warn(
      `[ds/Icon] Unknown icon name "${String(name)}". Falling back to "info". ` +
        `Add it to the registry in src/ds/Icon/Icon.tsx.`,
    )
  }

  const glyph = body ?? ICON_PATHS.info
  const px = SIZES[size] ?? DEFAULT_SIZE
  const card = CARD_FILL[name]

  const decorative = title === undefined

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill={card ? card.fill : 'none'}
      stroke={card ? card.stroke : 'currentColor'}
      strokeWidth={1.75}
      strokeLinecap="butt"
      strokeLinejoin="miter"
      className={className}
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      focusable={false}
      {...rest}
    >
      {!decorative && <title>{title}</title>}
      {glyph}
    </svg>
  )
}
