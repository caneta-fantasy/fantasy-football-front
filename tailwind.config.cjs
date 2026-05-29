/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  corePlugins: { preflight: false }, // re-enabled scoped via a base layer in Task 5
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)', surface: 'var(--color-surface)',
        'surface-inset': 'var(--color-surface-inset)',
        ink: { 900: 'var(--ink-900)', 700: 'var(--ink-700)', 500: 'var(--ink-500)', 100: 'var(--ink-100)' },
        lime: { DEFAULT: 'var(--caneta-lime)', d: 'var(--caneta-lime-d)', deep: 'var(--caneta-lime-deep)' },
        clay: 'var(--clay)', pitch: 'var(--pitch)', paper: 'var(--paper)',
        red: 'var(--red)', yellow: 'var(--yellow)',
        text: 'var(--color-text)', 'text-muted': 'var(--color-text-muted)',
        'text-subtle': 'var(--color-text-subtle)', 'text-on-dark': 'var(--color-text-on-dark)',
        border: 'var(--color-border)', 'border-strong': 'var(--color-border-strong)',
      },
      fontFamily: {
        display: ['Anton', 'Bebas Neue', 'Impact', 'sans-serif'],
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: { xs: '2px', sm: '4px', md: '8px', lg: '12px', full: '999px' },
      boxShadow: {
        e1: 'var(--elevation-1)', e2: 'var(--elevation-2)',
        e3: 'var(--elevation-3)', e4: 'var(--elevation-4)',
      },
      spacing: { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px', 8: '32px', 12: '48px', 16: '64px', 24: '96px' },
      screens: { sm: '640px', lg: '1024px', xl: '1440px' },
      zIndex: { dropdown: '1000', sticky: '1100', drawer: '1200', modal: '1300', popover: '1400', toast: '1500' },
    },
  },
  plugins: [],
}
