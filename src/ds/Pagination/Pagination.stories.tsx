import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { Pagination } from './Pagination'

/**
 * Modernista pagination: the current page is a **gold** color-block with
 * near-black on-gold ink; inactive pages are hairline-bordered Archivo
 * tabular-nums that hover to signature green. ARIA landmark + `aria-current`
 * carry over unchanged.
 */
const meta: Meta<typeof Pagination> = {
  title: 'Navigation/Pagination',
  component: Pagination,
  args: {
    page: 1,
    pageCount: 5,
    siblingCount: 1,
    'aria-label': 'Paginação',
  },
  argTypes: {
    page: { control: { type: 'number', min: 1 } },
    pageCount: { control: { type: 'number', min: 1 } },
    siblingCount: { control: { type: 'number', min: 0 } },
  },
}
export default meta

type S = StoryObj<typeof Pagination>

/** Interactive controls — drive page/pageCount/siblingCount from the panel. */
export const Playground: S = {}

/** Stateful: clicking actually moves the page. */
export const Interactive: S = {
  render: (args) => {
    const [page, setPage] = useState(args.page ?? 1)
    return (
      <Pagination {...args} page={page} onPageChange={setPage} />
    )
  },
  args: { pageCount: 10, page: 1 },
}

export const FirstPage: S = { args: { page: 1, pageCount: 5 } }
export const MiddlePage: S = { args: { page: 3, pageCount: 5 } }
export const LastPage: S = { args: { page: 5, pageCount: 5 } }

export const WithEllipses: S = { args: { page: 5, pageCount: 10 } }

export const FewPages: S = { args: { page: 2, pageCount: 4 } }

export const SinglePage: S = { args: { page: 1, pageCount: 1 } }
