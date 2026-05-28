import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Snackbar,
  Typography,
} from '@mui/material';
import { useUpdateFantasyLeagueSeason } from '../api/fantasyLeagueSeasonsMutation';

const SEASON_LOCKED_STATUSES = [
  'DRAFT_SCHEDULED', 'DRAFT_LIVE', 'DRAFT_DONE',
  'SCHEDULED', 'ACTIVE', 'SEASON_ENDED', 'ARCHIVED',
];

interface Props {
  values: any;
  onChange: (field: string, value: any) => void;
  id: any;
  refetchFantasyLeagueSeason: () => void;
  seasonStatus?: string;
}

const FantasyLeagueSeasonForm: React.FC<Props> = ({ values, onChange, id, refetchFantasyLeagueSeason, seasonStatus }) => {
  const isLocked = !!seasonStatus && SEASON_LOCKED_STATUSES.includes(seasonStatus);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const tradeDeadlineOptions = useMemo(() => {
    const start = Math.max(1, values.numberOfRounds - 8);
    const end = values.numberOfRounds - 3;
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [values.numberOfRounds]);
  
  const updateFantasyLeagueSeason = useUpdateFantasyLeagueSeason({
    onSuccess: () => {
      setOpenSnackbar(true);
      refetchFantasyLeagueSeason();
    },
  });

  return (
    <>
      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Configurações bloqueadas — o draft já foi agendado.
        </Alert>
      )}
      {/* Número de Times */}
      <Box>
        <Typography fontWeight={600}>Número de Times</Typography>
        <FormControl fullWidth>
          <Select
            value={values.numberOfTeams ?? ''}
            onChange={(e) => onChange('numberOfTeams', e.target.value)}
            disabled={isLocked}
          >
            {Array.from({ length: 13 }, (_, i) => i + 8).map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Revisão de Trocas */}
      <Box>
        <Typography fontWeight={600}>Revisão de Trocas</Typography>
        <Typography variant="body2" color="text.secondary">
          Após esse tempo, as trocas pendentes são processadas automaticamente.
        </Typography>
        <FormControl fullWidth>
          <Select
            value={values.tradeReviewDays ?? ''}
            onChange={(e) => onChange('tradeReviewDays', e.target.value)}
            disabled={isLocked}
          >
            {[0, 1, 2, 3].map((day) => (
              <MenuItem key={day} value={day}>
                {day === 0 ? 'Aprovação imediata' : `${day} dia(s)`}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Número de Rodadas */}
      <Box>
        <Typography fontWeight={600}>Número de Rodadas</Typography>
        <FormControl fullWidth>
          <Select
            value={values.numberOfRounds ?? ''}
            onChange={(e) => onChange('numberOfRounds', e.target.value)}
            disabled={isLocked}
          >
            {Array.from({ length: 20 }, (_, i) => 19 + i).map((val) => (
              <MenuItem key={val} value={val}>
                {val}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Trade Deadline */}
      <Box>
        <Typography fontWeight={600}>Rodada Limite para Trocas</Typography>
        <Typography variant="body2" color="text.secondary">
          Última rodada permitida para trocas. Deixe vazio se não houver limite.
        </Typography>
        <FormControl fullWidth>
          <Select
            value={values.tradeDeadlineRound ?? ''}
            onChange={(e) => onChange('tradeDeadlineRound', e.target.value)}
            disabled={isLocked}
          >
            <MenuItem value="">Sem limite</MenuItem>
            {tradeDeadlineOptions.map((round) => (
              <MenuItem key={round} value={round}>
                Rodada {round}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Times nos Playoffs */}
      <Box>
        <Typography fontWeight={600}>Times nos Playoffs</Typography>
        <FormControl fullWidth>
          <Select
            value={values.playoffTeams ?? ''}
            onChange={(e) => onChange('playoffTeams', e.target.value)}
            disabled={isLocked}
          >
            {[4, 6, 7, 8].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Reservas por Lesão */}
      <Box>
        <Typography fontWeight={600}>Reservas por Lesão</Typography>
        <FormControl fullWidth>
          <Select
            value={values.irSlots ?? ''}
            onChange={(e) => onChange('irSlots', e.target.value)}
            disabled={isLocked}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <MenuItem key={i} value={i}>
                {i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Formato dos Playoffs */}
      <Box>
        <Typography fontWeight={600}>Formato dos Playoffs</Typography>
        <RadioGroup
          value={values.playoffFormat ?? ''}
          onChange={(e) => onChange('playoffFormat', e.target.value)}
          aria-disabled={isLocked}
        >
          <FormControlLabel
            value="single_game"
            control={<Radio />}
            label="1 jogo por rodada"
          />
          <FormControlLabel
            value="two_leg_single_game_final"
            control={<Radio />}
            label="2 jogos por rodada, final 1"
          />
          <FormControlLabel
            value="two_leg_all"
            control={<Radio />}
            label="2 jogos em todas as rodadas"
          />
        </RadioGroup>
      </Box>
      <Box
        sx={{
            borderTop: '1px solid #eee',
            p: 2,
            display: 'flex',
            justifyContent: 'flex-end',
        }}
        >
          <Button
            variant="contained"
            onClick={() => updateFantasyLeagueSeason.mutate({ id, updates: values })}
            disabled={updateFantasyLeagueSeason.isPending || isLocked}
          >
            Salvar
          </Button>
        </Box>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Configurações salvas com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FantasyLeagueSeasonForm;
