import { useEffect, useState } from 'react';
import { Box, Typography, LinearProgress } from '@mui/material';

interface Props {
  deadline: string | null;
  totalSeconds: number;
  compact?: boolean;
  frozen?: boolean;
}

export default function DraftPickTimer({ deadline, totalSeconds, compact = false, frozen = false }: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number>(totalSeconds);

  useEffect(() => {
    if (!deadline) {
      setSecondsLeft(totalSeconds);
      return;
    }

    const calc = () => {
      const ms = new Date(deadline).getTime() - Date.now();
      setSecondsLeft(Math.max(0, Math.ceil(ms / 1000)));
    };

    calc();
    if (frozen) return;
    const interval = setInterval(calc, 500);
    return () => clearInterval(interval);
  }, [deadline, totalSeconds, frozen]);

  const progress = totalSeconds > 0 ? (secondsLeft / totalSeconds) * 100 : 0;
  const isUrgent = secondsLeft <= 10;

  const timeLabel = `${String(Math.floor(secondsLeft / 60)).padStart(2, '0')}:${String(secondsLeft % 60).padStart(2, '0')}`;

  if (compact) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <Typography
          variant="h5"
          fontWeight={700}
          color={isUrgent ? 'error.main' : 'text.primary'}
          sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1, minWidth: 64 }}
        >
          {timeLabel}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isUrgent ? 'error' : 'primary'}
          sx={{ flex: 1, height: 6, borderRadius: 3 }}
        />
      </Box>
    );
  }

  return (
    <Box textAlign="center">
      <Typography
        variant="h2"
        fontWeight={700}
        color={isUrgent ? 'error.main' : 'text.primary'}
        sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
      >
        {timeLabel}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={progress}
        color={isUrgent ? 'error' : 'primary'}
        sx={{ mt: 1, height: 6, borderRadius: 3 }}
      />
    </Box>
  );
}
