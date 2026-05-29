import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { BottomSheet } from './BottomSheet'
import { Icon } from '../Icon/Icon'
import { Btn } from '../Btn/Btn'

const meta: Meta<typeof BottomSheet> = {
  title: 'Overlays/BottomSheet',
  component: BottomSheet,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Yuri Alberto',
    closeOnEsc: true,
    closeOnScrimClick: true,
    dragDismissThreshold: 80,
  },
  argTypes: {
    open: { control: 'boolean' },
    onClose: { action: 'close' },
  },
}
export default meta

type S = StoryObj<typeof BottomSheet>

type Action = { icon: string; label: string; danger?: boolean }
const ACTIONS: Action[] = [
  { icon: 'captain-c', label: 'Definir capitão' },
  { icon: 'swap', label: 'Substituir' },
  { icon: 'share', label: 'Compartilhar' },
  { icon: 'delete', label: 'Liberar', danger: true },
]

const ActionList = ({ onClose }: { onClose?: () => void }) => (
  <ul className="list-none">
    {ACTIONS.map((a) => (
      <li key={a.label}>
        <button
          type="button"
          onClick={onClose}
          className={[
            'flex w-full items-center gap-3 border-b border-border-subtle px-[18px] py-[13px] text-left',
            a.danger ? 'text-red' : 'text-text',
          ].join(' ')}
        >
          <Icon name={a.icon as never} size={20} />
          <span className="font-sans text-[13.5px] font-semibold">
            {a.label}
          </span>
        </button>
      </li>
    ))}
  </ul>
)

/** Interactive controls — toggle open/threshold/dismiss behaviour. */
export const Playground: S = {
  render: (args) => (
    <BottomSheet {...args}>
      <ActionList />
    </BottomSheet>
  ),
}

export const ActionSheet: S = {
  render: (args) => (
    <BottomSheet {...args}>
      <ActionList />
    </BottomSheet>
  ),
}

/** Real open/close flow with a trigger (focus returns to it). Drag the grabber down to dismiss. */
export const Triggered: S = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="p-8">
        <Btn onClick={() => setOpen(true)}>Abrir ações</Btn>
        <BottomSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Yuri Alberto"
        >
          <ActionList onClose={() => setOpen(false)} />
        </BottomSheet>
      </div>
    )
  },
}
