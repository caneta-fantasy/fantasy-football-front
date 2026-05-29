import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Combobox, type ComboboxOption } from './Combobox'

const PLAYERS: ComboboxOption[] = [
  { value: 'pedro-henrique', label: 'Pedro Henrique' },
  { value: 'pedro', label: 'Pedro' },
  { value: 'pedrinho', label: 'Pedrinho' },
  { value: 'pedro-raul', label: 'Pedro Raul' },
  { value: 'gabriel-barbosa', label: 'Gabriel Barbosa' },
  { value: 'gabriel-jesus', label: 'Gabriel Jesus' },
  { value: 'endrick', label: 'Endrick' },
  { value: 'raphael-veiga', label: 'Raphael Veiga' },
]

const meta: Meta<typeof Combobox> = {
  title: 'Primitives/Combobox',
  component: Combobox,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Accessible typeahead on a real `<input role="combobox">` + a `role="listbox"` popup. Roving focus stays on the input via `aria-activedescendant`; the matched substring of each label is wrapped in a real query-driven `<mark>` (per §7). Keyboard: ArrowUp/ArrowDown move the active option (wrapping), Enter selects, Esc closes. Clicking outside or on an option also selects/closes.',
      },
    },
  },
  argTypes: {
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    emptyMessage: { control: 'text' },
  },
  args: {
    'aria-label': 'Adicionar ao mercado',
    options: PLAYERS,
    placeholder: 'Buscar jogador…',
  },
}
export default meta

type S = StoryObj<typeof Combobox>

/** Interactive controls — type "pedro" or "gabriel" to see the live filter + highlight. */
export const Playground: S = {
  render: (args) => (
    <div className="w-96">
      <Combobox {...args} />
    </div>
  ),
}

/** Labelled with a FieldGroup-style overline label. */
export const Labelled: S = {
  render: (args) => {
    function Demo() {
      const [chosen, setChosen] = useState<ComboboxOption | null>(null)
      return (
        <div className="w-96">
          <label
            htmlFor="player-search"
            className="mb-2 block font-sans text-[11px] font-bold uppercase tracking-[2px] text-text-muted"
          >
            Adicionar ao mercado
          </label>
          <Combobox
            {...args}
            id="player-search"
            aria-label={undefined}
            onSelect={setChosen}
          />
          {chosen && (
            <p className="mt-3 font-mono text-[12px] text-text-muted">
              Selecionado: {chosen.label}
            </p>
          )}
        </div>
      )
    }
    return <Demo />
  },
}

/** Empty-state message shown when nothing matches the query. */
export const EmptyState: S = {
  render: (args) => (
    <div className="w-96">
      <Combobox {...args} emptyMessage="Nenhum jogador encontrado" />
      <p className="mt-3 font-mono text-[12px] text-text-subtle">
        Try typing "xyz" to trigger the empty state.
      </p>
    </div>
  ),
}

/** Invalid state: error border + `aria-invalid`. */
export const Invalid: S = {
  render: (args) => (
    <div className="w-96">
      <Combobox {...args} invalid />
    </div>
  ),
}

/** Disabled control. */
export const Disabled: S = {
  render: (args) => (
    <div className="w-96">
      <Combobox {...args} disabled />
    </div>
  ),
}
