const API_BASE = window.location.hostname === 'localhost'
  ? '/api'
  : 'https://goat-of-maths-api.onrender.com/api';

let authToken: string | null = localStorage.getItem('goat-token');

export function getToken(): string | null {
  return authToken;
}

export function setToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('goat-token', token);
  } else {
    localStorage.removeItem('goat-token');
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<{ token: string; user: { username: string; displayName: string; isAdmin: boolean } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    register: (data: { username: string; password: string; displayName: string; isAdmin?: boolean; classe?: string; dateNaissance?: string }) =>
      request<{ token: string; user: { username: string; displayName: string; isAdmin: boolean } }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => request<{ username: string; displayName: string; isAdmin: boolean }>('/auth/me'),
  },
  state: {
    get: () => request<Record<string, unknown>>('/state'),
    save: (state: Record<string, unknown>) =>
      request<{ ok: boolean }>('/state', {
        method: 'POST',
        body: JSON.stringify(state),
      }),
  },
  questions: {
    list: () => request<Array<{ id: number; question: string; options: string[]; correctAnswer: number; explanation: string }>>('/questions'),
    create: (data: { question: string; options: string[]; correctAnswer: number; explanation: string }) =>
      request<{ id: number }>('/questions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { question: string; options: string[]; correctAnswer: number; explanation: string }) =>
      request<{ ok: boolean }>(`/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/questions/${id}`, { method: 'DELETE' }),
  },
  shop: {
    list: () => request<Array<{ id: number; name: string; icon: string; type: string; price: number; description: string; theme_id: string | null }>>('/shop'),
    create: (data: { name: string; icon: string; type: string; price: number; description: string; themeId?: string }) =>
      request<{ id: number }>('/shop', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number, data: { name: string; icon: string; type: string; price: number; description: string; themeId?: string }) =>
      request<{ ok: boolean }>(`/shop/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: number) =>
      request<{ ok: boolean }>(`/shop/${id}`, { method: 'DELETE' }),
  },
  badges: {
    list: () => request<Array<{ id: string; name: string; icon: string; description: string }>>('/badges'),
    create: (data: { id: string; name: string; icon: string; description: string }) =>
      request<{ ok: boolean }>('/badges', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: { name: string; icon: string; description: string }) =>
      request<{ ok: boolean }>(`/badges/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) =>
      request<{ ok: boolean }>(`/badges/${id}`, { method: 'DELETE' }),
  },
  accounts: {
    list: () => request<Array<{ username: string; displayName: string; isAdmin: boolean; classe: string; dateNaissance: string }>>('/accounts'),
    update: (username: string, data: { displayName: string; password?: string; isAdmin: boolean; classe?: string; dateNaissance?: string }) =>
      request<{ ok: boolean }>(`/accounts/${username}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (username: string) =>
      request<{ ok: boolean }>(`/accounts/${username}`, { method: 'DELETE' }),
    register: (data: { username: string; password: string; displayName: string; isAdmin?: boolean; classe?: string; dateNaissance?: string }) =>
      api.auth.register(data),
  },
  leaderboard: {
    get: () => request<Array<{ rank: number; name: string; xp: number; avatar: string }>>('/leaderboard'),
  },
  chat: {
    get: () => request<Array<{ id: number; username: string; message: string; timestamp: string }>>('/chat'),
    send: (message: string) =>
      request<{ id: number }>('/chat', { method: 'POST', body: JSON.stringify({ message }) }),
  },
  messages: {
    get: (friend: string) =>
      request<Array<{ id: number; from_user: string; to: string; message: string; timestamp: string }>>(`/messages/${encodeURIComponent(friend)}`),
    send: (friend: string, message: string) =>
      request<{ id: number }>(`/messages/${encodeURIComponent(friend)}`, { method: 'POST', body: JSON.stringify({ message }) }),
  },
  friends: {
    list: () => request<string[]>('/friends'),
    add: (name: string) => request<{ ok: boolean }>(`/friends/${encodeURIComponent(name)}`, { method: 'POST' }),
    remove: (name: string) => request<{ ok: boolean }>(`/friends/${encodeURIComponent(name)}`, { method: 'DELETE' }),
  },
  users: {
    list: () => request<Array<{ name: string; avatar: string }>>('/users'),
  },
  guilds: {
    list: () => request<Array<Record<string, unknown>>>('/guilds'),
    create: (data: { name: string; emoji: string; entryFee?: number }) =>
      request<{ id: number }>('/guilds', { method: 'POST', body: JSON.stringify(data) }),
    join: (id: number) => request<{ ok: boolean }>(`/guilds/${id}/join`, { method: 'POST' }),
    leave: (id: number) => request<{ ok: boolean }>(`/guilds/${id}/leave`, { method: 'POST' }),
    accept: (id: number, name: string) => request<{ ok: boolean }>(`/guilds/${id}/accept`, { method: 'POST', body: JSON.stringify({ name }) }),
    reject: (id: number, name: string) => request<{ ok: boolean }>(`/guilds/${id}/reject`, { method: 'POST', body: JSON.stringify({ name }) }),
    kick: (id: number, name: string) => request<{ ok: boolean }>(`/guilds/${id}/kick`, { method: 'POST', body: JSON.stringify({ name }) }),
    delete: (id: number) => request<{ ok: boolean }>(`/guilds/${id}`, { method: 'DELETE' }),
    settings: (id: number, data: { entryFee?: number; payoutPercentage?: number; chefAdjoint?: string }) =>
      request<{ ok: boolean }>(`/guilds/${id}/settings`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  shopBuy: (id: number) => request<{ ok: boolean; newCoins: number }>(`/shop/${id}/buy`, { method: 'POST' }),
};
