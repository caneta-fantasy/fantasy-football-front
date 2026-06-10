import React from 'react';
import {
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from '@mui/material';
import { useStandings } from '../api/fantasyMatchupQueries';

interface Props {
  seasonId: string;
  userTeamId?: number;
}

const StandingsTable: React.FC<Props> = ({ seasonId, userTeamId }) => {
  const theme = useTheme();
  const { data: standings, isLoading } = useStandings(seasonId);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!standings || standings.length === 0) {
    return (
      <Typography color="text.secondary" textAlign="center" py={3}>
        O draft ainda não foi concluído.
      </Typography>
    );
  }

  const headerCell = (label: string, align: 'left' | 'center' | 'right' = 'center') => (
    <TableCell
      align={align}
      sx={{ fontWeight: 700, fontSize: 12, color: 'text.secondary', py: 1, px: 1.5 }}
    >
      {label}
    </TableCell>
  );

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            {headerCell('#', 'center')}
            {headerCell('Time', 'left')}
            {headerCell('P')}
            {headerCell('V')}
            {headerCell('E')}
            {headerCell('D')}
            {headerCell('PP')}
            {headerCell('PC')}
          </TableRow>
        </TableHead>
        <TableBody>
          {standings.map((row) => {
            const isMe = userTeamId != null && row.teamId === userTeamId;
            return (
              <TableRow
                key={row.teamId}
                sx={{
                  backgroundColor: isMe
                    ? theme.palette.primary.main + '18'
                    : 'transparent',
                  '&:last-child td': { border: 0 },
                }}
              >
                <TableCell align="center" sx={{ py: 1, px: 1.5, fontWeight: 600 }}>
                  {row.seed}
                </TableCell>
                <TableCell sx={{ py: 1, px: 1.5, fontWeight: isMe ? 700 : 400 }}>
                  {row.teamName}
                  {row.ownerName && (
                    <Typography variant="caption" display="block" color="text.secondary" fontWeight={400}>
                      {row.ownerName}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center" sx={{ py: 1, px: 1.5, fontWeight: 700 }}>
                  {row.points}
                </TableCell>
                <TableCell align="center" sx={{ py: 1, px: 1.5 }}>
                  {row.wins}
                </TableCell>
                <TableCell align="center" sx={{ py: 1, px: 1.5 }}>
                  {row.draws}
                </TableCell>
                <TableCell align="center" sx={{ py: 1, px: 1.5 }}>
                  {row.losses}
                </TableCell>
                <TableCell align="center" sx={{ py: 1, px: 1.5, color: 'success.main' }}>
                  {row.pointsFor.toFixed(1)}
                </TableCell>
                <TableCell align="center" sx={{ py: 1, px: 1.5, color: 'text.secondary' }}>
                  {row.pointsAgainst.toFixed(1)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StandingsTable;
