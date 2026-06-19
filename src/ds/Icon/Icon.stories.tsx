import type { Meta, StoryObj } from '@storybook/react'
import { Icon, type IconName } from './Icon'

const ALL_NAMES: IconName[] = [
  'home', 'league', 'market', 'profile', 'draft',
  'edit', 'swap', 'share', 'copy', 'delete', 'save', 'plus', 'minus', 'check', 'x', 'search', 'filter', 'sort',
  'ball', 'whistle', 'jersey', 'boot', 'card-yellow', 'card-red', 'captain-c', 'sub-arrow', 'formation', 'calendar', 'clock', 'fire', 'trophy', 'medal', 'ranking',
  'settings', 'bell', 'mail', 'lock', 'eye', 'eye-off', 'chevron-up', 'chevron-down', 'chevron-left', 'chevron-right', 'external-link', 'info', 'warning', 'alert', 'success-check',
]

const meta: Meta<typeof Icon> = {
  title: 'Primitives/Icon',
  component: Icon,
  argTypes: {
    name: { control: 'select', options: ALL_NAMES },
    size: { control: 'inline-radio', options: [16, 20, 24] },
    title: { control: 'text' },
  },
  args: { name: 'trophy', size: 24 },
}
export default meta

type S = StoryObj<typeof Icon>

/** Interactive controls story — pick any name/size/title. */
export const Playground: S = {}

/** Decorative by default: aria-hidden, inherits currentColor. */
export const Decorative: S = {
  args: { name: 'ball' },
  render: (args) => (
    <span className="inline-flex items-center gap-2 text-text">
      <Icon {...args} />
      <span className="font-sans text-sm">decorative (aria-hidden)</span>
    </span>
  ),
}

/** Meaningful: a `title` makes it role="img" with an accessible name. */
export const WithTitle: S = {
  args: { name: 'trophy', title: 'Troféu da liga' },
}

/** The three supported sizes. */
export const Sizes: S = {
  render: () => (
    <div className="flex items-end gap-6 text-text">
      {([16, 20, 24] as const).map((s) => (
        <div key={s} className="flex flex-col items-center gap-2">
          <Icon name="whistle" size={s} />
          <span className="font-mono text-xs text-text-muted">{s}</span>
        </div>
      ))}
    </div>
  ),
}

/** DS §7 #8 first-class glyphs: the two filled cartões plus sub-arrow / external-link. */
export const KeyGlyphs: S = {
  render: () => (
    <div className="flex items-center gap-6 text-text">
      {(['card-yellow', 'card-red', 'sub-arrow', 'external-link'] as const).map((n) => (
        <div key={n} className="flex flex-col items-center gap-2">
          <Icon name={n} size={24} title={n} />
          <span className="font-mono text-xs text-text-muted">{n}</span>
        </div>
      ))}
    </div>
  ),
}

/** Inherits currentColor — set color on the parent. */
export const ColorInheritance: S = {
  render: () => (
    <div className="flex items-center gap-6">
      <span className="text-text"><Icon name="trophy" /></span>
      <span className="text-signature"><Icon name="fire" /></span>
      <span className="text-danger"><Icon name="alert" /></span>
    </div>
  ),
}

/** The full registry, grouped as in the DS icon sheet. */
export const Registry: S = {
  render: () => (
    <div className="grid grid-cols-8 gap-4 text-text">
      {ALL_NAMES.map((n) => (
        <div key={n} className="flex flex-col items-center gap-2 p-2">
          <Icon name={n} size={24} />
          <span className="font-mono text-[9px] text-text-muted text-center break-words">{n}</span>
        </div>
      ))}
    </div>
  ),
}
