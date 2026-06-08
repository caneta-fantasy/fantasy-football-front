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
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const isLocked = !!seasonStatus && ROSTER_LOCKED_STATUSES.includes(seasonStatus);
  const updateRoster = useUpdateRosterSettings({
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Configurações salvas com sucesso!', severity: 'success' });
      refetchRosterSettings();
      refetchDraftSettings();
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? 'Erro ao salvar configurações.';
      setSnackbar({ open: true, message: Array.isArray(msg) ? msg.join(', ') : msg, severity: 'error' });
    },
  });

  const totalStarterMin = values.minStarterMidfielders + values.minStarterForwards;
  const isStarterTotalExceeded = totalStarterMin > values.starterSkillSlots;

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
        <Typography fontWeight={600}>Mínimo de Meio-campistas Titulares</Typography>
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
        <Typography fontWeight={600}>Mínimo de Atacantes Titulares</Typography>
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

      {/* Bench Settings */}
      <Typography fontWeight={600} sx={{ my: 2, fontSize: '1.2rem' }}>Jogadores Reserva</Typography>
      <Box>
        <Typography fontWeight={600}>Vagas no Banco</Typography>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          O banco é livre — qualquer posição pode ocupar qualquer vaga.
        </Typography>
        <TextField
          fullWidth
          type="number"
          inputProps={{ min: 1, max: 10 }}
          disabled={isLocked}
          value={values.benchSlots}
          onChange={(e) => {
            const value = Number(e.target.value);
            if (value >= 1 && value <= 10) {
              onChange('benchSlots', value);
            }
          }}
        />
      </Box>

      {/* Position Limits */}
      <Typography fontWeight={600} sx={{ my: 2, fontSize: '1.2rem' }}>Limites por Posição (opcional)</Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
        Deixe em branco para sem limite. Limites totais do elenco de cada jogador somando titulares e reservas.
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
        {values.defenseType === 'OPEN' && (
          <Box>
            <Typography fontWeight={600}>Máx. Goleiros</Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              disabled={isLocked}
              placeholder="Sem limite"
              value={values.maxGk ?? ''}
              onChange={(e) => onChange('maxGk', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Box>
        )}
        {values.defenseType === 'OPEN' ? (
          <Box>
            <Typography fontWeight={600}>Máx. Defensores</Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              disabled={isLocked}
              placeholder="Sem limite"
              value={values.maxDefenders ?? ''}
              onChange={(e) => onChange('maxDefenders', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Box>
        ) : (
          <Box>
            <Typography fontWeight={600}>Máx. Defesas</Typography>
            <TextField
              fullWidth
              type="number"
              inputProps={{ min: 1 }}
              disabled={isLocked}
              placeholder="Sem limite"
              value={values.maxDef ?? ''}
              onChange={(e) => onChange('maxDef', e.target.value === '' ? null : Number(e.target.value))}
            />
          </Box>
        )}
        <Box>
          <Typography fontWeight={600}>Máx. Meio-campistas</Typography>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            disabled={isLocked}
            placeholder="Sem limite"
            value={values.maxMid ?? ''}
            onChange={(e) => onChange('maxMid', e.target.value === '' ? null : Number(e.target.value))}
          />
        </Box>
        <Box>
          <Typography fontWeight={600}>Máx. Atacantes</Typography>
          <TextField
            fullWidth
            type="number"
            inputProps={{ min: 1 }}
            disabled={isLocked}
            placeholder="Sem limite"
            value={values.maxFwd ?? ''}
            onChange={(e) => onChange('maxFwd', e.target.value === '' ? null : Number(e.target.value))}
          />
        </Box>
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
          disabled={updateRoster.isPending || isStarterTotalExceeded || isLocked}
        >
          Salvar
        </Button>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default RosterSettingsForm;
