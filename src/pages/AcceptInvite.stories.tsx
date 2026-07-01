import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AcceptInvite from './AcceptInvite'

/**
 * Screenshot / preview surface for the migrated AcceptInvite page. A
 * far-future fake JWT satisfies `isAuthenticated()` and `fetch` is stubbed to
 * resolve, so the invite auto-accepts and lands on the success state.
 */
const client = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

// header.payload.signature — payload carries a far-future `exp` so the JWT
// expiry check in isAuthenticated() passes.
const FUTURE_JWT = `x.${btoa(JSON.stringify({ exp: 9999999999 }))}.y`

const meta: Meta<typeof AcceptInvite> = {
  title: 'Pages/Auth/AcceptInvite',
  component: AcceptInvite,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => {
      localStorage.setItem('caneta.token', FUTURE_JWT)
      window.fetch = (() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })) as unknown as typeof fetch
      return (
        <QueryClientProvider client={client}>
          <MemoryRouter initialEntries={['/accept-invite?token=demo']}>
            <Story />
          </MemoryRouter>
        </QueryClientProvider>
      )
    },
  ],
}
export default meta

type Story = StoryObj<typeof AcceptInvite>

export const Success: Story = {}
