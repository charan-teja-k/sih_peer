import { apiPost, apiGet } from './api';

const TOKEN_KEY = 'accessToken';

export function getToken(): string | null { 
  return localStorage.getItem(TOKEN_KEY); 
}

export function setToken(t: string) { 
  localStorage.setItem(TOKEN_KEY, t); 
}

export function clearToken() { 
  localStorage.removeItem(TOKEN_KEY); 
}

export async function register(email: string, password: string) {
  return apiPost<{message: string}>('/auth/register', { email, password });
}

export async function login(email: string, password: string) {
  const data = await apiPost<{ accessToken: string; user?: unknown }>('/auth/login', { email, password });
  if (data?.accessToken) setToken(data.accessToken);
  return data;
}

export async function me() {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  return apiGet('/users/me', token);
}