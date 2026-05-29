import { render, screen, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { DeadlineCountdown } from './DeadlineCountdown'

// A fixed "now" so the component's internal clock is deterministic.
const NOW = new Date('2026-05-29T12:00:00.000Z').getTime()

describe('DeadlineCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders a timer with an aria-live polite region', () => {
    render(<DeadlineCountdown deadline={NOW + 2 * 60 * 60 * 1000} />)
    const timer = screen.getByRole('timer')
    expect(timer).toBeInTheDocument()
    expect(timer).toHaveAttribute('aria-live', 'polite')
  })

  it('formats the remaining time as HH:MM:SS', () => {
    // 2h 14m 8s from now.
    const deadline = NOW + (2 * 3600 + 14 * 60 + 8) * 1000
    render(<DeadlineCountdown deadline={deadline} />)
    expect(screen.getByText('02:14:08')).toBeInTheDocument()
  })

  it('uses the lime/caneta tone when far from the deadline', () => {
    const { container } = render(
      <DeadlineCountdown deadline={NOW + 3 * 60 * 60 * 1000} />,
    )
    const root = container.querySelector('[data-tone]')
    expect(root).toHaveAttribute('data-tone', 'caneta')
  })

  it('shifts to the yellow tone in the final stretch', () => {
    // 9m 42s — inside the default 10-minute yellow threshold, outside 1-min red.
    const deadline = NOW + (9 * 60 + 42) * 1000
    const { container } = render(<DeadlineCountdown deadline={deadline} />)
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'yellow',
    )
  })

  it('shifts to the red tone in the last seconds', () => {
    // 31s — inside the default 60-second red threshold.
    const deadline = NOW + 31 * 1000
    const { container } = render(<DeadlineCountdown deadline={deadline} />)
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'red',
    )
  })

  it('renders a locked/finished state once the deadline has passed', () => {
    const { container } = render(
      <DeadlineCountdown deadline={NOW - 1000} lockedLabel="FECHADA" />,
    )
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'locked',
    )
    expect(screen.getByText('FECHADA')).toBeInTheDocument()
    // The accessible status names the lock state for screen readers.
    expect(screen.getByRole('timer')).toHaveTextContent(/encerrad/i)
  })

  it('counts down as time advances and crosses tone thresholds', () => {
    // Start 1m 5s out (yellow), advance past the 60s red threshold.
    const deadline = NOW + 65 * 1000
    const { container } = render(<DeadlineCountdown deadline={deadline} />)
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'yellow',
    )
    act(() => {
      vi.advanceTimersByTime(10 * 1000) // now 55s remain → red
    })
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'red',
    )
    expect(screen.getByText('00:00:55')).toBeInTheDocument()
  })

  it('reaches the locked state when the clock runs out', () => {
    const deadline = NOW + 3 * 1000
    const { container } = render(<DeadlineCountdown deadline={deadline} />)
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'red',
    )
    act(() => {
      vi.advanceTimersByTime(4 * 1000)
    })
    expect(container.querySelector('[data-tone]')).toHaveAttribute(
      'data-tone',
      'locked',
    )
  })

  it('falls back to the caneta tone for an unknown thresholds shape without throwing', () => {
    expect(() =>
      render(
        // @ts-expect-error testing runtime fallback for a malformed prop
        <DeadlineCountdown deadline={NOW + 3600 * 1000} thresholds={null} />,
      ),
    ).not.toThrow()
  })
})
