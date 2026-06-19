import React from 'react'

/**
 * SubHead — the modernista section heading: a heavy, wide Archivo display title
 * that headlines a screen section (e.g. "Jogadores", "Classificação").
 *
 * Source: `app/screens.jsx:SubHead` — `disp(22|19, { wght: 800, wdth: 114 })`.
 * Unlike {@link Overline} (a small tracked caption), SubHead is the large
 * section title, so it renders as a real heading by default to keep the
 * document outline intact.
 *
 * a11y contract: real heading element (`h2` by default; override with `as`/
 * `level`); the wide/heavy poster look comes from `fontVariationSettings`, not
 * a second face. Stays in the accessibility tree as genuine heading content.
 */
export interface SubHeadProps
  extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'color'> {
  children: React.ReactNode
  /** Compact sizing for the mobile breakpoint. */
  compact?: boolean
  /** Heading level → element. Defaults to 2 (`<h2>`). */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /** Override the rendered element (e.g. a `span`). Wins over `level`. */
  as?: React.ElementType
}

// Archivo display, wide + heavy via fontVariationSettings (wght 800 / wdth 114).
const dispStyle = (compact: boolean): React.CSSProperties => ({
  fontFamily: 'var(--font-display)',
  fontVariationSettings: '"wght" 800, "wdth" 114',
  fontSize: compact ? 19 : 22,
  lineHeight: 1,
  letterSpacing: '-0.3px',
  color: 'var(--ink)',
  margin: 0,
})

export function SubHead({
  children,
  compact = false,
  level = 2,
  as,
  className,
  style,
  ...rest
}: SubHeadProps) {
  const Tag = (as ?? (`h${level}` as React.ElementType)) as React.ElementType
  return (
    <Tag
      className={`font-display ${className ?? ''}`.trim()}
      style={{ ...dispStyle(compact), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}
