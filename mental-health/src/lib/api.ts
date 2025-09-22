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

// Check if user has taken the test before and get their latest results
export async function checkTestHistory(token: string) {
  return apiGet<{
    hasTakenTest: boolean;
    latestTest?: {
      _id: string;
      userId: string;
      userEmail: string;
      userName: string;
      userAge: number;
      course: string;
      year: string;
      answers: Record<string, string>;
      responses: Record<string, string>;
      timestamp: string;
      calculatedRiskScore?: number;
      tags?: string[];
    };
    message: string;
  }>('/questions/check-history', token);
}