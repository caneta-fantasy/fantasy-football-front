import type { Meta, StoryObj } from '@storybook/react'
import { PositionPill } from './PositionPill'

const meta: Meta<typeof PositionPill> = {
  title: 'Fantasy/PositionPill',
  component: PositionPill,
  argTypes: {
    code: {
      control: 'select',
      options: ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA', 'TEC', 'XYZ'],
    },
  },
}
export default meta

type S = StoryObj<typeof PositionPill>

export const Goalkeeper: S = { args: { code: 'GOL' } }
export const CentreBack: S = { args: { code: 'ZAG' } }
export const Fullback: S = { args: { code: 'LAT' } }
export const Midfielder: S = { args: { code: 'MEI' } }
export const Attacker: S = { args: { code: 'ATA' } }
export const Coach: S = { args: { code: 'TEC' } }

/** §7 #9: unknown codes get a neutral pill (no silent MEI fallback). */
export const UnknownCode: S = { args: { code: 'XYZ' } }

/** All known positions side-by-side — note ZAG (solid) vs LAT (striped/outlined). */
export const AllPositions: S = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      {(['GOL', 'ZAG', 'LAT', 'MEI', 'ATA', 'TEC'] as const).map((code) => (
        <PositionPill key={code} code={code} />
      ))}
    </div>
  ),
}

/** ZAG vs LAT comparison — both blue-family, differentiated by fill pattern. */
export const ZagVsLat: S = {
  render: () => (
    <div className="flex items-center gap-3">
      <PositionPill code="ZAG" />
      <PositionPill code="LAT" />
    </div>
  ),
}

/** Interactive controls — change the `code` to see every treatment. */
export const Playground: S = { args: { code: 'MEI' } }
