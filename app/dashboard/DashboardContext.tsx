"use client";

import { createContext, useContext, useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Member, Task, Snippet, Note, DrawingPath, BoardImage, BoardShape, CustomShape, SharedFile } from "@/app/dashboard/types";
import { MEMBER_COLORS } from "@/app/dashboard/types";
import type { VaultProject } from "@/components/VaultSection";

// ─── Types ─────────────────────────────────────────────────────────────────────

type BoardSnapshot = { notes: Note[]; images: BoardImage[]; drawings: DrawingPath[]; shapes: BoardShape[]; };

interface DeleteConfig { type: string; id: string; name: string; }

export interface DashboardContextType {
  // Data
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

  // Filters
  taskFilterMember: string;
  setTaskFilterMember: (v: string) => void;
  filteredTasks: Task[];
  snippetSearch: string;
  setSnippetSearch: (v: string) => void;
  filteredSnippets: Snippet[];

  // Toolkit
  isToolkitVisible: boolean;
  setIsToolkitVisible: (v: boolean) => void;

  // Modals
  openMemberModal: boolean;  setOpenMemberModal: (v: boolean) => void;
  openTaskModal: boolean;    setOpenTaskModal: (v: boolean) => void;
  openSnippetModal: boolean; setOpenSnippetModal: (v: boolean) => void;
  openNoteModal: boolean;    setOpenNoteModal: (v: boolean) => void;
  openVaultModal: boolean;   setOpenVaultModal: (v: boolean) => void;
  openDeleteModal: boolean;  setOpenDeleteModal: (v: boolean) => void;
  deleteConfig: DeleteConfig | null;
  setDeleteConfig: (v: DeleteConfig | null) => void;
  editingTask: Task | null;         setEditingTask: (t: Task | null) => void;
  editingSnippet: Snippet | null;   setEditingSnippet: (s: Snippet | null) => void;
  editingVaultProject: VaultProject | null; setEditingVaultProject: (p: VaultProject | null) => void;
  assignModal: { taskId: string } | null; setAssignModal: (v: { taskId: string } | null) => void;

  // Board history
  pushToHistory: () => void;
  undo: () => void;
  redo: () => void;
  clipboard: any;
  setClipboard: (v: any) => void;

  // Handlers — members
  handleAddMember: (name: string, role: string) => void;
  handleDeleteMember: (id: string) => void;
  handleChangeAvatar: (id: string, seed: string) => void;
  selectCurrentUser: (m: Member) => void;
  handleLogout: () => void;

  // Handlers — tasks
  handleSaveTask: (payload: string[] | Partial<Task>) => void;
  handleChangeTaskStatus: (id: string, status: Task["status"]) => void;
  handleStartTask: (id: string) => void;
  handleAssignAndStart: (memberId: string) => void;
  handleDeleteTask: (id: string) => void;
  handleClearCompleted: () => void;

  // Handlers — snippets
  handleSaveSnippet: (data: Partial<Snippet>) => void;
  handleDeleteSnippet: (id: string) => void;
  handleCopySnippet: (c: string) => void;

  // Handlers — vault
  handleSaveVaultProject: (data: Partial<VaultProject>) => void;
  handleDeleteVaultProject: (id: string) => void;
  saveVault: (d: VaultProject[]) => void;

  // Handlers — board
  handleAddNote: (content: string, authorId: string) => void;
  handleDeleteNote: (id: string) => void;
  handleDragNote: (id: string, x: number, y: number, extra?: Partial<Note>) => void;
  handleDragImage: (id: string, x: number, y: number, w?: number, h?: number) => void;
  saveDrawings: (d: DrawingPath[]) => void;
  saveImages: (d: BoardImage[]) => void;
  saveNotes: (d: Note[]) => void;
  saveShapes: (d: BoardShape[]) => void;
  saveCustomShapes: (d: CustomShape[]) => void;

  // Handlers — archivos
  saveArchivos: (d: SharedFile[]) => void;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}

// ─── Provider ──────────────────────────────────────────────────────────────────

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const [members,       setMembers]       = useState<Member[]>([]);
  const [tasks,         setTasks]         = useState<Task[]>([]);
  const [snippets,      setSnippets]      = useState<Snippet[]>([]);
  const [notes,         setNotes]         = useState<Note[]>([]);
  const [drawings,      setDrawings]      = useState<DrawingPath[]>([]);
  const [boardImages,   setBoardImages]   = useState<BoardImage[]>([]);
  const [boardShapes,   setBoardShapes]   = useState<BoardShape[]>([]);
  const [customShapes,  setCustomShapes]  = useState<CustomShape[]>([]);
  const [archivos,      setArchivos]      = useState<SharedFile[]>([]);
  const [vaultProjects, setVaultProjects] = useState<VaultProject[]>([]);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [currentUser,   setCurrentUser]   = useState<Member | null>(null);
  const [isToolkitVisible, setIsToolkitVisible] = useState(true);
  const [isSetup,       setIsSetup]       = useState(false);
  const [isLoading,     setIsLoading]     = useState(true);
  const [showWhoAreYou, setShowWhoAreYou] = useState(false);
  const [clipboard,     setClipboard]     = useState<any>(null);

  const [openMemberModal,  setOpenMemberModal]  = useState(false);
  const [openTaskModal,    setOpenTaskModal]    = useState(false);
  const [openSnippetModal, setOpenSnippetModal] = useState(false);
  const [openNoteModal,    setOpenNoteModal]    = useState(false);
  const [openVaultModal,   setOpenVaultModal]   = useState(false);
  const [openDeleteModal,  setOpenDeleteModal]  = useState(false);
  const [deleteConfig,     setDeleteConfig]     = useState<DeleteConfig | null>(null);
  const [editingTask,       setEditingTask]       = useState<Task | null>(null);
  const [editingSnippet,    setEditingSnippet]    = useState<Snippet | null>(null);
  const [editingVaultProject, setEditingVaultProject] = useState<VaultProject | null>(null);
  const [assignModal,      setAssignModal]      = useState<{ taskId: string } | null>(null);
  const [taskFilterMember, setTaskFilterMember] = useState("all");
  const [snippetSearch,    setSnippetSearch]    = useState("");

  const historyRef = useRef<BoardSnapshot[]>([]);
  const redoRef    = useRef<BoardSnapshot[]>([]);

  // ── Load ──
  useEffect(() => {
    const session = sessionStorage.getItem("equipo_dev_session");
    if (!session) { router.replace("/"); return; }

    const load = (k: string) => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; };
    const m = load("velsat_dev_members");
    if (m) { setMembers(m); } else { setIsSetup(true); }
    const t  = load("velsat_dev_tasks");      if (t)  setTasks(t);
    const s  = load("velsat_dev_snippets");   if (s)  setSnippets(s);
    const n  = load("velsat_dev_notes");      if (n)  setNotes(n);
    const d  = load("velsat_dev_drawings");   if (d)  setDrawings(d);
    const i  = load("velsat_dev_images");     if (i)  setBoardImages(i);
    const sh = load("velsat_dev_shapes");     if (sh) setBoardShapes(sh);
    const cs = load("velsat_custom_shapes");  if (cs) setCustomShapes(cs);
    const a  = load("velsat_dev_archivos");   if (a)  setArchivos(a);
    const v  = load("velsat_dev_vault");      if (v)  setVaultProjects(v);
    const cu = sessionStorage.getItem("equipo_dev_current_user");
    if (cu) { setCurrentUser(JSON.parse(cu)); }
    else if (m && m.length > 0) { setShowWhoAreYou(true); }
    if (!m || m.length === 0) setIsSetup(true);
    setIsLoading(false);
  }, [router]);

  // ── Save helpers ──
  const saveMembers      = (d: Member[])       => { localStorage.setItem("velsat_dev_members",  JSON.stringify(d)); setMembers(d); };
  const saveTasks        = (d: Task[])         => { localStorage.setItem("velsat_dev_tasks",    JSON.stringify(d)); setTasks(d); };
  const saveSnippets     = (d: Snippet[])      => { localStorage.setItem("velsat_dev_snippets", JSON.stringify(d)); setSnippets(d); };
  const saveNotes        = (d: Note[])         => { localStorage.setItem("velsat_dev_notes",    JSON.stringify(d)); setNotes(d); };
  const saveDrawings     = (d: DrawingPath[])  => { localStorage.setItem("velsat_dev_drawings", JSON.stringify(d)); setDrawings(d); };
  const saveImages       = (d: BoardImage[])   => { try { localStorage.setItem("velsat_dev_images",   JSON.stringify(d)); setBoardImages(d); } catch { toast.error("Imagen demasiado grande"); } };
  const saveShapes       = (d: BoardShape[])   => { try { localStorage.setItem("velsat_dev_shapes",   JSON.stringify(d)); setBoardShapes(d); } catch { toast.error("Error guardando formas"); } };
  const saveCustomShapes = (d: CustomShape[])  => { try { localStorage.setItem("velsat_custom_shapes",JSON.stringify(d)); setCustomShapes(d); } catch { toast.error("Error guardando forma custom"); } };
  const saveArchivos     = (d: SharedFile[])   => { try { localStorage.setItem("velsat_dev_archivos", JSON.stringify(d)); setArchivos(d); } catch { toast.error("Archivo demasiado grande"); } };
  const saveVault        = (d: VaultProject[]) => { localStorage.setItem("velsat_dev_vault",    JSON.stringify(d)); setVaultProjects(d); };

  // ── Board history ──
  const getBoardSnapshot = (): BoardSnapshot => ({ notes: [...notes], images: [...boardImages], drawings: [...drawings], shapes: [...boardShapes] });
  const restoreBoardSnapshot = (snap: BoardSnapshot) => { saveNotes(snap.notes); saveImages(snap.images); saveDrawings(snap.drawings); saveShapes(snap.shapes); };
  const pushToHistory = () => {
    const snap = getBoardSnapshot();
    const cur = historyRef.current;
    if (cur.length > 0 && JSON.stringify(cur[0]) === JSON.stringify(snap)) return;
    historyRef.current = [snap, ...cur].slice(0, 30);
    redoRef.current = [];
  };
  const undo = () => {
    const cur = historyRef.current; if (!cur.length) return;
    const [last, ...rest] = cur; historyRef.current = rest;
    redoRef.current = [getBoardSnapshot(), ...redoRef.current].slice(0, 30);
    restoreBoardSnapshot(last); toast.success("↩️ Deshecho");
  };
  const redo = () => {
    const cur = redoRef.current; if (!cur.length) return;
    const [next, ...rest] = cur; redoRef.current = rest;
    historyRef.current = [getBoardSnapshot(), ...historyRef.current].slice(0, 30);
    restoreBoardSnapshot(next); toast.success("Rehecho");
  };

  // ── Filtered ──
  const filteredTasks    = useMemo(() => taskFilterMember === "all" ? tasks : tasks.filter(t => t.assignedTo === taskFilterMember), [tasks, taskFilterMember]);
  const filteredSnippets = useMemo(() => snippets.filter(s => s.title.toLowerCase().includes(snippetSearch.toLowerCase()) || s.content.toLowerCase().includes(snippetSearch.toLowerCase())), [snippets, snippetSearch]);

  // ── Auth ──
  const handleLogout = () => { sessionStorage.removeItem("equipo_dev_session"); sessionStorage.removeItem("equipo_dev_current_user"); router.push("/"); };
  const selectCurrentUser = (member: Member) => {
    sessionStorage.setItem("equipo_dev_current_user", JSON.stringify(member));
    setCurrentUser(member); setShowWhoAreYou(false);
    toast.success(`Bienvenido, ${member.name}`);
  };

  // ── Task alert toast ──
  const showTaskAlert = (title: string) => {
    toast.custom(() => (
      <div style={{ display:"flex", alignItems:"flex-start", gap:12, padding:"14px 16px",
        background:"#0d0f22", border:"1px solid rgba(124,58,237,0.22)", borderRadius:14,
        boxShadow:"0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(124,58,237,0.06)",
        minWidth:290, maxWidth:340, fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ width:36, height:36, borderRadius:10, background:"rgba(124,58,237,0.10)",
          border:"1px solid rgba(124,58,237,0.22)", display:"flex", alignItems:"center",
          justifyContent:"center", flexShrink:0, fontSize:16 }}>🎯</div>
        <div>
          <p style={{ fontWeight:700, color:"#eef0fb", fontSize:13, margin:0, lineHeight:1.3 }}>Nueva tarea asignada</p>
          <p style={{ color:"#a78bfa", fontSize:12, margin:"3px 0 4px", fontWeight:600 }}>{title}</p>
          <p style={{ color:"#4a5070", fontSize:11, margin:0 }}>Ver detalles en <span style={{ color:"#8b91b8", fontWeight:600 }}>Tareas</span></p>
        </div>
      </div>
    ), { duration:6000, position:"bottom-left" });
  };

  // ── Member handlers ──
  const handleAddMember = (name: string, role: string) => {
    const m: Member = { id: crypto.randomUUID(), name, role, color: MEMBER_COLORS[members.length % MEMBER_COLORS.length], avatarSeed: name };
    saveMembers([...members, m]);
    if (isSetup) setIsSetup(false);
    toast.success(`${name} agregado al equipo`);
  };
  const handleDeleteMember = (id: string) => { saveMembers(members.filter(m => m.id !== id)); toast.success("Miembro eliminado"); };
  const handleChangeAvatar = (id: string, seed: string) => {
    const updated = members.map(m => m.id === id ? { ...m, avatarSeed: seed } : m);
    saveMembers(updated);
    if (currentUser?.id === id) {
      const upd = updated.find(m => m.id === id);
      if (upd) { sessionStorage.setItem("equipo_dev_current_user", JSON.stringify(upd)); setCurrentUser(upd); }
    }
    toast.success("Avatar actualizado");
  };

  // ── Task handlers ──
  const handleSaveTask = (payload: string[] | Partial<Task>) => {
    if (Array.isArray(payload)) {
      const newTasks = payload.map(title => ({ id: crypto.randomUUID(), title, status: "pendiente" as const, assignedTo: "", createdAt: Date.now() }));
      saveTasks([...newTasks, ...tasks]);
      toast.success(`${newTasks.length} tarea${newTasks.length > 1 ? "s" : ""} agregada${newTasks.length > 1 ? "s" : ""}`);
    } else if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...payload } as Task : t));
      if (currentUser && payload.assignedTo === currentUser.id && editingTask.assignedTo !== currentUser.id) showTaskAlert(payload.title || editingTask.title);
      toast.success("Tarea actualizada");
    }
    setOpenTaskModal(false); setEditingTask(null);
  };
  const handleChangeTaskStatus = (id: string, status: Task["status"]) =>
    saveTasks(tasks.map(t => t.id === id ? { ...t, status, ...(status === "pendiente" ? { assignedTo: "" } : {}) } : t));
  const handleStartTask = (id: string) => setAssignModal({ taskId: id });
  const handleAssignAndStart = (memberId: string) => {
    if (!assignModal) return;
    const task = tasks.find(t => t.id === assignModal.taskId);
    saveTasks(tasks.map(t => t.id === assignModal.taskId ? { ...t, status: "en progreso" as const, assignedTo: memberId } : t));
    if (currentUser && memberId === currentUser.id && task) showTaskAlert(task.title);
    setAssignModal(null); toast.success("Tarea iniciada");
  };
  const handleDeleteTask     = (id: string) => { saveTasks(tasks.filter(t => t.id !== id)); toast.success("Tarea eliminada"); };
  const handleClearCompleted = () => { saveTasks(tasks.filter(t => t.status !== "completada")); toast.success("Completadas eliminadas"); };

  // ── Snippet handlers ──
  const handleSaveSnippet = (data: Partial<Snippet>) => {
    if (editingSnippet) { saveSnippets(snippets.map(s => s.id === editingSnippet.id ? { ...s, ...data } as Snippet : s)); toast.success("Snippet actualizado"); }
    else { saveSnippets([{ id: crypto.randomUUID(), title: data.title||"", content: data.content||"", label: data.label||"otro", authorId: data.authorId||"", createdAt: Date.now() }, ...snippets]); toast.success("Snippet guardado"); }
    setOpenSnippetModal(false); setEditingSnippet(null);
  };
  const handleDeleteSnippet = (id: string) => { saveSnippets(snippets.filter(s => s.id !== id)); toast.success("Snippet eliminado"); };
  const handleCopySnippet   = (c: string)  => { navigator.clipboard.writeText(c); toast.success("Copiado al portapapeles"); };

  // ── Vault handlers ──
  const handleSaveVaultProject = (data: Partial<VaultProject>) => {
    if (editingVaultProject) {
      saveVault(vaultProjects.map(p => p.id === editingVaultProject.id ? { ...p, ...data } as VaultProject : p));
      toast.success("Proyecto actualizado");
    } else {
      saveVault([{ id: crypto.randomUUID(), name: data.name||"", description: data.description||"", color: MEMBER_COLORS[vaultProjects.length % MEMBER_COLORS.length], content: "", createdAt: Date.now() }, ...vaultProjects]);
      toast.success("Proyecto agregado a la bóveda");
    }
    setOpenVaultModal(false); setEditingVaultProject(null);
  };
  const handleDeleteVaultProject = (id: string) => { saveVault(vaultProjects.filter(p => p.id !== id)); toast.success("Proyecto eliminado"); };

  // ── Note / Board handlers ──
  const handleAddNote = (content: string, authorId: string) => {
    const m = members.find(m => m.id === authorId);
    saveNotes([{ id: crypto.randomUUID(), content, authorId, createdAt: Date.now(), x: 80 + Math.random()*300, y: 80 + Math.random()*200, color: m?.color||"#7c3aed", type: "text" }, ...notes]);
    toast.success("Nota agregada"); setOpenNoteModal(false);
  };
  const handleDeleteNote  = (id: string) => saveNotes(notes.filter(n => n.id !== id));
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
      handleAddMember, handleDeleteMember, handleChangeAvatar, selectCurrentUser, handleLogout,
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
