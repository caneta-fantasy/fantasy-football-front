import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
} from '@mui/material';
import { Snackbar, Alert } from '@mui/material';
import { useUpdateFantasyLeague } from '../api/fantasyLeagueMutations';

interface Props {
  values: any;
  onChange: (field: string, value: any) => void;
  id: number;
  refetchFantasyLeague: () => void;
}

const FantasyLeagueForm: React.FC<Props> = ({ values, onChange, id, refetchFantasyLeague }) => {
  const [openSnackbar, setOpenSnackbar] = useState(false);
  
  const updateFantasyLeague = useUpdateFantasyLeague({
    onSuccess: () => {
      setOpenSnackbar(true);
      refetchFantasyLeague();
    },
  });

  return (
    <>
      <Box>
        <Typography fontWeight={600}>Nome da Liga</Typography>
        <TextField
          fullWidth
          value={values.name}
          onChange={(e) => onChange('name', e.target.value)}
        />
      </Box>
          {updateFantasyLeague.isError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              {(updateFantasyLeague.error as any)?.response?.data?.message ??
                'Não foi possível salvar as configurações.'}
            </Alert>
          )}
          <Button
            variant="contained"
            onClick={() => updateFantasyLeague.mutate({ id, updates: values })}
            disabled={updateFantasyLeague.isPending}
          >
            Salvar
          </Button>
      <Snackbar open={openSnackbar} autoHideDuration={3000} onClose={() => setOpenSnackbar(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Configurações salvas com sucesso!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FantasyLeagueForm;
