import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Card } from './Card'

const TONES = ['paper', 'green', 'gold', 'cobalt', 'greenPale', 'mist'] as const

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Structural editorial surface in six tones (paper · green · gold · cobalt · greenPale · mist). ' +
          'White-on-line by default, with a `green` broadcast block, `gold`/`cobalt` accents, a faint ' +
          '`greenPale` tint and a sunken `mist`. An unknown tone falls back to `paper` and never throws ' +
          '(DS §7 #1). Set `interactive` to upgrade the whole card to a real focusable `<button>` that ' +
          'reflects `selected` via `aria-pressed`/`aria-selected` and a 2px gold (cobalt on green) ' +
          'selection border, and earns the base layer focus ring. Hover lift is pure CSS (reduced-motion safe).',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: TONES,
    },
    interactive: { control: 'boolean' },
    selected: { control: 'boolean' },
    padding: { control: 'text' },
    children: { control: false },
  },
}
export default meta

type S = StoryObj<typeof Card>

const Body = ({ title, text }: { title: string; text: string }) => (
  <div className="flex flex-col gap-2">
    <span className="font-display text-[20px] leading-none uppercase tracking-[0.3px]">
      {title}
    </span>
    <span className="font-sans text-[13px]">{text}</span>
  </div>
)

/** Default paper tone — a plain `<div>`, white with a line hairline. */
export const Paper: S = {
  args: {
    tone: 'paper',
    children: <Body title="Rodada 12" text="Paper · superfície branca padrão." />,
  },
}

/** Green broadcast block for editorial / live moments. */
export const Green: S = {
  args: {
    tone: 'green',
    children: <Body title="Ao Vivo" text="Green · bloco de transmissão." />,
  },
}

/** Gold call-to-action tone. */
export const Gold: S = {
  args: {
    tone: 'gold',
    children: <Body title="Escalar" text="Gold · destaque de chamada para ação." />,
  },
}

/** Cobalt accent tone. */
export const Cobalt: S = {
  args: {
    tone: 'cobalt',
    children: <Body title="Transferência" text="Cobalt · destaque interativo." />,
  },
}

/** Faint greenPale tint on white. */
export const GreenPale: S = {
  args: {
    tone: 'greenPale',
    children: <Body title="Convite" text="GreenPale · realce sutil sobre branco." />,
  },
}

/** Sunken mist tone (was parchment). */
export const Mist: S = {
  args: {
    tone: 'mist',
    children: <Body title="Histórico" text="Mist · superfície rebaixada." />,
  },
}

/** All six tones side by side. */
export const AllTones: S = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {TONES.map((tone) => (
        <Card key={tone} tone={tone}>
          <Body title={tone} text={`tone="${tone}"`} />
        </Card>
      ))}
    </div>
  ),
}

/** Interactive (real `<button>`) — Tab to it to see the focus ring; hover lifts it. */
export const Interactive: S = {
  args: {
    interactive: true,
    children: <Body title="Selecionar" text="Cartão clicável (button real)." />,
  },
}

/** Selected interactive card — 2px gold selection border + `aria-pressed`/`aria-selected`. */
export const Selected: S = {
  args: {
    interactive: true,
    selected: true,
    children: <Body title="Selecionado" text="aria-pressed=true · borda ouro." />,
  },
}

/** Selected on the green tone — the selection cue swaps to cobalt for contrast. */
export const SelectedOnGreen: S = {
  args: {
    tone: 'green',
    interactive: true,
    selected: true,
    children: <Body title="Selecionado" text="aria-pressed=true · borda cobalto." />,
  },
}

/** Disabled interactive card — dimmed, not clickable, not focusable. */
export const Disabled: S = {
  args: {
    interactive: true,
    disabled: true,
    children: <Body title="Indisponível" text="Cartão desabilitado." />,
  },
}

/** Single-select group: interactive cards toggling their selected state. */
export const SelectableGroup: S = {
  render: () => {
    const options = ['4-3-3', '4-4-2', '3-5-2']
    const [picked, setPicked] = useState('4-3-3')
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {options.map((opt) => (
          <Card
            key={opt}
            interactive
            selected={picked === opt}
            onClick={() => setPicked(opt)}
          >
            <Body title={opt} text="Formação" />
          </Card>
        ))}
      </div>
    )
  },
}

/** Interactive controls: tweak tone, interactive, selected and padding live. */
export const Playground: S = {
  args: {
    tone: 'paper',
    interactive: false,
    selected: false,
    padding: 'p-4',
    children: <Body title="Playground" text="Ajuste as props ao lado." />,
  },
}
