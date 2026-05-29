import type { Meta, StoryObj } from '@storybook/react-vite'
import { Help } from './Help'

const meta: Meta<typeof Help> = {
  title: 'Forms/Help',
  component: Help,
  parameters: {
    docs: {
      description: {
        component:
          'Helper / validation message shown beneath a field. The `error` tone renders with `role="alert"` (announced) and a leading alert glyph; `success` shows a check; `neutral` is silent context. Text color uses `text-muted` / `text-red` / `text-lime-deep` — never `text-subtle` for this functional text (DS §7 #4).',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'error', 'success'] },
    children: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Help>

/** Neutral helper — silent context. */
export const Neutral: S = {
  args: { tone: 'neutral', children: 'Usamos só pra recuperar conta.' },
}

/** Error — role="alert", red text + alert glyph. */
export const Error: S = {
  args: { tone: 'error', children: 'Email inválido' },
}

/** Success — lime-deep text + check glyph. */
export const Success: S = {
  args: { tone: 'success', children: 'Preenchido e válido.' },
}

/** All three tones stacked. */
export const AllTones: S = {
  render: () => (
    <div className="flex flex-col gap-2">
      <Help tone="neutral">Senha precisa de 8+ caracteres.</Help>
      <Help tone="success">Senha forte o suficiente.</Help>
      <Help tone="error">Senha muito curta, parça.</Help>
    </div>
  ),
}

/** Interactive controls. */
export const Playground: S = {
  args: { tone: 'neutral', children: 'Markdown leve e emoji liberados.' },
}
