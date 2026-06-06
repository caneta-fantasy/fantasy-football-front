import React from 'react';
import { Avatar, EmptyState, Skeleton } from '@/ds';
import { useStandings } from '../api/fantasyMatchupQueries';

interface Props {
  seasonId: string;
  userTeamId?: number;
}

/**
 * StandingsTable — the modernista classification grid (Source: app-kit
 * `StandingsApp`). A CSS-grid table with a bottle-green header band, zebra
 * `mist` rows, the user's row tinted `green-pale` with a 3px gold left-bar, the
 * top-6 seed in signature green, PP in `success` and PC in `ink-muted`. Numerics
 * use tabular figures in the Archivo poster voice / `font-sans`.
 *
 * Data/flow is unchanged: `useStandings(seasonId)` keeps the same query key and
 * args; the `userTeamId` highlight logic is verbatim. Loading is a skeleton grid
 * (was a spinner); the empty case is a ds `EmptyState` (was a typography line).
 */

// Desktop columns: # Time P V E D PP PC. Mobile drops PP/PC to keep reading
// width. The grid template mirrors app-kit `StandingsApp`.
const GRID_DESKTOP = '34px 1fr 48px 44px 44px 44px 56px 56px';
const GRID_MOBILE = '28px 1fr 34px 30px 30px 30px';
const COLS_DESKTOP = ['#', 'Time', 'P', 'V', 'E', 'D', 'PP', 'PC'];
const COLS_MOBILE = ['#', 'Time', 'P', 'V', 'E', 'D'];

const StandingsTable: React.FC<Props> = ({ seasonId, userTeamId }) => {
  const { data: standings, isLoading } = useStandings(seasonId);

  if (isLoading) {
    return (
      <div
        data-testid="standings-loading"
        className="overflow-hidden rounded-btn-sm border border-line bg-white"
      >
        <div className="h-[42px] bg-signature" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderTop: i === 0 ? 'none' : '1px solid var(--line-subtle)' }}
          >
            <Skeleton variant="text" width={20} height={14} />
            <Skeleton variant="circle" width={26} />
            <Skeleton variant="text" width="40%" height={14} />
            <Skeleton variant="text" width={28} height={14} className="ml-auto" />
          </div>
        ))}
      </div>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <EmptyState
        icon="league"
        title="Sem classificação"
        body="Ainda não há jogos concluídos. A tabela aparece assim que a temporada começar a pontuar."
      />
    );
  }

  const headerCellAlign = (i: number) =>
    i === 0 ? 'center' : i === 1 ? 'left' : 'center';

  const renderGrid = (
    cols: string[],
    template: string,
    withPoints: boolean,
    keySuffix: string,
  ) => (
    <div
      className="overflow-hidden rounded-btn-sm border border-line bg-white"
      data-testid={`standings-${keySuffix}`}
    >
      <div
        className="grid items-center bg-signature px-4 py-[11px] font-sans text-[10px] font-bold uppercase tracking-[0.8px] text-on-green"
        style={{ gridTemplateColumns: template }}
      >
        {cols.map((c, i) => (
          <span key={c} style={{ textAlign: headerCellAlign(i) }}>
            {c}
          </span>
        ))}
      </div>
      {standings.map((row, i) => {
        const isMe = userTeamId != null && row.teamId === userTeamId;
        const zebra = i % 2 ? 'var(--mist)' : 'var(--paper)';
        return (
          <div
            key={row.teamId}
            data-me={isMe || undefined}
            className="grid items-center px-4 py-[11px]"
            style={{
              gridTemplateColumns: template,
              background: isMe ? 'var(--green-pale)' : zebra,
              borderTop: i === 0 ? 'none' : '1px solid var(--line-subtle)',
              borderLeft: isMe ? '3px solid var(--gold)' : '3px solid transparent',
            }}
          >
            <span
              className="text-center font-display text-[15px] leading-none tabular-nums"
              style={{
                fontVariationSettings: '"wght" 800, "wdth" 108',
                color: row.seed <= 6 ? 'var(--green)' : 'var(--ink-subtle)',
              }}
            >
              {row.seed}
            </span>
            <span className="flex min-w-0 items-center gap-[9px]">
              <Avatar name={row.teamName} size={26} />
              <span
                className="truncate font-sans text-[13.5px] text-ink"
                style={{ fontWeight: isMe ? 800 : 600 }}
              >
                {row.teamName}
              </span>
            </span>
            <span
              className="text-center font-display text-[15px] leading-none tabular-nums text-ink"
              style={{ fontVariationSettings: '"wght" 800, "wdth" 108' }}
            >
              {row.points}
            </span>
            <span className="text-center font-sans text-[13px] tabular-nums text-ink-muted">
              {row.wins}
            </span>
            <span className="text-center font-sans text-[13px] tabular-nums text-ink-muted">
              {row.draws}
            </span>
            <span className="text-center font-sans text-[13px] tabular-nums text-ink-muted">
              {row.losses}
            </span>
            {withPoints && (
              <span className="text-center font-sans text-[12.5px] tabular-nums text-success">
                {row.pointsFor.toFixed(1)}
              </span>
            )}
            {withPoints && (
              <span className="text-center font-sans text-[12.5px] tabular-nums text-ink-muted">
                {row.pointsAgainst.toFixed(1)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Desktop / tablet: full 8-column grid. */}
      <div className="hidden sm:block">
        {renderGrid(COLS_DESKTOP, GRID_DESKTOP, true, 'desktop')}
      </div>
      {/* Mobile: drop PP/PC to keep reading width. */}
      <div className="block sm:hidden">
        {renderGrid(COLS_MOBILE, GRID_MOBILE, false, 'mobile')}
      </div>
    </>
  );
};

export default StandingsTable;
