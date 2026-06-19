import type { Meta, StoryObj } from '@storybook/react-vite'
import { SubHead } from './SubHead'

const meta: Meta<typeof SubHead> = {
  title: 'App/SubHead',
  component: SubHead,
  parameters: {
    docs: {
      description: {
        component:
          'Modernista section heading — a heavy, wide Archivo display title (wght 800 / wdth 114) that headlines a screen section (e.g. "Jogadores", "Classificação"). Renders a real heading element by default so the document outline stays intact; override with `level`/`as`.',
      },
    },
  },
  argTypes: {
    compact: { control: 'boolean' },
    level: { control: 'inline-radio', options: [1, 2, 3, 4, 5, 6] },
    children: { control: 'text' },
  },
  args: { children: 'Jogadores', compact: false, level: 2 },
}
export default meta

type S = StoryObj<typeof SubHead>

export const Playground: S = {}

export const Sections: S = {
  render: () => (
    <div data-ds className="flex flex-col gap-4 bg-paper p-6">
      <SubHead>Jogadores</SubHead>
      <SubHead>Classificação</SubHead>
      <SubHead compact>Titulares (compact)</SubHead>
    </div>
  ),
}
