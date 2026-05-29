import React from 'react'

/**
 * Textarea — a real, controlled (or uncontrolled) `<textarea>` wrapped in a
 * styled field shell with an optional live character counter.
 *
 * a11y contract (DS §7 #4, #5):
 * - The visible control is always a native `<textarea>`, never a styled `<div>`.
 * - When `maxLength` is given, a character counter ("n / max") is rendered and
 *   linked to the textarea via `aria-describedby` so assistive tech announces
 *   the remaining budget. A caller-supplied `aria-describedby` is preserved and
 *   the counter id is appended.
 * - The counter region is `aria-live="polite"` so crossing the warning/over
 *   threshold is announced without stealing focus.
 * - `invalid`, or exceeding `maxLength` when `hardLimit` is off, sets
 *   `aria-invalid` (the visual error state is paired with the ARIA state, not
 *   color-only). The counter also exposes a non-colour `data-counter-state`
 *   cue (`ok | near | over`).
 * - Focus styling comes from the base layer's `:focus-visible` via the shell's
 *   `focus-within` ring.
 *
 * Counter colour ladder: neutral text-muted (ok) → yellow (near, ≥ warnAt of
 * max) → red (over, > max). `near` defaults to the last 20% of the budget.
 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * Soft character budget. Enables the counter and the warning ladder. Note
   * this is the DS counter target — whether it is *enforced* depends on
   * `hardLimit`.
   */
  maxLength?: number
  /**
   * When true (default), the native `maxLength` attribute is applied so the
   * browser physically prevents typing past the budget. When false the user can
   * exceed it, the counter goes `over`, and the field is marked invalid.
   */
  hardLimit?: boolean
  /**
   * Fraction (0–1) of `maxLength` at which the counter enters the `near`
   * (yellow) warning state. Default 0.8 — the last 20% of the budget.
   */
  warnAt?: number
  /** Marks the field invalid: sets `aria-invalid` and the error styling. */
  invalid?: boolean
}

type CounterState = 'ok' | 'near' | 'over'

let counterSeq = 0
function useCounterId(): string {
  const [id] = React.useState(() => `ds-ta-count-${(counterSeq += 1)}`)
  return id
}

function resolveCount(
  value: TextareaProps['value'],
  defaultValue: TextareaProps['defaultValue'],
): number | null {
  // Controlled value wins; otherwise fall back to the initial uncontrolled
  // value. When neither is a string we cannot derive a count statically.
  if (typeof value === 'string') return value.length
  if (Array.isArray(value)) return value.join('').length
  if (typeof value === 'number') return String(value).length
  if (typeof defaultValue === 'string') return defaultValue.length
  if (Array.isArray(defaultValue)) return defaultValue.join('').length
  if (typeof defaultValue === 'number') return String(defaultValue).length
  return null
}

function counterStateOf(
  count: number,
  max: number,
  warnAt: number,
): CounterState {
  if (count > max) return 'over'
  if (count >= Math.floor(max * warnAt)) return 'near'
  return 'ok'
}

const COUNTER_COLOR: Record<CounterState, string> = {
  // text-muted is the 5.6:1 functional token (DS §7 #4) — not text-subtle.
  ok: 'text-text-muted',
  near: 'text-[color:var(--yellow-d)]',
  over: 'text-red',
}

const SHELL_BASE =
  'relative flex w-full bg-surface rounded-sm border border-border-strong ' +
  'transition-colors duration-150 hover:border-ink-500 ' +
  'focus-within:border-ink-900 focus-within:shadow-[var(--focus-ring)] ' +
  'has-[:disabled]:bg-surface-inset has-[:disabled]:border-border ' +
  'has-[:disabled]:cursor-not-allowed'

const SHELL_INVALID =
  'border-red focus-within:border-red bg-[color:rgba(229,69,58,0.04)]'

const CONTROL_CLS =
  'min-w-0 flex-1 resize-y bg-transparent outline-none border-0 ' +
  'px-3 py-[13px] min-h-[110px] font-sans text-[13.5px] leading-[1.5] ' +
  'text-text placeholder:text-text-subtle disabled:cursor-not-allowed'

const COUNTER_CLS =
  'pointer-events-none absolute bottom-2 right-3 font-mono text-[10.5px] ' +
  'font-semibold select-none'

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea(
    {
      maxLength,
      hardLimit = true,
      warnAt = 0.8,
      invalid = false,
      disabled,
      className,
      value,
      defaultValue,
      onChange,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref,
  ) {
    const counterId = useCounterId()
    const hasCounter = typeof maxLength === 'number'

    // Track length internally so the counter is live for both controlled and
    // uncontrolled usage. Seed from value/defaultValue.
    const [count, setCount] = React.useState<number>(
      () => resolveCount(value, defaultValue) ?? 0,
    )

    // Keep the counter in sync when a controlled `value` changes externally.
    React.useEffect(() => {
      const c = resolveCount(value, undefined)
      if (c !== null) setCount(c)
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCount(e.target.value.length)
      onChange?.(e)
    }

    const state: CounterState = hasCounter
      ? counterStateOf(count, maxLength as number, warnAt)
      : 'ok'

    const isOver = state === 'over'
    const showInvalid = invalid || isOver

    // Compose aria-describedby: caller's value first, then the counter id, so a
    // FieldGroup's help/error keeps precedence and the counter is still linked.
    const describedBy =
      [ariaDescribedBy, hasCounter ? counterId : null]
        .filter(Boolean)
        .join(' ') || undefined

    const shellCls = [
      SHELL_BASE,
      showInvalid ? SHELL_INVALID : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={shellCls} data-invalid={showInvalid || undefined}>
        <textarea
          ref={ref}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          // hardLimit enforces the budget at the native level; otherwise the
          // user may exceed it and the field is flagged over/invalid.
          maxLength={hardLimit ? maxLength : undefined}
          aria-invalid={showInvalid || undefined}
          aria-describedby={describedBy}
          className={CONTROL_CLS}
          {...rest}
        />
        {hasCounter && (
          <span
            id={counterId}
            aria-live="polite"
            data-counter-state={state}
            className={`${COUNTER_CLS} ${COUNTER_COLOR[state]}`}
          >
            {count} / {maxLength}
          </span>
        )}
      </div>
    )
  },
)
