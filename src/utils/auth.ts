import { getToken } from './session';
export const isAuthenticated = (): boolean => {
    const token = getToken();
    if (!token) return false;
  
    try {
      const [, payload] = token.split('.');
      const decoded = JSON.parse(atob(payload));
      return decoded.exp * 1000 > Date.now(); // check expiration
    } catch {
      return false;
    }
  };
  