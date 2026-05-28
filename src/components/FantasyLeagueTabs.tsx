import React from 'react';
import { Box, Button, Stack, Badge } from '@mui/material';

const tabs = [
  { label: 'Draft', key: 'draft' },
  { label: 'Times', key: 'team' },
  { label: 'Tabela', key: 'schedule' },
  { label: 'Rodada', key: 'rodada' },
  { label: 'Liga', key: 'league' },
  { label: 'Jogadores', key: 'players' },
  { label: 'Trocas', key: 'trades' },
  { label: 'Pontuações', key: 'scores' },
];

interface FantasyLeagueTabsProps {
  selected: string;
  onChange: (key: string) => void;
  pendingTradesCount?: number;
}

const FantasyLeagueTabs: React.FC<FantasyLeagueTabsProps> = ({ selected, onChange, pendingTradesCount = 0 }) => {
  return (
    <Box sx={{ bgcolor: 'background.paper', py: 2 }}>
      <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
        {tabs.map((tab) => (
          <Badge
            key={tab.key}
            badgeContent={tab.key === 'trades' ? pendingTradesCount : 0}
            color="error"
            overlap="rectangular"
          >
            <Button
              variant={selected === tab.key ? 'contained' : 'outlined'}
              onClick={() => onChange(tab.key)}
              sx={{
                borderRadius: 50,
                px: 3,
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: selected === tab.key ? 'primary.main' : 'transparent',
                color: selected === tab.key ? '#fff' : 'text.primary',
                '&:hover': {
                  bgcolor: selected === tab.key ? 'primary.dark' : 'action.hover',
                },
              }}
            >
              {tab.label}
            </Button>
          </Badge>
        ))}
      </Stack>
    </Box>
  );
};

export default FantasyLeagueTabs;
