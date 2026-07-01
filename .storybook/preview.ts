import type { Preview } from '@storybook/react-vite'
import '@fontsource-variable/archivo/standard.css'
import '@fontsource/spectral/400.css'
import '@fontsource/spectral/500.css'
import '@fontsource/spectral/600.css'
import '@fontsource/spectral/700.css'
import '@fontsource/spline-sans-mono/400.css'
import '@fontsource/spline-sans-mono/500.css'
import '@fontsource/spline-sans-mono/600.css'
import '@fontsource/anton/400.css'
import '../src/ds/fonts.css'
import '../src/ds/tokens.css'
import '../src/ds/base.css'
// Tailwind layers (utilities/components) — needed by screens that style with
// token-backed utility classes (e.g. the auth pages) rather than only DS
// component CSS. Preflight is disabled in the Tailwind config, so this only
// adds utilities and does not reset existing story styles.
import '../src/index.css'
import React from 'react'

const preview: Preview = {
  parameters: { layout: 'centered' },
  decorators: [(Story) => React.createElement('div', { 'data-ds': true }, React.createElement(Story))],
}
export default preview
