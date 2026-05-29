import type { Meta, StoryObj } from '@storybook/react'
import { FixtureDifficulty } from './FixtureDifficulty'

const meta: Meta<typeof FixtureDifficulty> = {
  title: 'Fantasy/FixtureDifficulty',
  component: FixtureDifficulty,
  args: {
    fixtures: [
      { opponent: 'PAL', difficulty: 1 },
      { opponent: 'VFL', difficulty: 2 },
      { opponent: 'SAN', difficulty: 1 },
      { opponent: 'FLA', difficulty: 4 },
      { opponent: 'COR', difficulty: 5 },
    ],
    label: 'Dificuldade dos próximos jogos',
    showLegend: false,
    height: 26,
  },
  argTypes: {
    showLegend: { control: 'boolean' },
    height: { control: { type: 'range', min: 18, max: 48, step: 2 } },
    label: { control: 'text' },
    fixtures: { control: 'object' },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 280 }}>
        <Story />
      </div>
    ),
  ],
}
export default meta

type S = StoryObj<typeof FixtureDifficulty>

/** Interactive controls — edit the fixtures array and toggle the legend. */
export const Playground: S = {}

/** The exact strip from screens/12-data-display, with the numeric 1–5 cue added. */
export const NextFive: S = {
  args: {
    fixtures: [
      { opponent: 'PAL', difficulty: 1 },
      { opponent: 'VFL', difficulty: 2 },
      { opponent: 'SAN', difficulty: 1 },
      { opponent: 'FLA', difficulty: 4 },
      { opponent: 'COR', difficulty: 5 },
    ],
  },
}

/** With the FÁCIL → DIFÍCIL colour legend. */
export const WithLegend: S = {
  args: { showLegend: true },
}

/** Home/away markers under each opponent code. */
export const WithVenue: S = {
  args: {
    fixtures: [
      { opponent: 'PAL', difficulty: 1, venue: 'C' },
      { opponent: 'VFL', difficulty: 2, venue: 'F' },
      { opponent: 'SAN', difficulty: 3, venue: 'C' },
      { opponent: 'FLA', difficulty: 4, venue: 'F' },
      { opponent: 'COR', difficulty: 5, venue: 'C' },
    ],
    showLegend: true,
  },
}

/**
 * Every step, isolated — proof the foreground stays legible at each level.
 * Note clay (3) and redDeep (5) flip to WHITE text for AA contrast.
 */
export const AllLevels: S = {
  args: {
    fixtures: [
      { opponent: 'L1', difficulty: 1 },
      { opponent: 'L2', difficulty: 2 },
      { opponent: 'L3', difficulty: 3 },
      { opponent: 'L4', difficulty: 4 },
      { opponent: 'L5', difficulty: 5 },
    ],
    showLegend: true,
  },
}

/** A run of easy fixtures — useful for "good fixture run" callouts. */
export const EasyRun: S = {
  args: {
    fixtures: [
      { opponent: 'GOI', difficulty: 1 },
      { opponent: 'CUI', difficulty: 1 },
      { opponent: 'CRI', difficulty: 2 },
      { opponent: 'JUV', difficulty: 1 },
    ],
  },
}

/** A brutal run — all hardest fixtures. */
export const HardRun: S = {
  args: {
    fixtures: [
      { opponent: 'FLA', difficulty: 5 },
      { opponent: 'PAL', difficulty: 5 },
      { opponent: 'COR', difficulty: 4 },
      { opponent: 'GRE', difficulty: 5 },
    ],
  },
}

/** Empty state — renders an empty, labelled list without breaking. */
export const Empty: S = {
  args: { fixtures: [] },
}
