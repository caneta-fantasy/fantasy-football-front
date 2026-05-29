import React from 'react'
import { Toast, type ToastTone, type ToastAction } from './Toast'

/** Where the stack anchors on screen. Unknown values fall back to top-right. */
export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-right'
  | 'bottom-left'
  | 'bottom-center'

/** Options accepted by the imperative `toast(...)` API. */
export interface ToastOptions {
  tone?: ToastTone
  title: React.ReactNode
  body?: React.ReactNode
  action?: ToastAction
  /**
   * Auto-dismiss after this many ms. `0` (or any non-positive value) keeps the
   * toast until dismissed manually. Defaults to the provider's `defaultDuration`.
   */
  duration?: number
}

/** Handle returned by `toast(...)` for programmatic control. */
export interface ToastHandle {
  id: string
  dismiss: () => void
}

/** The imperative API: call to show a toast, get a handle back. */
export type ToastFn = (options: ToastOptions) => ToastHandle

interface ActiveToast extends ToastOptions {
  id: string
  /** Resolved duration (ms); 0 means sticky. */
  duration: number
  /** 0..1 fraction of remaining time, for the progress bar. */
  progress: number
}

const ToastContext = React.createContext<ToastFn | null>(null)

/**
 * Imperative toast API. Must be called inside a `ToastProvider`.
 *
 *   const toast = useToast()
 *   toast({ tone: 'success', title: 'Pick confirmado', action: { label: 'Desfazer', onClick } })
 */
export function useToast(): ToastFn {
  const ctx = React.useContext(ToastContext)
  if (ctx === null) {
    throw new Error('useToast must be used within a <ToastProvider>.')
  }
  return ctx
}

const POSITIONS: Record<ToastPosition, string> = {
  'top-right': 'top-0 right-0 items-end',
  'top-left': 'top-0 left-0 items-start',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-0 right-0 items-end flex-col-reverse',
  'bottom-left': 'bottom-0 left-0 items-start flex-col-reverse',
  'bottom-center':
    'bottom-0 left-1/2 -translate-x-1/2 items-center flex-col-reverse',
}

export interface ToastProviderProps {
  children?: React.ReactNode
  /** Default auto-dismiss duration (ms). Defaults to 4000 (DS spec). */
  defaultDuration?: number
  /** Anchor for the stack. Unknown values fall back to `top-right`. */
  position?: ToastPosition
  /** Accessible label for the live region. Defaults to "Notificações". */
  regionLabel?: string
}

let idCounter = 0
const nextId = () => `ds-toast-${++idCounter}`

// How often the progress bar / timer ticks. Each tick decrements remaining time
// by this amount while the toast is not paused (hovered).
const TICK = 100

/**
 * Mounts a fixed, `z-toast` stacking region and provides the imperative
 * `useToast()` API to its subtree. Each toast runs an auto-dismiss timer that
 * pauses while hovered and resumes (from where it left off) on leave.
 *
 * a11y: the region is a labelled landmark (`role="region"`); each toast carries
 * its own `role="status"`/`alert` + `aria-live`, so screen readers announce new
 * toasts as they mount.
 */
export function ToastProvider({
  children,
  defaultDuration = 4000,
  position = 'top-right',
  regionLabel = 'Notificações',
}: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ActiveToast[]>([])

  // Per-toast remaining time + paused flag, kept in a ref so the interval can
  // read/write without re-subscribing.
  const timers = React.useRef<
    Map<string, { remaining: number; paused: boolean }>
  >(new Map())

  const dismiss = React.useCallback((id: string) => {
    timers.current.delete(id)
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = React.useCallback<ToastFn>(
    (options) => {
      const id = nextId()
      const duration =
        options.duration != null ? options.duration : defaultDuration
      const safeDuration = duration > 0 ? duration : 0

      if (safeDuration > 0) {
        timers.current.set(id, { remaining: safeDuration, paused: false })
      }

      setToasts((prev) => [
        ...prev,
        { ...options, id, duration: safeDuration, progress: 1 },
      ])

      return { id, dismiss: () => dismiss(id) }
    },
    [defaultDuration, dismiss],
  )

  // Single interval drives every running timer. It decrements remaining time
  // for non-paused toasts and drops those that hit zero — in one state update.
  const hasRunning = toasts.some((t) => t.duration > 0)
  React.useEffect(() => {
    if (!hasRunning) return

    const interval = setInterval(() => {
      setToasts((prev) =>
        prev
          .map((t) => {
            if (t.duration <= 0) return t
            const timer = timers.current.get(t.id)
            if (!timer || timer.paused) return t
            timer.remaining = Math.max(0, timer.remaining - TICK)
            return { ...t, progress: timer.remaining / t.duration }
          })
          .filter((t) => {
            const timer = timers.current.get(t.id)
            const expired = t.duration > 0 && timer != null && timer.remaining === 0
            if (expired) timers.current.delete(t.id)
            return !expired
          }),
      )
    }, TICK)

    return () => clearInterval(interval)
  }, [hasRunning])

  const setPaused = React.useCallback((id: string, paused: boolean) => {
    const timer = timers.current.get(id)
    if (timer) timer.paused = paused
  }, [])

  const posCls = POSITIONS[position] ?? POSITIONS['top-right']

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        role="region"
        aria-label={regionLabel}
        className={`pointer-events-none fixed z-toast flex flex-col gap-3 p-4 ${posCls}`}
      >
        {toasts.map((t) => (
          <Toast
            key={t.id}
            data-ds-toast={t.id}
            tone={t.tone}
            title={t.title}
            body={t.body}
            action={
              t.action && {
                label: t.action.label,
                onClick: () => {
                  t.action?.onClick()
                  dismiss(t.id)
                },
              }
            }
            progress={t.duration > 0 ? t.progress : undefined}
            onDismiss={() => dismiss(t.id)}
            onMouseEnter={() => setPaused(t.id, true)}
            onMouseLeave={() => setPaused(t.id, false)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
