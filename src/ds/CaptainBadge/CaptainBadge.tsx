import React from 'react'

/**
 * CaptainBadge — the small circular "C"/"V" pip pinned to a player's chip to
 * mark the captain and vice-captain of a lineup (DS `screens/13-fantasy-patterns.jsx`).
 *
 * §7 #7 fix: the prototype had THREE uncoordinated `CapBadge` implementations
 * scattered across screens. This is the single primitive — one `role` ('C' | 'V')
 * and one `size`, with one spelled-out accessible label per role.
 *
 * a11y contract:
 *  - `role="img"` with an `aria-label` that spells the role out
 *    ("Capitão" / "Vice-capitão") — the single, unambiguous announcement.
 *  - The visible glyph (the letter C/V) is `aria-hidden`, so colour/letter is
 *    never the only cue; the label carries the meaning for assistive tech.
 */
export type CaptainRole = 'C' | 'V'

type SizeToken = 'sm' | 'md' | 'lg'

export interface CaptainBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, 'children' | 'role'> {
  /** `C` = captain, `V` = vice-captain. Unknown values fall back to `C`. */
  role: CaptainRole
  /** Semantic size token (`sm | md | lg`) or a raw pixel diameter. */
  size?: SizeToken | number
}

interface RoleStyle {
  /** Tailwind classes mapped to tokens (fill / text / optional ring). */
  cls: string
  /** The single glyph drawn inside the pip. */
  glyph: string
  /** Spelled-out accessible name. */
  label: string
}

/**
 * Captain and vice are deliberately inverse treatments so they read apart at a
 * glance even at 24px: captain is a solid lime pip with dark ink text; vice is
 * a dark ink pip with a lime glyph + lime ring (echoes the source `CapBadge`).
 */
const ROLES: Record<CaptainRole, RoleStyle> = {
  C: {
    cls: 'bg-lime text-[color:var(--color-on-lime)]',
    glyph: 'C',
    label: 'Capitão',
  },
  V: {
    cls:
      'bg-ink-900 text-lime ' +
      'ring-[1.5px] ring-inset ring-[color:var(--caneta-lime)]',
    glyph: 'V',
    label: 'Vice-capitão',
  },
}

// Diameter in px. `md` (24) echoes the source screen's pip; `sm`/`lg` flank it.
const SIZES: Record<SizeToken, number> = {
  sm: 18,
  md: 24,
  lg: 32,
}

const BASE =
  'inline-flex items-center justify-center align-middle select-none ' +
  'rounded-full font-display leading-none tracking-[-0.5px]'

export function CaptainBadge({
  role,
  size = 'md',
  className,
  style,
  ...rest
}: CaptainBadgeProps) {
  // Resolve role with a default fallback — never throw on an unknown value (§7 #1).
  const r = ROLES[role] ?? ROLES.C

  // Resolve a numeric diameter: a raw number passes through; a token resolves
  // via the map with an `md` fallback so an unknown key never throws (§7 #1).
  const px = typeof size === 'number' ? size : SIZES[size] ?? SIZES.md

  const cls = [BASE, r.cls, className].filter(Boolean).join(' ')

  return (
    <span
      data-role={role}
      role="img"
      aria-label={r.label}
      className={cls}
      style={{
        width: `${px}px`,
        height: `${px}px`,
        // Glyph scales with the pip (Anton reads well at ~58% of the diameter).
        fontSize: `${Math.round(px * 0.58)}px`,
        ...style,
      }}
      {...rest}
    >
      {/* The spelled-out label is the announcement; the glyph is decorative. */}
      <span aria-hidden="true">{r.glyph}</span>
    </span>
  )
}
