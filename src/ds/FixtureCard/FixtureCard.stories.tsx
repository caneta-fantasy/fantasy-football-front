import type { Meta, StoryObj } from '@storybook/react-vite'
import { FixtureCard } from './FixtureCard'

const home = { name: 'Palmeiras', short: 'PAL', seed: 2 }
const away = { name: 'Flamengo', short: 'FLA', seed: 1 }

const meta: Meta<typeof FixtureCard> = {
  title: 'Fantasy/FixtureCard',
  component: FixtureCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A single match tile for the four real fixture states (`screens/13-fantasy-patterns.jsx`, Block B): pre-match, live, finished and postponed. Built as a real `<article>` landmark whose `aria-label` names both clubs and the current state, so a screen reader announces the whole fixture as one unit. State is communicated by an explicit status WORD ("A SAIR" / "AO VIVO" / "ENCERRADO" / "ADIADO"), never by color alone. The live state embeds a pulsing `LiveChip` as a single `role="status"` + `aria-live="polite"` region carrying the match minute (reduced-motion safe — the pulse is neutralized by the DS base layer). Club crests are composed `Crest` images (`role="img"` + `<title>`). An unknown `status` falls back to pre-match — it never throws (§7 #1).',
      },
    },
  },
  argTypes: {
    status: {
      control: 'inline-radio',
      options: ['pre', 'live', 'finished', 'postponed'],
    },
    homeScore: { control: { type: 'number' } },
    awayScore: { control: { type: 'number' } },
    minute: { control: { type: 'number' } },
    kickoff: { control: 'text' },
    venue: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof FixtureCard>

/** Interactive controls — flip the status and the score/minute/kickoff. */
export const Playground: S = {
  args: {
    status: 'live',
    home,
    away,
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    venue: 'Allianz',
  },
}

/** Pre-match: kickoff time, no score, "A SAIR" status word. */
export const PreMatch: S = {
  args: { status: 'pre', home, away, kickoff: '16:00', venue: 'Maracanã' },
}

/** Live: pulsing AO VIVO chip with the minute, current score, polite region. */
export const Live: S = {
  args: {
    status: 'live',
    home,
    away,
    homeScore: 2,
    awayScore: 1,
    minute: 67,
    venue: 'Allianz',
  },
}

/** Finished: the final score with the "ENCERRADO" status word. */
export const Finished: S = {
  args: {
    status: 'finished',
    home,
    away,
    homeScore: 3,
    awayScore: 0,
    venue: 'Allianz',
  },
}

/** Postponed: "ADIADO" status, no score, balanced em-dash placeholder. */
export const Postponed: S = {
  args: { status: 'postponed', home, away, venue: 'Mineirão' },
}

/** All four states stacked, to compare the textual + accent cues per state. */
export const AllStates: S = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-3">
      <FixtureCard status="pre" home={home} away={away} kickoff="16:00" venue="Maracanã" />
      <FixtureCard
        status="live"
        home={home}
        away={away}
        homeScore={2}
        awayScore={1}
        minute={67}
        venue="Allianz"
      />
      <FixtureCard
        status="finished"
        home={home}
        away={away}
        homeScore={3}
        awayScore={0}
        venue="Allianz"
      />
      <FixtureCard status="postponed" home={home} away={away} venue="Mineirão" />
    </div>
  ),
}
