import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { DraftSettings, useUpdateDraftSettings } from '../api/useDraftSettingsMutations';

const DRAFT_LOCKED_STATUSES = [
  'DRAFT_DONE', 'SCHEDULED', 'ACTIVE', 'SEASON_ENDED', 'ARCHIVED',
];

interface Props {
  values: DraftSettings;
  onChange: (field: string, value: any) => void;
  id: number;
  refetchDraftSettings: () => void;
  seasonStatus?: string;
}

const DraftSettingsForm: React.FC<Props> = ({
  values,
  onChange,
  id,
  refetchDraftSettings,
  seasonStatus,
}) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const isLocked = !!seasonStatus && DRAFT_LOCKED_STATUSES.includes(seasonStatus);

  const updateDraftSettings = useUpdateDraftSettings({
    onSuccess: () => {
      setOpenSnackbar(true);
      refetchDraftSettings();
    },
  });

  return (
    <>
      {isLocked && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Configurações de draft bloqueadas — o draft já foi realizado.
        </Alert>
      )}
      {/* Draft Type */}
      <Box>
        <Typography fontWeight={600}>Tipo de Draft</Typography>
        <FormControl fullWidth>
          <Select
            value={values.draftType ?? ''}
            onChange={(e) => onChange('draftType', e.target.value)}
            disabled={isLocked}
          >
            <MenuItem value="snake">Vai e Vem</MenuItem>
            <MenuItem value="linear">Linear</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Pick Timer */}
      <Box>
        <Typography fontWeight={600}>Tempo por Escolha</Typography>
        <FormControl fullWidth>
          <Select
            value={values.pickTimer ?? ''}
            onChange={(e) => onChange('pickTimer', e.target.value)}
            disabled={isLocked}
          >
            <MenuItem value={30}>30 segundos</MenuItem>
            <MenuItem value={60}>60 segundos</MenuItem>
            <MenuItem value={90}>90 segundos</MenuItem>
            <MenuItem value={120}>120 segundos</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Rounds (read-only) */}
      <Box>
        <Typography fontWeight={600}>Rodadas</Typography>
        <TextField
          fullWidth
          value={values.rounds}
          disabled
        />
      </Box>

      {/* Season (read-only) */}
      <Box>
        <Typography fontWeight={600}>Temporada</Typography>
        <TextField
          fullWidth
          value={values.season}
          disabled
        />
      </Box>

      {/* Save Button */}
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
          onClick={() =>
            updateDraftSettings.mutate({
              id,
              updates: values,
            })
          }
          disabled={updateDraftSettings.isPending || isLocked}
        >
          Salvar
        </Button>
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          Configurações do draft salvas com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
};

export default DraftSettingsForm;
