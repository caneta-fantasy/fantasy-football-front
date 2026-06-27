/**
 * Password policy — mirrors the backend
 * (fantasy-football-api/src/auth/password-policy.ts) so the live checklist and
 * server validation agree.
 *
 * Production: min 8 chars AND ≥3 of 4 classes (lower, upper, number, symbol).
 * Local/dev: no rules (any non-empty password) — keeps local testing friction-free.
 *
 * Under Vite, process.env.NODE_ENV is 'development' locally and 'production' in a
 * prod build, so the same NODE_ENV convention as the backend applies.
 */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MIN_CLASSES = 3;

export interface PasswordRequirement {
  key: string;
  label: string;
  met: boolean;
}

export const passwordRulesEnforced = (): boolean =>
  process.env.NODE_ENV === 'production';

/** Per-class booleans + the derived requirement list for the UI checklist. */
export function evaluatePassword(password: string): {
  requirements: PasswordRequirement[];
  classesMet: number;
  valid: boolean;
} {
  const pw = password ?? '';
  const hasLower = /[a-z]/.test(pw);
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSymbol = /[^a-zA-Z0-9]/.test(pw);
  const classesMet =
    Number(hasLower) + Number(hasUpper) + Number(hasNumber) + Number(hasSymbol);
  const minLength = pw.length >= PASSWORD_MIN_LENGTH;

  const requirements: PasswordRequirement[] = [
    { key: 'len', label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`, met: minLength },
    {
      key: 'classes',
      label: `Ao menos ${PASSWORD_MIN_CLASSES} de: minúscula, maiúscula, número, símbolo`,
      met: classesMet >= PASSWORD_MIN_CLASSES,
    },
  ];

  return {
    requirements,
    classesMet,
    valid: minLength && classesMet >= PASSWORD_MIN_CLASSES,
  };
}

/** Whether the password is acceptable in the current environment. */
export function isPasswordAcceptable(password: string): boolean {
  if (!passwordRulesEnforced()) return !!password;
  return evaluatePassword(password).valid;
}
