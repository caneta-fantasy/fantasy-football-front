import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import VerifyEmail from './VerifyEmail'

/**
 * Screenshot / preview surface for the migrated VerifyEmail page. `fetch` is
 * stubbed to resolve so the auto-submitted token lands on the success state
 * (the representative happy path) without a backend.
 */
const client = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

const meta: Meta<typeof VerifyEmail> = {
  title: 'Pages/Auth/VerifyEmail',
  component: VerifyEmail,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      window.fetch = (() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })) as unknown as typeof fetch
      return (
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={['/verify-email?token=demo']}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      )
    },
  ],
}
export default meta

type Story = StoryObj<typeof VerifyEmail>

export const Success: Story = {}
