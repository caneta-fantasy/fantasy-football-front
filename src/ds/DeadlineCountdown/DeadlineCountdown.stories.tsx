import type { Meta, StoryObj } from '@storybook/react-vite'
import { DeadlineCountdown } from './DeadlineCountdown'

// A fixed reference "now" so the stories render a stable, deterministic clock.
const NOW = new Date('2026-05-29T12:00:00.000Z').getTime()
const inSeconds = (s: number) => NOW + s * 1000

const meta: Meta<typeof DeadlineCountdown> = {
  title: 'Fantasy/DeadlineCountdown',
  component: DeadlineCountdown,
  parameters: {
    docs: {
      description: {
        component:
          'The one piece in the system that changes color by urgency (design principle #2): signature green (`caneta`) while there is time, warning amber (`yellow`) in the final stretch, a pulsing brick-danger (`red`) in the last seconds (reduced-motion safe — the DS base layer disables the pulse), then a neutral `locked` state once the deadline passes. The `red` tone is the functional brick (#B23A2B), never the referee card-red. Rendered as a real `role="timer"` with `aria-live="polite"`; the visible HH:MM:SS ticks every second while the screen-reader sentence is throttled to minute granularity so polite announcements do not flood. Color is never the only cue — the urgency label text escalates and the locked state shows a lock icon. The `now` prop pins the clock for these stories; in the app it is omitted and uses the real time.',
      },
    },
  },
  argTypes: {
    label: { control: 'text' },
    lockedLabel: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof DeadlineCountdown>

/** Interactive controls — drive the label/lockedLabel; the clock is pinned. */
export const Playground: S = {
  args: { deadline: inSeconds(2 * 3600 + 14 * 60 + 8), now: NOW },
}

/** caneta: plenty of time left — signature-green block. */
export const Caneta: S = {
  args: { deadline: inSeconds(2 * 3600 + 14 * 60 + 8), now: NOW },
}

/** yellow: the final stretch (inside ~10 minutes) — warning amber. */
export const Yellow: S = {
  args: { deadline: inSeconds(9 * 60 + 42), now: NOW },
}

/** red: the last seconds, brick danger, with a pulsing urgency dot. */
export const Red: S = {
  args: { deadline: inSeconds(31), now: NOW },
}

/** locked/finished: the deadline has passed; the window is closed. */
export const Locked: S = {
  args: { deadline: inSeconds(-30), now: NOW, lockedLabel: 'FECHADA · R12' },
}

/** The full urgency escalation side by side, mirroring the DS reference. */
export const Escalation: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <DeadlineCountdown deadline={inSeconds(2 * 3600 + 14 * 60 + 8)} now={NOW} />
      <DeadlineCountdown deadline={inSeconds(9 * 60 + 42)} now={NOW} />
      <DeadlineCountdown deadline={inSeconds(31)} now={NOW} />
      <DeadlineCountdown deadline={inSeconds(-30)} now={NOW} lockedLabel="FECHADA" />
    </div>
  ),
}

/** Custom thresholds: escalate later (yellow ≤ 5min, red ≤ 30s). */
export const CustomThresholds: S = {
  args: {
    deadline: inSeconds(4 * 60),
    now: NOW,
    thresholds: { yellow: 300, red: 30 },
  },
}
