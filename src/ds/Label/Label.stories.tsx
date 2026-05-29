import type { Meta, StoryObj } from '@storybook/react-vite'
import { Label } from './Label'

const meta: Meta<typeof Label> = {
  title: 'Forms/Label',
  component: Label,
  parameters: {
    docs: {
      description: {
        component:
          'Field label — a real `<label htmlFor>`. Editorial overline style (uppercase, 2px tracking, functional-contrast `text-muted`). When `required`, a lime `*` is appended; the asterisk is `aria-hidden`, so requiredness is conveyed on the control via `aria-required` (FieldGroup wires this).',
      },
    },
  },
  argTypes: {
    required: { control: 'boolean' },
    children: { control: 'text' },
    htmlFor: { control: 'text' },
  },
}
export default meta

type S = StoryObj<typeof Label>

/** Default optional label associated with an input. */
export const Default: S = {
  args: { htmlFor: 'demo-default', children: 'E-mail' },
  render: (args) => (
    <div>
      <Label {...args} />
      <input id={args.htmlFor} className="border border-border-strong rounded-sm h-[40px] px-3" />
    </div>
  ),
}

/** Required label with the lime asterisk. */
export const Required: S = {
  args: { htmlFor: 'demo-required', children: 'Senha', required: true },
  render: (args) => (
    <div>
      <Label {...args} />
      <input id={args.htmlFor} className="border border-border-strong rounded-sm h-[40px] px-3" />
    </div>
  ),
}

/** Interactive controls. */
export const Playground: S = {
  args: { htmlFor: 'demo-playground', children: 'Time favorito', required: false },
  render: (args) => (
    <div>
      <Label {...args} />
      <input id={args.htmlFor} className="border border-border-strong rounded-sm h-[40px] px-3" />
    </div>
  ),
}
