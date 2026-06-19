import type { Meta, StoryObj } from '@storybook/react-vite'
import { LeagueStandings, type StandingRow } from './LeagueStandings'

const ROWS: StandingRow[] = [
  { id: 1, rank: 1, team: 'Caneta FC', seed: 3, points: 1184, movement: 0, form: ['V', 'V', 'E', 'V', 'V'] },
  { id: 2, rank: 2, team: 'Churrasco XI', seed: 1, points: 1142, movement: 1, form: ['V', 'D', 'V', 'V', 'E'] },
  { id: 3, rank: 3, team: 'Zona Mista', seed: 6, points: 1098, movement: -1, form: ['E', 'V', 'D', 'V', 'V'] },
  { id: 4, rank: 4, team: 'Os Canelas', seed: 4, points: 1067, movement: 2, form: ['V', 'V', 'V', 'D', 'D'] },
  { id: 5, rank: 5, team: 'Resenha SC', seed: 2, points: 1012, movement: 0, form: ['D', 'E', 'V', 'D', 'V'] },
]

const meta: Meta<typeof LeagueStandings> = {
  title: 'Patterns/LeagueStandings',
  component: LeagueStandings,
  parameters: { layout: 'padded' },
  args: { rows: ROWS, caption: 'Classificação · Brasileirão Fantasy' },
}
export default meta

type S = StoryObj<typeof LeagueStandings>

/** Default standings: rank-1 carries the gold LÍDER badge + gold numeral. */
export const Default: S = {}

/** The signed-in manager's row gets the selected band + aria-selected. */
export const CurrentUserHighlighted: S = {
  args: { currentUserRowId: 3 },
}

/** Loading slot — centered Spinner with role="status". */
export const Loading: S = {
  args: { rows: [], loading: true },
}

/** Empty slot — house-voice message when no teams have joined yet. */
export const Empty: S = {
  args: { rows: [] },
}

/** Single team: still a valid leader (rank-1 highlight, no movement). */
export const SingleTeam: S = {
  args: {
    rows: [
      { id: 1, rank: 1, team: 'Caneta FC', seed: 3, points: 0, movement: 0, form: [] },
    ],
  },
}

/** Interactive: tweak rows, caption, the current-user row and loading via controls. */
export const Interactive: S = {
  args: { currentUserRowId: 1 },
  argTypes: {
    currentUserRowId: { control: 'text' },
    loading: { control: 'boolean' },
    caption: { control: 'text' },
  },
}
