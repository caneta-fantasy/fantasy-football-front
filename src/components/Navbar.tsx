import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import { BrandLockup } from '../ds';
import { useAuth } from '../context/AuthContext';
import { useCurrentSeason } from '../api/currentSeasonQueries';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { data: currentSeason } = useCurrentSeason();

  // The top nav is the authenticated app shell — hide it entirely when logged
  // out so it never renders on the public pages (sign in / sign up / invite).
  // The login screen carries its own brand wordmark in the hero.
  if (!user) return null;

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        color: 'black',
        borderBottom: '1px solid #e0e0e0',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        {/* Logo on the left */}
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'inline-flex' }}>
          <BrandLockup size={34} />
        </Link>
        
        {/* Current season badge */}
        {currentSeason && (
          <Chip
            label={`Temporada ${currentSeason.year}`}
            size="small"
            sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0', color: '#1a1a1a' }}
          />
        )}

        {/* Conditional rendering based on auth */}
        {user ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body1"
              component={Link}
              to="/profile"
              sx={{ fontWeight: 'bold', color: '#1a1a1a', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
            >
              Olá, {user.firstName}!
            </Typography>
            {user.isAdmin && (
              <Button
                component={Link}
                to="/admin"
                variant="text"
                sx={{ textTransform: 'none', fontWeight: 'bold', color: '#1a1a1a' }}
              >
                Admin
              </Button>
            )}
            <Button
              variant="outlined"
              onClick={logout}
              sx={{
                borderColor: '#1a1a1a',
                color: '#1a1a1a',
                textTransform: 'none',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)',
                  borderColor: '#1a1a1a',
                },
              }}
            >
              SAIR
            </Button>
          </Box>
        ) : (
          <Button 
            variant="outlined"
            component={Link}
            to="/signin"
            sx={{
              borderColor: '#1a1a1a',
              color: '#1a1a1a',
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
                borderColor: '#1a1a1a',
              },
            }}
          >
            ENTRAR
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
