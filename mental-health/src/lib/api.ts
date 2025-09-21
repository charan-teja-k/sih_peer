export const API_URL = import.meta.env.VITE_API_URL!;

export function authHeader(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function apiGet<T>(path: string, token?: string) {
  const res = await fetch(`${API_URL}${path}`, { 
    headers: { 'Content-Type': 'application/json', ...authHeader(token) }
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export async function apiPost<T, B = unknown>(path: string, body: B, token?: string) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader(token) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}