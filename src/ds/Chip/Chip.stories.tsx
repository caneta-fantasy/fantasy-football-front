import type { Meta, StoryObj } from '@storybook/react-vite'
import { Chip, type ChipTone } from './Chip'

// App tones first, then the two reserved referee tones.
const TONES: ChipTone[] = [
  'green',
  'gold',
  'cobalt',
  'success',
  'white',
  'ghost',
  'live',
  'yellow',
  'red',
]

const meta: Meta<typeof Chip> = {
  title: 'Primitives/Chip',
  component: Chip,
  parameters: {
    docs: {
      description: {
        component:
          'Compact status/label token in the modernista palette. Nine tones — `green`, `gold`, `cobalt`, `success`, `white`, `ghost`, `live`, plus the **reserved** referee tones `yellow`/`red` (cartão amarelo/vermelho — never used to convey app state by color alone). Each tone is a bg + fg + **1.5px border** triple, so the tone survives in greyscale and never communicates by fill alone; radius is the full `chip` pill (999). Renders a decorative `<span>` by default; `interactive` upgrades it to a real `<button>` (focusable, keyboard-operable, button role). The `live` tone (brick `danger`, distinct from card-red) adds a CSS-pulsing dot, disabled under `prefers-reduced-motion` by the DS base layer. `disabled` adds a non-color cue (line-through + a visually-hidden "(desativado)"), never color alone. Unknown tones fall back to `green`. Per §7 #3 the reserved `red` carries its tone via the card-red **border** with ink text on a red tint — never white-on-card-red.',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: TONES },
    interactive: { control: 'boolean' },
    disabled: { control: 'boolean' },
    children: { control: 'text' },
  },
  args: { tone: 'green', children: 'Líder' },
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

export const Green: S = { args: { tone: 'green', children: 'Líder' } }
export const Gold: S = { args: { tone: 'gold', children: 'Capitão' } }
export const Cobalt: S = { args: { tone: 'cobalt', children: 'Escalado' } }
export const Success: S = { args: { tone: 'success', children: 'Confirmado' } }
export const White: S = { args: { tone: 'white', children: 'Rascunho' } }
export const Ghost: S = { args: { tone: 'ghost', children: 'Filtro' } }

/** Live tone: brick `danger` with a CSS-pulsing dot (reduced-motion safe). */
export const Live: S = { args: { tone: 'live', children: 'Ao vivo' } }

/**
 * Reserved referee tones — `yellow`/`red` echo cartão amarelo/vermelho and are
 * never repurposed for app state. The `red` carries the card-red on its border
 * (ink text on a red tint), reconciled away from white-on-card-red (§7 #3).
 */
export const RefereeReserved: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Chip tone="yellow">Cartão amarelo</Chip>
      <Chip tone="red">Cartão vermelho</Chip>
    </div>
  ),
}

/** Interactive: a real focusable, clickable button (e.g. a removable filter). */
export const Interactive: S = {
  args: { tone: 'ghost', interactive: true, children: 'Meio-campo' },
}

/** Interactive + disabled: button is disabled with a non-color cue. */
export const InteractiveDisabled: S = {
  args: { tone: 'green', interactive: true, disabled: true, children: 'Indisponível' },
}

/** Static disabled span: aria-disabled + line-through, not color-only. */
export const Disabled: S = {
  args: { tone: 'white', disabled: true, children: 'Esgotado' },
}

/** On a dark green band the tones stay legible. */
export const OnGreen: S = {
  render: () => (
    <div className="bg-signature p-6 rounded-btn flex flex-wrap gap-3">
      {TONES.map((t) => (
        <Chip key={t} tone={t}>
          {t}
        </Chip>
      ))}
    </div>
  ),
}
