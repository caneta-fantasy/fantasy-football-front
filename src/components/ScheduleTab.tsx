import React from 'react';
import {
  ArchHeader,
  EmptyState,
  SectionLabel,
  Spinner,
  TickerBar,
  type TickerItem,
} from '@/ds';
import {
  usePlayoffMatchups,
  useStandings,
} from '../api/fantasyMatchupQueries';
import PlayoffBracket from './PlayoffBracket';
import StandingsTable from './StandingsTable';

interface Props {
  seasonId: string | undefined;
  userTeamId?: number;
  seasonYear?: number;
  currentRound?: number | null;
  playoffStartRound?: number | null;
  numberOfRounds?: number | null;
}

/**
 * ScheduleTab (Tabela) — the classification + knockout screen, converted to
 * modernista. The view is rebuilt from `src/ds` + the signature pieces
 * (`ArchHeader`, `TickerBar`): a swept green header carrying a "your standing"
 * placar band derived from the user's real standings row, the Classificação
 * grid, and — when generated — the Mata-mata bracket.
 *
 * Data/flow is preserved verbatim: `usePlayoffMatchups(seasonId)` gates the
 * bracket exactly as before; `useStandings(seasonId)` (the same query key the
 * embedded `StandingsTable` already uses, so it dedupes) backs the header
 * placar. No query keys, args, navigation, or local state changed.
 *
 * The root carries `data-ds` so the scoped base layer applies without leaking
 * into the still-MUI screens.
 */
const ScheduleTab: React.FC<Props> = ({ seasonId, userTeamId, seasonYear }) => {
  const { data: playoffMatchups, isLoading: playoffLoading } =
    usePlayoffMatchups(seasonId);
  const { data: standings } = useStandings(seasonId);

  if (!seasonId) {
    return (
      <div data-ds className="bg-bg">
        <EmptyState
          icon="league"
          title="Temporada não encontrada"
          body="Selecione uma temporada para ver a tabela e a classificação da liga."
        />
      </div>
    );
  }

  // Your-standing placar: derive the user's real standings row (rank + points).
  // Real data only — omitted when there is no user team or no standings yet.
  const myRow =
    userTeamId != null
      ? standings?.find((row) => row.teamId === userTeamId)
      : undefined;

  const placarItems: TickerItem[] | null = myRow
    ? [
        { tag: `${myRow.seed}º`, text: 'Posição', val: String(myRow.seed) },
        { tag: 'Pts', text: 'Pontos', val: String(myRow.points) },
        { tag: 'PP', text: 'Pró', val: myRow.pointsFor.toFixed(1) },
      ]
    : null;

  const hasPlayoffMatchups = !!playoffMatchups && playoffMatchups.length > 0;

  return (
    <div data-ds className="bg-bg">
      <ArchHeader
        eyebrow={`Temporada${seasonYear ? ` ${seasonYear}` : ''} · sua liga`}
        title="Tabela"
        level={2}
        right={
          placarItems ? (
            <TickerBar
              items={placarItems}
              tone="green"
              label="Sua classificação"
              className="rounded-btn-sm"
            />
          ) : undefined
        }
      />

      {playoffLoading && (
        <div className="mt-7 flex justify-center py-6">
          <Spinner size={28} />
        </div>
      )}

      {!playoffLoading && hasPlayoffMatchups && (
        <div className="mt-7">
          <SectionLabel as="h3" accent="var(--gold)" className="mb-[14px]">
            Mata-mata
          </SectionLabel>
          <PlayoffBracket seasonId={seasonId} seasonYear={seasonYear} />
        </div>
      )}

      <div className="mt-9">
        <SectionLabel as="h3" accent="var(--gold)" className="mb-[14px]">
          Classificação
        </SectionLabel>
        <StandingsTable seasonId={seasonId} userTeamId={userTeamId} />
      </div>
    </div>
  );
};

export default ScheduleTab;
