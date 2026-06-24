// ─── API Client ───────────────────────────────────────────────────────────────
// Todas las llamadas al backend de Equipo Dev

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:3006';

export interface AdminTeam {
  id: string;
  name: string;
  createdAt: number | null;
  legacy: boolean;
  disabled?: boolean;
  members: number;
  tasks: number;
  snippets: number;
  vault: number;
  memberNames: string[];
}

export function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('equipo_dev_token') || '';
}

async function req<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // ── Auth ────────────────────────────────────────────────────────────────────
  login: (password: string) => req<{ token: string; teamName?: string }>('POST', '/auth/login', { password }),
  register: (teamName: string, password: string, vaultPassword: string) =>
    req<{ ok: boolean; teamId: string; teamName: string }>('POST', '/auth/register', { teamName, password, vaultPassword }),
  verifyVault: (password: string) => req<{ ok: boolean }>('POST', '/auth/vault', { password }),

  // ── Admin (clave de administrador, no token) ────────────────────────────────
  adminGetTeams: async (adminKey: string) => {
    const res = await fetch(`${API_BASE}/admin/teams`, { headers: { 'x-admin-key': adminKey } });
    if (!res.ok) throw new Error(await res.text());
    return res.json() as Promise<AdminTeam[]>;
  },
  adminDeleteTeam: async (adminKey: string, id: string) => {
    const res = await fetch(`${API_BASE}/admin/teams/${id}`, { method: 'DELETE', headers: { 'x-admin-key': adminKey } });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },
  adminUpdateTeam: async (adminKey: string, id: string, patch: { password?: string; vaultPassword?: string; disabled?: boolean }) => {
    const res = await fetch(`${API_BASE}/admin/teams/${id}`, {
      method: 'PATCH',
      headers: { 'x-admin-key': adminKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  // ── Members ─────────────────────────────────────────────────────────────────
  getMembers:    ()                      => req('GET',    '/members'),
  addMember:     (name: string, role: string, avatarSeed?: string) => req('POST', '/members', { name, role, avatarSeed: avatarSeed || 'aventurero' }),
  updateMember:  (id: string, patch: Record<string, unknown>) => req('PATCH',  `/members/${id}`, patch),
  deleteMember:  (id: string)            => req('DELETE', `/members/${id}`),

  // ── Tasks ───────────────────────────────────────────────────────────────────
  getTasks:   ()                           => req('GET',    '/tasks'),
  addTask:    (data: Record<string, unknown>)            => req('POST',   '/tasks', data),
  updateTask: (id: string, patch: Record<string, unknown>) => req('PATCH',  `/tasks/${id}`, patch),
  deleteTask: (id: string)                 => req('DELETE', `/tasks/${id}`),

  // ── Snippets ─────────────────────────────────────────────────────────────────
  getSnippets:    ()                           => req('GET',    '/snippets'),
  addSnippet:     (data: Record<string, unknown>)            => req('POST',   '/snippets', data),
  updateSnippet:  (id: string, patch: Record<string, unknown>) => req('PATCH',  `/snippets/${id}`, patch),
  deleteSnippet:  (id: string)                 => req('DELETE', `/snippets/${id}`),

  // ── Notes ────────────────────────────────────────────────────────────────────
  getNotes:    ()                           => req('GET',    '/notes'),
  addNote:     (data: Record<string, unknown>)            => req('POST',   '/notes', data),
  updateNote:  (id: string, patch: Record<string, unknown>) => req('PATCH',  `/notes/${id}`, patch),
  deleteNote:  (id: string)                 => req('DELETE', `/notes/${id}`),

  // ── Vault ────────────────────────────────────────────────────────────────────
  getVault:          ()                           => req('GET',    '/vault'),
  addVaultProject:   (data: Record<string, unknown>)            => req('POST',   '/vault', data),
  updateVaultProject:(id: string, patch: Record<string, unknown>) => req('PATCH',  `/vault/${id}`, patch),
  deleteVaultProject:(id: string)                 => req('DELETE', `/vault/${id}`),

  // ── Pizarra personal ─────────────────────────────────────────────────────────
  getPizarra:  (memberId: string)          => req('GET', `/pizarra/${memberId}`),
  savePizarra: (memberId: string, data: unknown) => req('PUT', `/pizarra/${memberId}`, data),

  // ── Custom shapes (compartidas) ──────────────────────────────────────────────
  getCustomShapes:   ()                    => req('GET',    '/pizarra/shapes/all'),
  addCustomShape:    (data: Record<string, unknown>)       => req('POST',   '/pizarra/shapes', data),
  deleteCustomShape: (id: string)          => req('DELETE', `/pizarra/shapes/${id}`),

  // ── Links de Entornos ────────────────────────────────────────────────────────
  getLinks:    ()                                          => req('GET',    '/links'),
  addLink:     (data: Record<string, unknown>)             => req('POST',   '/links', data),
  deleteLink:  (id: string)                                => req('DELETE', `/links/${id}`),

  // ── Archivos compartidos ──────────────────────────────────────────────────────
  getSharedFiles:    ()                                    => req('GET',    '/pizarra/files/all'),
  addSharedFile:     (data: Record<string, unknown>)       => req('POST',   '/pizarra/files', data),
  updateSharedFile:  (id: string, patch: Record<string, unknown>) => req('PATCH', `/pizarra/files/${id}`, patch),
  deleteSharedFile:  (id: string)                          => req('DELETE', `/pizarra/files/${id}`),
};
