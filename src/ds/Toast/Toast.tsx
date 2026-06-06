import React from 'react'
import { Icon, type IconName } from '../Icon/Icon'
import './Toast.css'

export type ToastTone = 'success' | 'error' | 'info' | 'warning'

export interface ToastAction {
  /** Visible, uppercase action label (e.g. "Desfazer"). */
  label: string
  /** Fired when the action button is pressed. */
  onClick: () => void
}

export interface ToastProps {
  /** Visual + semantic tone. Unknown values fall back to `info` (no throw — §7 #1). */
  tone?: ToastTone
  /** Bold headline line. */
  title: React.ReactNode
  /** Optional supporting copy under the title. */
  body?: React.ReactNode
  /** Optional single action (e.g. "Desfazer"). Rendered as a real button. */
  action?: ToastAction
  /** Called when the dismiss (×) button is pressed. */
  onDismiss?: () => void
  /**
   * 0..1 fraction of the remaining auto-dismiss time. When provided a thin
   * progress bar is rendered along the bottom edge. Driven by the provider.
   */
  progress?: number
  /** Forwarded so the provider can pause/resume on hover. */
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>
  /** Extra data attribute hook (used by the provider to locate a toast). */
  'data-ds-toast'?: string
}

interface ToneSpec {
  /** Tailwind class for the accent color (bg + bar). */
  accent: string
  /** Glyph rendered in the leading badge. */
  icon: IconName
  /** Tailwind text color for the glyph (must contrast with the accent). */
  iconText: string
  /** Tailwind text color for the action button label. */
  actionText: string
  /** Live-region semantics: status (polite) or alert (assertive). */
  role: 'status' | 'alert'
  live: 'polite' | 'assertive'
}

// Modernista: the toast is a bottle-green broadcast band. Each tone carries a
// 5px accent bar + a badge in its own functional hue (own hues, never the
// referee card colours). §7 #3: the accent hue is never a text background — the
// glyph sits on the badge in a colour that contrasts with it, and the action
// label sits on the green surface in a colour that reads there (gold/light).
const TONES: Record<ToastTone, ToneSpec> = {
  success: {
    accent: 'bg-success',
    icon: 'success-check',
    iconText: 'text-on-green',
    actionText: 'text-accent-light',
    role: 'status',
    live: 'polite',
  },
  info: {
    accent: 'bg-cobalt',
    icon: 'info',
    iconText: 'text-on-cobalt',
    actionText: 'text-accent-light',
    role: 'status',
    live: 'polite',
  },
  warning: {
    accent: 'bg-warning',
    icon: 'warning',
    iconText: 'text-on-gold',
    actionText: 'text-accent-light',
    role: 'alert',
    live: 'assertive',
  },
  error: {
    accent: 'bg-danger',
    icon: 'alert',
    iconText: 'text-white',
    actionText: 'text-accent-light',
    role: 'alert',
    live: 'assertive',
  },
}

/**
 * Presentational toast surface — a green broadcast snackbar with a tone accent
 * bar, an icon badge, title/body, an optional action and a dismiss button.
 *
 * a11y: success/info announce politely via `role="status"`; error/warning
 * announce assertively via `role="alert"` (matches the DS annotation). The
 * dismiss control is a real `<button aria-label="Fechar">`.
 *
 * This component is "dumb": the auto-dismiss timer, hover-pause and stacking
 * live in `ToastProvider`. Use it directly only when you manage state yourself.
 */
export function Toast({
  tone = 'info',
  title,
  body,
  action,
  onDismiss,
  progress,
  onMouseEnter,
  onMouseLeave,
  ...rest
}: ToastProps) {
  const t = TONES[tone] ?? TONES.info

  return (
    <div
      role={t.role}
      aria-live={t.live}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={[
        'pointer-events-auto relative flex min-w-[320px] max-w-[420px] items-stretch',
        'overflow-hidden bg-signature text-on-green shadow-e4',
        'animate-[ds-toast-in_var(--dur-200,200ms)_var(--ease-emphasized)]',
      ].join(' ')}
      {...rest}
    >
      {/* Tone accent bar. */}
      <div className={`w-[5px] flex-none ${t.accent}`} aria-hidden="true" />

      {/* Icon badge. */}
      <div className="flex items-center px-[14px]">
        <span
          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${t.accent} ${t.iconText}`}
        >
          <Icon name={t.icon} size={16} />
        </span>
      </div>

      {/* Copy. */}
      <div className="flex-1 py-3 pr-[14px]">
        <div className="font-sans text-[13px] font-bold leading-tight text-on-green">
          {title}
        </div>
        {body != null && (
          <div className="mt-[2px] font-sans text-[12px] leading-snug text-on-green-mute">
            {body}
          </div>
        )}
      </div>

      {/* Optional action. */}
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className={[
            'm-3 self-center whitespace-nowrap rounded-btn-sm border border-signature-line px-[11px] py-[7px]',
            'font-sans text-[11px] font-bold uppercase tracking-[0.6px]',
            'transition-colors duration-150 hover:bg-signature-raised',
            t.actionText,
          ].join(' ')}
        >
          {action.label}
        </button>
      )}

      {/* Dismiss. */}
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Fechar"
        className="flex-none self-start p-2 text-on-green-mute transition-colors duration-150 hover:text-on-green"
      >
        <Icon name="x" size={16} />
      </button>

      {/* Auto-dismiss progress bar (provider-driven). */}
      {progress != null && (
        <div
          aria-hidden="true"
          className={`absolute bottom-0 left-0 h-[2px] ${t.accent}`}
          style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
        />
      )}
    </div>
  )
}
