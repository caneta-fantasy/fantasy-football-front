import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { DraftSettingsResponse } from '../api/useDraftSettings';
import { useUpdateDraftSettings } from '../api/useDraftSettingsMutations';
import { useScheduleDraft } from '../api/useScheduleDraftMutation';
import { useDraftOrder } from '../api/draftOrderQueries';

interface Props {
  seasonId: string;
  leagueId: number;
  draftSettings: DraftSettingsResponse;
  isOwner: boolean;
  refetchDraftSettings: () => void;
}

const toLocalDatetimeValue = (isoString: string): string => {
  const date = new Date(isoString);
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const getErrorMessage = (err: unknown): string => {
  try {
    const e: any = err;
    const d = e?.response?.data;
    if (d) {
      if (Array.isArray(d?.message)) return d.message.join(', ');
      return d?.message || d?.error || JSON.stringify(d);
    }
    if (e?.message) return e.message;
    return 'Erro desconhecido';
  } catch {
    return 'Erro desconhecido';
  }
};

export default function DraftSchedulePanel({
  seasonId,
  leagueId,
  draftSettings,
  isOwner,
  refetchDraftSettings,
}: Props) {
  const { data: draftOrder } = useDraftOrder(leagueId, draftSettings.season);
  const hasDraftOrder = !!draftOrder && draftOrder.length > 0;

  const [newDate, setNewDate] = useState(
    draftSettings.draftDate ? toLocalDatetimeValue(draftSettings.draftDate) : '',
  );
  const [scheduleConfirmOpen, setScheduleConfirmOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  const { mutate: updateSettings } = useUpdateDraftSettings();
  const { mutate: scheduleDraft, isPending: isScheduling } = useScheduleDraft(leagueId);

  // Single irreversible action: persist the chosen date, then schedule the draft.
  // (Scheduling reads draftDate from the DB, so the save must land first.) This
  // replaces the old two-step "Salvar Data" → "Agendar Draft" flow, where users
  // could save the date and wrongly assume the draft was already scheduled.
  const handleConfirmSchedule = () => {
    setScheduleConfirmOpen(false);
    updateSettings(
      {
        id: draftSettings.id,
        updates: { ...draftSettings, draftDate: new Date(newDate).toISOString() },
      },
      {
        onSuccess: () => {
          refetchDraftSettings();
          scheduleDraft(seasonId, {
            onSuccess: () =>
              setSnackbar({ open: true, message: 'Draft agendado com sucesso!', severity: 'success' }),
            onError: (err) =>
              setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' }),
          });
        },
        onError: (err) =>
          setSnackbar({ open: true, message: getErrorMessage(err), severity: 'error' }),
      },
    );
  };

  const minDateTime = toLocalDatetimeValue(new Date(Date.now() + 60000).toISOString());

  const formattedNewDate = newDate
    ? new Date(newDate).toLocaleString('pt-BR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : null;

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={1}>
        Data do Draft
      </Typography>

      {isOwner && (
        <>
          <Box display="flex" gap={1} alignItems="center" mb={2}>
            <CalendarMonthIcon color="primary" />
            <TextField
              type="datetime-local"
              size="small"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              slotProps={{ htmlInput: { min: minDateTime } }}
              sx={{ flex: 1 }}
            />
          </Box>

          <Alert severity="warning" sx={{ mb: 2 }}>
            Escolha a data e clique em <strong>Agendar Draft</strong>. Esta ação é
            irreversível: depois de agendado, o draft não pode ser desfeito.
          </Alert>

          <Button
            variant="contained"
            onClick={() => setScheduleConfirmOpen(true)}
            disabled={isScheduling || !newDate}
            sx={{ borderRadius: 50, textTransform: 'none', fontWeight: 700 }}
          >
            {isScheduling ? 'Agendando…' : 'Agendar Draft'}
          </Button>
        </>
      )}

      {/* Schedule confirmation dialog */}
      <Dialog open={scheduleConfirmOpen} onClose={() => setScheduleConfirmOpen(false)}>
        <DialogTitle>Confirmar Agendamento do Draft</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={1}>
            O draft será agendado para:
          </Typography>
          <Typography fontWeight={700} mb={2}>
            {formattedNewDate}
          </Typography>
          {!hasDraftOrder && (
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Seu draft não possui uma ordem definida. Caso confirme, uma ordem aleatória será estabelecida automaticamente.
            </Alert>
          )}
          <Alert severity="warning">
            Esta ação não pode ser desfeita. Após confirmar, a data fica salva e o
            draft é agendado.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleConfirmOpen(false)} sx={{ textTransform: 'none' }}>
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleConfirmSchedule}
            disabled={isScheduling}
            sx={{ textTransform: 'none' }}
          >
            Confirmar Agendamento
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
