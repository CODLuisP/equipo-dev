// ─── Interfaces compartidas ───────────────────────────────────────────────────

export interface Member { id: string; name: string; role: string; color: string; avatarSeed?: string; }
export interface Task {
  id: string; title: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  assignedTo: string; createdAt: number;
}
export interface Snippet { id: string; title: string; content: string; label: 'env' | 'código' | 'config' | 'otro'; authorId: string; createdAt: number; }
export interface Note { id: string; content: string; authorId: string; createdAt: number; x: number; y: number; color?: string; type?: 'note' | 'text'; fontSize?: number; width?: number; rotation?: number; }
export interface BoardImage { id: string; src: string; x: number; y: number; width: number; height: number; rotation?: number; zOrder?: number; }
export interface DrawingPath { points: { x: number; y: number }[]; color: string; width: number; zOrder?: number; }
export interface BoardShape { id: string; type: string; x: number; y: number; width: number; height: number; color: string; label?: string; rotation?: number; zOrder?: number; }
export interface CustomShape { id: string; label: string; svgContent: string; viewBox: string; defaultW: number; defaultH: number; }
export interface SharedFile { id: string; name: string; type: string; size: number; dataUrl: string; x: number; y: number; createdAt: number; authorName: string; }

export type Tab = 'equipo' | 'tareas' | 'snippets' | 'pizarra' | 'archivos' | 'boveda' | 'ajustes';

// ─── Constantes ───────────────────────────────────────────────────────────────

export const STATUSES: Task['status'][] = ['pendiente', 'en progreso', 'completada'];
export const MEMBER_COLORS = ['#E85D2F','#3498DB','#2ECC71','#F1C40F','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#D35400','#27AE60'];
export const AVATAR_PRESETS = ['aventurero','creativo','tecnico','disenador','ninja','heroe','mago','explorador','lider','builder'];
