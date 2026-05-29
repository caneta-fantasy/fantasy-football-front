import type { Preview } from '@storybook/react-vite'
import '@fontsource/anton/400.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/jetbrains-mono/500.css'
import '../src/ds/tokens.css'
import '../src/ds/base.css'
import React from 'react'

const preview: Preview = {
  parameters: { layout: 'centered' },
  decorators: [(Story) => React.createElement('div', { 'data-ds': true }, React.createElement(Story))],
}
export default preview
