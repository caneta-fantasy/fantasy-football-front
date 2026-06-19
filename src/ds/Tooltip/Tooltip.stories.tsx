import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Btn } from '../Btn/Btn'

const meta: Meta<typeof Tooltip> = {
  title: 'Overlays/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  args: {
    label: 'proj 14.8 · últ 5: +22',
    placement: 'top',
    openDelay: 0,
  },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
    },
    openDelay: { control: { type: 'number', min: 0, step: 50 } },
  },
}
export default meta

type S = StoryObj<typeof Tooltip>

/** Interactive controls — change placement/delay and hover or focus the trigger. */
export const Playground: S = {
  render: (args) => (
    <Tooltip {...args}>
      <Btn variant="ghost" size="sm">
        Pedro H.
      </Btn>
    </Tooltip>
  ),
}

export const Top: S = {
  render: (args) => (
    <Tooltip {...args} placement="top">
      <Btn variant="ghost" size="sm">
        Acima
      </Btn>
    </Tooltip>
  ),
}

export const Bottom: S = {
  render: (args) => (
    <Tooltip {...args} placement="bottom">
      <Btn variant="ghost" size="sm">
        Abaixo
      </Btn>
    </Tooltip>
  ),
}

export const Left: S = {
  render: (args) => (
    <Tooltip {...args} placement="left">
      <Btn variant="ghost" size="sm">
        Esquerda
      </Btn>
    </Tooltip>
  ),
}

export const Right: S = {
  render: (args) => (
    <Tooltip {...args} placement="right">
      <Btn variant="ghost" size="sm">
        Direita
      </Btn>
    </Tooltip>
  ),
}

export const WithDelay: S = {
  render: (args) => (
    <Tooltip {...args} openDelay={400}>
      <Btn variant="ghost" size="sm">
        Espera 400ms
      </Btn>
    </Tooltip>
  ),
}
