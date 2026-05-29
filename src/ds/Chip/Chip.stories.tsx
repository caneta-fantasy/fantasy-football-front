import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip, type ChipTone } from './Chip'

const TONES: ChipTone[] = ['lime', 'yellow', 'red', 'ink', 'paper', 'ghost', 'live']

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          'Compact status/label token. Renders a decorative `<span>` by default; `interactive` upgrades it to a real `<button>` (focusable, keyboard-operable, button role). The `live` tone adds a CSS-pulsing dot (disabled under `prefers-reduced-motion` by the DS base layer). `disabled` adds a non-color cue (line-through + a visually-hidden "(desativado)"), never color alone. Unknown tones fall back to `ink`. Per §7 #3, the red/live tones use the ink900 danger foreground, not white-on-red.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    interactive: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { tone: 'ink', children: 'Líder' },
}
export default meta

type S = StoryObj<typeof Chip>

/** Interactive controls — tweak tone/interactive/disabled/label live. */
export const Playground: S = {}

/** The full tone palette side by side. */
export const AllTones: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {TONES.map((t) => (
        <Chip key={t} tone={t}>
          {t}
        </Chip>
      ))}
    </div>
  ),
}

export const Lime: S = { args: { tone: 'lime', children: 'Capitão' } }
export const Yellow: S = { args: { tone: 'yellow', children: 'Cartão' } }
export const Red: S = { args: { tone: 'red', children: 'Expulso' } }
export const Ink: S = { args: { tone: 'ink', children: 'Líder' } }
export const Paper: S = { args: { tone: 'paper', children: 'Rascunho' } }
export const Ghost: S = { args: { tone: 'ghost', children: 'Filtro' } }

/** Live tone: a CSS-pulsing dot precedes the label (reduced-motion safe). */
export const Live: S = { args: { tone: 'live', children: 'Ao vivo' } }

/** Interactive: a real focusable, clickable button (e.g. a removable filter). */
export const Interactive: S = {
  args: { tone: 'ghost', interactive: true, children: 'Meio-campo' },
}

/** Interactive + disabled: button is disabled with a non-color cue. */
export const InteractiveDisabled: S = {
  args: { tone: 'lime', interactive: true, disabled: true, children: 'Indisponível' },
}

/** Static disabled span: aria-disabled + line-through, not color-only. */
export const Disabled: S = {
  args: { tone: 'paper', disabled: true, children: 'Esgotado' },
}

/** On a dark surface the tones stay legible. */
export const OnDark: S = {
  render: () => (
    <div className="bg-surface-dark p-6 rounded-md flex flex-wrap gap-3">
      {TONES.map((t) => (
        <Chip key={t} tone={t}>
          {t}
        </Chip>
      ))}
    </div>
  ),
}
