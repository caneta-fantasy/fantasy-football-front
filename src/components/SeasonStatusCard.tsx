import { useMemo } from 'react';
import { Box, Stack, Typography, Button, Divider } from '@mui/material';
import { useActivateSeasonMutation } from '../api/fantasyLeagueSeasonsMutation';
import { FantasyLeagueSeason } from '../api/useFantasyLeagueSeasons';
import { DraftSettings } from '../api/useDraftSettingsMutations';

/** Keep in sync with backend */
export enum LeagueStatus {
    INACTIVE = 'INACTIVE',
    ACTIVATED_PRESEASON = 'ACTIVATED_PRESEASON',
    DRAFT_SCHEDULED = 'DRAFT_SCHEDULED',
    DRAFT_LIVE = 'DRAFT_LIVE',
    DRAFT_DONE = 'DRAFT_DONE',
    SCHEDULED = 'SCHEDULED',
    ACTIVE = 'ACTIVE',
    SEASON_ENDED = 'SEASON_ENDED',
    ARCHIVED = 'ARCHIVED',
  }
  
  type Props = {
    season?: FantasyLeagueSeason | null;
    canManage: boolean;
    onUpdated?: () => void;
    devEnableForceOpen?: boolean;
    refetchSeason?: () => void;
    draftSettings?: DraftSettings;
    championTeamName?: string | null;
  };
  
  function isoToDate(iso: string | null | undefined): Date | null {
    if (!iso) return null;
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // add this helper near the top of the file
const getErrorMessage = (err: unknown) => {
  // works for fetch, axios, Nest errors, or plain objects
  if (err instanceof Error) return err.message;
  if (typeof err === 'string') return err;
  try {
    const e: any = err;
    if (e?.response?.data) {
      const d = e.response.data;
      if (Array.isArray(d?.message)) return d.message.join(', ');
      return d?.message || d?.error || JSON.stringify(d);
    }
    if (Array.isArray(e?.message)) return e.message.join(', ');
    if (e?.message) return e.message;
    return JSON.stringify(e);
  } catch {
    return 'Erro desconhecido';
  }
};

  
  /** Dev rule: if no kickoff provided, treat as now + 2 months (mirrors backend dev logic) */
  function resolveKickoffDevFromSeason(season: FantasyLeagueSeason): Date {
    return isoToDate(season.seasonKickoffAt) ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);
  }
  
  /** Used when there is NO season: still show a date (now + 2 months) */
  function resolveKickoffDevNoSeason(): Date {
    return new Date(Date.now() + 1000 * 60 * 60 * 24 * 60);
  }
  
  function isActivationWindowOpen(season: FantasyLeagueSeason, now = new Date()): boolean {
    const kickoff = resolveKickoffDevFromSeason(season);
    const windowStart = new Date(kickoff);
    windowStart.setMonth(kickoff.getMonth() - 2);
    return now >= windowStart && now < kickoff;
  }
  
  type UiPhase =
    | 'entre-temporadas'
    | 'inativa'
    | 'pre-temporada'
    | 'draft'
    | 'temporada'
    | 'playoffs-encerrados'
    | 'pós-temporada';
  
  function computeUiPhase(season: FantasyLeagueSeason): UiPhase {
    const now = new Date();
    const kickoff = resolveKickoffDevFromSeason(season);
    const windowOpen = isActivationWindowOpen(season, now);
  
    switch (season.status) {
      case LeagueStatus.INACTIVE:
        return windowOpen ? 'inativa' : 'entre-temporadas';
      case LeagueStatus.DRAFT_LIVE:
        return 'draft';
      case LeagueStatus.ACTIVATED_PRESEASON:
        return 'pre-temporada'
      case LeagueStatus.DRAFT_SCHEDULED:
      case LeagueStatus.DRAFT_DONE:
      case LeagueStatus.SCHEDULED:
        return now < kickoff ? 'pre-temporada' : 'temporada';
      case LeagueStatus.ACTIVE:
        return 'temporada';
      case LeagueStatus.SEASON_ENDED:
        return 'playoffs-encerrados';
      case LeagueStatus.ARCHIVED:
        return 'pós-temporada';
      default:
        return 'entre-temporadas';
    }
  }
  
  function chipColor(phase: UiPhase) {
    switch (phase) {
      case 'entre-temporadas':
        return 'default';
      case 'inativa':
        return 'warning';
      case 'pre-temporada':
        return 'info';
      case 'draft':
        return 'secondary';
      case 'temporada':
        return 'success';
      case 'playoffs-encerrados':
        return 'warning';
      case 'pós-temporada':
        return 'primary';
    }
  }
  
  function daysUntil(date: Date): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    const now = new Date();
    return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / msPerDay));
  }
  
  export default function SeasonStatusCard({
    season,
    canManage,
    onUpdated,
    devEnableForceOpen = true,
    refetchSeason,
    draftSettings,
    championTeamName,
  }: Props) {
    // Always compute a kickoff & message, even when there's no season
    const kickoff = useMemo<Date>(() => {
      return season ? resolveKickoffDevFromSeason(season) : resolveKickoffDevNoSeason();
    }, [season]);
  
    const windowStart = useMemo<Date>(() => {
      const d = new Date(kickoff.getTime());
      d.setMonth(d.getMonth() - 2);
      return d;
    }, [kickoff]);
  
    const phase: UiPhase = useMemo(
      () => (season ? computeUiPhase(season) : 'entre-temporadas'),
      [season],
    );
    
    const kickoffStr = kickoff.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    const windowStr = `${windowStart.toLocaleString('pt-BR', { dateStyle: 'short' })} → ${kickoff.toLocaleString('pt-BR', { dateStyle: 'short' })}`;
  
    const days = daysUntil(kickoff);
  
    const { mutate: activateMutate, isPending } = useActivateSeasonMutation({
      onSuccess: () => {
        onUpdated?.();
        refetchSeason?.();
      },
      onError: (e) => alert(getErrorMessage(e)),
    });
    
    function postActivate(withOverride: boolean) {
      if (!season) return;
      const body = withOverride
        ? { seasonKickoffAt: new Date(Date.now() + 60 * 60 * 1000).toISOString() }
        : {};
      activateMutate({ seasonId: season.id, body });
    }

    const hasDraftDate = draftSettings?.draftDate ? new Date(draftSettings.draftDate) : null;

    // Helper function to render draft date information
    const renderDraftDateInfo = () => {
      if (phase !== 'pre-temporada') return null;
      
      if (hasDraftDate) {
        return (
          <Typography variant="body2" color="text.secondary">
            Draft marcado para {hasDraftDate.toLocaleString('pt-BR', { 
              dateStyle: 'short', 
              timeStyle: 'short' 
            })}
          </Typography>
        );
      }
      
      return (
        <Typography variant="body2" color="text.secondary">
          Sua liga ainda não tem data de draft. Confira as configurações da liga e defina uma data.
        </Typography>
      );
    };

    return (
      <Box mt={2}>
        <Divider sx={{ my: 2 }} />
        <Stack spacing={1.2}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button size="large" sx={{
                borderRadius: 50,
                color: 'white',
                fontWeight: 700,
                fontSize: '0.95rem',
                py: 1.25,
                minHeight: 44,
                 backgroundColor: chipColor(phase) === 'default' ? 'primary.main' : chipColor(phase) === 'warning' ? 'warning.main' : chipColor(phase) === 'info' ? 'info.main' : chipColor(phase) === 'secondary' ? 'secondary.main' : chipColor(phase) === 'success' ? 'success.main' : chipColor(phase) === 'primary' ? 'primary.main' : 'default.main' }}>{phase}</Button>
          </Stack>

          {season ? (
            <>
              <Typography variant="body2" color="text.secondary">
                {/* PT-BR UI */}
                Temporada {season.seasonYear}
                {season.numberOfTeams ? ` • ${season.numberOfTeams} times` : ''}
                {season.playoffTeams ? ` • ${season.playoffTeams}  se classificam para o mata mata` : ''}
              </Typography>

              {phase === 'temporada' && season.currentFantasyRound != null && (
                <Typography variant="body2" color="text.secondary">
                  {(() => {
                    // Always show both rounds so users know exactly where the
                    // league AND the championship are
                    const realRound = season.realCurrentRound ?? season.currentRealRound;
                    return realRound != null
                      ? `Rodada ${season.currentFantasyRound} da Liga • Rodada ${realRound} do Campeonato`
                      : `Rodada ${season.currentFantasyRound}`;
                  })()}
                </Typography>
              )}

              {phase === 'playoffs-encerrados' && (
                <Typography variant="body2" fontWeight={700} color="warning.main">
                  🏆 Campeão{championTeamName ? `: ${championTeamName}` : ''}
                </Typography>
              )}

              <Typography variant="caption" color="text.secondary">
                {/* PT-BR UI */}
                Janela de ativação: {windowStr}
              </Typography>

              {canManage && (
                <Stack direction="column" spacing={1} mt={1} alignItems='center'>
                    {phase === 'entre-temporadas' && devEnableForceOpen && (
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => postActivate(true)}
                        disabled={isPending}
                        sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
                      >
                        {isPending ? 'Abrindo…' : 'Abrir janela'}
                      </Button>
                    )}
                    {phase === 'inativa' && (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => postActivate(false)}
                        disabled={isPending}
                        sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 600 }}
                      >
                        {isPending ? 'Ativando…' : 'Ativar temporada'}
                      </Button>
                  )}
                </Stack>
              )}
            </>
          ) : (
            <>
              {/* Removed: "Nenhuma temporada criada." */}
              <Typography variant="body2" color="text.secondary">
                {/* PT-BR UI */}
                Temporada começa em {days} {days === 1 ? 'dia' : 'dias'} • {kickoffStr}
              </Typography>
            </>
          )}

          {renderDraftDateInfo()}
        </Stack>
      </Box>
    );
  }