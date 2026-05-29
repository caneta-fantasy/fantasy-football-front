import React from 'react'
import { Icon } from '../Icon/Icon'
import './DeadlineCountdown.css'

/**
 * DeadlineCountdown — the one piece in the system that changes color by
 * urgency (design principle #2): lime/`caneta` while there is time, `yellow`
 * in the final stretch, pulsing `red` in the last seconds, then a neutral
 * `locked` state once the deadline has passed.
 *
 * a11y contract:
 * - Rendered as `role="timer"` with `aria-live="polite"`, so assistive tech
 *   announces updates. To avoid a flood, the announced (sr-only) sentence only
 *   re-renders when the minute (or the locked state) changes — the visible
 *   HH:MM:SS still ticks every second.
 * - The clock icon is decorative (`aria-hidden`); meaning is carried by text.
 * - Color is never the only cue: the urgency label text changes with the tone,
 *   and the locked state shows a lock icon + label.
 */

export type DeadlineTone = 'caneta' | 'yellow' | 'red' | 'locked'

/** Remaining-time thresholds (in seconds) at which the tone escalates. */
export interface DeadlineThresholds {
  /** At or below this many seconds remaining, switch to `yellow`. */
  yellow: number
  /** At or below this many seconds remaining, switch to `red`. */
  red: number
}

export interface DeadlineCountdownProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /** When the window closes. Accepts a `Date`, epoch ms, or an ISO string. */
  deadline: Date | number | string
  /**
   * Override the urgency thresholds. Unknown/malformed values fall back to the
   * defaults (no throw). Default: yellow ≤ 10min, red ≤ 60s.
   */
  thresholds?: DeadlineThresholds
  /** Label shown above the clock while counting down (`caneta`/`yellow`/`red`). */
  label?: string
  /** Label shown once the deadline has passed. Default `FECHADA`. */
  lockedLabel?: string
  /**
   * Inject a fixed "now" (epoch ms) for tests/SSR. When omitted the component
   * uses `Date.now()` and ticks once per second.
   */
  now?: number
}

const DEFAULT_THRESHOLDS: DeadlineThresholds = { yellow: 600, red: 60 }

// Per-tone label fallback (used when no explicit `label` is supplied). The text
// itself escalates so urgency is communicated without relying on color alone.
const DEFAULT_LABELS: Record<Exclude<DeadlineTone, 'locked'>, string> = {
  caneta: 'FECHA EM',
  yellow: 'ÚLTIMA CHANCE',
  red: 'FECHANDO',
}

// Tone → Tailwind utility classes mapped to tokens. §7 #3: red uses the danger
// foreground (ink900), never white-on-red.
const TONE_CLS: Record<DeadlineTone, string> = {
  caneta: 'bg-lime text-[color:var(--color-on-lime)]',
  yellow: 'bg-yellow text-[color:var(--color-on-lime)]',
  red: 'bg-red text-[color:var(--color-danger-fg)]',
  locked: 'bg-surface-inset text-text-muted',
}

function toMs(deadline: Date | number | string): number {
  if (deadline instanceof Date) return deadline.getTime()
  if (typeof deadline === 'number') return deadline
  const parsed = new Date(deadline).getTime()
  return Number.isNaN(parsed) ? 0 : parsed
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** Format whole seconds remaining as HH:MM:SS (clamped at zero). */
function formatRemaining(totalSeconds: number): string {
  const s = Math.max(0, totalSeconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  return `${pad(h)}:${pad(m)}:${pad(sec)}`
}

function toneFor(
  secondsRemaining: number,
  thresholds: DeadlineThresholds,
): DeadlineTone {
  if (secondsRemaining <= 0) return 'locked'
  if (secondsRemaining <= thresholds.red) return 'red'
  if (secondsRemaining <= thresholds.yellow) return 'yellow'
  return 'caneta'
}

const BASE =
  'relative overflow-hidden inline-flex flex-col rounded-xs px-4 py-3 ' +
  'font-sans min-w-[150px]'

// Visually-hidden recipe (matches Spinner/Chip): out of the visual flow, still
// in the a11y tree. Used for the throttled live-region sentence.
const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

export function DeadlineCountdown({
  deadline,
  thresholds,
  label,
  lockedLabel = 'FECHADA',
  now,
  className,
  ...rest
}: DeadlineCountdownProps) {
  // Default-fallback: a malformed thresholds object resolves rather than throws.
  const th =
    thresholds && typeof thresholds.yellow === 'number' && typeof thresholds.red === 'number'
      ? thresholds
      : DEFAULT_THRESHOLDS

  const deadlineMs = React.useMemo(() => toMs(deadline), [deadline])

  const getNow = React.useCallback(
    () => (typeof now === 'number' ? now : Date.now()),
    [now],
  )

  const [nowMs, setNowMs] = React.useState(getNow)

  // Tick once per second while the deadline is in the future. The interval is
  // self-clearing once locked, so a finished countdown does no further work.
  React.useEffect(() => {
    setNowMs(getNow())
    if (deadlineMs - getNow() <= 0) return
    const id = setInterval(() => {
      const current = getNow()
      setNowMs(current)
      if (deadlineMs - current <= 0) clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [deadlineMs, getNow])

  const secondsRemaining = Math.floor((deadlineMs - nowMs) / 1000)
  const tone = toneFor(secondsRemaining, th)
  const toneCls = TONE_CLS[tone] ?? TONE_CLS.caneta
  const locked = tone === 'locked'

  const displayLabel = locked
    ? lockedLabel
    : label ?? DEFAULT_LABELS[tone as Exclude<DeadlineTone, 'locked'>]

  const timeText = formatRemaining(secondsRemaining)

  // sr-only sentence: throttled to minute granularity so polite announcements
  // do not fire every second. Locked state announces once.
  const minutesRemaining = Math.max(0, Math.ceil(secondsRemaining / 60))
  const announce = locked
    ? `Inscrições encerradas. ${lockedLabel}.`
    : minutesRemaining <= 1
      ? `${displayLabel}: menos de um minuto restante.`
      : `${displayLabel}: ${minutesRemaining} minutos restantes.`

  return (
    <div
      data-tone={tone}
      className={[BASE, toneCls, className].filter(Boolean).join(' ')}
      role="timer"
      aria-live="polite"
      {...rest}
    >
      {/* Decorative halftone-ish texture is omitted to keep the primitive lean;
          the urgency dot is the only motion, and only in the red state. */}
      {tone === 'red' && <span className="ds-deadline-dot" aria-hidden="true" />}

      <span className="relative flex items-center gap-2">
        <Icon
          name={locked ? 'lock' : 'clock'}
          size={16}
          className="shrink-0"
          aria-hidden
        />
        <span className="font-mono text-[9.5px] font-bold uppercase tracking-[1px]">
          {displayLabel}
        </span>
      </span>

      {!locked && (
        <span
          className="relative mt-1 font-display text-[40px] leading-[0.9] tracking-[-1.5px] [font-variant-numeric:tabular-nums]"
          aria-hidden="true"
        >
          {timeText}
        </span>
      )}

      {/* Single throttled live sentence drives announcements (visually hidden). */}
      <span style={srOnly}>{announce}</span>
    </div>
  )
}
