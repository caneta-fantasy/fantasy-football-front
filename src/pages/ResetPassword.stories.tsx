import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ResetPassword from './ResetPassword'

/**
 * Screenshot / preview surface for the migrated ResetPassword page. A `token`
 * query param is supplied so the form renders (a missing token shows the
 * invalid-link state instead).
 */
const client = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta: Meta<typeof ResetPassword> = {
  title: 'Pages/Auth/ResetPassword',
  component: ResetPassword,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/reset-password?token=demo']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ResetPassword>

export const Default: Story = {}
