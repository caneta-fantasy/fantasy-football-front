import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArchHeader } from './ArchHeader'
import { Crest } from '../Crest/Crest'
import { Avatar } from '../Avatar/Avatar'
import { Btn } from '../Btn/Btn'

const meta: Meta<typeof ArchHeader> = {
  title: 'Signature/ArchHeader',
  component: ArchHeader,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'ArchHeader — the composed modernista screen header. It stacks an ' +
          '`ArchPanel` (the swept Niemeyer surface) carrying an optional ' +
          '`Overline` eyebrow, a **real display heading** (`as`/`level` — it ' +
          'joins the document outline), and an optional trailing slot ' +
          '(`Crest`/`Avatar`/actions), over an optional `aria-hidden` background ' +
          'pattern (`azulejo`/`pitch`/`none`). Tones ship as contrast-checked ' +
          'bg/fg pairs (`green | gold | cobalt | paper`); the eyebrow is a ' +
          'sibling label (never folded into the heading), and the pattern layer ' +
          'is purely decorative (`aria-hidden` + `pointer-events: none`, capped ' +
          'opacity, clipped to the arch).',
      },
    },
  },
  argTypes: {
    tone: { control: 'inline-radio', options: ['green', 'gold', 'cobalt', 'paper'] },
    pattern: { control: 'inline-radio', options: ['none', 'azulejo', 'pitch'] },
    level: { control: { type: 'number', min: 1, max: 6 } },
    arch: { control: { type: 'number' } },
    eyebrow: { control: 'text' },
    title: { control: 'text' },
    bg: { control: 'text' },
    color: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof ArchHeader>

// Every story sits in a `data-ds` host so the DS base layer (Archivo, focus
// ring) applies — matching how the header sits at the top of a migrated screen.
const Host = ({ children }: { children: React.ReactNode }) => (
  <div data-ds className="bg-bg p-6">
    {children}
  </div>
)

/** Default: the green broadcast surface with a gold eyebrow + on-green title. */
export const Default: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} />
    </Host>
  ),
  args: { eyebrow: 'Rodada 12', title: 'Tabela', tone: 'green' },
}

/** Gold tone — near-black eyebrow + title on heritage gold (AA-checked). */
export const Gold: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} />
    </Host>
  ),
  args: { eyebrow: 'Campeão', title: 'Final', tone: 'gold' },
}

/** Cobalt tone — warm-white on azulejo cobalt. */
export const Cobalt: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} />
    </Host>
  ),
  args: { eyebrow: 'Mercado', title: 'Jogadores', tone: 'cobalt' },
}

/** Paper tone — ink on white; a hard-ish edge for light sections. */
export const Paper: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} />
    </Host>
  ),
  args: { eyebrow: 'Seção', title: 'Classificação', tone: 'paper', arch: 60 },
}

/**
 * With the decorative `azulejo` pattern layer — the faint Bulcão tile lattice
 * clipped to the swept arch. The layer is `aria-hidden`; only the heading and
 * eyebrow are announced.
 */
export const WithAzulejo: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} style={{ minHeight: 160 }} />
    </Host>
  ),
  args: {
    eyebrow: 'Caneta Fantasy',
    title: 'Seu Time',
    tone: 'green',
    pattern: 'azulejo',
  },
}

/** With the decorative `pitch` watermark pattern behind the title. */
export const WithPitch: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} style={{ minHeight: 160 }} />
    </Host>
  ),
  args: {
    eyebrow: 'Ao vivo',
    title: 'Placar',
    tone: 'green',
    pattern: 'pitch',
  },
}

/**
 * With a trailing `right` slot — a club `Crest` opposite the title. Real
 * content, kept in the a11y tree.
 */
export const WithCrest: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} right={<Crest name="FC Resenha" seed={2} size={56} />} />
    </Host>
  ),
  args: { eyebrow: 'Time', title: 'FC Resenha', tone: 'green' },
}

/**
 * With an `Avatar` + an action `Btn` in the trailing slot — the owner header on
 * the Times screen. The button is a real interactive control.
 */
export const WithAvatarAndAction: S = {
  render: (args) => (
    <Host>
      <ArchHeader
        {...args}
        right={
          <>
            <Avatar name="João Silva" size={48} />
            <Btn variant="gold" size="sm">
              Editar
            </Btn>
          </>
        }
      />
    </Host>
  ),
  args: { eyebrow: 'Meu Time', title: 'João Silva', tone: 'green' },
}

/**
 * Heading level: rendered as an `h1` for a page-top header so it anchors the
 * document outline. Inspect the accessibility panel — the eyebrow is a sibling
 * label, not part of the heading name.
 */
export const AsPageHeading: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} />
    </Host>
  ),
  args: { eyebrow: 'Liga Brasileirão', title: 'Tabela', level: 1, tone: 'green' },
}

/** Interactive controls — tweak tone, pattern, eyebrow, title, level and arch. */
export const Playground: S = {
  render: (args) => (
    <Host>
      <ArchHeader {...args} style={{ minHeight: 160 }} />
    </Host>
  ),
  args: {
    eyebrow: 'Rodada 12',
    title: 'Tabela',
    tone: 'green',
    pattern: 'azulejo',
    level: 2,
  },
}
