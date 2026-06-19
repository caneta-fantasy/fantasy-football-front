import type { Meta, StoryObj } from '@storybook/react'
import { ProgressRing } from './ProgressRing'

const meta: Meta<typeof ProgressRing> = {
  title: 'Feedback/ProgressRing',
  component: ProgressRing,
  args: {
    value: 82,
    max: 100,
    size: 88,
    stroke: 6,
    label: '82%',
    sub: 'SALÁRIO',
    ariaLabel: 'Salário usado',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 130, step: 1 } },
    max: { control: 'number' },
    size: { control: { type: 'range', min: 40, max: 160, step: 4 } },
    stroke: { control: { type: 'range', min: 2, max: 14, step: 1 } },
    color: { control: 'color' },
    label: { control: 'text' },
    sub: { control: 'text' },
    ariaLabel: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof ProgressRing>

/** Interactive controls — tweak value/size/stroke/colour in the panel. */
export const Playground: S = {}

export const Salary: S = {
  args: { value: 82, label: '82%', sub: 'SALÁRIO', ariaLabel: 'Salário usado' },
}

export const Draft: S = {
  args: {
    value: 45,
    label: '45%',
    sub: 'DRAFT',
    color: 'var(--gold)',
    ariaLabel: 'Draft concluído',
  },
}

export const Empty: S = {
  args: { value: 0, label: '0%', sub: 'INÍCIO', ariaLabel: 'Sem progresso' },
}

export const Complete: S = {
  args: { value: 100, label: '100%', sub: 'PRONTO', ariaLabel: 'Concluído' },
}

/** Over max — the arc is clamped to a full ring; aria-valuenow keeps the real value. */
export const OverMax: S = {
  args: { value: 130, max: 100, label: '130%', sub: 'EXCEDIDO', ariaLabel: 'Excedido' },
}

export const Pair: S = {
  render: () => (
    <div className="flex items-center gap-5">
      <ProgressRing value={82} label="82%" sub="SALÁRIO" ariaLabel="Salário usado" />
      <ProgressRing
        value={45}
        label="45%"
        sub="DRAFT"
        color="var(--gold)"
        ariaLabel="Draft concluído"
      />
    </div>
  ),
}

export const Sizes: S = {
  render: () => (
    <div className="flex items-center gap-5">
      <ProgressRing value={66} size={56} stroke={5} label="66" ariaLabel="66 por cento" />
      <ProgressRing value={66} size={88} label="66" ariaLabel="66 por cento" />
      <ProgressRing value={66} size={120} stroke={8} label="66" ariaLabel="66 por cento" />
    </div>
  ),
}
