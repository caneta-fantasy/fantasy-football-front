import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Drawer } from './Drawer'
import { Btn } from '../Btn/Btn'
import { Overline } from '../Overline/Overline'

const meta: Meta<typeof Drawer> = {
  title: 'Overlays/Drawer',
  component: Drawer,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Pedro Henrique',
    side: 'right',
    width: 320,
    closeOnEsc: true,
    closeOnScrimClick: true,
  },
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right'] },
    open: { control: 'boolean' },
    onClose: { action: 'close' },
  },
}
export default meta

type S = StoryObj<typeof Drawer>

const Stats = () => (
  <div className="grid grid-cols-2 gap-[10px]">
    {[
      ['PROJ', '14.8'],
      ['ÚLT 5', '+22'],
      ['G/A', '12/8'],
      ['MIN%', '92%'],
    ].map(([l, v]) => (
      <div key={l} className="rounded-btn border border-line px-[10px] py-2">
        <Overline>{l}</Overline>
        <div className="mt-[2px] font-mono text-[17px] font-bold tabular-nums">
          {v}
        </div>
      </div>
    ))}
  </div>
)

/** Interactive controls — toggle side/width/dismiss behaviour. */
export const Playground: S = {
  render: (args) => (
    <Drawer {...args} footer={<Btn className="w-full justify-center">Draftar →</Btn>}>
      <Stats />
    </Drawer>
  ),
}

export const Right: S = {
  args: { side: 'right' },
  render: (args) => (
    <Drawer {...args} footer={<Btn className="w-full justify-center">Draftar →</Btn>}>
      <Stats />
    </Drawer>
  ),
}

export const Left: S = {
  args: { side: 'left', title: 'Filtros' },
  render: (args) => (
    <Drawer {...args}>
      <Stats />
    </Drawer>
  ),
}

/** Real open/close flow driven by a trigger (focus returns to it). */
export const Triggered: S = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="p-8">
        <Btn onClick={() => setOpen(true)}>Ver detalhe</Btn>
        <Drawer
          open={open}
          onClose={() => setOpen(false)}
          title="Pedro Henrique"
          footer={
            <Btn className="w-full justify-center" onClick={() => setOpen(false)}>
              Draftar →
            </Btn>
          }
        >
          <Stats />
        </Drawer>
      </div>
    )
  },
}
