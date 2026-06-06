/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './index.html'],
  corePlugins: { preflight: false }, // scoped reset lives in src/ds/base.css ([data-ds])
  theme: {
    // OVERRIDE (not extend): drops Tailwind's default ramps so no neutral gray
    // ramp and no default blue ring can leak. Only the modernista token set —
    // plus compat aliases for not-yet-restyled ds components (removed in Part B).
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      white: '#FFFFFF',
      black: '#000000',

      // ─── modernista flat token set (all var(--…)) ───
      // surfaces
      bg: 'var(--bg)',
      paper: 'var(--paper)',
      raised: 'var(--raised)',
      mist: 'var(--mist)',
      mist2: 'var(--mist2)',
      veil: 'var(--veil)',
      // semantic surface aliases (kept for in-use utilities)
      surface: 'var(--color-surface)',
      'surface-inset': 'var(--color-surface-inset)',
      'surface-sunken': 'var(--color-surface-sunken)',
      'surface-hero': 'var(--color-surface-hero)',
      // signature (green)
      signature: {
        DEFAULT: 'var(--green)',
        deep: 'var(--green-deep)',
        raised: 'var(--green-600)',
        leaf: 'var(--green-500)',
        line: 'var(--green-line)',
        pale: 'var(--green-pale)',
      },
      // accent (gold)
      accent: {
        DEFAULT: 'var(--gold)',
        deep: 'var(--gold-deep)',
        light: 'var(--gold-light)',
        pale: 'var(--gold-pale)',
      },
      // interactive (cobalt)
      cobalt: {
        DEFAULT: 'var(--cobalt)',
        deep: 'var(--cobalt-deep)',
        light: 'var(--cobalt-light)',
        pale: 'var(--cobalt-pale)',
      },
      // ink + on-colors
      ink: {
        DEFAULT: 'var(--ink)',
        muted: 'var(--ink-muted)',
        subtle: 'var(--ink-subtle)',
      },
      'on-green': 'var(--on-green)',
      'on-green-mute': 'var(--on-green-mute)',
      'on-gold': 'var(--on-gold)',
      'on-cobalt': 'var(--on-cobalt)',
      // borders
      line: {
        DEFAULT: 'var(--line)',
        strong: 'var(--line-strong)',
        subtle: 'var(--line-subtle)',
      },
      // reserved — referee only
      'card-yellow': 'var(--card-yellow)',
      'card-red': 'var(--card-red)',
      // functional (own hues)
      success: { DEFAULT: 'var(--success)', pale: 'var(--success-pale)' },
      warning: { DEFAULT: 'var(--warning)', pale: 'var(--warning-pale)' },
      danger: { DEFAULT: 'var(--danger)', pale: 'var(--danger-pale)' },
      // pitch
      pitch: { DEFAULT: 'var(--pitch)', line: 'var(--pitch-line)' },

      // semantic text/border aliases (in-use utility names)
      text: {
        DEFAULT: 'var(--color-text)',
        muted: 'var(--color-text-muted)',
        subtle: 'var(--color-text-subtle)',
      },
      border: {
        DEFAULT: 'var(--color-border)',
        strong: 'var(--color-border-strong)',
        subtle: 'var(--color-border-subtle)',
      },

      // ─── compat aliases ──────────────────────────────────────────────
      // ds components are restyled in Part B (plan B1–B10). Most compat color
      // names are now retired; `lime` survives only because SignIn still emits
      // `text-lime-deep` (the wordmark dot) — kept until that page is reworked.
      lime: {
        DEFAULT: 'var(--green)',
        d: 'var(--green-600)',
        deep: 'var(--green-deep)',
      },
    },
    fontFamily: {
      // same family for sans + display; poster look comes from
      // fontVariationSettings (disp), not a second face.
      sans: ['Archivo', 'system-ui', 'sans-serif'],
      display: ['Archivo', 'system-ui', 'sans-serif'],
      serif: ['Spectral', 'Georgia', 'serif'],
      mono: ['Spline Sans Mono', 'ui-monospace', 'Menlo', 'monospace'],
      logo: ['Anton', 'Impact', 'sans-serif'], // wordmark-only — not a general display utility
    },
    borderRadius: {
      none: '0',
      DEFAULT: '11px', // `rounded` / `rounded-t` compat (btn radius)
      btn: '11px',
      'btn-sm': '9px',
      'btn-lg': '13px',
      pill: '4px',
      chip: '999px',
      full: '9999px',
      // cards default to hard edge; Niemeyer arches stay inline 120px 120px 0 0.
      // compat: only `xs` survives — SignIn still emits `rounded-xs` (removed
      // when that page is reworked).
      xs: '4px',
    },
    extend: {
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
