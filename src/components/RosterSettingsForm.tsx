import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Snackbar,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { RosterSettings, useUpdateRosterSettings } from '../api/useUpdateRosterSettings';

const ROSTER_LOCKED_STATUSES = [
  'DRAFT_SCHEDULED', 'DRAFT_LIVE', 'DRAFT_DONE',
  'SCHEDULED', 'ACTIVE', 'SEASON_ENDED', 'ARCHIVED',
];

interface Props {
  values: RosterSettings;
  onChange: (field: string, value: any) => void;
  id: number;
  refetchRosterSettings: () => void;
  refetchDraftSettings: () => void;
  seasonStatus?: string;
}

const RosterSettingsForm: React.FC<Props> = ({ values, onChange, id, refetchRosterSettings, refetchDraftSettings, seasonStatus }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const isLocked = !!seasonStatus && ROSTER_LOCKED_STATUSES.includes(seasonStatus);
  const updateRoster = useUpdateRosterSettings({
    onSuccess: () => {
      setOpenSnackbar(true);
      refetchRosterSettings();
      refetchDraftSettings();
    },
  });

  const totalStarterMin = values.minStarterMidfielders + values.minStarterForwards;
  const isStarterTotalExceeded = totalStarterMin > values.starterSkillSlots;

  const totalBenchMin = values.minBenchMidfielders + values.minBenchForwards;
  const isBenchTotalExceeded = totalBenchMin > values.benchSkillSlots;

  return (
    <>
      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Configurações de elenco bloqueadas — o draft já foi agendado.
        </Alert>
      )}
      {/* Starter Settings */}
      <Typography fontWeight={600} sx={{ mb: 2, fontSize: '1.2rem' }}>Jogadores Titulares</Typography>
      <Box>
        <Typography fontWeight={600}>Total de Jogadores Titulares (não incluindo defesa)</Typography>
        <TextField
          fullWidth
          type="number"
          inputProps={{ min: 4, max: 8 }}
          disabled={isLocked}
          value={values.starterSkillSlots}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 4 && value <= 8) {
              onChange('starterSkillSlots', value);
            }
          }}
        />
      </Box>

      <Box>
        <Typography fontWeight={600}>Minimo de Meio-campistas Titulares</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.minStarterMidfielders}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= values.starterSkillSlots) {
              onChange('minStarterMidfielders', value);
            }
          }}
          error={isStarterTotalExceeded}
          helperText={
            isStarterTotalExceeded ? 'A soma dos atacantes e meias não pode exceder o total de jogadores' : ''
          }
        />
      </Box>

      <Box>
        <Typography fontWeight={600}>Minimo de Atacantes Titulares</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.minStarterForwards}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= values.starterSkillSlots) {
              onChange('minStarterForwards', value);
            }
          }}
          error={isStarterTotalExceeded}
          helperText={
            isStarterTotalExceeded ? 'A soma dos atacantes e meias não pode exceder o total de jogadores' : ''
          }
        />
      </Box>
      <Box>
        <Typography fontWeight={600}>Defesa(s) Titular(es)</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.starterDefenseSlots}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 2) {
              onChange('starterDefenseSlots', value);
            }
          }}
        />
      </Box>

      <Typography fontWeight={600} sx={{ my: 2, fontSize: '1.2rem' }}>Jogadores Reserva</Typography>
      {/* Bench Settings */}
      <Box>
        <Typography fontWeight={600}>Total de Jogadores Reserva (não incluindo defesa)</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.benchSkillSlots}
          onChange={(e) => onChange('benchSkillSlots', Number(e.target.value))}
        />
      </Box>

      <Box>
        <Typography fontWeight={600}>Minimo de Meio-campistas Reservas</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.minBenchMidfielders}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= values.benchSkillSlots) {
              onChange('minBenchMidfielders', value);
            }
          }}
          error={isBenchTotalExceeded}
          helperText={
            isBenchTotalExceeded ? 'A soma dos atacantes e meias não pode exceder o total de jogadores reservas' : ''
          }
        />
      </Box>

      <Box>
        <Typography fontWeight={600}>Atacantes Reserva (mín)</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.minBenchForwards}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= values.benchSkillSlots) {
              onChange('minBenchForwards', value);
            }
          }}
          error={isBenchTotalExceeded}
          helperText={
            isBenchTotalExceeded ? 'A soma dos atacantes e meias não pode exceder o total de jogadores reservas' : ''
          }
        />
      </Box>
      <Box>
        <Typography fontWeight={600}>Maximo de Defesa(s) Reserva(s)</Typography>
        <TextField
          fullWidth
          type="number"
          disabled={isLocked}
          value={values.benchDefenseSlots}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 0 && value <= 2) {
              onChange('benchDefenseSlots', value);
            }
          }}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Typography fontWeight={600} sx={{ mb: 1 }}>Tipo de Defesa</Typography>
        <ToggleButtonGroup
          exclusive
          value={values.defenseType ?? 'CLOSED'}
          onChange={(_, val) => { if (val && !isLocked) onChange('defenseType', val); }}
          disabled={isLocked}
          size="small"
        >
          <ToggleButton value="CLOSED">Defesa Fechada</ToggleButton>
          <ToggleButton value="OPEN">Defesa Aberta</ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          {values.defenseType === 'OPEN'
            ? 'Jogadores defensores individuais de qualquer time'
            : 'Unidade defensiva completa de um time (ex: Defesa do Flamengo)'}
        </Typography>
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
        onClick={() => updateRoster.mutate({ id, updates: values })}
        disabled={updateRoster.isPending || isStarterTotalExceeded || isBenchTotalExceeded || isLocked}
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

export default RosterSettingsForm;
