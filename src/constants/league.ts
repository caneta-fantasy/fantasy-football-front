/**
 * League creation/season constants shared across the frontend.
 *
 * These mirror server-side limits (e.g. the round-26 creation cutoff in
 * fantasy-leagues.service.ts). Keep them in sync with the backend.
 */

/** Real championship round after which new leagues can no longer be created. */
export const CREATION_CUTOFF_ROUND = 26;

/** Default number of fantasy rounds when the calendar allows it. */
export const DEFAULT_ROUNDS = 19;

/** Minimum number of fantasy rounds a league can be created with. */
export const MIN_ROUNDS = 12;
