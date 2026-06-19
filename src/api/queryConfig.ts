/**
 * Centralized React Query timing constants.
 *
 * Previously these were scattered as magic numbers (`5 * 60 * 1000`, `30_000`,
 * `staleTime: 0`, ...) across the `api/*.ts` query hooks. Keeping them here
 * gives a single place to reason about caching/polling behavior.
 *
 * All values are in milliseconds.
 */

const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** How long fetched data is considered fresh before a refetch can occur. */
export const STALE_TIME = {
  /** Always stale — refetch on every mount/observer. For fast-changing data. */
  ALWAYS: 0,
  /** Standard cache window for most reads. */
  STANDARD: 5 * MINUTE,
  /** Longer window for slowly-changing data (e.g. current season). */
  LONG: 6 * MINUTE,
  /** Never goes stale — for effectively-static reference data. */
  STATIC: Infinity,
} as const;

/** Background polling intervals for data that changes server-side over time. */
export const REFETCH_INTERVAL = {
  /** Fast polling for a live, actively-changing view (e.g. draft board). */
  LIVE: 5 * SECOND,
  /** Standard polling for waivers/trades/round-flow status. */
  STANDARD: 30 * SECOND,
  /** Slow polling for round games that update infrequently. */
  SLOW: 2 * MINUTE,
} as const;
