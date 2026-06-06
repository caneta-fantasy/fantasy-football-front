import React from 'react'

/**
 * Breakpoint tokens for the Jogadores screen layout. Mirrors the modernista
 * prototype's `bp` model: mobile stacks into cards, tablet shows a reduced
 * table, desktop shows the full table.
 */
export type Breakpoint = 'm' | 't' | 'd'

// Match the prototype thresholds: cards below 834, reduced table below 1100.
const MOBILE_MAX = 833
const TABLET_MAX = 1099

const QUERY_MOBILE = `(max-width: ${MOBILE_MAX}px)`
const QUERY_TABLET = `(max-width: ${TABLET_MAX}px)`

/**
 * Non-MUI breakpoint hook built on `matchMedia`. Deterministic default is `'d'`
 * (desktop) — the value jsdom's mocked `matchMedia` (matches: false) yields, so
 * tests render the full 8-column table unless they override `matchMedia`.
 */
export function useBreakpoint(): Breakpoint {
  const getBp = React.useCallback((): Breakpoint => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return 'd'
    }
    if (window.matchMedia(QUERY_MOBILE).matches) return 'm'
    if (window.matchMedia(QUERY_TABLET).matches) return 't'
    return 'd'
  }, [])

  const [bp, setBp] = React.useState<Breakpoint>(getBp)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return
    }
    const mqMobile = window.matchMedia(QUERY_MOBILE)
    const mqTablet = window.matchMedia(QUERY_TABLET)
    const onChange = () => setBp(getBp())

    // addEventListener is the modern API; addListener is the deprecated fallback
    // for older Safari. The matchMedia mock provides both as no-ops.
    mqMobile.addEventListener?.('change', onChange)
    mqTablet.addEventListener?.('change', onChange)
    // Re-sync once on mount in case the SSR/initial value drifted.
    onChange()
    return () => {
      mqMobile.removeEventListener?.('change', onChange)
      mqTablet.removeEventListener?.('change', onChange)
    }
  }, [getBp])

  return bp
}
