import React, { useState } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Box,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FantasyLeagueSettingsModal from './FantasyLeagueSettingsModal';
import { FantasyLeague } from '../api/fantasyLeagueQueries';
import { useFantasyLeagueSeasons} from '../api/useFantasyLeagueSeasons';

interface Props {
  isOwner?: boolean;
  onEdit?: () => void;
  fantasyLeague: FantasyLeague;
}

const FantasyLeagueSettings: React.FC<Props> = ({ isOwner = false, fantasyLeague }) => {
  const { data: fantasyLeagueSeason } = useFantasyLeagueSeasons(fantasyLeague.id);
  const [modalOpen, setModalOpen] = useState(false);  
  const settings = {
    numberOfTeams: fantasyLeagueSeason?.numberOfTeams,
    playoffs: fantasyLeagueSeason?.playoffTeams,
    tradeDeadline: fantasyLeagueSeason?.tradeDeadlineRound,
    irSlots: fantasyLeagueSeason?.irSlots,
    playoffStartRound: fantasyLeagueSeason?.playoffStartRound,
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        mt: 3,
        borderRadius: 2,
        overflowX: 'auto',
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={600}>
          Configurações da Liga
        </Typography>
        {isOwner && (
          <IconButton onClick={() => setModalOpen(true)} size="small">
            <EditIcon />
          </IconButton>
        )}
      </Box>

      <Table size="small">
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary' }}>Número de Times</TableCell>
            <TableCell>{settings.numberOfTeams}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary' }}>Times classificados para os Playoffs</TableCell>
            <TableCell>{settings.playoffs}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary' }}>Rodada em que os playoffs comecam</TableCell>
            <TableCell>{settings.playoffStartRound}a</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary' }}>Rodada Limite para Trocas</TableCell>
            <TableCell>{settings.tradeDeadline}a</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{ color: 'text.secondary' }}>Vagas para Lesionados</TableCell>
            <TableCell>{settings.irSlots}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <FantasyLeagueSettingsModal open={modalOpen} onClose={() => setModalOpen(false)} fantasyLeague={fantasyLeague} />
    </Paper>
  );
};

export default FantasyLeagueSettings;
