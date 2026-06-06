import React from 'react';
import { Chip } from '@/ds';
import { FantasyMatchupDto } from '../api/fantasyMatchupQueries';

interface Props {
  matchup: FantasyMatchupDto;
  highlighted?: boolean;
  onClick?: () => void;
}

/**
 * MatchupCard — modernista `MatchupRow` (Source: app-kit `MatchupRow`). A flat
 * scoreline row: team names flanking a centered tabular-figure score, the
 * winner's name + score in signature green. When `highlighted` (the user's
 * matchup) the row gets a green-pale fill, a green border, and a 4px gold
 * left-bar. A `bye` matchup renders a muted row with a ghost `BYE` chip.
 *
 * The public API is unchanged — `matchup` / `highlighted` / `onClick`, plus the
 * `isGhost` and `bye` (status) behaviour — so the existing consumers
 * (RodadaTab, MatchupDetailModal) keep working. When `onClick` is provided the
 * row upgrades to a real focusable `<button>` (keyboard-operable, focus ring)
 * instead of a bare clickable div.
 */
const MatchupCard: React.FC<Props> = ({ matchup, highlighted = false, onClick }) => {
  const homeName = matchup.homeTeamName ?? 'Ghost';
  const awayName = matchup.awayTeamName ?? 'Ghost';

  if (matchup.status === 'bye') {
    return (
      <div className="flex items-center justify-between gap-2 rounded-btn-sm border border-line bg-mist px-4 py-[13px] opacity-70">
        <span className="font-sans text-[14px] font-bold text-ink-muted">
          {homeName}
        </span>
        <Chip tone="ghost">BYE</Chip>
      </div>
    );
  }

  const homeScore = matchup.homeScore != null ? matchup.homeScore : '—';
  const awayScore = matchup.awayScore != null ? matchup.awayScore : '—';

  const homeWon =
    matchup.homeScore != null &&
    matchup.awayScore != null &&
    matchup.homeScore > matchup.awayScore;
  const awayWon =
    matchup.homeScore != null &&
    matchup.awayScore != null &&
    matchup.awayScore > matchup.homeScore;

  const ghostHome = matchup.isGhost && matchup.homeTeamName == null;
  const ghostAway = matchup.isGhost && matchup.awayTeamName == null;

  const shellBase =
    'flex w-full items-center gap-2 rounded-btn-sm px-4 py-[13px] text-left ' +
    (highlighted
      ? 'border border-l-4 border-signature border-l-accent bg-signature-pale'
      : 'border border-line bg-white');
  const interactive = onClick
    ? ' cursor-pointer transition-colors duration-150 ' +
      (highlighted ? 'hover:brightness-[0.97]' : 'hover:bg-mist')
    : '';

  const nameCls = (won: boolean, ghost: boolean, side: 'home' | 'away') =>
    `min-w-0 flex-1 truncate font-sans text-[14px] ${
      side === 'home' ? 'text-right' : ''
    } ${won ? 'font-extrabold' : 'font-medium'} ${
      ghost ? 'text-ink-subtle' : 'text-ink'
    }`;

  const scoreCls = (won: boolean) =>
    `font-display text-[20px] leading-none tabular-nums ${
      won ? 'text-signature' : 'text-ink-muted'
    }`;
  const scoreStyle = { fontVariationSettings: '"wght" 800, "wdth" 108' };

  const content = (
    <>
      <span className={nameCls(homeWon, ghostHome, 'home')}>{homeName}</span>
      <span className="flex min-w-[78px] items-center justify-center gap-2">
        <span className={scoreCls(homeWon)} style={scoreStyle}>
          {homeScore}
        </span>
        <span className="text-ink-subtle">–</span>
        <span className={scoreCls(awayWon)} style={scoreStyle}>
          {awayScore}
        </span>
      </span>
      <span className={nameCls(awayWon, ghostAway, 'away')}>{awayName}</span>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={shellBase + interactive}>
        {content}
      </button>
    );
  }

  return <div className={shellBase}>{content}</div>;
};

export default MatchupCard;
