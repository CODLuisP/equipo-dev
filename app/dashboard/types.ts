// ─── Interfaces compartidas ───────────────────────────────────────────────────

export interface Member { id: string; name: string; role: string; color: string; avatarSeed?: string; }
export interface TaskAttachment {
  id: string;
  type: 'image' | 'video';
  name: string;
  url: string;
}

export interface TaskBlock {
  id: string;
  type: 'text' | 'image';
  content?: string;
  url?: string;
  name?: string;
}

export interface Task {
  id: string; title: string;
  status: 'pendiente' | 'en progreso' | 'completada';
  assignedTo: string; createdAt: number;
  description?: string;
  attachments?: TaskAttachment[];
  blocks?: TaskBlock[];
}
export interface Snippet { id: string; title: string; content: string; label: 'env' | 'código' | 'config' | 'otro'; authorId: string; createdAt: number; }
export interface Note { id: string; content: string; authorId: string; createdAt: number; x: number; y: number; color?: string; type?: 'note' | 'text'; fontSize?: number; width?: number; rotation?: number; fontFamily?: string; textAlign?: 'left' | 'center' | 'right'; fontWeight?: 'normal' | 'bold'; }
export interface BoardImage { id: string; src: string; x: number; y: number; width: number; height: number; rotation?: number; zOrder?: number; }
export interface DrawingPath { points: { x: number; y: number }[]; color: string; width: number; fill?: string; cornerRadius?: number; zOrder?: number; isArrow?: boolean; }
export interface BoardShape { id: string; type: string; x: number; y: number; width: number; height: number; color: string; label?: string; rotation?: number; zOrder?: number; }
export interface CustomShape { id: string; label: string; svgContent: string; viewBox: string; defaultW: number; defaultH: number; }
export interface SharedFile { id: string; name: string; type: string; size: number; dataUrl: string; x: number; y: number; createdAt: number; authorName: string; }

export type Tab = 'equipo' | 'tareas' | 'snippets' | 'pizarra' | 'archivos' | 'boveda' | 'ajustes';

// ─── Constantes ───────────────────────────────────────────────────────────────

export const STATUSES: Task['status'][] = ['pendiente', 'en progreso', 'completada'];
export const MEMBER_COLORS = ['#E85D2F','#3498DB','#2ECC71','#F1C40F','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#D35400','#27AE60'];
export const AVATAR_PRESETS = [
  // Fila 1 — originales
  'aventurero','creativo','tecnico','disenador','ninja','heroe','mago','explorador','lider','builder',
  // Fila 2 — masculinos
  'guerrero','capitan','vikingo','samurai','guardian','cazador','titan','caballero','dragoon','pirata',
  // Fila 3 — nombres masculinos
  'felipe','marcos','andres','carlos','miguel','jorge','diego','roberto','sergio','manuel',
  // Fila 4 — nuevos (10 más)
  'rafael','alejandro','gabriel','antonio','hector','ivan','oscar','ruben','victor','david',
];
