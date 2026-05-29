import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Card } from './Card'

const meta: Meta<typeof Card> = {
  title: 'Primitives/Card',
  component: Card,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Generic editorial surface in four tones (surface · dark · paper · lime). ' +
          'An unknown tone falls back to `surface` and never throws (DS §7 #1). ' +
          'Set `interactive` to upgrade the whole card to a real focusable `<button>` ' +
          'that reflects `selected` via `aria-pressed`/`aria-selected` and earns the ' +
          'base layer focus ring. Hover lift is pure CSS (reduced-motion safe).',
      },
    },
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['surface', 'dark', 'paper', 'lime'],
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
    <span className="font-display text-[20px] leading-none uppercase">{title}</span>
    <span className="font-sans text-[13px]">{text}</span>
  </div>
)

/** Default surface tone — a plain `<div>` with the base border + radius. */
export const Surface: S = {
  args: {
    tone: 'surface',
    children: <Body title="Rodada 12" text="Surface · superfície branca padrão." />,
  },
}

/** Dark tone for broadcast/editorial moments. */
export const Dark: S = {
  args: {
    tone: 'dark',
    children: <Body title="Ao Vivo" text="Dark · momento editorial sobre tinta." />,
  },
}

/** Parchment tone. */
export const Paper: S = {
  args: {
    tone: 'paper',
    children: <Body title="Convite" text="Paper · superfície de pergaminho." />,
  },
}

/** Lime call-to-action tone. */
export const Lime: S = {
  args: {
    tone: 'lime',
    children: <Body title="Escalar" text="Lime · destaque de chamada para ação." />,
  },
}

/** All four tones side by side. */
export const AllTones: S = {
  render: () => (
    <div className="grid gap-4 sm:grid-cols-2">
      {(['surface', 'dark', 'paper', 'lime'] as const).map((tone) => (
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

/** Selected interactive card — lime selection border + `aria-pressed`/`aria-selected`. */
export const Selected: S = {
  args: {
    interactive: true,
    selected: true,
    children: <Body title="Selecionado" text="aria-pressed=true · borda lime." />,
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
    tone: 'surface',
    interactive: false,
    selected: false,
    padding: 'p-4',
    children: <Body title="Playground" text="Ajuste as props ao lado." />,
  },
}
