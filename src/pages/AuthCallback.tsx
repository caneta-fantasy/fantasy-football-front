import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userFromToken } from '../utils/session';

/**
 * Landing page for the Google OAuth redirect. The backend redirects here with the
 * JWT in the URL fragment (`/auth/callback#token=…`). We read it client-side
 * (fragments never hit the server/logs), derive the user identity from the JWT,
 * log in, and route onward. Invalid/missing token → back to /signin.
 */
const AuthCallback = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash;
    const token = new URLSearchParams(hash).get('token');
    const user = token ? userFromToken(token) : null;

    if (!token || !user) {
      navigate('/signin', {
        replace: true,
        state: { message: 'Não foi possível entrar com o Google. Tente novamente.' },
      });
      return;
    }

    // The session store requires firstName/lastName on the User type; fall back
    // to empty strings (the name guards handle display).
    login(token, {
      ...user,
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
    });

    const redirect = localStorage.getItem('postLoginRedirect');
    if (redirect) {
      localStorage.removeItem('postLoginRedirect');
      navigate(redirect, { replace: true });
    } else {
      navigate('/welcome', { replace: true });
    }
  }, [login, navigate]);

  return null;
};

export default AuthCallback;
