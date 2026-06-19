/**
 * Typed mirror of the MODERNISTA semantic token layer (src/ds/tokens.css).
 * For programmatic consumers (inline styles, JS color math). Values are the
 * CSS custom properties — resolved at render against tokens.css.
 */
export const tokens = {
  color: {
    // surfaces
    bg: 'var(--color-bg)',
    surface: 'var(--color-surface)',
    surfaceInset: 'var(--color-surface-inset)',
    surfaceSunken: 'var(--color-surface-sunken)',
    surfaceHero: 'var(--color-surface-hero)',
    // text
    text: 'var(--color-text)',
    textMuted: 'var(--color-text-muted)',
    textSubtle: 'var(--color-text-subtle)',
    // signature (green)
    signature: 'var(--color-signature)',
    signatureDeep: 'var(--color-signature-deep)',
    signatureRaised: 'var(--color-signature-raised)',
    signaturePale: 'var(--color-signature-pale)',
    signatureLine: 'var(--color-signature-line)',
    onSignature: 'var(--color-on-signature)',
    onSignatureMuted: 'var(--color-on-signature-muted)',
    // accent (gold)
    accent: 'var(--color-accent)',
    accentDeep: 'var(--color-accent-deep)',
    accentLight: 'var(--color-accent-light)',
    accentPale: 'var(--color-accent-pale)',
    onAccent: 'var(--color-on-accent)',
    // interactive (cobalt)
    interactive: 'var(--color-interactive)',
    interactiveDeep: 'var(--color-interactive-deep)',
    interactivePale: 'var(--color-interactive-pale)',
    onInteractive: 'var(--color-on-interactive)',
    // borders
    border: 'var(--color-border)',
    borderStrong: 'var(--color-border-strong)',
    borderSubtle: 'var(--color-border-subtle)',
    // functional (own hues)
    success: 'var(--color-success)',
    successPale: 'var(--color-success-pale)',
    warning: 'var(--color-warning)',
    warningPale: 'var(--color-warning-pale)',
    danger: 'var(--color-danger)',
    dangerPale: 'var(--color-danger-pale)',
    // reserved — referee only
    cardYellow: 'var(--color-card-yellow)',
    cardRed: 'var(--color-card-red)',
    // pitch
    pitch: 'var(--color-pitch)',
    pitchLine: 'var(--color-pitch-line)',
  },
  radius: {
    none: 'var(--radius-none)',
    btnSm: 'var(--radius-btn-sm)',
    btn: 'var(--radius-btn)',
    btnLg: 'var(--radius-btn-lg)',
    pill: 'var(--radius-pill)',
    chip: 'var(--radius-chip)',
    full: 'var(--radius-full)',
  },
  z: { dropdown: 1000, sticky: 1100, drawer: 1200, modal: 1300, popover: 1400, toast: 1500 },
  font: {
    display: 'var(--font-display)',
    sans: 'var(--font-sans)',
    serif: 'var(--font-serif)',
    mono: 'var(--font-mono)',
    logo: 'var(--font-logo)',
  },
} as const
export type Tokens = typeof tokens
