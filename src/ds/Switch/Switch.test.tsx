import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Switch } from './Switch'

describe('Switch', () => {
  it('renders a button with role="switch" and an accessible name', () => {
    render(<Switch label="Notificações" />)
    const sw = screen.getByRole('switch', { name: 'Notificações' })
    expect(sw).toBeInTheDocument()
    expect(sw.tagName).toBe('BUTTON')
  })

  it('exposes aria-checked reflecting the on/off state', () => {
    render(<Switch label="Auto-pick" checked={false} />)
    expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
  })

  it('toggles on click and reports the next state via onChange', async () => {
    const onChange = vi.fn()
    render(<Switch label="Notificações" checked={false} onChange={onChange} />)
    await userEvent.click(screen.getByRole('switch'))
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('toggles with the keyboard (Space and Enter)', async () => {
    const onChange = vi.fn()
    render(<Switch label="Notificações" checked={false} onChange={onChange} />)
    const sw = screen.getByRole('switch')
    sw.focus()
    await userEvent.keyboard(' ')
    expect(onChange).toHaveBeenLastCalledWith(true)
    await userEvent.keyboard('{Enter}')
    expect(onChange).toHaveBeenLastCalledWith(true)
  })

  it('works uncontrolled, flipping aria-checked on click', async () => {
    render(<Switch label="Som" defaultChecked={false} />)
    const sw = screen.getByRole('switch')
    expect(sw).toHaveAttribute('aria-checked', 'false')
    await userEvent.click(sw)
    expect(sw).toHaveAttribute('aria-checked', 'true')
  })

  it('does not toggle or fire onChange when disabled', async () => {
    const onChange = vi.fn()
    render(
      <Switch label="Travado" checked disabled onChange={onChange} />,
    )
    const sw = screen.getByRole('switch')
    expect(sw).toBeDisabled()
    await userEvent.click(sw)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('is a native type=button so it does not submit forms', () => {
    render(<Switch label="X" />)
    expect(screen.getByRole('switch')).toHaveAttribute('type', 'button')
  })
})
