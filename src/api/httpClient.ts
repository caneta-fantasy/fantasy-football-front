import axios from 'axios';
import { apiConfig } from './config';
import { getToken, clearSession } from '../utils/session';

/**
 * Single source for the auth header. Previously this exact function was
 * redefined in ~12 query/mutation files; they now import it from here. Reads the
 * namespaced session token (caneta.*) so it can't pick up another localhost
 * app's token.
 */
export const authHeader = (): { Authorization: string } => ({
  Authorization: `Bearer ${getToken()}`,
});

/**
 * Pre-configured axios instance that injects the bearer token on every request
 * via an interceptor. New query hooks should prefer `apiClient.get(...)` over
 * passing `headers: authHeader()` by hand. Existing call sites still work with
 * the exported `authHeader` above.
 */
export const apiClient = axios.create({
  baseURL: apiConfig.baseUrl,
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Disconnect on a rejected/expired/invalid token. The backend re-checks the user
// exists on every request, so a 401 means the session is no longer valid — clear
// it and bounce to /signin (unless already on a public auth page).
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      const path = window.location.pathname;
      if (!path.startsWith('/signin') && !path.startsWith('/signup')) {
        window.location.assign('/signin');
      }
    }
    return Promise.reject(error);
  },
);
