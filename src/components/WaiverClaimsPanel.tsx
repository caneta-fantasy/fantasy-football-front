import {
  Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Chip, Avatar, IconButton, Tooltip, Paper, Alert,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import { WaiverClaim, WaiverBudget, useCancelWaiverClaim } from '../api/waiverQueries';

const STATUS_LABEL: Record<string, { label: string; color: 'default' | 'success' | 'error' | 'warning' | 'info' }> = {
  PENDING: { label: 'Pendente', color: 'info' },
  WON: { label: 'Conquistado', color: 'success' },
  LOST: { label: 'Perdido', color: 'default' },
  CANCELLED: { label: 'Cancelado', color: 'warning' },
  FAILED: { label: 'Falhou', color: 'error' },
};

interface Props {
  seasonId: string;
  currentUserId: number;
  claims: WaiverClaim[];
  budgets: WaiverBudget[];
  isWindowOpen: boolean;
}

export default function WaiverClaimsPanel({ seasonId, currentUserId, claims, isWindowOpen }: Props) {
  const cancelClaim = useCancelWaiverClaim(seasonId);

  const handleCancel = async (claimId: string) => {
    try {
      await cancelClaim.mutateAsync(claimId);
    } catch {
      // error handled silently; user sees claim not disappear
    }
  };

  const myClaims = claims.filter((c) => c.userTeam.user.id === currentUserId);

  if (myClaims.length === 0 && !isWindowOpen) return null;

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight={700}>
          Mercado
        </Typography>
      </Box>

      {isWindowOpen && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Mercado aberto. Use o botão "Reivindicar" na aba Jogadores para fazer uma oferta.
        </Alert>
      )}

      {myClaims.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Você não possui reivindicações nesta janela.
        </Typography>
      ) : (
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Jogador</TableCell>
              <TableCell>Oferta</TableCell>
              <TableCell>Liberar</TableCell>
              <TableCell>Status</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>
          <TableBody>
            {myClaims.map((claim) => (
              <TableRow key={claim.id}>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar src={claim.targetPlayer.photo} sx={{ width: 24, height: 24 }} />
                    <Typography variant="body2">{claim.targetPlayer.name}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">R$ {Number(claim.bidAmount).toFixed(0)}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {claim.dropPlayer?.name ?? '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={STATUS_LABEL[claim.status]?.label ?? claim.status}
                    color={STATUS_LABEL[claim.status]?.color ?? 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {claim.status === 'PENDING' && isWindowOpen && (
                    <Tooltip title="Cancelar reivindicação">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancel(claim.id)}
                        disabled={cancelClaim.isPending}
                      >
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Paper>
  );
}
