import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Feedback/Skeleton',
  component: Skeleton,
  args: {
    variant: 'text',
    width: 200,
    height: 14,
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['text', 'rect', 'circle'] },
    width: { control: 'text' },
    height: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Skeleton>

/** Interactive controls — tweak variant/width/height in the panel. */
export const Playground: S = {}

export const Text: S = { args: { variant: 'text', width: 200, height: 14 } }

export const Rect: S = { args: { variant: 'rect', width: 120, height: 80 } }

export const Circle: S = { args: { variant: 'circle', width: 48 } }

export const PercentageWidth: S = {
  render: () => (
    <div style={{ width: 280 }}>
      <Skeleton width="60%" height={12} />
    </div>
  ),
}

/** Composed layout-matching skeleton — a player row (from screens/07-states). */
export const PlayerRow: S = {
  render: () => (
    <div className="flex flex-col gap-3" style={{ width: 320 }}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="grid items-center gap-3"
          style={{ gridTemplateColumns: '34px 1fr 50px' }}
        >
          <Skeleton variant="rect" width={34} height={20} />
          <div>
            <Skeleton width="60%" height={11} className="mb-2" />
            <Skeleton width="38%" height={9} />
          </div>
          <Skeleton variant="rect" width={50} height={18} />
        </div>
      ))}
    </div>
  ),
}
