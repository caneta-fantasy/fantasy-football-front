import React, { useMemo } from 'react';
import { Box, CircularProgress, Paper, Tooltip, Typography } from '@mui/material';
import { usePlayoffMatchups, FantasyMatchupDto } from '../api/fantasyMatchupQueries';

interface Props {
  seasonId: string | undefined;
  seasonYear?: number;
}

interface BracketSlot {
  position: number; // better seed of the pair (1 = best)
  stage: number;
  legs: FantasyMatchupDto[]; // 1 or 2 legs
}

interface TieResult {
  homeTotal: number | null;
  awayTotal: number | null;
  winnerId: number | null;
}

function computeTieResult(legs: FantasyMatchupDto[]): TieResult {
  if (legs.length === 0) return { homeTotal: null, awayTotal: null, winnerId: null };

  if (legs.length === 1) {
    const leg = legs[0];
    return { homeTotal: leg.homeScore, awayTotal: leg.awayScore, winnerId: leg.winnerId };
  }

  const sorted = [...legs].sort((a, b) => a.roundNumber - b.roundNumber);
  const leg1 = sorted[0];
  const leg2 = sorted[1];

  if (leg1.homeScore == null || leg1.awayScore == null || leg2.homeScore == null || leg2.awayScore == null) {
    return { homeTotal: leg1.homeScore, awayTotal: leg1.awayScore, winnerId: null };
  }

  // Leg 1: home = original home. Leg 2: home = original away (reversed).
  // original home aggregate = leg1.home + leg2.away
  const homeAggregate = Number(leg1.homeScore) + Number(leg2.awayScore);
  const awayAggregate = Number(leg1.awayScore) + Number(leg2.homeScore);
  const winnerId = homeAggregate >= awayAggregate ? leg1.homeTeamId : leg1.awayTeamId;

  return { homeTotal: homeAggregate, awayTotal: awayAggregate, winnerId };
}

// Standard bracket seed order top-to-bottom for a column of N slots.
// This follows the classic 1v(n), 2v(n-1), ... seeding where 1 is top.
// We store per-slot the "position" = min(homeSeed, awaySeed).
// Quarter positions for 4 slots: [1, 4, 2, 3] → 1v4 on top, 2v3 on bottom (standard bracket)
// Semi positions for 2 slots: [1, 2]
// Final positions for 1 slot: [1]
function getVisualSlotOrder(stage: number): number[] {
  switch (stage) {
    case 3: return [1, 4, 2, 3]; // 8-team quarters: 1v8 top, 4v5 second, 2v7 third, 3v6 bottom
    case 2: return [1, 2];
    case 1: return [1];
    default: return Array.from({ length: Math.pow(2, stage - 1) }, (_, i) => i + 1);
  }
}

// Build a Map<stage, Map<position, BracketSlot>> from flat matchup list
function buildSlots(matchups: FantasyMatchupDto[]): Map<number, Map<number, BracketSlot>> {
  // Group by stage
  const byStage = new Map<number, FantasyMatchupDto[]>();
  for (const matchup of matchups) {
    if (matchup.playoffStage == null) continue;
    const group = byStage.get(matchup.playoffStage) ?? [];
    group.push(matchup);
    byStage.set(matchup.playoffStage, group);
  }

  const result = new Map<number, Map<number, BracketSlot>>();

  byStage.forEach((stageMatchups, stage) => {
    const slotMap = new Map<number, BracketSlot>();

    // Group two-leg pairs together, keep singles separate
    const byPair = new Map<string, FantasyMatchupDto[]>();
    const singles: FantasyMatchupDto[] = [];

    for (const matchup of stageMatchups) {
      if (matchup.twoLegPairId) {
        const group = byPair.get(matchup.twoLegPairId) ?? [];
        group.push(matchup);
        byPair.set(matchup.twoLegPairId, group);
      } else {
        singles.push(matchup);
      }
    }

    for (const matchup of singles) {
      if (matchup.isGhost) continue;
      const seed = matchup.playoffSeed;
      const position = seed ? Math.min(seed.homeSeed, seed.awaySeed) : 0;
      slotMap.set(position, { position, stage, legs: [matchup] });
    }

    byPair.forEach((legs) => {
      if (legs[0].isGhost) return;
      const seed = legs[0].playoffSeed;
      const position = seed ? Math.min(seed.homeSeed, seed.awaySeed) : 0;
      const sorted = [...legs].sort((a, b) => a.roundNumber - b.roundNumber);
      slotMap.set(position, { position, stage, legs: sorted });
    });

    result.set(stage, slotMap);
  });

  return result;
}

// Detect bye teams by finding seeds that appear in a later-stage (semi) matchup
// but have no corresponding quarter matchup
function detectByeTeams(
  topStage: number,
  slotsByStage: Map<number, Map<number, BracketSlot>>,
): Map<number, string> {
  const byeMap = new Map<number, string>();
  if (topStage < 3) return byeMap; // no quarters stage = no byes

  const quarterSlots = slotsByStage.get(topStage);
  const semiSlots = slotsByStage.get(topStage - 1);
  if (!quarterSlots || !semiSlots) return byeMap;

  const visualOrder = getVisualSlotOrder(topStage);

  visualOrder.forEach((position) => {
    if (quarterSlots.has(position)) return; // real matchup exists, no bye

    // Position has no quarter matchup — find which team has this seed by looking at semis
    semiSlots.forEach((semiSlot) => {
      const seed = semiSlot.legs[0].playoffSeed;
      if (!seed) return;
      const rep = semiSlot.legs[0];
      if (seed.homeSeed === position && rep.homeTeamName) {
        byeMap.set(position, rep.homeTeamName);
      } else if (seed.awaySeed === position && rep.awayTeamName) {
        byeMap.set(position, rep.awayTeamName);
      }
    });
  });

  return byeMap;
}

// ──────────────────────────────────────────────────────────────────────────────
// Components
// ──────────────────────────────────────────────────────────────────────────────

const SLOT_HEIGHT = 84;
const SLOT_WIDTH = 280;
const CONNECTOR_W = 28;

const scoreStr = (score: number | null) =>
  score == null ? '-' : Number(score).toFixed(2).replace('.', ',');

interface TeamRowProps {
  name: string | null;
  score: number | null;
  leg1Score?: number | null;
  leg2Score?: number | null;
  isTwoLeg: boolean;
  isWinner: boolean;
  hasBorder: boolean;
  seed?: number | null;
}

const TeamRow: React.FC<TeamRowProps> = ({ name, score, leg1Score, leg2Score, isTwoLeg, isWinner, hasBorder, seed }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      px: 1,
      py: 0.65,
      bgcolor: isWinner ? 'action.selected' : 'transparent',
      borderBottom: hasBorder ? '1px solid' : 'none',
      borderColor: 'divider',
      minWidth: 0,
    }}
  >
    <Box sx={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0, mr: 0.75 }}>
      {seed != null && (
        <Typography
          component="span"
          variant="caption"
          sx={{ fontSize: 9, color: 'text.disabled', fontWeight: 600, mr: 0.4, flexShrink: 0 }}
        >
          #{seed}
        </Typography>
      )}
      <Tooltip title={name ?? ''} placement="top" disableHoverListener={(name?.length ?? 0) <= 20}>
        <Typography
          variant="caption"
          fontWeight={isWinner ? 800 : 400}
          noWrap
          sx={{ fontSize: 11, lineHeight: 1.3 }}
        >
          {name ?? '?'}
        </Typography>
      </Tooltip>
    </Box>
    {isTwoLeg ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>
          {scoreStr(leg1Score ?? null)}
        </Typography>
        <Typography variant="caption" sx={{ fontSize: 9, color: 'text.disabled' }}>/</Typography>
        <Typography variant="caption" sx={{ fontSize: 10, color: 'text.disabled' }}>
          {scoreStr(leg2Score ?? null)}
        </Typography>
        <Typography
          variant="caption"
          fontWeight={isWinner ? 800 : 600}
          sx={{ fontSize: 11, minWidth: 34, textAlign: 'right' }}
        >
          {scoreStr(score)}
        </Typography>
      </Box>
    ) : (
      <Typography variant="caption" fontWeight={isWinner ? 800 : 600} sx={{ fontSize: 11, flexShrink: 0 }}>
        {scoreStr(score)}
      </Typography>
    )}
  </Box>
);

const MatchupBox: React.FC<{ slot: BracketSlot }> = ({ slot }) => {
  const { legs } = slot;
  const rep = legs[0];
  const isTwoLeg = legs.length === 2;
  const sorted = isTwoLeg ? [...legs].sort((a, b) => a.roundNumber - b.roundNumber) : legs;
  const leg1 = sorted[0];
  const leg2 = isTwoLeg ? sorted[1] : null;
  const tieResult = computeTieResult(legs);
  const homeWon = tieResult.winnerId != null && tieResult.winnerId === rep.homeTeamId;
  const awayWon = tieResult.winnerId != null && tieResult.winnerId === rep.awayTeamId;

  // For two-leg: leg1 home row = leg1.home + leg2.away; leg1 away row = leg1.away + leg2.home
  const homeLeg1 = isTwoLeg ? leg1.homeScore : null;
  const homeLeg2 = isTwoLeg && leg2 ? leg2.awayScore : null;
  const awayLeg1 = isTwoLeg ? leg1.awayScore : null;
  const awayLeg2 = isTwoLeg && leg2 ? leg2.homeScore : null;

  return (
    <Paper
      variant="outlined"
      sx={{
        width: SLOT_WIDTH,
        borderRadius: 1.5,
        overflow: 'hidden',
        borderColor: 'divider',
      }}
    >
      <TeamRow
        name={rep.homeTeamName}
        score={tieResult.homeTotal}
        leg1Score={homeLeg1}
        leg2Score={homeLeg2}
        isTwoLeg={isTwoLeg}
        isWinner={homeWon}
        hasBorder
        seed={rep.homeTeamSeed ?? null}
      />
      <TeamRow
        name={rep.awayTeamName}
        score={tieResult.awayTotal}
        leg1Score={awayLeg1}
        leg2Score={awayLeg2}
        isTwoLeg={isTwoLeg}
        isWinner={awayWon}
        hasBorder={false}
        seed={rep.awayTeamSeed ?? null}
      />
    </Paper>
  );
};

const ByeBox: React.FC<{ teamName: string; seed?: number }> = ({ teamName, seed }) => (
  <Paper
    variant="outlined"
    sx={{ width: SLOT_WIDTH, borderRadius: 1.5, overflow: 'hidden', borderColor: 'divider', bgcolor: 'action.hover' }}
  >
    <Box sx={{ px: 1, py: 0.65, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
      {seed != null && (
        <Typography component="span" variant="caption" sx={{ fontSize: 9, color: 'text.disabled', fontWeight: 600, mr: 0.4, flexShrink: 0 }}>
          #{seed}
        </Typography>
      )}
      <Tooltip title={teamName} placement="top" disableHoverListener={teamName.length <= 20}>
        <Typography variant="caption" fontWeight={700} noWrap sx={{ fontSize: 11 }}>
          {teamName}
        </Typography>
      </Tooltip>
    </Box>
    <Box sx={{ px: 1, py: 0.65 }}>
      <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>Folga</Typography>
    </Box>
  </Paper>
);

const TbdBox: React.FC = () => (
  <Paper
    variant="outlined"
    sx={{ width: SLOT_WIDTH, borderRadius: 1.5, overflow: 'hidden', borderColor: 'divider', opacity: 0.4 }}
  >
    <Box sx={{ px: 1, py: 0.65, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>A definir</Typography>
    </Box>
    <Box sx={{ px: 1, py: 0.65 }}>
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>A definir</Typography>
    </Box>
  </Paper>
);

// ──────────────────────────────────────────────────────────────────────────────
// Bracket geometry helpers
// ──────────────────────────────────────────────────────────────────────────────

function totalRows(maxStage: number): number {
  return Math.pow(2, maxStage - 1); // e.g. stage 3 → 4 rows, stage 2 → 2 rows
}

// Vertical center of slot at index `slotIndex` in a column with `slotCount` slots,
// given total canvas height = totalRows(maxStage) * SLOT_HEIGHT
function slotCenterY(slotIndex: number, slotCount: number, maxStage: number): number {
  const canvasH = totalRows(maxStage) * SLOT_HEIGHT;
  const cellH = canvasH / slotCount;
  return slotIndex * cellH + cellH / 2;
}

// ──────────────────────────────────────────────────────────────────────────────
// Column + connector
// ──────────────────────────────────────────────────────────────────────────────

interface ColumnProps {
  stage: number;
  maxStage: number;
  slotMap: Map<number, BracketSlot>;
  visualOrder: number[];
  byeTeams: Map<number, string>;
}

const BracketColumn: React.FC<ColumnProps> = ({ maxStage, slotMap, visualOrder, byeTeams }) => {
  const canvasH = totalRows(maxStage) * SLOT_HEIGHT;
  const slotCount = visualOrder.length;

  return (
    <Box sx={{ position: 'relative', width: SLOT_WIDTH, height: canvasH, flexShrink: 0 }}>
      {visualOrder.map((position, slotIndex) => {
        const centerY = slotCenterY(slotIndex, slotCount, maxStage);
        const topY = centerY - SLOT_HEIGHT / 2;
        const slot = slotMap.get(position);
        const byeName = byeTeams.get(position);

        return (
          <Box
            key={position}
            sx={{
              position: 'absolute',
              top: topY,
              left: 0,
              width: SLOT_WIDTH,
              height: SLOT_HEIGHT,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {byeName ? <ByeBox teamName={byeName} seed={position} /> : slot ? <MatchupBox slot={slot} /> : <TbdBox />}
          </Box>
        );
      })}
    </Box>
  );
};

interface ConnectorProps {
  leftStage: number;
  maxStage: number;
  leftOrder: number[];
  rightOrder: number[];
}

const ConnectorSvg: React.FC<ConnectorProps> = ({ maxStage, leftOrder, rightOrder }) => {
  const canvasH = totalRows(maxStage) * SLOT_HEIGHT;
  const leftCount = leftOrder.length;
  const rightCount = rightOrder.length;
  const w = CONNECTOR_W + 8;

  const lines: React.ReactNode[] = [];

  // Each right slot gets 2 left slots feeding into it
  rightOrder.forEach((_, rightIndex) => {
    const leftA = leftOrder[rightIndex * 2];
    const leftB = leftOrder[rightIndex * 2 + 1];
    if (leftA === undefined || leftB === undefined) return;

    const idxA = leftOrder.indexOf(leftA);
    const idxB = leftOrder.indexOf(leftB);
    const yA = slotCenterY(idxA, leftCount, maxStage);
    const yB = slotCenterY(idxB, leftCount, maxStage);
    const yRight = slotCenterY(rightIndex, rightCount, maxStage);
    const midX = w / 2;

    lines.push(
      <g key={`${leftA}-${leftB}`}>
        <line x1={0} y1={yA} x2={midX} y2={yA} stroke="currentColor" strokeWidth={1.5} />
        <line x1={0} y1={yB} x2={midX} y2={yB} stroke="currentColor" strokeWidth={1.5} />
        <line x1={midX} y1={yA} x2={midX} y2={yB} stroke="currentColor" strokeWidth={1.5} />
        <line x1={midX} y1={yRight} x2={w} y2={yRight} stroke="currentColor" strokeWidth={1.5} />
      </g>,
    );
  });

  return (
    <Box
      component="svg"
      sx={{ width: w, height: canvasH, flexShrink: 0, color: 'divider', overflow: 'visible' }}
      viewBox={`0 0 ${w} ${canvasH}`}
    >
      {lines}
    </Box>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// PlayoffBracket
// ──────────────────────────────────────────────────────────────────────────────

const STAGE_LABELS: Record<number, string> = {
  3: 'Quartas',
  2: 'Semifinal',
  1: 'Final',
};

const PlayoffBracket: React.FC<Props> = ({ seasonId, seasonYear }) => {
  const { data: matchups, isLoading } = usePlayoffMatchups(seasonId);

  const slotsByStage = useMemo(() => {
    if (!matchups) return new Map<number, Map<number, BracketSlot>>();
    return buildSlots(matchups);
  }, [matchups]);

  const stages = useMemo(() => {
    if (!matchups || matchups.length === 0) return [];
    const stageSet = new Set<number>();
    matchups.forEach((matchup) => {
      if (matchup.playoffStage != null) stageSet.add(matchup.playoffStage);
    });
    return Array.from(stageSet).sort((a, b) => b - a); // descending: quarters → semi → final
  }, [matchups]);

  const maxStage = useMemo(() => (stages.length > 0 ? stages[0] : 1), [stages]);

  const visualOrderByStage = useMemo(() => {
    const map = new Map<number, number[]>();
    stages.forEach((stage) => map.set(stage, getVisualSlotOrder(stage)));
    return map;
  }, [stages]);

  const byeTeams = useMemo(() => {
    if (stages.length === 0) return new Map<number, string>();
    return detectByeTeams(maxStage, slotsByStage);
  }, [maxStage, stages, slotsByStage]);

  const championName = useMemo(() => {
    const finalSlots = slotsByStage.get(1);
    if (!finalSlots || finalSlots.size === 0) return null;
    const finalSlot = Array.from(finalSlots.values())[0];
    const tieResult = computeTieResult(finalSlot.legs);
    if (tieResult.winnerId == null) return null;
    const rep = finalSlot.legs[0];
    return tieResult.winnerId === rep.homeTeamId ? rep.homeTeamName : rep.awayTeamName;
  }, [slotsByStage]);

  const hasTwoLeg = useMemo(
    () => !!matchups && matchups.some((matchup) => matchup.twoLegPairId != null),
    [matchups],
  );

  if (!seasonId) return null;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (!matchups || matchups.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" py={4}>
        O mata-mata ainda não foi gerado.
      </Typography>
    );
  }

  return (
    <Box>
      {championName && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 3,
            textAlign: 'center',
            background: 'linear-gradient(135deg, #f59e0b22 0%, #f59e0b11 100%)',
            border: '1.5px solid',
            borderColor: 'warning.main',
          }}
        >
          <Typography variant="h5" fontWeight={800} color="warning.main">
            🏆 {championName}
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Campeão{seasonYear ? ` da temporada ${seasonYear}` : ''}
          </Typography>
        </Paper>
      )}

      {/* Column headers */}
      <Box sx={{ display: 'flex', mb: 1 }}>
        {stages.map((stage, stageIndex) => (
          <React.Fragment key={stage}>
            <Box sx={{ width: SLOT_WIDTH, flexShrink: 0, textAlign: 'left' }}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="text.secondary"
                sx={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}
              >
                {STAGE_LABELS[stage] ?? `Estágio ${stage}`}
              </Typography>
            </Box>
            {stageIndex < stages.length - 1 && (
              <Box sx={{ width: CONNECTOR_W + 8, flexShrink: 0 }} />
            )}
          </React.Fragment>
        ))}
      </Box>

      {/* Bracket */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', overflowX: 'auto', pb: 2 }}>
        {stages.map((stage, stageIndex) => {
          const slotMap = slotsByStage.get(stage) ?? new Map<number, BracketSlot>();
          const visualOrder = visualOrderByStage.get(stage) ?? [];
          const nextStage = stages[stageIndex + 1];

          return (
            <React.Fragment key={stage}>
              <BracketColumn
                stage={stage}
                maxStage={maxStage}
                slotMap={slotMap}
                visualOrder={visualOrder}
                byeTeams={stageIndex === 0 ? byeTeams : new Map()}
              />
              {nextStage !== undefined && (
                <ConnectorSvg
                  leftStage={stage}
                  maxStage={maxStage}
                  leftOrder={visualOrder}
                  rightOrder={visualOrderByStage.get(nextStage) ?? []}
                />
              )}
            </React.Fragment>
          );
        })}
      </Box>

      {hasTwoLeg && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Placar: J1 / J2 — Agregado
        </Typography>
      )}
    </Box>
  );
};

export default PlayoffBracket;
