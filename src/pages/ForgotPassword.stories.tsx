import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ForgotPassword from './ForgotPassword'

/** Screenshot / preview surface for the migrated ForgotPassword page. */
const client = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta: Meta<typeof ForgotPassword> = {
  title: 'Pages/Auth/ForgotPassword',
  component: ForgotPassword,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/forgot-password']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof ForgotPassword>

export const Default: Story = {}
