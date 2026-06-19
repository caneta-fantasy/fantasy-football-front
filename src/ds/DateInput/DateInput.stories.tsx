import type { Meta, StoryObj } from '@storybook/react'
import { DateInput } from './DateInput'
import { FieldGroup } from '../FieldGroup/FieldGroup'

const meta: Meta<typeof DateInput> = {
  title: 'Forms/DateInput',
  component: DateInput,
  args: {
    size: 'md',
    invalid: false,
    disabled: false,
    'aria-label': 'Data limite',
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    value: { control: 'text' },
    min: { control: 'text' },
    max: { control: 'text' },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Real native `<input type="date">` styled with the token field shell. ' +
          'Replaces the MUI x-date-picker for new code. Pair with a `<label>` ' +
          '(via `FieldGroup` or `aria-label`); the leading calendar glyph is decorative.',
      },
    },
  },
}
export default meta

type S = StoryObj<typeof DateInput>

/** Default 40px field with a value set. */
export const Default: S = {
  args: { value: '2026-08-05' },
}

/** Empty field — shows the browser's native placeholder segments. */
export const Empty: S = {}

/** Compact 32px filter variant. */
export const Small: S = {
  args: { size: 'sm', value: '2026-08-05' },
}

/** Bounded to a season window with `min`/`max`. */
export const Bounded: S = {
  args: { value: '2026-08-05', min: '2026-08-01', max: '2026-12-31' },
}

/** Error state — red border paired with `aria-invalid`. */
export const Invalid: S = {
  args: { invalid: true, value: '2026-08-05' },
}

/** Disabled state. */
export const Disabled: S = {
  args: { disabled: true, value: '2026-08-05' },
}

/** Wired into the canonical FieldGroup with a real `<label>`, helper and error. */
export const InFieldGroup: S = {
  render: (args) => (
    <div className="w-[320px]">
      <FieldGroup
        label="Prazo da escalação"
        htmlFor="deadline"
        help="A escalação trava no início da primeira partida."
        error={args.invalid ? 'Escolha uma data futura.' : undefined}
        required
      >
        <DateInput
          id="deadline"
          size={args.size}
          invalid={args.invalid}
          disabled={args.disabled}
          defaultValue="2026-08-05"
        />
      </FieldGroup>
    </div>
  ),
}

/** All states side by side for visual review. */
export const AllStates: S = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-4">
      <DateInput aria-label="Padrão" defaultValue="2026-08-05" />
      <DateInput aria-label="Compacto" size="sm" defaultValue="2026-08-05" />
      <DateInput aria-label="Inválido" invalid defaultValue="2026-08-05" />
      <DateInput aria-label="Desabilitado" disabled defaultValue="2026-08-05" />
    </div>
  ),
}
