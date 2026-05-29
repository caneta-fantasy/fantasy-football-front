import type { Meta, StoryObj } from '@storybook/react'
import { EmptyState } from './EmptyState'

const meta: Meta<typeof EmptyState> = {
  title: 'States/EmptyState',
  component: EmptyState,
  parameters: { layout: 'padded' },
  args: {
    icon: 'jersey',
    num: '00',
    title: 'Time vazio',
    body: 'Você ainda não draftou ninguém. Bora montar essa escalação?',
    cta: 'Ir ao mercado',
  },
  argTypes: {
    icon: {
      control: 'select',
      options: ['jersey', 'market', 'bell', 'trophy', 'search', 'calendar'],
    },
    num: { control: 'text' },
    title: { control: 'text' },
    body: { control: 'text' },
    cta: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof EmptyState>

/** Interactive controls — tweak the icon, numeral, copy and CTA in the panel. */
export const Playground: S = {}

export const TeamEmpty: S = {
  args: {
    icon: 'jersey',
    num: '00',
    title: 'Time vazio',
    body: 'Você ainda não draftou ninguém. Bora montar essa escalação?',
    cta: 'Ir ao mercado',
  },
}

export const MarketEmpty: S = {
  args: {
    icon: 'market',
    num: '0',
    title: 'Mercado limpo',
    body: 'Nenhum jogador bate com esse filtro. Afrouxa um pouco a busca.',
    cta: 'Limpar filtros',
  },
}

/** No CTA — purely informational. */
export const NoCta: S = {
  args: {
    icon: 'bell',
    num: '0',
    title: 'Sem novidades',
    body: 'Tudo quieto por aqui. Quando rolar gol, lesão ou troca, a gente avisa.',
    cta: undefined,
  },
}

/** No oversized numeral. */
export const NoNumeral: S = {
  args: {
    icon: 'search',
    num: undefined,
    title: 'Nada encontrado',
    body: 'Tenta outra busca — talvez com menos letras.',
    cta: undefined,
  },
}

export const Grid: S = {
  render: () => (
    <div className="grid grid-cols-3 gap-[18px]">
      <EmptyState
        icon="jersey"
        num="00"
        title="Time vazio"
        body="Você ainda não draftou ninguém. Bora montar essa escalação?"
        cta="Ir ao mercado"
      />
      <EmptyState
        icon="market"
        num="0"
        title="Mercado limpo"
        body="Nenhum jogador bate com esse filtro. Afrouxa um pouco a busca."
        cta="Limpar filtros"
      />
      <EmptyState
        icon="bell"
        num="0"
        title="Sem novidades"
        body="Tudo quieto por aqui. Quando rolar gol, lesão ou troca, a gente avisa."
      />
    </div>
  ),
}
