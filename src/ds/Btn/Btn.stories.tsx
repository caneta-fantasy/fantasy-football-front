import type { Meta, StoryObj } from '@storybook/react'
import { Btn } from './Btn'

const meta: Meta<typeof Btn> = {
  title: 'Primitives/Btn',
  component: Btn,
  args: {
    children: 'Entrar na liga',
    variant: 'primary',
    size: 'md',
    loading: false,
    disabled: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'gold', 'cobalt', 'secondary', 'danger', 'ghost'],
    },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    loading: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta

type S = StoryObj<typeof Btn>

const VARIANTS = [
  'primary',
  'gold',
  'cobalt',
  'secondary',
  'danger',
  'ghost',
] as const
const SIZES = ['sm', 'md', 'lg'] as const

/** Interactive controls — toggle variant/size/loading/disabled in the panel. */
export const Playground: S = {}

export const Primary: S = { args: { variant: 'primary', children: 'Entrar na liga' } }
export const Gold: S = { args: { variant: 'gold', children: 'Confirmar oferta' } }
export const Cobalt: S = { args: { variant: 'cobalt', children: 'Ver detalhes' } }
export const Secondary: S = { args: { variant: 'secondary', children: 'Voltar' } }
export const Danger: S = { args: { variant: 'danger', children: 'Excluir liga' } }
export const Ghost: S = { args: { variant: 'ghost', children: 'Cancelar' } }

export const AllVariants: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {VARIANTS.map((v) => (
        <Btn key={v} variant={v}>
          {v}
        </Btn>
      ))}
    </div>
  ),
}

export const AllSizes: S = {
  render: () => (
    <div className="flex items-center gap-3">
      {SIZES.map((sz) => (
        <Btn key={sz} size={sz}>
          {sz}
        </Btn>
      ))}
    </div>
  ),
}

export const Loading: S = { args: { children: 'Aguarde', loading: true } }

export const LoadingAcrossSizes: S = {
  render: () => (
    <div className="flex items-center gap-3">
      {SIZES.map((sz) => (
        <Btn key={sz} size={sz} loading>
          {sz}
        </Btn>
      ))}
    </div>
  ),
}

export const Disabled: S = { args: { children: 'Indisponível', disabled: true } }
