import type { Meta, StoryObj } from '@storybook/react'
import { CaptainBadge } from './CaptainBadge'

const meta: Meta<typeof CaptainBadge> = {
  title: 'Fantasy/CaptainBadge',
  component: CaptainBadge,
  argTypes: {
    role: { control: 'inline-radio', options: ['C', 'V'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
}
export default meta

type S = StoryObj<typeof CaptainBadge>

/** Captain — solid lime pip with dark ink glyph. */
export const Captain: S = { args: { role: 'C' } }

/** Vice-captain — dark ink pip with a lime glyph and lime ring. */
export const Vice: S = { args: { role: 'V' } }

/** Captain and vice side-by-side — inverse treatments read apart at a glance. */
export const CaptainAndVice: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <CaptainBadge role="C" />
      <CaptainBadge role="V" />
    </div>
  ),
}

/** Every size token for both roles. */
export const AllSizes: S = {
  render: () => (
    <div className="flex items-center gap-6">
      {(['C', 'V'] as const).map((role) => (
        <div key={role} className="flex items-center gap-3">
          <CaptainBadge role={role} size="sm" />
          <CaptainBadge role={role} size="md" />
          <CaptainBadge role={role} size="lg" />
        </div>
      ))}
    </div>
  ),
}

/**
 * Pinned to a player chip — the real usage: the pip overlaps the
 * top-right corner of an avatar/card (DS `screens/13-fantasy-patterns.jsx`).
 */
export const PinnedToChip: S = {
  render: () => (
    <div className="relative inline-block">
      <div className="h-16 w-16 rounded-md bg-surface-inset" />
      <div className="absolute -right-2 -top-2">
        <CaptainBadge role="C" />
      </div>
    </div>
  ),
}

/** Interactive controls — flip `role` and `size`. */
export const Playground: S = { args: { role: 'C', size: 'md' } }
