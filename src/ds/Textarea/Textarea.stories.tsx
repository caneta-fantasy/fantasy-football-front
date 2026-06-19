import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Textarea } from './Textarea'
import { FieldGroup } from '../FieldGroup/FieldGroup'

const meta: Meta<typeof Textarea> = {
  title: 'Forms/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Comentário na liga',
    placeholder: 'Manda a real sobre a rodada…',
  },
  argTypes: {
    maxLength: { control: 'number' },
    warnAt: { control: { type: 'range', min: 0, max: 1, step: 0.05 } },
    hardLimit: { control: 'boolean' },
    invalid: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
}
export default meta
type S = StoryObj<typeof Textarea>

export const Default: S = {}

export const Filled: S = {
  args: {
    defaultValue:
      'Caneta limpa do André no meio da zaga, mano. Esse cara tá voando essa rodada.',
  },
}

export const WithCounter: S = {
  args: {
    maxLength: 280,
    defaultValue:
      'Caneta limpa do André no meio da zaga, mano. Esse cara tá voando essa rodada.',
  },
}

export const NearLimitWarning: S = {
  args: {
    maxLength: 60,
    // 52 chars of 60 -> past the 80% warn threshold (yellow).
    defaultValue: 'Esse texto já tá chegando bem perto do limite agora!!',
  },
}

export const OverLimit: S = {
  args: {
    maxLength: 40,
    hardLimit: false,
    // Exceeds 40 -> red counter + aria-invalid error border.
    defaultValue:
      'Esse comentário passou do limite permitido pela liga, parça.',
  },
}

export const Invalid: S = {
  args: { invalid: true, defaultValue: 'Conteúdo inválido' },
}

export const Disabled: S = {
  args: { disabled: true, defaultValue: 'Conversa encerrada pelo admin.' },
}

export const InFieldGroup: S = {
  render: () => (
    <div className="w-[420px]">
      <FieldGroup
        label="Comentário na liga"
        htmlFor="ta-comment"
        help="Markdown leve e emoji liberados na conversa da liga."
      >
        <Textarea
          maxLength={280}
          defaultValue="Caneta limpa do André no meio da zaga, mano."
        />
      </FieldGroup>
    </div>
  ),
}

export const AllStates: S = {
  render: () => (
    <div className="flex flex-col gap-6 w-[420px]">
      <Textarea aria-label="default" placeholder="default" />
      <Textarea aria-label="ok counter" maxLength={280} defaultValue="abc" />
      <Textarea
        aria-label="near limit"
        maxLength={60}
        defaultValue="Esse texto já tá chegando bem perto do limite agora!"
      />
      <Textarea
        aria-label="over limit"
        maxLength={40}
        hardLimit={false}
        defaultValue="Esse comentário passou do limite permitido pela liga, parça."
      />
      <Textarea aria-label="invalid" invalid defaultValue="Conteúdo inválido" />
      <Textarea
        aria-label="disabled"
        disabled
        defaultValue="Conversa encerrada."
      />
    </div>
  ),
}

export const Interactive: S = {
  args: { maxLength: 140, hardLimit: false, warnAt: 0.8 },
  render: (args) => {
    const [value, setValue] = useState('')
    return (
      <div className="w-[420px]">
        <Textarea
          {...args}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
    )
  },
}
