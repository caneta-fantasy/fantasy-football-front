// src/components/Loading.tsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Carregando...', fullScreen = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: fullScreen ? '100vh' : '100%',
        width: '100%',
        gap: 2,
        textAlign: 'center',
      }}
    >
      <CircularProgress size={50} />
      {message && (
        <Typography variant="body1" color="textSecondary">
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default Loading;
