import React from 'react'
import { Icon, type IconName } from '../Icon/Icon'

/**
 * TextInput — a real, controlled `<input>` wrapped in a styled field shell.
 *
 * a11y contract (DS §7 #4, #5):
 * - The visible control is always a native `<input>`, never a styled `<div>`.
 * - `invalid` drives `aria-invalid` (the visual error border is paired with the
 *   ARIA state, not color-only).
 * - The leading icon and the prefix/suffix affixes are *decorative duplicates*
 *   of information the user is typing/expecting, so they are `aria-hidden`. To
 *   keep affix meaning (a unit like "R$" / "mi") available to assistive tech the
 *   affixes are linked to the input via `aria-describedby`; a caller-supplied
 *   `aria-describedby` is preserved and the affix ids are appended.
 * - States default/hover/focus/filled/error/disabled are all attribute/CSS
 *   driven on the real input (`:hover`, `:focus-within`, `:disabled`), so the
 *   focus ring comes from the base layer's `:focus-visible`.
 *
 * Sizing: a single 40px field height — reconciles the §7 42/38 conflict (the
 * prototype used 42 for fields and 38/40 for stepper buttons).
 */
export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  /** Registry name of a decorative icon rendered inside the field's left edge. */
  leadingIcon?: IconName
  /** Short decorative text on the left edge (e.g. a currency symbol "R$"). */
  prefix?: React.ReactNode
  /** Short decorative text on the right edge (e.g. a unit "mi"). */
  suffix?: React.ReactNode
  /** Marks the field invalid: sets `aria-invalid` and the error styling. */
  invalid?: boolean
}

let affixSeq = 0
function useAffixId(prefix: string): string {
  // A stable per-instance id for linking an affix via aria-describedby.
  const [id] = React.useState(() => `ds-ti-${prefix}-${(affixSeq += 1)}`)
  return id
}

const SHELL_BASE =
  'flex items-center gap-2 w-full h-[40px] px-3 bg-surface rounded-pill border ' +
  'border-border-strong font-sans text-[13px] text-text transition-colors ' +
  'duration-150 hover:border-ink-muted focus-within:border-signature ' +
  'focus-within:shadow-[var(--focus-ring)] ' +
  'has-[:disabled]:bg-surface-inset has-[:disabled]:border-border ' +
  'has-[:disabled]:cursor-not-allowed'

const SHELL_INVALID =
  'border-danger focus-within:border-danger bg-[color:rgba(178,58,43,0.05)]'

// Mono is reserved for genuine tabular tech: the prefix/suffix carry a unit
// (currency "R$" / "mi"), so Spline Sans Mono stays here.
const AFFIX_CLS =
  'shrink-0 font-mono text-[12px] font-semibold text-text-muted select-none'

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      leadingIcon,
      prefix,
      suffix,
      invalid = false,
      disabled,
      className,
      'aria-describedby': ariaDescribedBy,
      ...inputProps
    },
    ref,
  ) {
    const prefixId = useAffixId('pre')
    const suffixId = useAffixId('suf')

    // Compose aria-describedby: caller's value first, then any affix ids, so a
    // FieldGroup's help/error text keeps precedence and the affix unit is still
    // announced. (DS §7 #5: affixes are accessibly labelled, not orphaned.)
    const describedBy =
      [
        ariaDescribedBy,
        prefix != null ? prefixId : null,
        suffix != null ? suffixId : null,
      ]
        .filter(Boolean)
        .join(' ') || undefined

    const shellCls = [
      SHELL_BASE,
      invalid ? SHELL_INVALID : '',
      className ?? '',
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className={shellCls} data-invalid={invalid || undefined}>
        {leadingIcon && (
          <Icon
            name={leadingIcon}
            size={16}
            className="shrink-0 text-text-subtle"
          />
        )}
        {prefix != null && (
          <span id={prefixId} aria-hidden="true" className={AFFIX_CLS}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          className="min-w-0 flex-1 bg-transparent outline-none border-0 p-0 text-text placeholder:text-text-subtle disabled:cursor-not-allowed"
          {...inputProps}
        />
        {suffix != null && (
          <span
            id={suffixId}
            aria-hidden="true"
            className={`${AFFIX_CLS} text-text-subtle`}
          >
            {suffix}
          </span>
        )}
      </div>
    )
  },
)
