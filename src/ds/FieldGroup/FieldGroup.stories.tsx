import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldGroup } from './FieldGroup'

const inputClass =
  'w-full h-[40px] px-[13px] font-sans text-[13.5px] text-text bg-surface border border-border-strong rounded-sm box-border ' +
  'aria-[invalid=true]:border-red'

const meta: Meta<typeof FieldGroup> = {
  title: 'Forms/FieldGroup',
  component: FieldGroup,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Canonical field skeleton: `<label>` → control → helper → error. Real `<label htmlFor>` association; `error` renders with `role="alert"` and is linked via `aria-describedby`; helper AND error can both show (DS §7: the error does not replace the helper); `required` adds a lime `*` plus `aria-required`, and `error` adds `aria-invalid` on the control.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    required: { control: 'boolean' },
    help: { control: 'text' },
    error: { control: 'text' },
    htmlFor: { control: false },
  },
}
export default meta

type S = StoryObj<typeof FieldGroup>

/** Default — label + neutral helper. */
export const Default: S = {
  args: {
    label: 'E-mail',
    htmlFor: 'fg-default',
    help: 'Usamos só pra recuperar conta.',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <FieldGroup {...args}>
        <input className={inputClass} placeholder="nome@email.com" />
      </FieldGroup>
    </div>
  ),
}

/** Required — lime asterisk + aria-required on the control. */
export const Required: S = {
  args: { label: 'E-mail', htmlFor: 'fg-required', required: true, help: 'Campo obrigatório.' },
  render: Default.render,
}

/** Error — role="alert", aria-invalid, red border. */
export const WithError: S = {
  args: { label: 'E-mail', htmlFor: 'fg-error', required: true, error: 'Email inválido' },
  render: Default.render,
}

/** Helper AND error together — the DS §7 fix: error appends, helper stays. */
export const HelperAndError: S = {
  args: {
    label: 'Senha',
    htmlFor: 'fg-both',
    required: true,
    help: 'Senha precisa de 8+ caracteres.',
    error: 'Senha muito curta, parça.',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <FieldGroup {...args}>
        <input type="password" className={inputClass} defaultValue="123" />
      </FieldGroup>
    </div>
  ),
}

/** Disabled control inside a clean field. */
export const Disabled: S = {
  args: { label: 'Time', htmlFor: 'fg-disabled', help: 'Temporada travada.' },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <FieldGroup {...args}>
        <input
          disabled
          defaultValue="Caneta FC"
          className={`${inputClass} bg-surface-inset text-text-subtle cursor-not-allowed`}
        />
      </FieldGroup>
    </div>
  ),
}

/** Interactive controls — toggle required / help / error live. */
export const Playground: S = {
  args: {
    label: 'E-mail',
    htmlFor: 'fg-playground',
    required: true,
    help: 'Usamos só pra recuperar conta.',
    error: '',
  },
  render: (args) => (
    <div style={{ maxWidth: 360 }}>
      <FieldGroup {...args} error={args.error || undefined}>
        <input className={inputClass} placeholder="nome@email.com" />
      </FieldGroup>
    </div>
  ),
}
