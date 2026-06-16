import axios from 'axios';
import { apiConfig } from './config';

/**
 * Single source for the auth header. Previously this exact function was
 * redefined in ~12 query/mutation files; they now import it from here.
 */
export const authHeader = (): { Authorization: string } => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
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
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
