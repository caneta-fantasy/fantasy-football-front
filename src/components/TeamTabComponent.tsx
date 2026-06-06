// src/components/TeamTabComponent.tsx
//
// Modernista "Times" tab (Plan Task C3) — the roster rendered as a faithful
// LIST (no pitch). This is a VIEW-layer restyle: every hook, query key/arg,
// modal-wiring, local-state and the starters/bench split are preserved verbatim
// from the legacy MUI version. Only the view is rebuilt from `src/ds` + the
// signature pieces, and every MUI import is removed.

import { useMemo, useState } from 'react'
import { ArchHeader, Overline, ErrorState, EmptyState, Skeleton } from '@/ds'
import { useRoster } from './userTeamRosterQueries'
import { SlotCard } from './SlotCard'
import PlayerSelectModal from './PlayerSelectModal'
import MovePlayerModal from './MovePlayerModal'
import PlayerStatsModal from './PlayerStatsModal'
import { Slot } from './userTeamRosterQueries'
import { RosterSlotCard } from './SlotCard'
import type { CSSProperties } from 'react'
import {
  FantasyLeague,
  useFantasyLeagueTeams,
  FantasyLeagueTeamsResponse,
} from '../api/fantasyLeagueQueries'
import { UserTeam } from '../api/userTeamsQueries'
import { useRealMatchesByRound } from '../api/matchesQueries'
import { getOpponentForTeam } from '../utils/matchUtils'
import { useLockedTeams } from '../api/fantasyRoundGameQueries'
import { useFantasyLeagueSeasons } from '../api/useFantasyLeagueSeasons'

interface Props {
  userTeam: UserTeam
  seasonYear: number
  seasonId?: string
  fantasyLeague: FantasyLeague
}

/** Visually-hidden recipe (no `sr-only` utility ships; preflight is off). */
const SR_ONLY: CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: 0,
}

/** Section heading — the app-kit `SubHead` (heavy/wide Archivo display label). */
function SubHead({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="m-0 mb-3.5 font-display text-[22px] text-ink"
      style={{ fontVariationSettings: '"wght" 800, "wdth" 114', lineHeight: 1, letterSpacing: '-0.3px' }}
    >
      {children}
    </h2>
  )
}

/** A single Skeleton roster row used while the roster is loading. */
function SkeletonRow() {
  return (
    <div className="flex min-h-[60px] items-center gap-3.5 rounded-[8px] border border-line bg-surface px-4 py-3">
      <Skeleton variant="rect" width={58} height={22} />
      <Skeleton variant="circle" width={38} />
      <div className="flex flex-col gap-1.5">
        <Skeleton variant="text" width={140} height={13} />
        <Skeleton variant="text" width={90} height={11} />
      </div>
    </div>
  )
}

export const TeamTab: React.FC<Props> = ({ userTeam, fantasyLeague, seasonYear, seasonId }) => {
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [moveOpen, setMoveOpen] = useState(false)
  const [originIndex, setOriginIndex] = useState<number | null>(null)

  const [statsSlot, setStatsSlot] = useState<Slot | null>(null)

  const [selectedTeamId, setSelectedTeamId] = useState<number>(userTeam.id)

  const { data: leagueTeams } = useFantasyLeagueTeams(fantasyLeague.id)
  const { data: season } = useFantasyLeagueSeasons(fantasyLeague.id)
  const currentRealRound = season?.currentRealRound ?? undefined
  const { data: realMatches } = useRealMatchesByRound(seasonYear, currentRealRound)
  const { data: lockedTeamsData } = useLockedTeams(
    fantasyLeague.league.externalId,
    seasonYear,
    currentRealRound,
  )
  const lockedTeamIds = new Set<number>(lockedTeamsData?.lockedTeamIds ?? [])
  const isViewingOwnTeam = selectedTeamId === userTeam.id
  const viewedTeam = leagueTeams?.find(
    (t: FantasyLeagueTeamsResponse) => t.id === selectedTeamId,
  )

  const handleSlotClick = (slot: Slot) => {
    if (slot.player) {
      setStatsSlot(slot)
    } else if (isViewingOwnTeam) {
      setSelectedSlot(slot)
      setIsModalOpen(true)
    }
  }
  const userTeamId = userTeam.id

  const { data: slots, isLoading, refetch, isError } = useRoster({
    userTeamId: selectedTeamId,
    seasonYear,
  })

  const starters = useMemo(
    () => slots?.filter((s: Slot) => s.slotType === 'starter') || [],
    [slots],
  )
  const bench = useMemo(
    () => slots?.filter((s: Slot) => s.slotType === 'bench') || [],
    [slots],
  )

  // Whether a slot is actionable: a player to inspect, or an empty own-team slot
  // to fill. Drives the focusable-control affordance on the row.
  const slotIsInteractive = (slot: Slot) => !!slot.player || isViewingOwnTeam

  const renderSlots = (list: Slot[]) =>
    list.map((slot: Slot) => (
      <SlotCard
        key={slot.index}
        slotType={slot.slotType}
        allowedPositions={slot.allowedPositions as unknown as RosterSlotCard[]}
        player={slot.player}
        slot={slot}
        onActivate={() => handleSlotClick(slot)}
        interactive={slotIsInteractive(slot)}
        opponentInfo={
          slot.player?.team?.id != null && realMatches
            ? getOpponentForTeam(realMatches, slot.player.team.id)
            : null
        }
      />
    ))

  return (
    <div data-ds className="flex flex-col gap-6">
      {leagueTeams && leagueTeams.length > 1 && (
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1.5">
          {[...leagueTeams]
            .sort(
              (a, b) =>
                (b.id === userTeam.id ? 1 : 0) - (a.id === userTeam.id ? 1 : 0),
            )
            .map((team: FantasyLeagueTeamsResponse) => {
            const active = team.id === selectedTeamId
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => setSelectedTeamId(team.id)}
                aria-pressed={active}
                className={`inline-flex h-[34px] shrink-0 items-center whitespace-nowrap rounded-chip border-[1.5px] px-4 font-sans text-[12.5px] font-bold transition-colors ${
                  active
                    ? 'border-signature bg-signature text-on-green'
                    : 'border-line-strong bg-transparent text-ink-muted hover:bg-mist'
                }`}
              >
                {team.id === userTeam.id ? `${team.name} (Meu Time)` : team.name}
              </button>
            )
          })}
        </div>
      )}

      {!isViewingOwnTeam && viewedTeam && (
        <Overline as="p" color="var(--ink-muted)">
          Time de {viewedTeam.user.firstName} {viewedTeam.user.lastName}
        </Overline>
      )}

      <ArchHeader
        tone="green"
        eyebrow={isViewingOwnTeam ? 'Meu time' : 'Elenco'}
        title={
          isViewingOwnTeam
            ? userTeam.name
            : viewedTeam
              ? viewedTeam.name
              : 'Elenco'
        }
        level={2}
      />

      {isError ? (
        <ErrorState
          variant="500"
          onRetry={() => refetch()}
          retryLabel="Tentar de novo"
        />
      ) : isLoading ? (
        <div aria-busy="true" aria-live="polite">
          <span style={SR_ONLY}>Carregando time...</span>
          <SubHead>Titulares</SubHead>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
          <div className="h-6" />
          <SubHead>Reservas</SubHead>
          <div className="flex flex-col gap-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
        </div>
      ) : starters.length === 0 && bench.length === 0 ? (
        <EmptyState
          icon="jersey"
          num="0"
          title="Sem elenco"
          body="Esse time ainda não montou o elenco para a temporada."
        />
      ) : (
        <>
          <section>
            <SubHead>Titulares</SubHead>
            <div className="flex flex-col gap-2.5">{renderSlots(starters)}</div>
          </section>

          <section>
            <SubHead>Reservas</SubHead>
            <div className="flex flex-col gap-2.5">{renderSlots(bench)}</div>
          </section>
        </>
      )}

      <PlayerStatsModal
        playerId={statsSlot?.player?.id ?? null}
        playerName={statsSlot?.player?.name}
        playerPhoto={statsSlot?.player?.photo}
        seasonId={seasonId}
        numberOfRounds={season?.numberOfRounds ?? undefined}
        onClose={() => setStatsSlot(null)}
        slotId={isViewingOwnTeam ? statsSlot?.id : undefined}
        isOwner={isViewingOwnTeam}
        isLocked={
          statsSlot?.player?.team?.id != null &&
          lockedTeamIds.has(statsSlot.player.team.id)
        }
        onMove={() => {
          if (statsSlot) setOriginIndex(statsSlot.index)
          setStatsSlot(null)
          setMoveOpen(true)
        }}
        refetch={refetch}
      />

      {isViewingOwnTeam && (
        <>
          <PlayerSelectModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelectPlayer={() => {
              setIsModalOpen(false)
            }}
            fantasyLeague={fantasyLeague}
            allowedPositions={selectedSlot?.allowedPositions || ['DEF', 'MEI', 'ATA']}
            userTeamId={userTeamId}
            seasonYear={seasonYear}
            slot={selectedSlot?.slot}
            slotType={selectedSlot?.slotType}
            refetch={refetch}
            targetSlotIndex={selectedSlot?.index}
          />

          {originIndex !== null && (
            <MovePlayerModal
              open={moveOpen}
              onClose={() => setMoveOpen(false)}
              slots={slots || []}
              originIndex={originIndex}
              userTeamId={userTeam.id}
              seasonYear={seasonYear}
              refetch={refetch}
            />
          )}
        </>
      )}
    </div>
  )
}
