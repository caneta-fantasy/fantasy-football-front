import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Modal } from './Modal'
import { Btn } from '../Btn/Btn'
import { Overline } from '../Overline/Overline'

const meta: Meta<typeof Modal> = {
  title: 'Overlays/Modal',
  component: Modal,
  parameters: { layout: 'fullscreen' },
  args: {
    open: true,
    title: 'Convidar pra liga',
    subtitle: 'MÉDIO · 480 × auto',
    size: 'md',
    closeOnEsc: true,
    closeOnScrimClick: true,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    open: { control: 'boolean' },
    onClose: { action: 'close' },
  },
}
export default meta

type S = StoryObj<typeof Modal>

/** Interactive controls — toggle size/open/dismiss behaviour in the panel. */
export const Playground: S = {
  render: (args) => (
    <Modal {...args}>
      <p className="font-sans text-[12.5px] text-text-muted">
        Manda o link pros parças. Liga fecha com 6 times.
      </p>
    </Modal>
  ),
}

export const Small: S = {
  args: { size: 'sm', title: 'Liberar Yuri?', subtitle: 'SM · CONFIRM' },
  render: (args) => (
    <Modal
      {...args}
      footer={
        <>
          <Btn variant="ghost" size="sm">
            Cancelar
          </Btn>
          <Btn variant="danger" size="sm">
            Liberar
          </Btn>
        </>
      }
    >
      <p className="font-sans text-[12.5px] leading-[1.5] text-text-muted">
        Ele volta pro mercado e qualquer um pode pegar. Não dá pra desfazer.
      </p>
    </Modal>
  ),
}

export const Medium: S = {
  render: (args) => (
    <Modal {...args}>
      <p className="mb-3 font-sans text-[12.5px] text-text-muted">
        Manda o link pros parças. Liga fecha com 6 times.
      </p>
      <div className="flex gap-2">
        <div className="flex h-10 flex-1 items-center rounded-btn border border-line-strong px-3 font-mono text-[12px] text-text-muted">
          caneta.fc/j/KHOURI26
        </div>
        <Btn variant="primary">Copiar</Btn>
      </div>
    </Modal>
  ),
}

export const Large: S = {
  args: { size: 'lg', title: 'Regras da liga', subtitle: 'GRANDE · 720 × auto' },
  render: (args) => (
    <Modal
      {...args}
      footer={
        <>
          <Btn variant="ghost">Fechar</Btn>
          <Btn variant="primary">Entendi, bora</Btn>
        </>
      }
    >
      <div className="grid grid-cols-3 gap-[14px]">
        {[
          ['Formato', 'Snake'],
          ['Rodadas', '11'],
          ['Times', '6'],
          ['Orçamento', 'R$ 120 mi'],
          ['Capitão', '×2 / ×3'],
          ['Deadline', 'Sex 19h'],
        ].map(([l, v]) => (
          <div
            key={l}
            className="rounded-btn border border-line bg-surface-inset px-3 py-[10px]"
          >
            <Overline>{l}</Overline>
            <div className="mt-[3px] font-display text-[20px] text-text">{v}</div>
          </div>
        ))}
      </div>
    </Modal>
  ),
}

/** Real open/close flow driven by a trigger button (focus returns to it). */
export const Triggered: S = {
  render: () => {
    const [open, setOpen] = React.useState(false)
    return (
      <div className="p-8">
        <Btn onClick={() => setOpen(true)}>Abrir modal</Btn>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          title="Convidar pra liga"
          subtitle="MÉDIO · 480 × auto"
          footer={
            <Btn variant="primary" onClick={() => setOpen(false)}>
              Fechar
            </Btn>
          }
        >
          <p className="font-sans text-[12.5px] text-text-muted">
            Esc, clique no scrim ou no X fecham. O foco volta pro botão.
          </p>
        </Modal>
      </div>
    )
  },
}
