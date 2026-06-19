import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActionCell, type ActionKind } from './ActionCell'

const KINDS: ActionKind[] = [
  'add',
  'waiver',
  'oferta',
  'drop',
  'escalado',
  'bloqueado',
  'draft',
]

const meta: Meta<typeof ActionCell> = {
  title: 'App/ActionCell',
  component: ActionCell,
  parameters: {
    docs: {
      description: {
        component:
          'The per-row action control on the Jogadores list. Covers all six (+1) states: free-agent **add** (cobalt) / **waiver** (gold "Oferta") / already-filed **oferta** (disabled), my-roster **drop** ("Liberar"), and the locked **escalado** / **bloqueado** / **draft** chips. Each state carries a Tooltip; active states are real buttons, locked states are chips with the lock meaning in the visible label.',
      },
    },
  },
  argTypes: {
    kind: { control: 'inline-radio', options: KINDS },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { kind: 'add' },
}
export default meta

type S = StoryObj<typeof ActionCell>

export const Playground: S = {}

export const AllStates: S = {
  render: () => (
    <div data-ds className="flex flex-wrap items-center gap-4 bg-paper p-6">
      {KINDS.map((kind) => (
        <div key={kind} className="flex flex-col items-center gap-2">
          <ActionCell kind={kind} />
          <span className="font-sans text-[11px] text-ink-muted">{kind}</span>
        </div>
      ))}
    </div>
  ),
}
