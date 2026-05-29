import type { Meta, StoryObj } from '@storybook/react-vite'
import { Select, type SelectOption } from './Select'

const FORMATIONS: SelectOption[] = [
  { value: '4-3-3', label: '4-3-3' },
  { value: '4-4-2', label: '4-4-2' },
  { value: '3-5-2', label: '3-5-2' },
  { value: '5-3-2', label: '5-3-2' },
]

const meta: Meta<typeof Select> = {
  title: 'Primitives/Select',
  component: Select,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A real native `<select>` in a styled shell. Label-associable via `id` + `<label htmlFor>` (or `aria-label`); set `invalid` to drive `aria-invalid` and the error border. The chevron is decorative (`aria-hidden`). Sizes `sm | md | lg` fall back to `md` for unknown values.',
      },
    },
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  args: {
    'aria-label': 'Formação',
    options: FORMATIONS,
    defaultValue: '4-3-3',
  },
}
export default meta

type S = StoryObj<typeof Select>

/** Interactive controls — tweak size/invalid/disabled/placeholder live. */
export const Playground: S = {}

/** With a labelled FieldGroup-style association. */
export const Labelled: S = {
  render: () => (
    <div className="w-72">
      <label
        htmlFor="formacao"
        className="mb-2 block font-sans text-[11px] font-bold uppercase tracking-[2px] text-text-muted"
      >
        Formação
      </label>
      <Select id="formacao" options={FORMATIONS} defaultValue="4-3-3" />
    </div>
  ),
}

/** Placeholder shown as a disabled, empty-value first option. */
export const WithPlaceholder: S = {
  args: { defaultValue: '', placeholder: 'Selecione a formação…' },
}

export const Small: S = { args: { size: 'sm' } }
export const Medium: S = { args: { size: 'md' } }
export const Large: S = { args: { size: 'lg' } }

/** Invalid state: error border + `aria-invalid`. */
export const Invalid: S = { args: { invalid: true } }

export const Disabled: S = { args: { disabled: true } }
