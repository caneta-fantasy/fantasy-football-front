import { useEffect, useRef } from 'react';
import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import { DraftPick, DraftResponse } from '../api/draftQueries';

interface Props {
  draft: DraftResponse;
  picks: DraftPick[];
  currentUserId: number;
  connectedUserIds: number[];
}

export default function DraftOrderDisplay({ draft, picks, currentUserId, connectedUserIds }: Props) {
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [draft.currentPickPosition]);

  const sorted = [...picks].sort((a, b) => a.overallPick - b.overallPick);
  const rounds = Array.from(new Set(sorted.map((p) => p.round)));

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
        ORDEM DO DRAFT
      </Typography>

      <Box sx={{ maxHeight: 500, overflowY: 'auto', pr: 0.5 }}>
        {rounds.map((round) => {
          const roundPicks = sorted.filter((p) => p.round === round);
          return (
            <Box key={round} mb={1}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                Rodada {round}
              </Typography>
              <Divider sx={{ mb: 0.5 }} />
              <Box display="flex" flexDirection="column" gap={0.5}>
                {roundPicks.map((pick) => {
                  const isActive = pick.overallPick === draft.currentPickPosition && !pick.pickedAt;
                  const isMyTeam = pick.userTeam?.user?.id === currentUserId;
                  const isOnline = !pick.isGhost && pick.userTeam?.user?.id != null
                    && connectedUserIds.includes(pick.userTeam.user.id);
                  const isDone = !!pick.pickedAt;

                  return (
                    <Paper
                      key={pick.id}
                      ref={isActive ? activeRef : undefined}
                      variant="outlined"
                      sx={{
                        px: 1.5,
                        py: 0.75,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: isActive ? 'primary.50' : isDone ? 'grey.50' : 'transparent',
                        borderColor: isActive ? 'primary.main' : 'divider',
                        borderWidth: isActive ? 2 : 1,
                        opacity: isDone ? 0.7 : 1,
                      }}
                    >
                      {/* Online dot */}
                      {!pick.isGhost && (
                        <Box sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          flexShrink: 0,
                          bgcolor: isOnline ? 'success.main' : 'grey.400',
                        }} />
                      )}

                      {/* Pick number */}
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ minWidth: 24, flexShrink: 0 }}>
                        {pick.overallPick}.
                      </Typography>

                      {/* Main content */}
                      <Box flex={1} minWidth={0}>
                        {pick.isGhost ? (
                          <Typography variant="body2" fontStyle="italic" color="text.disabled">
                            Vaga livre
                          </Typography>
                        ) : isDone ? (
                          <>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {pick.player?.name ?? '—'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                              {pick.userTeam?.name}
                            </Typography>
                          </>
                        ) : (
                          <Typography variant="body2" fontWeight={isMyTeam ? 700 : 400} noWrap>
                            {pick.userTeam?.name ?? '—'}
                          </Typography>
                        )}
                      </Box>

                      {/* Chips */}
                      {!isActive && isMyTeam && !isDone && (
                        <Chip label="Você" size="small" variant="outlined" sx={{ flexShrink: 0 }} />
                      )}
                      {isDone && pick.isAutoDrafted && (
                        <Chip label="Automático" size="small" color="warning" sx={{ flexShrink: 0 }} />
                      )}
                    </Paper>
                  );
                })}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
