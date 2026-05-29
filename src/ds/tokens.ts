export const tokens = {
  color: {
    bg: 'var(--color-bg)', surface: 'var(--color-surface)',
    surfaceInset: 'var(--color-surface-inset)', text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)', textSubtle: 'var(--color-text-subtle)',
    textOnDark: 'var(--color-text-on-dark)', border: 'var(--color-border)',
    borderStrong: 'var(--color-border-strong)', lime: 'var(--caneta-lime)',
    limeDeep: 'var(--caneta-lime-deep)', red: 'var(--red)', yellow: 'var(--yellow)',
    clay: 'var(--clay)', pitch: 'var(--pitch)', dangerFg: 'var(--color-danger-fg)',
  },
  radius: { xs: 'var(--radius-xs)', sm: 'var(--radius-sm)', md: 'var(--radius-md)', lg: 'var(--radius-lg)', full: 'var(--radius-full)' },
  z: { dropdown: 1000, sticky: 1100, drawer: 1200, modal: 1300, popover: 1400, toast: 1500 },
  font: { display: 'var(--font-display)', sans: 'var(--font-sans)', mono: 'var(--font-mono)' },
} as const
export type Tokens = typeof tokens
