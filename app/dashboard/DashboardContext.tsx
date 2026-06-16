"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Member, Task, Snippet, Note, DrawingPath, BoardImage, BoardShape, CustomShape, SharedFile } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import type { VaultProject } from "@/components/VaultSection";
import { api } from "@/lib/api";
import { getSocket, disconnectSocket } from "@/lib/socket";

// ─── Types ─────────────────────────────────────────────────────────────────────

type BoardSnapshot = { notes: Note[]; images: BoardImage[]; drawings: DrawingPath[]; shapes: BoardShape[] };
interface DeleteConfig { type: string; id: string; name: string }

// ─── Caché local de la pizarra ───────────────────────────────────────────────
// Guardamos el último estado de la pizarra en localStorage para poder mostrarla
// al instante en un F5, sin esperar a la red. El backend sigue siendo la fuente
// de verdad y reemplaza estos datos cuando responde.
const PIZARRA_CACHE_PREFIX = 'pizarra_cache_';
function readPizarraCache(memberId: string): BoardSnapshot | null {
  if (typeof window === 'undefined' || !memberId) return null;
  try {
    const raw = localStorage.getItem(PIZARRA_CACHE_PREFIX + memberId);
    return raw ? JSON.parse(raw) as BoardSnapshot : null;
  } catch { return null; }
}
function writePizarraCache(memberId: string, snap: BoardSnapshot) {
  if (typeof window === 'undefined' || !memberId) return;
  try { localStorage.setItem(PIZARRA_CACHE_PREFIX + memberId, JSON.stringify(snap)); } catch {}
}
function readCachedBoardForCurrentMember(): BoardSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const id = localStorage.getItem('equipo_dev_current_member');
    return id ? readPizarraCache(id) : null;
  } catch { return null; }
}

export interface DashboardContextType {
  members: Member[];
  tasks: Task[];
  snippets: Snippet[];
  notes: Note[];
  drawings: DrawingPath[];
  boardImages: BoardImage[];
  boardShapes: BoardShape[];
  customShapes: CustomShape[];
  archivos: SharedFile[];
  vaultProjects: VaultProject[];
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (v: boolean) => void;
  currentUser: Member | null;
  isLoading: boolean;
  isSetup: boolean;
  setIsSetup: (v: boolean) => void;
  showWhoAreYou: boolean;
  setShowWhoAreYou: (v: boolean) => void;
  taskFilterMember: string;
  setTaskFilterMember: (v: string) => void;
  filteredTasks: Task[];
  snippetSearch: string;
  setSnippetSearch: (v: string) => void;
  filteredSnippets: Snippet[];
  isToolkitVisible: boolean;
  setIsToolkitVisible: (v: boolean) => void;
  openMemberModal: boolean;  setOpenMemberModal: (v: boolean) => void;
  openTaskModal: boolean;    setOpenTaskModal: (v: boolean) => void;
  openSnippetModal: boolean; setOpenSnippetModal: (v: boolean) => void;
  openNoteModal: boolean;    setOpenNoteModal: (v: boolean) => void;
  openVaultModal: boolean;   setOpenVaultModal: (v: boolean) => void;
  openDeleteModal: boolean;  setOpenDeleteModal: (v: boolean) => void;
  deleteConfig: DeleteConfig | null;
  setDeleteConfig: (v: DeleteConfig | null) => void;
  editingTask: Task | null;          setEditingTask: (t: Task | null) => void;
  editingSnippet: Snippet | null;    setEditingSnippet: (s: Snippet | null) => void;
  editingVaultProject: VaultProject | null; setEditingVaultProject: (p: VaultProject | null) => void;
  assignModal: { taskId: string } | null; setAssignModal: (v: { taskId: string } | null) => void;
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clipboard: unknown;
  setClipboard: (v: unknown) => void;
  handleAddMember: (name: string, role: string, avatarSeed?: string) => void;
  handleDeleteMember: (id: string) => void;
  handleDeleteArchivo: (id: string) => void;
  handleChangeAvatar: (id: string, seed: string) => void;
  selectCurrentUser: (m: Member) => void;
  handleLogout: () => void;
  handleSaveTask: (payload: string[] | Partial<Task>) => void;
  handleChangeTaskStatus: (id: string, status: Task["status"]) => void;
  handleStartTask: (id: string) => void;
  handleAssignAndStart: (memberId: string) => void;
  handleDeleteTask: (id: string) => void;
  handleClearCompleted: () => void;
  handleSaveSnippet: (data: Partial<Snippet>) => void;
  handleDeleteSnippet: (id: string) => void;
  handleCopySnippet: (c: string) => void;
  handleSaveVaultProject: (data: Partial<VaultProject>) => void;
  handleDeleteVaultProject: (id: string) => void;
  saveVault: (d: VaultProject[]) => void;
  handleAddNote: (content: string, authorId: string) => void;
  handleDeleteNote: (id: string) => void;
  handleDragNote: (id: string, x: number, y: number, extra?: Partial<Note>) => void;
  handleDragImage: (id: string, x: number, y: number, w?: number, h?: number) => void;
  saveDrawings: (d: DrawingPath[]) => void;
  saveImages: (d: BoardImage[]) => void;
  saveNotes: (d: Note[]) => void;
  saveShapes: (d: BoardShape[]) => void;
  saveCustomShapes: (d: CustomShape[]) => void;
  saveArchivos: (d: SharedFile[]) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [members,        setMembers]        = useState<Member[]>([]);
  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [snippets,       setSnippets]       = useState<Snippet[]>([]);
  // Hidratación instantánea desde la caché local (se reemplaza al responder el backend)
  const [notes,          setNotes]          = useState<Note[]>(() => readCachedBoardForCurrentMember()?.notes ?? []);
  const [drawings,       setDrawings]       = useState<DrawingPath[]>(() => readCachedBoardForCurrentMember()?.drawings ?? []);
  const [boardImages,    setBoardImages]     = useState<BoardImage[]>(() => readCachedBoardForCurrentMember()?.images ?? []);
  const [boardShapes,    setBoardShapes]     = useState<BoardShape[]>(() => readCachedBoardForCurrentMember()?.shapes ?? []);
  const [customShapes,   setCustomShapes]   = useState<CustomShape[]>([]);
  const [archivos,       setArchivos]       = useState<SharedFile[]>([]);
  const [vaultProjects,  setVaultProjects]  = useState<VaultProject[]>([]);
  const [isVaultUnlocked, setIsVaultUnlockedState] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined" && sessionStorage.getItem("vault-unlocked") === "1") {
      setIsVaultUnlockedState(true);
    }
  }, []);
  const setIsVaultUnlocked = (v: boolean) => {
    setIsVaultUnlockedState(v);
    if (typeof window !== "undefined") {
      if (v) sessionStorage.setItem("vault-unlocked", "1");
      else sessionStorage.removeItem("vault-unlocked");
    }
  };
  const [currentUser,    setCurrentUser]    = useState<Member | null>(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [isSetup,        setIsSetup]        = useState(false);
  const [showWhoAreYou,  setShowWhoAreYou]  = useState(false);
  const [isToolkitVisible, setIsToolkitVisible] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1320 : false);
  const [clipboard,      setClipboard]      = useState<unknown>(null);
  const [taskFilterMember, setTaskFilterMember] = useState("all");
  const [snippetSearch,    setSnippetSearch]    = useState("");
  const [openMemberModal,  setOpenMemberModal]  = useState(false);
  const [openTaskModal,    setOpenTaskModal]    = useState(false);
  const [openSnippetModal, setOpenSnippetModal] = useState(false);
  const [openNoteModal,    setOpenNoteModal]    = useState(false);
  const [openVaultModal,   setOpenVaultModal]   = useState(false);
  const [openDeleteModal,  setOpenDeleteModal]  = useState(false);
  const [deleteConfig,     setDeleteConfig]     = useState<DeleteConfig | null>(null);
  const [editingTask,      setEditingTask]      = useState<Task | null>(null);
  const [editingSnippet,   setEditingSnippet]   = useState<Snippet | null>(null);
  const [editingVaultProject, setEditingVaultProject] = useState<VaultProject | null>(null);
  const [assignModal,      setAssignModal]      = useState<{ taskId: string } | null>(null);

  const historyRef = useRef<BoardSnapshot[]>([]);
  const redoRef    = useRef<BoardSnapshot[]>([]);
  const currentUserRef = useRef<Member | null>(null);
  const pizarraTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Cargar datos del backend ────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('equipo_dev_token');
    if (!token) { router.replace('/'); return; }

    (async () => {
      try {
        const savedId = localStorage.getItem('equipo_dev_current_member');
        // La pizarra ya se hidrató desde caché (estado inicial). Lanzamos su carga
        // del backend EN PARALELO, sin esperar al resto de secciones.
        if (savedId) loadPizarra(savedId);

        // Datos críticos para desbloquear la UI: miembros + formas personalizadas
        const [m, cs] = await Promise.all([
          api.getMembers(),
          api.getCustomShapes(),
        ]);
        setMembers(m);
        setCustomShapes(cs);

        if (!m || m.length === 0) {
          setIsSetup(true);
        } else {
          const found = m.find((mem: Member) => mem.id === savedId);
          if (found) {
            setCurrentUser(found);
            currentUserRef.current = found;
          } else {
            setShowWhoAreYou(true);
          }
        }
        setIsLoading(false);

        // Secciones secundarias en segundo plano: no bloquean la pizarra
        Promise.all([
          api.getTasks(),
          api.getSnippets(),
          api.getVault(),
          api.getSharedFiles(),
        ]).then(([t, s, v, sf]) => {
          setTasks(t);
          setSnippets(s);
          setVaultProjects(v);
          setArchivos(sf);
        }).catch(err => console.error('Error cargando datos secundarios:', err));
      } catch (err) {
        console.error('Error cargando datos:', err);
        toast.error('No se pudo conectar al servidor. ¿Está corriendo el backend?');
        router.replace('/');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  // ── Socket.io — tiempo real ──────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('equipo_dev_token');
    if (!token) return;

    const socket = getSocket();

    socket.on('connect', () => console.log('🔌 Socket conectado'));
    socket.on('disconnect', () => console.log('🔌 Socket desconectado'));

    // Members
    socket.on('member:added',   (m: Member)   => setMembers(prev => [...prev, m]));
    socket.on('member:updated', (m: Member)   => setMembers(prev => prev.map(x => x.id === m.id ? m : x)));
    socket.on('member:deleted', ({ id }: { id: string }) => setMembers(prev => prev.filter(x => x.id !== id)));

    // Tasks
    socket.on('task:added',   (t: Task)   => setTasks(prev => [t, ...prev]));
    socket.on('task:updated', (t: Task)   => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)));
    socket.on('task:deleted', ({ id }: { id: string }) => setTasks(prev => prev.filter(x => x.id !== id)));

    // Snippets
    socket.on('snippet:added',   (s: Snippet) => setSnippets(prev => [s, ...prev]));
    socket.on('snippet:updated', (s: Snippet) => setSnippets(prev => prev.map(x => x.id === s.id ? s : x)));
    socket.on('snippet:deleted', ({ id }: { id: string }) => setSnippets(prev => prev.filter(x => x.id !== id)));

    // Notes (pizarra compartida - solo si hubiera)
    socket.on('note:added',   (n: Note)   => setNotes(prev => [...prev, n]));
    socket.on('note:updated', (n: Note)   => setNotes(prev => prev.map(x => x.id === n.id ? n : x)));
    socket.on('note:deleted', ({ id }: { id: string }) => setNotes(prev => prev.filter(x => x.id !== id)));

    // Vault
    socket.on('vault:added',   (p: VaultProject) => setVaultProjects(prev => [p, ...prev]));
    socket.on('vault:updated', (p: VaultProject) => setVaultProjects(prev => prev.map(x => x.id === p.id ? p : x)));
    socket.on('vault:deleted', ({ id }: { id: string }) => setVaultProjects(prev => prev.filter(x => x.id !== id)));

    // Custom shapes (compartidas)
    socket.on('shape:added',   (s: CustomShape)   => setCustomShapes(prev => [...prev, s]));
    socket.on('shape:deleted', ({ id }: { id: string }) => setCustomShapes(prev => prev.filter(x => x.id !== id)));

    // Archivos compartidos
    socket.on('file:added',   (f: SharedFile) => setArchivos(prev => [...prev, f]));
    socket.on('file:updated', (f: SharedFile) => setArchivos(prev => prev.map(x => x.id === f.id ? f : x)));
    socket.on('file:deleted', ({ id }: { id: string }) => setArchivos(prev => prev.filter(x => x.id !== id)));

    return () => {
      socket.off('member:added'); socket.off('member:updated'); socket.off('member:deleted');
      socket.off('task:added');   socket.off('task:updated');   socket.off('task:deleted');
      socket.off('snippet:added');socket.off('snippet:updated');socket.off('snippet:deleted');
      socket.off('note:added');   socket.off('note:updated');   socket.off('note:deleted');
      socket.off('vault:added');  socket.off('vault:updated');  socket.off('vault:deleted');
      socket.off('shape:added');  socket.off('shape:deleted');
      socket.off('file:added');   socket.off('file:updated'); socket.off('file:deleted');
    };
  }, []);

  // ── Cargar / guardar pizarra personal ──────────────────────────────────────

  const loadPizarra = useCallback(async (memberId: string) => {
    try {
      const data = await api.getPizarra(memberId);
      const notes    = data.notes    ?? [];
      const drawings = data.drawings ?? [];
      const images   = data.images   ?? [];
      const shapes   = data.shapes   ?? [];
      setNotes(notes);
      setDrawings(drawings);
      setBoardImages(images);
      setBoardShapes(shapes);
      // Actualizar la caché local con lo que dice el backend (fuente de verdad)
      writePizarraCache(memberId, { notes, images, drawings, shapes });

      // Unirse a la sala personal de la pizarra
      getSocket().emit('join:pizarra', memberId);
    } catch (e) {
      console.warn('Sin datos de pizarra para este miembro');
    }
  }, []);

  const savePizarraDebounced = useCallback((memberId: string, data: {
    notes: Note[], drawings: DrawingPath[], images: BoardImage[], shapes: BoardShape[]
  }) => {
    // Guardar en caché local de inmediato → F5 muestra la pizarra al instante
    writePizarraCache(memberId, { notes: data.notes, images: data.images, drawings: data.drawings, shapes: data.shapes });
    if (pizarraTimerRef.current) clearTimeout(pizarraTimerRef.current);
    pizarraTimerRef.current = setTimeout(() => {
      api.savePizarra(memberId, data).catch(console.error);
    }, 800); // guardar 800ms después del último cambio
  }, []);

  // ── Board history ───────────────────────────────────────────────────────────

  const getBoardSnapshot = (): BoardSnapshot => ({
    notes: [...notes], images: [...boardImages], drawings: [...drawings], shapes: [...boardShapes]
  });

  const pushToHistory = () => {
    const snap = getBoardSnapshot();
    if (historyRef.current.length && JSON.stringify(historyRef.current[0]) === JSON.stringify(snap)) return;
    historyRef.current = [snap, ...historyRef.current].slice(0, 30);
    redoRef.current = [];
  };

  const undo = () => {
    const [last, ...rest] = historyRef.current;
    if (!last) return;
    historyRef.current = rest;
    redoRef.current = [getBoardSnapshot(), ...redoRef.current].slice(0, 30);
    setNotes(last.notes); setBoardImages(last.images); setDrawings(last.drawings); setBoardShapes(last.shapes);
    toast.success("↩️ Deshecho");
  };

  const redo = () => {
    const [next, ...rest] = redoRef.current;
    if (!next) return;
    redoRef.current = rest;
    historyRef.current = [getBoardSnapshot(), ...historyRef.current].slice(0, 30);
    setNotes(next.notes); setBoardImages(next.images); setDrawings(next.drawings); setBoardShapes(next.shapes);
    toast.success("Rehecho");
  };

  // ── Filtrados ───────────────────────────────────────────────────────────────

  const filteredTasks    = useMemo(() => taskFilterMember === "all" ? tasks : tasks.filter(t => t.assignedTo === taskFilterMember), [tasks, taskFilterMember]);
  const filteredSnippets = useMemo(() => snippets.filter(s =>
    s.title.toLowerCase().includes(snippetSearch.toLowerCase()) ||
    s.content.toLowerCase().includes(snippetSearch.toLowerCase())
  ), [snippets, snippetSearch]);

  // ── Pizarra save helpers ────────────────────────────────────────────────────
  // Cada vez que cambia algo de la pizarra, lo sincronizamos con el backend

  const syncPizarra = useCallback((patch: {
    notes?: Note[], drawings?: DrawingPath[], images?: BoardImage[], shapes?: BoardShape[]
  }) => {
    const uid = currentUserRef.current?.id;
    if (!uid) return;
    savePizarraDebounced(uid, {
      notes:    patch.notes    ?? notes,
      drawings: patch.drawings ?? drawings,
      images:   patch.images   ?? boardImages,
      shapes:   patch.shapes   ?? boardShapes,
    });
  }, [notes, drawings, boardImages, boardShapes, savePizarraDebounced]);

  const saveNotes        = (d: Note[])        => { setNotes(d);       syncPizarra({ notes: d }); };
  const saveDrawings     = (d: DrawingPath[])  => { setDrawings(d);    syncPizarra({ drawings: d }); };
  const saveImages       = (d: BoardImage[])   => { setBoardImages(d); syncPizarra({ images: d }); };
  const saveShapes       = (d: BoardShape[])   => { setBoardShapes(d); syncPizarra({ shapes: d }); };
  const customShapesRef = useRef<CustomShape[]>([]);
  useEffect(() => { customShapesRef.current = customShapes; }, [customShapes]);

  const saveCustomShapes = useCallback((newList: CustomShape[]) => {
    const prev = customShapesRef.current;
    const prevIds = new Set(prev.map(s => s.id));
    const newIds  = new Set(newList.map(s => s.id));

    // Nuevas formas → API emitirá shape:added → socket actualiza state
    newList.filter(s => !prevIds.has(s.id)).forEach(s => {
      api.addCustomShape({ ...s }).catch(console.error);
    });

    // Formas eliminadas → API emitirá shape:deleted → socket actualiza state
    prev.filter(s => !newIds.has(s.id)).forEach(s => {
      api.deleteCustomShape(s.id).catch(console.error);
    });

    // Si solo hay cambios locales sin add/delete, actualizar state directamente
    const hasStructural = prev.some(s => !newIds.has(s.id)) || newList.some(s => !prevIds.has(s.id));
    if (!hasStructural) setCustomShapes(newList);
  }, []);

  // Archivos compartidos: comparar con estado actual para detectar add / delete / move
  const archivosRef = useRef<SharedFile[]>([]);
  useEffect(() => { archivosRef.current = archivos; }, [archivos]);

  const saveArchivos = useCallback((newList: SharedFile[]) => {
    const prev = archivosRef.current;
    const prevIds = new Set(prev.map(f => f.id));
    const newIds  = new Set(newList.map(f => f.id));

    const deletions = prev.filter(f => !newIds.has(f.id));
    const additions = newList.filter(f => !prevIds.has(f.id));

    // Archivos eliminados → API emitirá file:deleted → socket actualiza el state
    deletions.forEach(f => {
      api.deleteSharedFile(f.id).catch(console.error);
    });

    // Archivos nuevos → API emitirá file:added → socket actualiza el state
    // NO llamamos setArchivos aquí para evitar duplicados con el socket
    additions.forEach(f => {
      api.addSharedFile({ ...f }).catch(console.error);
    });

    // Solo mover (sin add/delete): actualizar state local inmediatamente
    // + guardar posición en backend (sin socket broadcast de posición)
    if (deletions.length === 0 && additions.length === 0) {
      newList.forEach(f => {
        const old = prev.find(p => p.id === f.id);
        if (old && (old.x !== f.x || old.y !== f.y)) {
          api.updateSharedFile(f.id, { x: f.x, y: f.y }).catch(console.error);
        }
      });
      setArchivos(newList);
    }
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    localStorage.removeItem('equipo_dev_token');
    localStorage.removeItem('equipo_dev_current_member');
    disconnectSocket();
    router.push('/');
  };

  const selectCurrentUser = (member: Member) => {
    localStorage.setItem('equipo_dev_current_member', member.id);
    setCurrentUser(member);
    currentUserRef.current = member;
    setShowWhoAreYou(false);
    loadPizarra(member.id);
    toast.success(`Bienvenido, ${member.name} 👋`);
  };

  // ── Members ─────────────────────────────────────────────────────────────────

  const handleAddMember = async (name: string, role: string, avatarSeed?: string) => {
    const seed = (avatarSeed && avatarSeed.trim()) ? avatarSeed.trim() : AVATAR_PRESETS[0];
    try {
      await api.addMember(name, role, seed);
      toast.success(`${name} agregado al equipo`);
    } catch { toast.error('Error al agregar miembro'); }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await api.deleteMember(id);
      toast.success('Miembro eliminado');
    } catch { toast.error('Error al eliminar'); }
  };

  const handleChangeAvatar = async (id: string, seed: string) => {
    try {
      const updated = await api.updateMember(id, { avatarSeed: seed });
      // también actualizar currentUser si es el mismo
      if (currentUserRef.current?.id === id) {
        setCurrentUser(updated);
        currentUserRef.current = updated;
      }
      toast.success('Avatar actualizado');
    } catch { toast.error('Error al actualizar avatar'); }
  };

  // ── Tasks ────────────────────────────────────────────────────────────────────

  const handleSaveTask = async (payload: string[] | Partial<Task>) => {
    try {
      if (Array.isArray(payload)) {
        await Promise.all(payload.map(title =>
          api.addTask({ title, status: 'pendiente', assignedTo: '' })
        ));
        toast.success(`${payload.length} tarea${payload.length > 1 ? 's' : ''} agregada${payload.length > 1 ? 's' : ''}`);
      } else if (editingTask) {
        await api.updateTask(editingTask.id, payload);
        toast.success('Tarea actualizada');
      }
    } catch { toast.error('Error al guardar tarea'); }
    setOpenTaskModal(false); setEditingTask(null);
  };

  const handleChangeTaskStatus = async (id: string, status: Task["status"]) => {
    const patch: Partial<Task> = { status };
    if (status === 'pendiente') patch.assignedTo = '';
    try { await api.updateTask(id, patch); } catch { toast.error('Error'); }
  };

  const handleStartTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    if (task.assignedTo) {
      try {
        await api.updateTask(id, { status: 'en progreso' });
        toast.success('Tarea iniciada');
      } catch { toast.error('Error'); }
    } else {
      setAssignModal({ taskId: id });
    }
  };

  const handleAssignAndStart = async (memberId: string) => {
    if (!assignModal) return;
    const task = tasks.find(t => t.id === assignModal.taskId);
    try {
      await api.updateTask(assignModal.taskId, { status: 'en progreso', assignedTo: memberId });
      toast.success('Tarea iniciada');
    } catch { toast.error('Error'); }
    setAssignModal(null);
  };

  const handleDeleteTask = async (id: string) => {
    try { await api.deleteTask(id); toast.success('Tarea eliminada'); } catch { toast.error('Error'); }
  };

  const handleClearCompleted = async () => {
    const completed = tasks.filter(t => t.status === 'completada');
    try {
      await Promise.all(completed.map(t => api.deleteTask(t.id)));
      toast.success('Completadas eliminadas');
    } catch { toast.error('Error'); }
  };

  // ── Snippets ──────────────────────────────────────────────────────────────────

  const handleSaveSnippet = async (data: Partial<Snippet>) => {
    try {
      if (editingSnippet) {
        await api.updateSnippet(editingSnippet.id, data);
        toast.success('Snippet actualizado');
      } else {
        await api.addSnippet({ title: data.title||'', content: data.content||'', label: data.label||'otro', authorId: data.authorId||'' });
        toast.success('Snippet guardado');
      }
    } catch { toast.error('Error al guardar snippet'); }
    setOpenSnippetModal(false); setEditingSnippet(null);
  };

  const handleDeleteSnippet = async (id: string) => {
    try { await api.deleteSnippet(id); toast.success('Snippet eliminado'); } catch { toast.error('Error'); }
  };

  const handleCopySnippet = (c: string) => {
    navigator.clipboard.writeText(c);
    toast.success('Copiado al portapapeles');
  };

  // ── Vault ─────────────────────────────────────────────────────────────────────

  const handleSaveVaultProject = async (data: Partial<VaultProject>) => {
    try {
      if (editingVaultProject) {
        await api.updateVaultProject(editingVaultProject.id, data);
        toast.success('Proyecto actualizado');
      } else {
        await api.addVaultProject({ name: data.name||'', description: data.description||'', content: '', color: '#3498DB' });
        toast.success('Proyecto agregado a la bóveda');
      }
    } catch { toast.error('Error al guardar proyecto'); }
    setOpenVaultModal(false); setEditingVaultProject(null);
  };

  const handleDeleteVaultProject = async (id: string) => {
    try { await api.deleteVaultProject(id); toast.success('Proyecto eliminado'); } catch { toast.error('Error'); }
  };

  // Llamado desde VaultSection cuando editan el contenido inline
  const saveVault = useCallback((newList: VaultProject[]) => {
    setVaultProjects(newList);
    // Detectar el proyecto que cambió y hacer PATCH
    newList.forEach(p => {
      const orig = vaultProjects.find(x => x.id === p.id);
      if (orig && orig.content !== p.content) {
        api.updateVaultProject(p.id, { content: p.content }).catch(console.error);
      }
    });
  }, [vaultProjects]);

  // ── Board handlers ────────────────────────────────────────────────────────────

  const handleAddNote = (content: string, authorId: string) => {
    const member = members.find(m => m.id === authorId);
    const note: Note = {
      id: crypto.randomUUID(), content, authorId, createdAt: Date.now(),
      x: 80 + Math.random()*300, y: 80 + Math.random()*200,
      color: member?.color || 'var(--blue)', type: 'text',
    };
    saveNotes([note, ...notes]);
    toast.success('Nota agregada'); setOpenNoteModal(false);
  };

  const handleDeleteNote    = (id: string) => saveNotes(notes.filter(n => n.id !== id));
  const handleDeleteArchivo = async (id: string) => {
    try { await api.deleteSharedFile(id); toast.success('Archivo eliminado'); } catch { toast.error('Error'); }
  };
  const handleDragNote    = (id: string, x: number, y: number, extra?: Partial<Note>) =>
    saveNotes(notes.map(n => n.id === id ? { ...n, x, y, ...extra } : n));
  const handleDragImage   = (id: string, x: number, y: number, w?: number, h?: number) =>
    saveImages(boardImages.map(img => img.id === id ? { ...img, x, y, width: w||img.width, height: h||img.height } : img));

  return (
    <DashboardContext.Provider value={{
      members, tasks, snippets, notes, drawings, boardImages, boardShapes, customShapes, archivos, vaultProjects,
      isVaultUnlocked, setIsVaultUnlocked,
      currentUser, isLoading, isSetup, setIsSetup, showWhoAreYou, setShowWhoAreYou,
      taskFilterMember, setTaskFilterMember, filteredTasks,
      snippetSearch, setSnippetSearch, filteredSnippets,
      isToolkitVisible, setIsToolkitVisible,
      openMemberModal, setOpenMemberModal,
      openTaskModal, setOpenTaskModal,
      openSnippetModal, setOpenSnippetModal,
      openNoteModal, setOpenNoteModal,
      openVaultModal, setOpenVaultModal,
      openDeleteModal, setOpenDeleteModal,
      deleteConfig, setDeleteConfig,
      editingTask, setEditingTask,
      editingSnippet, setEditingSnippet,
      editingVaultProject, setEditingVaultProject,
      assignModal, setAssignModal,
      pushToHistory, undo, redo, clipboard, setClipboard,
      handleAddMember, handleDeleteMember, handleDeleteArchivo, handleChangeAvatar, selectCurrentUser, handleLogout,
      handleSaveTask, handleChangeTaskStatus, handleStartTask, handleAssignAndStart, handleDeleteTask, handleClearCompleted,
      handleSaveSnippet, handleDeleteSnippet, handleCopySnippet,
      handleSaveVaultProject, handleDeleteVaultProject, saveVault,
      handleAddNote, handleDeleteNote, handleDragNote, handleDragImage,
      saveDrawings, saveImages, saveNotes, saveShapes, saveCustomShapes, saveArchivos,
    }}>
      {children}
    </DashboardContext.Provider>
  );
}
