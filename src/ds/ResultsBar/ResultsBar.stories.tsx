import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ResultsBar } from './ResultsBar'

const meta: Meta<typeof ResultsBar> = {
  title: 'App/ResultsBar',
  component: ResultsBar,
  parameters: {
    docs: {
      description: {
        component:
          'The Jogadores pagination footer: a rows-per-page `Select`, a "1–N de TOTAL" range readout, and the ds `Pagination` control. Paging is 1-based; the parent owns page state.',
      },
    },
  },
  argTypes: { compact: { control: 'boolean' } },
}
export default meta

type S = StoryObj<typeof ResultsBar>

const Demo = ({ compact }: { compact?: boolean }) => {
  const [page, setPage] = useState(1)
  const [rpp, setRpp] = useState(10)
  return (
    <div data-ds className="bg-paper p-6">
      <ResultsBar
        compact={compact}
        page={page}
        rowsPerPage={rpp}
        total={134}
        onPageChange={setPage}
        onRowsPerPageChange={(n) => {
          setRpp(n)
          setPage(1)
        }}
      />
    </div>
  )
}

export const Desktop: S = { render: () => <Demo /> }
export const Mobile: S = { render: () => <Demo compact /> }
