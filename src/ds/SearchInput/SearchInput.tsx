import React from 'react'
import { TextInput, type TextInputProps } from '../TextInput/TextInput'
import { Icon } from '../Icon/Icon'
import { Spinner } from '../Spinner/Spinner'

/**
 * SearchInput — a `TextInput` specialised for search.
 *
 * a11y contract (catalog P1a):
 * - Real `<input type="search">` from `TextInput`; a decorative leading search
 *   `Icon` (`aria-hidden`).
 * - The clear affordance is a REAL `<button type="button" aria-label="limpar">`
 *   (keyboard focusable, Enter/Space operable). It only appears when there is a
 *   value to clear and never while `loading`.
 * - Clearing works for controlled AND uncontrolled fields: controlled fields
 *   get a synthetic `onChange` carrying an empty value; uncontrolled fields are
 *   reset directly and refocused so the user can keep typing.
 * - `loading` renders the `Spinner` (`role="status"`) with a visually-hidden
 *   "Buscando" status; it replaces the clear button slot (one trailing slot).
 * - Focus rings on the field and the clear button come from the base layer's
 *   `:focus-visible`.
 */
export interface SearchInputProps
  extends Omit<TextInputProps, 'leadingIcon' | 'suffix' | 'type'> {
  /** Shows a Spinner with a "Buscando" status; hides the clear button. */
  loading?: boolean
  /** Called after the field is cleared, in addition to the empty `onChange`. */
  onClear?: () => void
}

// Setter used to write an empty value into an uncontrolled input while still
// notifying React's controlled-value tracker (so any `onChange` listeners and
// re-renders fire). Standard pattern for programmatic native value changes.
function setNativeValue(el: HTMLInputElement, value: string) {
  const proto = Object.getPrototypeOf(el)
  const descriptor = Object.getOwnPropertyDescriptor(proto, 'value')
  descriptor?.set?.call(el, value)
}

export const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  function SearchInput(
    { loading = false, onClear, value, defaultValue, onChange, className, ...rest },
    ref,
  ) {
    const innerRef = React.useRef<HTMLInputElement | null>(null)

    // Merge the forwarded ref with our internal ref (we need direct DOM access
    // to clear and refocus the field).
    const setRefs = React.useCallback(
      (node: HTMLInputElement | null) => {
        innerRef.current = node
        if (typeof ref === 'function') ref(node)
        else if (ref) ref.current = node
      },
      [ref],
    )

    const isControlled = value !== undefined

    // Track the current value for uncontrolled usage so the clear button knows
    // whether to show.
    const [hasValue, setHasValue] = React.useState(
      () => String(defaultValue ?? '').length > 0,
    )
    const currentlyHasValue = isControlled
      ? String(value ?? '').length > 0
      : hasValue

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) setHasValue(e.target.value.length > 0)
      onChange?.(e)
    }

    const handleClear = () => {
      const el = innerRef.current
      if (el) {
        if (onChange) {
          // Build a synthetic change carrying the empty value for the caller.
          setNativeValue(el, '')
          const event = new Event('input', { bubbles: true })
          Object.defineProperty(event, 'target', {
            writable: false,
            value: el,
          })
          onChange({
            ...(event as unknown as React.ChangeEvent<HTMLInputElement>),
            target: el,
            currentTarget: el,
          })
        } else if (!isControlled) {
          setNativeValue(el, '')
        }
        el.focus()
      }
      if (!isControlled) setHasValue(false)
      onClear?.()
    }

    const showClear = currentlyHasValue && !loading

    return (
      <div className="relative">
        <TextInput
          ref={setRefs}
          type="search"
          leadingIcon="search"
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          // Reserve room on the right edge for the trailing slot (clear /
          // spinner). The search type renders a UA clear control in some
          // browsers; hide it so only our accessible button shows.
          className={`pr-[40px] [&_input::-webkit-search-cancel-button]:hidden ${className ?? ''}`.trim()}
          {...rest}
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center">
          {loading ? (
            <span className="inline-flex h-8 w-8 items-center justify-center">
              <Spinner size={18} label="Buscando" />
            </span>
          ) : showClear ? (
            <button
              type="button"
              aria-label="limpar"
              title="limpar"
              onClick={handleClear}
              className={
                'inline-flex h-8 w-8 items-center justify-center rounded-pill ' +
                'text-text-muted hover:text-text hover:bg-surface-inset ' +
                'transition-colors duration-150 cursor-pointer'
              }
            >
              <Icon name="x" size={20} />
            </button>
          ) : null}
        </div>
      </div>
    )
  },
)
