import React from 'react';

/**
 * Caneta brand assets. The source SVGs live in /public/brand and are served as
 * static files, so these render via <img> (matching the app's existing asset
 * pattern — there is no SVG-as-component tooling). Colors are baked into the
 * artwork (maroon/gold/cream) and intentionally NOT themed by design tokens.
 */

const BRAND = {
  crest: '/brand/caneta-crest.svg',
  wordmarkDark: '/brand/caneta-logo-horizontal-dark.svg', // for dark/green backgrounds
  wordmarkLight: '/brand/caneta-logo-horizontal.svg', // for light backgrounds
} as const;

export interface BrandCrestProps {
  /** Rendered height in px (width scales to the crest aspect ratio). */
  size?: number;
  className?: string;
  alt?: string;
}

/** The standalone Caneta shield crest (the app logo, not a club crest). */
export const BrandCrest: React.FC<BrandCrestProps> = ({
  size = 40,
  className,
  alt = 'Caneta',
}) => (
  <img
    src={BRAND.crest}
    alt={alt}
    height={size}
    className={className}
    style={{ height: size, width: 'auto', display: 'block' }}
  />
);

export interface WordmarkProps {
  /** Which artwork to use given the background it sits on. */
  variant?: 'dark' | 'light';
  /** Rendered height in px (width scales to the logo aspect ratio). */
  height?: number;
  className?: string;
  alt?: string;
}

/** The full horizontal crest + "CANETA FANTASY" lockup. */
export const Wordmark: React.FC<WordmarkProps> = ({
  variant = 'dark',
  height = 64,
  className,
  alt = 'Caneta Fantasy',
}) => (
  <img
    src={variant === 'dark' ? BRAND.wordmarkDark : BRAND.wordmarkLight}
    alt={alt}
    height={height}
    className={className}
    style={{ height, width: 'auto', display: 'block' }}
  />
);

export interface BrandLockupProps {
  /** Crest height in px; the wordmark text scales with it. */
  size?: number;
  className?: string;
}

/**
 * Compact crest + "Caneta" wordmark for app chrome (navbar). The text uses the
 * logo font (Anton) so it reads as a brand mark, not body copy.
 */
export const BrandLockup: React.FC<BrandLockupProps> = ({
  size = 32,
  className,
}) => (
  <span
    className={className}
    style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
  >
    <BrandCrest size={size} alt="" />
    <span
      style={{
        fontFamily: 'var(--font-logo, Anton, Impact, sans-serif)',
        fontSize: size * 0.7,
        lineHeight: 1,
        letterSpacing: '0.02em',
        color: 'var(--ink, #13211A)',
        textTransform: 'uppercase',
      }}
    >
      Caneta
    </span>
  </span>
);
