import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArchPanel } from './ArchPanel'
import { Overline } from '../Overline/Overline'
import { Azulejo } from '../Azulejo/Azulejo'
import { ArchShape } from '../ArchShape/ArchShape'

const meta: Meta<typeof ArchPanel> = {
  title: 'Signature/ArchPanel',
  component: ArchPanel,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A **content container** whose top is swept into a Niemeyer curve ' +
          '(`border-radius: <arch>px <arch>px 0 0`, `overflow: hidden`) — the ' +
          'signature modernista header surface. Unlike `ArchShape` (a pure ' +
          'decorative graphic), `ArchPanel` carries real content (eyebrows, ' +
          'headings, scores) and stays fully in the accessibility tree. Tones ' +
          'ship as contrast-checked bg/fg pairs (`green | gold | cobalt | ' +
          'paper`) so the on-color text always clears AA on the chosen surface. ' +
          '`overflow: hidden` clips inner decorative layers (`Azulejo`, ' +
          '`ArchShape`) to the swept silhouette — those layers stay ' +
          '`aria-hidden`.',
      },
    },
  },
  argTypes: {
    tone: { control: 'select', options: ['green', 'gold', 'cobalt', 'paper'] },
    bg: { control: 'text' },
    color: { control: 'text' },
    arch: { control: { type: 'number' } },
  },
}
export default meta

type S = StoryObj<typeof ArchPanel>

/** Default: green broadcast surface with on-green text and a 120px sweep. */
export const Default: S = {
  args: {
    children: (
      <>
        <Overline color="var(--gold-light)" accent="var(--gold)">
          Rodada 12
        </Overline>
        <h2
          className="font-display"
          style={{
            margin: '10px 0 0',
            color: 'var(--color-on-signature)',
            fontVariationSettings: '"wght" 850, "wdth" 118',
            fontSize: 34,
            lineHeight: 0.92,
          }}
        >
          Tabela
        </h2>
      </>
    ),
  },
}

/** Gold tone — near-black text on heritage gold (AA-checked pairing). */
export const Gold: S = {
  args: {
    tone: 'gold',
    children: (
      <>
        <Overline color="var(--on-gold)">Campeão</Overline>
        <h2
          className="font-display"
          style={{
            margin: '10px 0 0',
            color: 'var(--color-on-accent)',
            fontVariationSettings: '"wght" 850, "wdth" 118',
            fontSize: 34,
            lineHeight: 0.92,
          }}
        >
          Final
        </h2>
      </>
    ),
  },
}

/** Cobalt tone — warm-white on azulejo cobalt. */
export const Cobalt: S = {
  args: {
    tone: 'cobalt',
    children: (
      <h2
        className="font-display"
        style={{
          margin: 0,
          color: 'var(--color-on-interactive)',
          fontVariationSettings: '"wght" 850, "wdth" 118',
          fontSize: 34,
          lineHeight: 0.92,
        }}
      >
        Jogadores
      </h2>
    ),
  },
}

/** Paper tone — ink on white, a hard-edged option for light contexts. */
export const Paper: S = {
  args: {
    tone: 'paper',
    arch: 60,
    children: (
      <>
        <Overline accent="var(--green)">Seção</Overline>
        <h2
          className="font-display"
          style={{
            margin: '10px 0 0',
            color: 'var(--color-text)',
            fontVariationSettings: '"wght" 850, "wdth" 118',
            fontSize: 30,
            lineHeight: 0.92,
          }}
        >
          Classificação
        </h2>
      </>
    ),
  },
}

/**
 * With inner decorative layers: a faint `Azulejo` texture and a gold `ArchShape`
 * accent are clipped to the swept silhouette by `overflow: hidden`. Both are
 * `aria-hidden`; only the heading is announced.
 */
export const WithDecorativeLayers: S = {
  render: (args) => (
    <ArchPanel {...args} style={{ minHeight: 200 }}>
      <Azulejo color="var(--on-green)" opacity={0.12} />
      <ArchShape
        w={180}
        h={100}
        fill="var(--gold)"
        style={{ position: 'absolute', right: 0, bottom: 0 }}
      />
      <div style={{ position: 'relative' }}>
        <Overline color="var(--gold-light)" accent="var(--gold)">
          Caneta Fantasy
        </Overline>
        <h2
          className="font-display"
          style={{
            margin: '10px 0 0',
            color: 'var(--color-on-signature)',
            fontVariationSettings: '"wght" 900, "wdth" 122',
            fontSize: 40,
            lineHeight: 0.92,
            letterSpacing: '-0.5px',
          }}
        >
          Seu Time
        </h2>
      </div>
    </ArchPanel>
  ),
  args: { tone: 'green', arch: 120 },
}

/** Hard edge (`arch={0}`) — the panel reads as a flat color block. */
export const HardEdge: S = {
  args: {
    arch: 0,
    children: (
      <h2
        className="font-display"
        style={{
          margin: 0,
          color: 'var(--color-on-signature)',
          fontVariationSettings: '"wght" 850, "wdth" 118',
          fontSize: 30,
        }}
      >
        Sem curva
      </h2>
    ),
  },
}
