import type { Meta, StoryObj } from '@storybook/react'
import { ErrorState } from './ErrorState'

const meta: Meta<typeof ErrorState> = {
  title: 'States/ErrorState',
  component: ErrorState,
  parameters: { layout: 'padded' },
  args: {
    variant: '404',
    retryLabel: 'Tentar de novo',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['404', '500', 'offline'],
    },
    retryLabel: { control: 'text' },
    onRetry: { action: 'retry' },
  },
}
export default meta

type S = StoryObj<typeof ErrorState>

/** Interactive controls — switch variant and retry label in the panel. */
export const Playground: S = {}

export const NotFound404: S = { args: { variant: '404' } }
export const ServerError500: S = { args: { variant: '500' } }
export const Offline: S = { args: { variant: 'offline' } }

/** Custom retry label. */
export const CustomRetryLabel: S = {
  args: { variant: 'offline', retryLabel: 'Reconectar' },
}

export const AllVariants: S = {
  render: () => (
    <div className="grid grid-cols-3 gap-[18px]">
      <ErrorState variant="404" />
      <ErrorState variant="500" />
      <ErrorState variant="offline" />
    </div>
  ),
}
