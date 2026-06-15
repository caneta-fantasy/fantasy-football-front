import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { useScoringConfig, ScoringConfigData } from '../api/useScoringConfig';
import { useUpdateScoringConfig } from '../api/useScoringConfigMutations';


const LOCKED_STATUSES = [
  'DRAFT_SCHEDULED',
  'DRAFT_LIVE',
  'DRAFT_DONE',
  'SCHEDULED',
  'ACTIVE',
  'ARCHIVED',
];

interface StatRow {
  field: keyof ScoringConfigData;
  label: string;
  note?: string;
}

const ATTACK_ROWS: StatRow[] = [
  { field: 'goalPoints', label: 'Gol' },
  { field: 'assistPoints', label: 'Assistência' },
  { field: 'shotSavedPoints', label: 'Finalização defendida' },
  { field: 'shotOffTargetPoints', label: 'Finalização pra fora' },
  { field: 'foulDrawnPoints', label: 'Falta sofrida' },
  { field: 'penaltyWonPoints', label: 'Pênalti sofrido' },
  { field: 'penaltyMissedPoints', label: 'Pênalti perdido' },
  { field: 'offsidePoints', label: 'Impedimento' },
];

const DEFENSE_ROWS: StatRow[] = [
  { field: 'penaltySavedPoints', label: 'Defesa de pênalti', note: 'GK / defesa fechada' },
  { field: 'cleanSheetPoints', label: 'Jogo sem sofrer gols', note: 'GK / defesa fechada' },
  { field: 'savePoints', label: 'Defesa', note: 'GK / defesa fechada' },
  { field: 'tacklePoints', label: 'Desarme' },
  { field: 'ownGoalPoints', label: 'Gol contra' },
  { field: 'goalConcededPoints', label: 'Gol sofrido', note: 'GK / defesa fechada' },
  { field: 'redCardPoints', label: 'Cartão vermelho' },
  { field: 'yellowCardPoints', label: 'Cartão amarelo' },
  { field: 'foulCommittedPoints', label: 'Falta cometida' },
  { field: 'penaltyCommittedPoints', label: 'Pênalti cometido' },
];

interface Props {
  seasonId: string | undefined;
  seasonStatus: string | undefined;
  isOwner: boolean;
}

const ScoringConfigForm: React.FC<Props> = ({ seasonId, seasonStatus, isOwner }) => {
  const { data: scoringConfig, refetch } = useScoringConfig(seasonId);
  const [localValues, setLocalValues] = useState<Partial<ScoringConfigData>>({});
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarError, setSnackbarError] = useState(false);

  const isLocked = !!seasonStatus && LOCKED_STATUSES.includes(seasonStatus);
  const isReadOnly = isLocked || !isOwner;

  useEffect(() => {
    if (scoringConfig) setLocalValues(scoringConfig);
  }, [scoringConfig]);

  const { mutate: updateScoringConfig, isPending } = useUpdateScoringConfig({
    onSuccess: () => {
      refetch();
      setOpenSnackbar(true);
      setSnackbarError(false);
    },
  });

  const handleChange = (field: keyof ScoringConfigData, value: string) => {
    setLocalValues((prev) => ({ ...prev, [field]: parseFloat(value) }));
  };

  const handleSave = () => {
    if (!seasonId) return;
    updateScoringConfig({ seasonId, updates: localValues });
  };

  const renderRows = (rows: StatRow[]) =>
    rows.map(({ field, label, note }) => (
      <TableRow key={field}>
        <TableCell sx={{ border: 'none', py: 1 }}>
          <Typography variant="body2">{label}</Typography>
          {note && (
            <Typography variant="caption" color="text.secondary" fontStyle="italic">
              {note}
            </Typography>
          )}
        </TableCell>
        <TableCell sx={{ border: 'none', py: 1, width: 120 }}>
          <TextField
            type="number"
            size="small"
            value={localValues[field] ?? ''}
            onChange={(e) => handleChange(field, e.target.value)}
            disabled={isReadOnly}
            slotProps={{ htmlInput: { step: 0.1 } }}
            sx={{ width: 100 }}
          />
        </TableCell>
      </TableRow>
    ));

  return (
    <>
      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Pontuação bloqueada — temporada em andamento.
        </Alert>
      )}
      {!isLocked && !isOwner && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Apenas o dono da liga pode editar as configurações de pontuação.
        </Alert>
      )}

      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Ataque
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableBody>{renderRows(ATTACK_ROWS)}</TableBody>
      </Table>

      <Typography variant="subtitle1" fontWeight={600} mb={1}>
        Defesa
      </Typography>
      <Table size="small" sx={{ mb: 3 }}>
        <TableBody>{renderRows(DEFENSE_ROWS)}</TableBody>
      </Table>

      {!isReadOnly && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" onClick={handleSave} disabled={isPending}>
            Salvar
          </Button>
        </Box>
      )}

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity={snackbarError ? 'error' : 'success'} sx={{ width: '100%' }}>
          {snackbarError
            ? 'Erro ao salvar configurações de pontuação.'
            : 'Configurações de pontuação salvas com sucesso!'}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ScoringConfigForm;
