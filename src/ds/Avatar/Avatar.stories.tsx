import type { Meta, StoryObj } from '@storybook/react'
import { Avatar } from './Avatar'

const meta: Meta<typeof Avatar> = {
  title: 'Domain/Avatar',
  component: Avatar,
  args: {
    name: 'João Silva',
    size: 48,
  },
  argTypes: {
    name: { control: 'text' },
    src: { control: 'text' },
    size: { control: { type: 'range', min: 20, max: 96, step: 4 } },
    seed: { control: { type: 'number' } },
  },
}
export default meta

type S = StoryObj<typeof Avatar>

/** Interactive controls — change name/src/size/seed in the panel. */
export const Playground: S = {}

export const InitialsFallback: S = {
  args: { name: 'João Silva', size: 48 },
}

export const SingleWordName: S = {
  args: { name: 'Ronaldinho', size: 48 },
}

export const LongNameTruncates: S = {
  args: { name: 'Ana Beatriz Carolina Duarte', size: 48 },
}

export const WithImage: S = {
  args: {
    name: 'João Silva',
    size: 48,
    src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="%2314402C"/><circle cx="24" cy="24" r="12" fill="%23C79A2B"/></svg>',
  },
}

export const BrokenImageFallsBack: S = {
  args: { name: 'João Silva', size: 48, src: '/this-image-does-not-exist.png' },
}

/**
 * The seeded green/gold/cobalt roundel palette: same seed → same colour,
 * deterministic per person.
 */
export const SeededPalette: S = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <Avatar key={i} name={`P${i}`} seed={i} size={48} />
      ))}
    </div>
  ),
}

export const Sizes: S = {
  render: () => (
    <div className="flex items-end gap-3">
      {[24, 32, 48, 64, 96].map((s) => (
        <Avatar key={s} name="João Silva" size={s} />
      ))}
    </div>
  ),
}
