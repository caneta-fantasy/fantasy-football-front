/**
 * Single source of truth for the auth session in localStorage.
 *
 * Keys are NAMESPACED (`caneta.*`) so other apps the user runs on the same
 * origin (localhost) can't collide with / corrupt our session — the bug where
 * a foreign token+user left the app "logged in" with a blank name.
 *
 * A session is only trusted when the token is present, unexpired, AND the stored
 * user is internally consistent with the JWT payload. Anything off → treated as
 * logged out (the caller clears + redirects).
 */

export const TOKEN_KEY = 'caneta.token';
export const USER_KEY = 'caneta.user';
// Legacy generic keys from before namespacing — cleared on load so a stale
// foreign value can never be picked up again.
const LEGACY_KEYS = ['token', 'user'];

export interface SessionUser {
  id: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin?: boolean;
  emailVerifiedAt?: string | null;
}

interface JwtPayload {
  sub: string | number;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  isAdmin?: boolean;
  emailVerifiedAt?: string | null;
  exp?: number;
}

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);

/** Decode a JWT payload without verifying the signature (client-side identity read). */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const [, payload] = token.split('.');
    if (!payload) return null;
    return JSON.parse(atob(payload)) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(payload: JwtPayload): boolean {
  return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
}

export function setSession(token: string, user: SessionUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setUser(user: SessionUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
}

/**
 * Load and VALIDATE the persisted session. Returns the session only if everything
 * is consistent; otherwise clears storage and returns null (= logged out).
 */
export function loadSession(): { token: string; user: SessionUser } | null {
  // Always purge legacy generic keys so a sibling app's value can't linger.
  LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));

  const token = localStorage.getItem(TOKEN_KEY);
  const rawUser = localStorage.getItem(USER_KEY);
  if (!token || !rawUser) {
    clearSession();
    return null;
  }

  const payload = decodeToken(token);
  if (!payload || isExpired(payload)) {
    clearSession();
    return null;
  }

  let user: SessionUser;
  try {
    user = JSON.parse(rawUser);
  } catch {
    clearSession();
    return null;
  }

  // The stored user must match the token and carry a usable identity. This is
  // what catches the "half-authenticated / foreign user object" state.
  const idMatches = String(user.id) === String(payload.sub);
  const emailMatches =
    !payload.email || !user.email || user.email === payload.email;
  const hasIdentity = !!(user.firstName || user.username || user.email);
  if (!idMatches || !emailMatches || !hasIdentity) {
    clearSession();
    return null;
  }

  return { token, user };
}

/** Build a SessionUser from the JWT alone (used by the OAuth callback). */
export function userFromToken(token: string): SessionUser | null {
  const p = decodeToken(token);
  if (!p || isExpired(p)) return null;
  return {
    id: p.sub,
    email: p.email,
    firstName: p.firstName,
    lastName: p.lastName,
    username: p.username,
    isAdmin: p.isAdmin ?? false,
    emailVerifiedAt: p.emailVerifiedAt ?? null,
  };
}
