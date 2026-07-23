"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Member, Task, Snippet, WebSite, SharedFile } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import type { VaultProject } from "@/components/VaultSection";
import { api } from "@/lib/api";
import { getSocket, disconnectSocket } from "@/lib/socket";

interface DeleteConfig { type: string; id: string; name: string }

export interface DashboardContextType {
  members: Member[];
  tasks: Task[];
  snippets: Snippet[];
  websites: WebSite[];
  vaultProjects: VaultProject[];
  archivos: SharedFile[];
  saveArchivos: (d: SharedFile[]) => void;
  isVaultUnlocked: boolean;
  setIsVaultUnlocked: (v: boolean) => void;
  currentUser: Member | null;
  isLoading: boolean;
  isLoadingSecondary: boolean;
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
  openTaskModal: boolean;    setOpenTaskModal: (v: boolean) => void;
  openSnippetModal: boolean; setOpenSnippetModal: (v: boolean) => void;
  openVaultModal: boolean;   setOpenVaultModal: (v: boolean) => void;
  openDeleteModal: boolean;  setOpenDeleteModal: (v: boolean) => void;
  deleteConfig: DeleteConfig | null;
  setDeleteConfig: (v: DeleteConfig | null) => void;
  editingTask: Task | null;          setEditingTask: (t: Task | null) => void;
  editingSnippet: Snippet | null;    setEditingSnippet: (s: Snippet | null) => void;
  editingVaultProject: VaultProject | null; setEditingVaultProject: (p: VaultProject | null) => void;
  assignModal: { taskId: string } | null; setAssignModal: (v: { taskId: string } | null) => void;
  handleAddMember: (name: string, role: string, avatarSeed?: string) => void;
  handleDeleteMember: (id: string) => void;
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
  handleSaveWebsite: (data: Partial<WebSite>, id?: string) => Promise<void>;
  handleDeleteWebsite: (id: string) => void;
}

const DashboardContext = createContext<DashboardContextType | null>(null);
export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

function useStableHandlers<T extends Record<string, (...args: any[]) => any>>(handlers: T): T {
  const ref = useRef(handlers);
  ref.current = handlers;
  const stableRef = useRef<T | null>(null);
  if (!stableRef.current) {
    const stable = {} as T;
    for (const key of Object.keys(handlers) as (keyof T)[]) {
      stable[key] = ((...args: unknown[]) => ref.current[key](...args)) as T[keyof T];
    }
    stableRef.current = stable;
  }
  return stableRef.current;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [members,        setMembers]        = useState<Member[]>([]);
  const [tasks,          setTasks]          = useState<Task[]>([]);
  const [snippets,       setSnippets]       = useState<Snippet[]>([]);
  const [websites,       setWebsites]       = useState<WebSite[]>([]);
  const [vaultProjects,  setVaultProjects]  = useState<VaultProject[]>([]);
  const [archivos,       setArchivos]       = useState<SharedFile[]>([]);
  const [isVaultUnlocked, setIsVaultUnlockedState] = useState(true);
  const setIsVaultUnlocked = (v: boolean) => {
    setIsVaultUnlockedState(v);
    if (typeof window !== "undefined") {
      if (v) sessionStorage.setItem("vault-unlocked", "1");
      else sessionStorage.removeItem("vault-unlocked");
    }
  };
  const [currentUser,    setCurrentUser]    = useState<Member | null>(null);
  const [isLoading,      setIsLoading]      = useState(true);
  const [isLoadingSecondary, setIsLoadingSecondary] = useState(true);
  const [isSetup,        setIsSetup]        = useState(false);
  const [showWhoAreYou,  setShowWhoAreYou]  = useState(false);
  const [isToolkitVisible, setIsToolkitVisible] = useState(false);
  const [taskFilterMember, setTaskFilterMember] = useState("all");
  const [snippetSearch,    setSnippetSearch]    = useState("");
  const [openTaskModal,    setOpenTaskModal]    = useState(false);
  const [openSnippetModal, setOpenSnippetModal] = useState(false);
  const [openVaultModal,   setOpenVaultModal]   = useState(false);
  const [openDeleteModal,  setOpenDeleteModal]  = useState(false);
  const [deleteConfig,     setDeleteConfig]     = useState<DeleteConfig | null>(null);
  const [editingTask,      setEditingTask]      = useState<Task | null>(null);
  const [editingSnippet,   setEditingSnippet]   = useState<Snippet | null>(null);
  const [editingVaultProject, setEditingVaultProject] = useState<VaultProject | null>(null);
  const [assignModal,      setAssignModal]      = useState<{ taskId: string } | null>(null);

  const currentUserRef = useRef<Member | null>(null);

  // ── Cargar datos ────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('equipo_dev_token');
    if (!token) { router.replace('/'); return; }

    (async () => {
      try {
        const savedId = localStorage.getItem('equipo_dev_current_member');
        const m = await api.getMembers();
        setMembers(m);

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

        Promise.all([
          api.getTasks(),
          api.getSnippets(),
          api.getVault(),
          api.getWebsites(),
        ]).then(([t, s, v, ws]) => {
          setTasks(t);
          setSnippets(s);
          setVaultProjects(v);
          setWebsites(ws);
        }).catch(err => console.error('Error cargando datos secundarios:', err))
          .finally(() => setIsLoadingSecondary(false));

        api.getSharedFiles()
          .then(af => setArchivos(af))
          .catch(() => setArchivos([]));
      } catch (err) {
        console.error('Error cargando datos:', err);
        toast.error('No se pudo conectar al servidor. ¿Está corriendo el backend?');
        router.replace('/');
        setIsLoadingSecondary(false);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [router]);

  // ── Socket.io ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('equipo_dev_token');
    if (!token) return;

    const socket = getSocket();

    socket.on('connect', () => console.log('🔌 Socket conectado'));
    socket.on('disconnect', () => console.log('🔌 Socket desconectado'));

    socket.on('member:added',   (m: Member) => setMembers(prev => [...prev, m]));
    socket.on('member:updated', (m: Member) => setMembers(prev => prev.map(x => x.id === m.id ? m : x)));
    socket.on('member:deleted', ({ id }: { id: string }) => setMembers(prev => prev.filter(x => x.id !== id)));

    socket.on('task:added',   (t: Task) => setTasks(prev => [t, ...prev]));
    socket.on('task:updated', (t: Task) => setTasks(prev => prev.map(x => x.id === t.id ? { ...x, ...t } : x)));
    socket.on('task:deleted', ({ id }: { id: string }) => setTasks(prev => prev.filter(x => x.id !== id)));

    socket.on('snippet:added',   (s: Snippet) => setSnippets(prev => [s, ...prev]));
    socket.on('snippet:updated', (s: Snippet) => setSnippets(prev => prev.map(x => x.id === s.id ? s : x)));
    socket.on('snippet:deleted', ({ id }: { id: string }) => setSnippets(prev => prev.filter(x => x.id !== id)));

    socket.on('vault:added',   (p: VaultProject) => setVaultProjects(prev => [p, ...prev]));
    socket.on('vault:updated', (p: VaultProject) => setVaultProjects(prev => prev.map(x => x.id === p.id ? p : x)));
    socket.on('vault:deleted', ({ id }: { id: string }) => setVaultProjects(prev => prev.filter(x => x.id !== id)));

    socket.on('website:added',   (w: WebSite) => setWebsites(prev => prev.some(x => x.id === w.id) ? prev : [w, ...prev]));
    socket.on('website:updated', (w: WebSite) => setWebsites(prev => prev.map(x => x.id === w.id ? w : x)));
    socket.on('website:deleted', ({ id }: { id: string }) => setWebsites(prev => prev.filter(x => x.id !== id)));

    socket.on('file:added',   (f: SharedFile) => setArchivos(prev => prev.some(x => x.id === f.id) ? prev : [...prev, f]));
    socket.on('file:updated', (f: SharedFile) => setArchivos(prev => prev.map(x => x.id === f.id ? f : x)));
    socket.on('file:deleted', ({ id }: { id: string }) => setArchivos(prev => prev.filter(x => x.id !== id)));

    return () => {
      socket.off('member:added'); socket.off('member:updated'); socket.off('member:deleted');
      socket.off('task:added');   socket.off('task:updated');   socket.off('task:deleted');
      socket.off('snippet:added');socket.off('snippet:updated');socket.off('snippet:deleted');
      socket.off('vault:added');  socket.off('vault:updated');  socket.off('vault:deleted');
      socket.off('website:added'); socket.off('website:updated'); socket.off('website:deleted');
      socket.off('file:added');   socket.off('file:updated');   socket.off('file:deleted');
    };
  }, []);

  // ── Filtrados ────────────────────────────────────────────────────────────────
  const filteredTasks    = useMemo(() => taskFilterMember === "all" ? tasks : tasks.filter(t => t.assignedTo === taskFilterMember), [tasks, taskFilterMember]);
  const filteredSnippets = useMemo(() => snippets.filter(s =>
    s.title.toLowerCase().includes(snippetSearch.toLowerCase()) ||
    s.content.toLowerCase().includes(snippetSearch.toLowerCase())
  ), [snippets, snippetSearch]);

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
    toast.success(`Bienvenido, ${member.name} 👋`);
  };

  // ── Members ────────────────────────────────────────────────────────────────
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
      if (currentUserRef.current?.id === id) {
        setCurrentUser(updated);
        currentUserRef.current = updated;
      }
      toast.success('Avatar actualizado');
    } catch { toast.error('Error al actualizar avatar'); }
  };

  // ── Tasks ──────────────────────────────────────────────────────────────────
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
    if (!task) { toast.error('Esa tarea ya no existe'); setAssignModal(null); return; }
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

  // ── Snippets ──────────────────────────────────────────────────────────────
  const handleSaveSnippet = async (data: Partial<Snippet>) => {
    try {
      if (editingSnippet) {
        await api.updateSnippet(editingSnippet.id, data);
        toast.success('Snippet actualizado');
      } else {
        await api.addSnippet({ title: data.title || '', content: data.content || '', label: data.label || 'otro', authorId: data.authorId || '' });
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

  // ── Vault ──────────────────────────────────────────────────────────────────
  const handleSaveVaultProject = async (data: Partial<VaultProject>) => {
    try {
      if (editingVaultProject) {
        await api.updateVaultProject(editingVaultProject.id, data);
        toast.success('Proyecto actualizado');
      } else {
        await api.addVaultProject({ name: data.name || '', description: data.description || '', content: '', color: '#3498DB' });
        toast.success('Proyecto agregado a la bóveda');
      }
    } catch { toast.error('Error al guardar proyecto'); }
    setOpenVaultModal(false); setEditingVaultProject(null);
  };

  const handleDeleteVaultProject = async (id: string) => {
    try { await api.deleteVaultProject(id); toast.success('Proyecto eliminado'); } catch { toast.error('Error'); }
  };

  const saveVault = useCallback((newList: VaultProject[]) => {
    setVaultProjects(newList);
    newList.forEach(p => {
      const orig = vaultProjects.find(x => x.id === p.id);
      if (orig && orig.content !== p.content) {
        api.updateVaultProject(p.id, { content: p.content }).catch(console.error);
      }
    });
  }, [vaultProjects]);

  // ── Web Sites ──────────────────────────────────────────────────────────────
  const handleSaveWebsite = async (data: Partial<WebSite>, id?: string) => {
    if (id) {
      await api.updateWebsite(id, data as Record<string, unknown>);
      toast.success('Sitio actualizado');
    } else {
      await api.addWebsite({ ...(data as Record<string, unknown>), authorId: currentUserRef.current?.id || '' });
      toast.success('Sitio agregado');
    }
  };

  const handleDeleteWebsite = async (id: string) => {
    try { await api.deleteWebsite(id); toast.success('Sitio eliminado'); } catch { toast.error('Error al eliminar'); }
  };

  // ── Archivos compartidos ───────────────────────────────────────────────────
  const saveArchivos = useCallback(async (newList: SharedFile[]) => {
    const prev = archivos;
    setArchivos(newList);
    try {
      const added   = newList.filter(f => !prev.find(p => p.id === f.id));
      const removed = prev.filter(p => !newList.find(f => f.id === p.id));
      const moved   = newList.filter(f => { const o = prev.find(p => p.id === f.id); return o && (o.x !== f.x || o.y !== f.y); });
      await Promise.all([
        ...added.map(f => api.addSharedFile(f as unknown as Record<string, unknown>)),
        ...removed.map(f => api.deleteSharedFile(f.id)),
        ...moved.map(f => api.updateSharedFile(f.id, { x: f.x, y: f.y })),
      ]);
    } catch { toast.error('Error al guardar archivos'); }
  }, [archivos]);

  const handlers = useStableHandlers({
    handleAddMember, handleDeleteMember, handleChangeAvatar, selectCurrentUser, handleLogout,
    handleSaveTask, handleChangeTaskStatus, handleStartTask, handleAssignAndStart, handleDeleteTask, handleClearCompleted,
    handleSaveSnippet, handleDeleteSnippet, handleCopySnippet,
    handleSaveVaultProject, handleDeleteVaultProject, saveVault,
    handleSaveWebsite, handleDeleteWebsite,
    saveArchivos,
    setIsVaultUnlocked,
  });

  const contextValue = useMemo<DashboardContextType>(() => ({
    members, tasks, snippets, websites, vaultProjects, archivos,
    isVaultUnlocked,
    currentUser, isLoading, isLoadingSecondary, isSetup, setIsSetup, showWhoAreYou, setShowWhoAreYou,
    taskFilterMember, setTaskFilterMember, filteredTasks,
    snippetSearch, setSnippetSearch, filteredSnippets,
    isToolkitVisible, setIsToolkitVisible,
    openTaskModal, setOpenTaskModal,
    openSnippetModal, setOpenSnippetModal,
    openVaultModal, setOpenVaultModal,
    openDeleteModal, setOpenDeleteModal,
    deleteConfig, setDeleteConfig,
    editingTask, setEditingTask,
    editingSnippet, setEditingSnippet,
    editingVaultProject, setEditingVaultProject,
    assignModal, setAssignModal,
    ...handlers,
  }), [
    members, tasks, snippets, websites, vaultProjects, archivos,
    isVaultUnlocked, currentUser, isLoading, isLoadingSecondary, isSetup, showWhoAreYou,
    taskFilterMember, filteredTasks, snippetSearch, filteredSnippets, isToolkitVisible,
    openTaskModal, openSnippetModal, openVaultModal, openDeleteModal,
    deleteConfig, editingTask, editingSnippet, editingVaultProject, assignModal,
    handlers,
  ]);

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}
