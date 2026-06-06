import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { RoundSelector } from './RoundSelector'

const meta: Meta<typeof RoundSelector> = {
  title: 'Patterns/RoundSelector',
  component: RoundSelector,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'RoundSelector — the round navigator (Source: ScheduleTab/RodadaTab). ' +
          'A prev/next arrow pair flanking a real native `<select>` styled as a ' +
          'white pill on the strong hairline, carrying "Rodada N" plus an optional ' +
          'cobalt **Atual** chip and gold **Mata-mata** chip. The select is the ' +
          'real keyboard-operable control; the visible label + chips are a ' +
          'decorative overlay. Arrows are real buttons, `disabled` at the bounds.',
      },
    },
  },
}
export default meta

type S = StoryObj<typeof RoundSelector>

const ROUNDS = [9, 10, 11, 12, 13, 14]

const Host = ({ children }: { children: React.ReactNode }) => (
  <div data-ds className="bg-bg p-6">
    {children}
  </div>
)

function Controlled(props: {
  currentRound?: number
  isPlayoff?: (r: number) => boolean
  start?: number
}) {
  const [round, setRound] = useState(props.start ?? 12)
  return (
    <Host>
      <RoundSelector
        rounds={ROUNDS}
        value={round}
        onChange={setRound}
        currentRound={props.currentRound}
        isPlayoff={props.isPlayoff}
      />
    </Host>
  )
}

export const Default: S = { render: () => <Controlled /> }

export const CurrentRound: S = {
  render: () => <Controlled currentRound={12} />,
}

export const PlayoffRound: S = {
  render: () => <Controlled start={13} isPlayoff={(r) => r >= 13} />,
}

export const Both: S = {
  render: () => (
    <Controlled start={13} currentRound={13} isPlayoff={(r) => r >= 13} />
  ),
}
