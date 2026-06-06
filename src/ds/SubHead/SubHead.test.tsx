import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SubHead } from './SubHead'

describe('SubHead', () => {
  it('renders a real heading (h2 by default) in the a11y tree', () => {
    render(<SubHead>Jogadores</SubHead>)
    const h = screen.getByRole('heading', { name: 'Jogadores', level: 2 })
    expect(h.tagName).toBe('H2')
  })

  it('honours the level prop', () => {
    render(<SubHead level={3}>Classificação</SubHead>)
    expect(screen.getByRole('heading', { name: 'Classificação', level: 3 })).toBeInTheDocument()
  })

  it('can render as a non-heading element via as', () => {
    render(<SubHead as="span">Times</SubHead>)
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
    expect(screen.getByText('Times').tagName).toBe('SPAN')
  })
})
