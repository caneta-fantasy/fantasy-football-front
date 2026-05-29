import type { Meta, StoryObj } from '@storybook/react'
import { Popover } from './Popover'
import { Btn } from '../Btn/Btn'

const meta: Meta<typeof Popover> = {
  title: 'Overlays/Popover',
  component: Popover,
  parameters: { layout: 'centered' },
  argTypes: {
    placement: {
      control: 'inline-radio',
      options: ['top', 'bottom', 'left', 'right'],
    },
    label: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Popover>

const SortOptions = () => (
  <div>
    <p className="mb-2 font-sans text-[12.5px] font-bold text-text">
      Ordenar por
    </p>
    {['Projeção', 'Valorização', 'Preço'].map((o) => (
      <button
        key={o}
        type="button"
        className="block w-full rounded-sm px-2 py-[5px] text-left font-sans text-[12.5px] text-text hover:bg-surface-inset"
      >
        {o}
      </button>
    ))}
  </div>
)

/** Interactive controls — click the trigger; outside-click or Esc closes it. */
export const Playground: S = {
  args: { label: 'Opções de ordenação', placement: 'bottom' },
  render: (args) => (
    <Popover {...args} trigger={<Btn variant="ghost" size="sm">Ordenar por</Btn>}>
      <SortOptions />
    </Popover>
  ),
}

export const Bottom: S = {
  render: () => (
    <Popover
      label="Ordenar"
      placement="bottom"
      trigger={<Btn variant="ghost" size="sm">Abaixo</Btn>}
    >
      <SortOptions />
    </Popover>
  ),
}

export const Top: S = {
  render: () => (
    <Popover
      label="Ordenar"
      placement="top"
      trigger={<Btn variant="ghost" size="sm">Acima</Btn>}
    >
      <SortOptions />
    </Popover>
  ),
}

export const Right: S = {
  render: () => (
    <Popover
      label="Ordenar"
      placement="right"
      trigger={<Btn variant="ghost" size="sm">Direita</Btn>}
    >
      <SortOptions />
    </Popover>
  ),
}

export const Left: S = {
  render: () => (
    <Popover
      label="Ordenar"
      placement="left"
      trigger={<Btn variant="ghost" size="sm">Esquerda</Btn>}
    >
      <SortOptions />
    </Popover>
  ),
}
