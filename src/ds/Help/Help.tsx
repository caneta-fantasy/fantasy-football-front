import React from 'react'
import { Icon } from '../Icon/Icon'

export type HelpTone = 'neutral' | 'error' | 'success'

export interface HelpProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** Stable id so the field control can reference this via aria-describedby. */
  id?: string
  /** Visual + semantic tone. `error` upgrades the node to role="alert". */
  tone?: HelpTone
  children: React.ReactNode
}

// Each tone owns its text color and optional leading glyph. A default
// fallback (neutral) means an unknown tone never throws (DS §7 #1).
const TONES: Record<
  HelpTone,
  { color: string; icon: 'alert' | 'success-check' | null }
> = {
  // textMuted, not textSubtle — small functional text needs the 5.6:1 token (DS §7 #4).
  neutral: { color: 'text-text-muted', icon: null },
  error: { color: 'text-red', icon: 'alert' },
  success: { color: 'text-lime-deep', icon: 'success-check' },
}

const ICON_COLOR: Record<'alert' | 'success-check', string> = {
  alert: 'var(--red)',
  'success-check': 'var(--caneta-lime-deep)',
}

const BASE = 'flex items-center gap-[6px] mt-2 font-sans text-[11.5px]'

/**
 * Helper / validation message shown beneath a field. The `error` tone renders
 * with `role="alert"` so a newly-surfaced validation error is announced; the
 * neutral and success tones are silent. Pair with `aria-describedby` on the
 * control (FieldGroup wires this automatically).
 */
export function Help({
  id,
  tone = 'neutral',
  className,
  children,
  ...rest
}: HelpProps) {
  const t = TONES[tone] ?? TONES.neutral
  const isError = tone === 'error'

  return (
    <div
      id={id}
      role={isError ? 'alert' : undefined}
      className={`${BASE} ${t.color} ${className ?? ''}`.trim()}
      {...rest}
    >
      {t.icon && (
        <Icon
          name={t.icon}
          size={16}
          aria-hidden="true"
          style={{ color: ICON_COLOR[t.icon], flexShrink: 0 }}
        />
      )}
      <span>{children}</span>
    </div>
  )
}
