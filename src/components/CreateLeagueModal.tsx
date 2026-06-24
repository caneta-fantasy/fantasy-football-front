import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Typography,
  Button,
  Modal,
  TextField,
  MenuItem,
  Stack,
  CircularProgress,
  FormControl,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCreateFantasyLeague } from '../api/fantasyLeagueMutations';
import { useCurrentSeason } from '../api/currentSeasonQueries';
import {
  CREATION_CUTOFF_ROUND,
  DEFAULT_ROUNDS,
  MIN_ROUNDS,
} from '../constants/league';
import Loading from './Loading';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: {
    xs: '90%',
    sm: 400,
    md: 460,
  },
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: {
    xs: 3,
    sm: 4,
  },
  borderRadius: 3,
};

interface CreateLeagueModalProps {
  open: boolean;
  handleClose: () => void;
}

const draftTypes = [
  {
    value: 'snake',
    label: 'Vai e Vem',
    description: 'O time que escolher primeiro na primeira rodada escolhe por último na segunda rodada e assim por diante.',
  },
  {
    value: 'linear',
    label: 'Linear',
    description: 'A ordem de escolha não é alterada ao longo das rodadas.',
  },
];

const CreateLeagueModal: React.FC<CreateLeagueModalProps> = ({ open, handleClose }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [leagueName, setLeagueName] = useState('');
  const [numberOfTeams, setNumberOfTeams] = useState(8);
  const [draftType, setDraftType] = useState('snake');
  const { mutate: createFantasyLeague, isPending, isError, error } = useCreateFantasyLeague();

  // Round budget comes straight from the backend so it's correct even for a brand
  // new user with no leagues yet. maxRounds shrinks as the real season advances.
  const { data: currentSeason } = useCurrentSeason();
  const minAllowed = currentSeason?.minRounds ?? MIN_ROUNDS;
  const maxAllowed = currentSeason?.maxRounds ?? null;

  const roundOptions = useMemo(() => {
    const all = Array.from({ length: 20 }, (_, i) => minAllowed + i);
    return maxAllowed != null ? all.filter((v) => v <= maxAllowed) : all;
  }, [minAllowed, maxAllowed]);

  const [numberOfRounds, setNumberOfRounds] = useState(() =>
    Math.min(DEFAULT_ROUNDS, maxAllowed ?? DEFAULT_ROUNDS),
  );

  // Recalculate default when the round budget loads
  React.useEffect(() => {
    if (maxAllowed != null) {
      setNumberOfRounds((prev) => Math.min(prev, maxAllowed));
    }
  }, [maxAllowed]);

  const isPastCutoff = currentSeason ? !currentSeason.canCreate : false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leagueName.trim()) return;

    createFantasyLeague(
      {
        name: leagueName,
        numberOfTeams,
        ownerId: Number(user?.id) || 0,
        leagueId: 1,
        draftType,
        numberOfRounds,
      },
      {
        onSuccess: (res) => {
          handleClose();
          navigate(`/fantasy-league/${res.data.id}`);
        },
      }
    );
  };

  if (isPending) return <Loading message="Criando liga..." fullScreen />;

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="create-league-modal">
      <Box sx={modalStyle}>
        <Typography variant="h5" sx={{ mb: 3 }}>
          Criar Nova Liga
        </Typography>

        {isPastCutoff ? (
          <Alert severity="warning">
            Não é possível criar novas ligas após a rodada {CREATION_CUTOFF_ROUND} do campeonato. Aguarde a próxima temporada.
          </Alert>
        ) : (
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              label="Nome da Liga"
              variant="outlined"
              fullWidth
              value={leagueName}
              onChange={(e) => setLeagueName(e.target.value)}
              inputProps={{ maxLength: 100 }}
              required
            />

            <TextField
              select
              label="Número de Times"
              value={numberOfTeams}
              onChange={(e) => setNumberOfTeams(Number(e.target.value))}
              fullWidth
            >
              {Array.from({ length: 13 }, (_, i) => i + 8).map((num) => (
                <MenuItem key={num} value={num}>
                  {num}
                </MenuItem>
              ))}
            </TextField>

            <FormControl>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Tipo de Draft
              </Typography>
              <RadioGroup value={draftType} onChange={(e) => setDraftType(e.target.value)}>
                {draftTypes.map((type) => (
                  <Paper
                    key={type.value}
                    variant="outlined"
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderColor: draftType === type.value ? 'primary.main' : 'divider',
                      backgroundColor: draftType === type.value ? 'action.hover' : 'inherit',
                      borderRadius: 2,
                    }}
                  >
                    <FormControlLabel
                      value={type.value}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography variant="body1" fontWeight={600}>
                            {type.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {type.description}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', margin: 0 }}
                    />
                  </Paper>
                ))}
              </RadioGroup>
            </FormControl>

            <TextField
              select
              label="Número de Rodadas"
              value={numberOfRounds}
              onChange={(e) => setNumberOfRounds(Number(e.target.value))}
              fullWidth
              helperText={
                maxAllowed != null && maxAllowed < DEFAULT_ROUNDS
                  ? `Máximo disponível no campeonato: ${maxAllowed} rodadas`
                  : undefined
              }
            >
              {roundOptions.map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </TextField>

            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={1}>
              <Button onClick={handleClose} variant="outlined">
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isPending || !leagueName.trim()}
              >
                {isPending ? <CircularProgress size={24} /> : 'Criar Liga'}
              </Button>
            </Stack>
          </Stack>
        </form>
        )}

        {isError && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error instanceof Error ? error.message : 'Algo deu errado ao criar a liga.'}
          </Typography>
        )}
      </Box>
    </Modal>
  );
};

export default CreateLeagueModal;
