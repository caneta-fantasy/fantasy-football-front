import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  it('renders the trigger and is hidden by default', () => {
    render(
      <Tooltip label="proj 14.8">
        <button>Pedro H.</button>
      </Tooltip>,
    )
    expect(
      screen.getByRole('button', { name: 'Pedro H.' }),
    ).toBeInTheDocument()
    // No visible tooltip content before interaction.
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows on hover and links the trigger via aria-describedby', async () => {
    render(
      <Tooltip label="proj 14.8">
        <button>Pedro H.</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Pedro H.' })
    await userEvent.hover(trigger)
    const tip = await screen.findByRole('tooltip')
    expect(tip).toHaveTextContent('proj 14.8')
    expect(trigger).toHaveAttribute('aria-describedby', tip.id)
  })

  it('hides again when the pointer leaves', async () => {
    render(
      <Tooltip label="proj 14.8">
        <button>Pedro H.</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Pedro H.' })
    await userEvent.hover(trigger)
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    await userEvent.unhover(trigger)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('shows on keyboard focus and hides on blur (focus trigger)', async () => {
    render(
      <Tooltip label="proj 14.8">
        <button>Pedro H.</button>
      </Tooltip>,
    )
    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Pedro H.' })).toHaveFocus()
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    await userEvent.tab()
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('dismisses on Escape while visible', async () => {
    render(
      <Tooltip label="proj 14.8">
        <button>Pedro H.</button>
      </Tooltip>,
    )
    const trigger = screen.getByRole('button', { name: 'Pedro H.' })
    await userEvent.hover(trigger)
    expect(await screen.findByRole('tooltip')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('falls back to the default placement for an unknown value without throwing', () => {
    expect(() =>
      render(
        // @ts-expect-error testing runtime fallback
        <Tooltip label="x" placement="nope">
          <button>t</button>
        </Tooltip>,
      ),
    ).not.toThrow()
  })
})
