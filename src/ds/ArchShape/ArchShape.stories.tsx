import type { Meta, StoryObj } from '@storybook/react-vite'
import { ArchShape } from './ArchShape'

const meta: Meta<typeof ArchShape> = {
  title: 'Signature/ArchShape',
  component: ArchShape,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'The half-stadium Niemeyer curve as a pure decorative `<svg><path>` ' +
          'graphic — a flat gold block whose top is swept into one big arc. It ' +
          'is the signature modernista tension: a strict editorial grid ' +
          'interrupted by a single generous curve (e.g. the once-per-screen ' +
          'accent on the SignIn hero). It is `aria-hidden` with `pointer-events: ' +
          'none` — pure decoration, never announced; any meaning it frames is ' +
          'carried by adjacent functional text. Props: `w`/`h` size the ' +
          'silhouette, `fill` recolors it (default signature gold).',
      },
    },
  },
  argTypes: {
    w: { control: { type: 'number' } },
    h: { control: { type: 'number' } },
    fill: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof ArchShape>

/** Default: 200×120, signature gold. */
export const Default: S = {
  args: { w: 200, h: 120 },
}

/** Recolored to bottle green. */
export const Green: S = {
  args: { w: 200, h: 120, fill: 'var(--green)' },
}

/** Recolored to azulejo cobalt. */
export const Cobalt: S = {
  args: { w: 200, h: 120, fill: 'var(--cobalt)' },
}

/** A wide, shallow arch — a sweeping hero accent. */
export const WideShallow: S = {
  args: { w: 360, h: 120, fill: 'var(--gold)' },
}

/** A tall, narrow arch. */
export const TallNarrow: S = {
  args: { w: 140, h: 200, fill: 'var(--gold)' },
}

/**
 * In context: a gold arch anchored to the bottom of a green hero block — the
 * signature SignIn moment. The arch is purely decorative; the heading carries
 * the meaning.
 */
export const InGreenHero: S = {
  render: (args) => (
    <div
      style={{
        position: 'relative',
        width: 420,
        height: 280,
        overflow: 'hidden',
        background: 'var(--color-signature)',
        borderRadius: 16,
      }}
    >
      <h2
        className="font-display"
        style={{
          position: 'relative',
          margin: 0,
          padding: '28px 30px',
          color: 'var(--color-on-signature)',
          fontVariationSettings: '"wght" 900, "wdth" 122',
          fontSize: 40,
          lineHeight: 0.92,
          letterSpacing: '-0.5px',
        }}
      >
        Caneta
        <br />
        Fantasy
      </h2>
      <ArchShape
        {...args}
        style={{ position: 'absolute', right: 0, bottom: 0 }}
      />
    </div>
  ),
  args: { w: 200, h: 120, fill: 'var(--gold)' },
}
