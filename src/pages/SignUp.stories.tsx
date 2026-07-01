import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import SignUp from './SignUp'

/**
 * Screenshot / preview surface for the migrated SignUp page. Wrapped in the
 * providers the page reads (QueryClient for the mutation hooks, a router for the
 * links); the default render is the clean account-creation form.
 */
const client = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta: Meta<typeof SignUp> = {
  title: 'Pages/Auth/SignUp',
  component: SignUp,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={['/signup']}>
          <Story />
        </MemoryRouter>
      </QueryClientProvider>
    ),
  ],
}
export default meta

type Story = StoryObj<typeof SignUp>

export const Default: Story = {}
