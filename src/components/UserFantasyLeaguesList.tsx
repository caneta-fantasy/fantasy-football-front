import {
  Box,
  Typography,
  Card,
  CardActionArea,
  CardContent,
  Chip,
} from '@mui/material';
import { FantasyLeague } from '../api/fantasyLeagueQueries';

interface UserLeaguesListProps {
  fantasyLeagues: FantasyLeague[];
  onFantasyLeagueSelect: (fantasyLeagueId: number) => void;
}

export const UserFantasyLeaguesList = ({ fantasyLeagues, onFantasyLeagueSelect }: UserLeaguesListProps) => {
  if (fantasyLeagues.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Você não está em nenhuma liga ainda
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
        Suas Ligas
      </Typography>
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(3, 1fr)'
        },
        gap: 2,
        justifyContent: 'center'
      }}>
        {fantasyLeagues.map((fantasyLeague) => (
          <Card 
            key={fantasyLeague.id}
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: 2,
                borderColor: 'primary.main'
              }
            }}
          >
            <CardActionArea 
              onClick={() => onFantasyLeagueSelect(fantasyLeague.id)}
              sx={{ flexGrow: 1 }}
            >
              <CardContent>
                <Typography gutterBottom variant="h6" component="div">
                  {fantasyLeague.name}
                  {fantasyLeague.isSimulation && (
                    <Chip label="Simulação" color="warning" size="small" sx={{ ml: 1 }} />
                  )}
                  {fantasyLeague.isOwner && (
                    <Typography 
                      component="span" 
                      variant="caption" 
                      color="primary"
                      sx={{ ml: 1 }}
                    >
                      (Dono)
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Times: {fantasyLeague.numberOfTeams}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Campeonato: {fantasyLeague.league.name}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
};