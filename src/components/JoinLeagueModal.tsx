import React, { useEffect, useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useJoinFantasyLeague } from '../api/fantasyLeagueMutations';

interface JoinLeagueModalProps {
  open: boolean;
  handleClose: () => void;
  initialCode?: string;
}

const JoinLeagueModal: React.FC<JoinLeagueModalProps> = ({ open, handleClose, initialCode }) => {
  const [code, setCode] = useState(initialCode ?? '');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: join, isPending, isError, error, reset } = useJoinFantasyLeague();

  // Prefill the code when opened from a shareable link (?code=…).
  useEffect(() => {
    if (open && initialCode) setCode(initialCode);
  }, [open, initialCode]);

  const close = () => {
    setCode('');
    reset();
    handleClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    join(code.trim().toUpperCase(), {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['myLeagues'] });
        close();
        navigate(`/fantasy-league/${data.leagueId}`);
      },
    });
  };

  return (
    <Modal open={open} onClose={close}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: '90%', sm: 400 },
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography variant="h6" sx={{ mb: 1 }}>
          Entrar com código
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Digite o código de convite que você recebeu do dono da liga.
        </Typography>

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error instanceof Error ? error.message : 'Não foi possível entrar na liga.'}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Código"
            fullWidth
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            inputProps={{ style: { letterSpacing: 4, textTransform: 'uppercase' } }}
            autoFocus
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
            <Button onClick={close} disabled={isPending}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isPending || !code.trim()}
              sx={{ backgroundColor: '#1a1a1a', '&:hover': { backgroundColor: '#333' } }}
            >
              {isPending ? <CircularProgress size={22} color="inherit" /> : 'Entrar'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default JoinLeagueModal;
