import { render, screen, act, within, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Toast } from './Toast'
import { ToastProvider, useToast } from './ToastProvider'

describe('Toast (presentational)', () => {
  it('renders the title and body', () => {
    render(<Toast tone="success" title="Pick confirmado" body="Pedro é seu." />)
    expect(screen.getByText('Pick confirmado')).toBeInTheDocument()
    expect(screen.getByText('Pedro é seu.')).toBeInTheDocument()
  })

  it('uses role="status" for success/info tones', () => {
    const { rerender } = render(<Toast tone="success" title="ok" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
    rerender(<Toast tone="info" title="ok" />)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('uses role="alert" for error/warning tones', () => {
    const { rerender } = render(<Toast tone="error" title="ruim" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
    rerender(<Toast tone="warning" title="cuidado" />)
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('falls back to the info tone for an unknown tone without throwing', () => {
    expect(() =>
      // @ts-expect-error testing runtime fallback
      render(<Toast tone="nope" title="x" />),
    ).not.toThrow()
    // unknown -> info -> role=status
    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders a real dismiss <button> labelled "Fechar" and calls onDismiss', async () => {
    const onDismiss = vi.fn()
    render(<Toast tone="info" title="oi" onDismiss={onDismiss} />)
    const close = screen.getByRole('button', { name: /fechar/i })
    expect(close.tagName).toBe('BUTTON')
    await userEvent.click(close)
    expect(onDismiss).toHaveBeenCalledTimes(1)
  })

  it('renders an action button when an action is provided and fires its callback', async () => {
    const onAction = vi.fn()
    render(
      <Toast
        tone="success"
        title="Pick confirmado"
        action={{ label: 'Desfazer', onClick: onAction }}
      />,
    )
    const action = screen.getByRole('button', { name: 'Desfazer' })
    await userEvent.click(action)
    expect(onAction).toHaveBeenCalledTimes(1)
  })

  it('omits the action button when no action is provided', () => {
    render(<Toast tone="warning" title="Deadline" />)
    // only the dismiss button should be present
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(1)
    expect(buttons[0]).toHaveAccessibleName(/fechar/i)
  })
})

describe('ToastProvider + useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    // Unmount first so the provider's interval is torn down, then flush any
    // already-scheduled callbacks inside act() to avoid stray state updates.
    act(() => {
      cleanup()
    })
    act(() => {
      vi.runOnlyPendingTimers()
    })
    vi.useRealTimers()
  })

  const Trigger = ({
    options = {},
  }: {
    options?: Record<string, unknown>
  }) => {
    const toast = useToast()
    return (
      <button
        onClick={() =>
          toast({ tone: 'success', title: 'Salvo', ...options })
        }
      >
        disparar
      </button>
    )
  }

  it('throws a helpful error when useToast is used outside a provider', () => {
    const Bad = () => {
      useToast()
      return null
    }
    // Silence the expected React error boundary console output.
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Bad />)).toThrow(/ToastProvider/)
    spy.mockRestore()
  })

  it('mounts a toast region with an accessible label', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    // The live region container is labelled for assistive tech.
    expect(screen.getByRole('region', { name: /notifica/i })).toBeInTheDocument()
  })

  it('shows a toast imperatively when the API is called', () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    )
    expect(screen.queryByText('Salvo')).not.toBeInTheDocument()
    act(() => {
      screen.getByRole('button', { name: 'disparar' }).click()
    })
    expect(screen.getByText('Salvo')).toBeInTheDocument()
  })

  it('auto-dismisses after the duration elapses', () => {
    render(
      <ToastProvider defaultDuration={4000}>
        <Trigger />
      </ToastProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'disparar' }).click()
    })
    expect(screen.getByText('Salvo')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(4000)
    })
    expect(screen.queryByText('Salvo')).not.toBeInTheDocument()
  })

  it('does not auto-dismiss when duration is 0', () => {
    render(
      <ToastProvider>
        <Trigger options={{ duration: 0 }} />
      </ToastProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'disparar' }).click()
    })
    act(() => {
      vi.advanceTimersByTime(60000)
    })
    expect(screen.getByText('Salvo')).toBeInTheDocument()
  })

  it('pauses the auto-dismiss timer while hovered, then resumes', () => {
    render(
      <ToastProvider defaultDuration={4000}>
        <Trigger />
      </ToastProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'disparar' }).click()
    })
    const toast = screen.getByText('Salvo').closest('[data-ds-toast]') as HTMLElement
    expect(toast).toBeTruthy()

    // Advance halfway, then hover to pause. React synthesizes onMouseEnter from
    // a native `mouseover`, so dispatch that (not `mouseenter`).
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    act(() => {
      toast.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    })
    // While paused, lots of time passes but it must remain.
    act(() => {
      vi.advanceTimersByTime(10000)
    })
    expect(screen.getByText('Salvo')).toBeInTheDocument()

    // Unhover resumes; remaining ~2000ms then dismisses.
    act(() => {
      toast.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(screen.queryByText('Salvo')).not.toBeInTheDocument()
  })

  it('stacks multiple toasts in the region', () => {
    const Multi = () => {
      const toast = useToast()
      return (
        <button
          onClick={() => {
            toast({ tone: 'success', title: 'Um' })
            toast({ tone: 'error', title: 'Dois' })
          }}
        >
          dois
        </button>
      )
    }
    render(
      <ToastProvider>
        <Multi />
      </ToastProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'dois' }).click()
    })
    const region = screen.getByRole('region', { name: /notifica/i })
    expect(within(region).getByText('Um')).toBeInTheDocument()
    expect(within(region).getByText('Dois')).toBeInTheDocument()
  })

  it('dismisses a single toast via its close button without affecting others', () => {
    const Multi = () => {
      const toast = useToast()
      return (
        <button
          onClick={() => {
            toast({ tone: 'success', title: 'Um', duration: 0 })
            toast({ tone: 'error', title: 'Dois', duration: 0 })
          }}
        >
          dois
        </button>
      )
    }
    render(
      <ToastProvider>
        <Multi />
      </ToastProvider>,
    )
    act(() => {
      screen.getByRole('button', { name: 'dois' }).click()
    })
    const first = screen.getByText('Um').closest('[data-ds-toast]') as HTMLElement
    const closeBtn = within(first).getByRole('button', { name: /fechar/i })
    act(() => {
      closeBtn.click()
    })
    expect(screen.queryByText('Um')).not.toBeInTheDocument()
    expect(screen.getByText('Dois')).toBeInTheDocument()
  })
})
