import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Tabs } from './Tabs'

const ITEMS = [
  { id: 'time', label: 'Time', content: <p>Conteúdo Time</p> },
  { id: 'mercado', label: 'Mercado', content: <p>Conteúdo Mercado</p> },
  { id: 'stats', label: 'Stats', content: <p>Conteúdo Stats</p> },
  { id: 'chat', label: 'Chat', content: <p>Conteúdo Chat</p> },
]

describe('Tabs', () => {
  it('renders a tablist with one tab per item', () => {
    render(<Tabs items={ITEMS} aria-label="Seções da liga" />)
    const list = screen.getByRole('tablist', { name: 'Seções da liga' })
    expect(list).toBeInTheDocument()
    expect(screen.getAllByRole('tab')).toHaveLength(4)
  })

  it('marks the first tab selected by default and shows only its panel', () => {
    render(<Tabs items={ITEMS} aria-label="Seções" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true')
    expect(tabs[1]).toHaveAttribute('aria-selected', 'false')
    // The selected panel is shown; others are not in the accessible tree.
    expect(screen.getByText('Conteúdo Time')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo Mercado')).not.toBeInTheDocument()
  })

  it('honors defaultValue', () => {
    render(<Tabs items={ITEMS} defaultValue="stats" aria-label="Seções" />)
    expect(screen.getByRole('tab', { name: 'Stats' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Conteúdo Stats')).toBeInTheDocument()
  })

  it('wires each tab to its panel via aria-controls/aria-labelledby', () => {
    render(<Tabs items={ITEMS} aria-label="Seções" />)
    const tab = screen.getByRole('tab', { name: 'Time' })
    const panel = screen.getByRole('tabpanel')
    expect(tab).toHaveAttribute('aria-controls', panel.id)
    expect(panel).toHaveAttribute('aria-labelledby', tab.id)
  })

  it('selects a tab on click and swaps the panel', async () => {
    render(<Tabs items={ITEMS} aria-label="Seções" />)
    await userEvent.click(screen.getByRole('tab', { name: 'Mercado' }))
    expect(screen.getByRole('tab', { name: 'Mercado' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    expect(screen.getByText('Conteúdo Mercado')).toBeInTheDocument()
    expect(screen.queryByText('Conteúdo Time')).not.toBeInTheDocument()
  })

  it('calls onValueChange when the selection changes', async () => {
    const onValueChange = vi.fn()
    render(
      <Tabs items={ITEMS} aria-label="Seções" onValueChange={onValueChange} />,
    )
    await userEvent.click(screen.getByRole('tab', { name: 'Chat' }))
    expect(onValueChange).toHaveBeenCalledWith('chat')
  })

  it('uses roving tabindex: only the active tab is in the tab sequence', () => {
    render(<Tabs items={ITEMS} aria-label="Seções" />)
    const tabs = screen.getAllByRole('tab')
    expect(tabs[0]).toHaveAttribute('tabindex', '0')
    expect(tabs[1]).toHaveAttribute('tabindex', '-1')
  })

  it('moves selection with ArrowRight/ArrowLeft and wraps around', async () => {
    render(<Tabs items={ITEMS} aria-label="Seções" />)
    const tabs = screen.getAllByRole('tab')
    tabs[0].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Mercado' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    // wrap from last to first with ArrowRight
    tabs[3].focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'Time' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    // ArrowLeft from first wraps to last
    screen.getByRole('tab', { name: 'Time' }).focus()
    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Chat' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('jumps to first/last tab with Home/End', async () => {
    render(<Tabs items={ITEMS} aria-label="Seções" />)
    screen.getByRole('tab', { name: 'Time' }).focus()
    await userEvent.keyboard('{End}')
    expect(screen.getByRole('tab', { name: 'Chat' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
    await userEvent.keyboard('{Home}')
    expect(screen.getByRole('tab', { name: 'Time' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('skips disabled tabs during arrow navigation', async () => {
    const items = [
      { id: 'a', label: 'A', content: <p>A</p> },
      { id: 'b', label: 'B', content: <p>B</p>, disabled: true },
      { id: 'c', label: 'C', content: <p>C</p> },
    ]
    render(<Tabs items={items} aria-label="Seções" />)
    screen.getByRole('tab', { name: 'A' }).focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(screen.getByRole('tab', { name: 'C' })).toHaveAttribute(
      'aria-selected',
      'true',
    )
  })

  it('does not throw on an unknown variant and renders the tablist', () => {
    expect(() =>
      render(
        // @ts-expect-error testing runtime fallback
        <Tabs items={ITEMS} variant="nope" aria-label="Seções" />,
      ),
    ).not.toThrow()
    expect(screen.getByRole('tablist')).toBeInTheDocument()
  })
})
