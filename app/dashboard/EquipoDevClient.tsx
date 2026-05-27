"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users, CheckSquare, Code, StickyNote, Plus,
  Settings, FolderOpen, LogOut, Shield, Sparkles
} from "lucide-react";
import ButtonBase from "@/components/ui/ButtonBase";
import ModalBase from "@/components/modal/ModalBase";
import ModalEliminar from "@/components/modal/ModalEliminar";
import { toast, Toaster } from "sonner";
import DevToolkit from "@/components/DevToolkit";
import { SectionBoveda, VaultProjectForm, type VaultProject } from "@/components/VaultSection";

// ─── Tipos y constantes ───────────────────────────────────────────────────────
import type { Member, Task, Snippet, Note, DrawingPath, BoardImage, BoardShape, CustomShape, SharedFile, Tab } from "@/app/dashboard/types";
import { MEMBER_COLORS } from "@/app/dashboard/types";

// ─── Componentes compartidos ──────────────────────────────────────────────────
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import TabBtn from "@/app/dashboard/components/TabBtn";

// ─── Secciones ────────────────────────────────────────────────────────────────
import SectionEquipo from "@/app/dashboard/sections/SectionEquipo";
import SectionTareas from "@/app/dashboard/sections/SectionTareas";
import SectionSnippets from "@/app/dashboard/sections/SectionSnippets";
import SectionPizarra from "@/app/dashboard/sections/SectionPizarra";
import SectionArchivos from "@/app/dashboard/sections/SectionArchivos";
import SectionAjustes from "@/app/dashboard/sections/SectionAjustes";

// ─── Formularios ──────────────────────────────────────────────────────────────
import MemberForm from "@/app/dashboard/forms/MemberForm";
import MemberPicker from "@/app/dashboard/forms/MemberPicker";
import TaskForm from "@/app/dashboard/forms/TaskForm";
import SnippetForm from "@/app/dashboard/forms/SnippetForm";
import NoteForm from "@/app/dashboard/forms/NoteForm";

// ─── Pantallas ────────────────────────────────────────────────────────────────
import SetupScreen from "@/app/dashboard/screens/SetupScreen";
import WhoAreYouScreen from "@/app/dashboard/screens/WhoAreYouScreen";

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EquipoDevClient() {
  const router = useRouter();
  const [activeTab, setActiveTab]       = useState<Tab>('equipo');
  const [members, setMembers]           = useState<Member[]>([]);
  const [tasks, setTasks]               = useState<Task[]>([]);
  const [snippets, setSnippets]         = useState<Snippet[]>([]);
  const [notes, setNotes]               = useState<Note[]>([]);
  const [drawings, setDrawings]         = useState<DrawingPath[]>([]);
  const [boardImages, setBoardImages]   = useState<BoardImage[]>([]);
  const [boardShapes, setBoardShapes]   = useState<BoardShape[]>([]);
  const [customShapes, setCustomShapes] = useState<CustomShape[]>([]);
  const [archivos, setArchivos]         = useState<SharedFile[]>([]);
  const [vaultProjects, setVaultProjects] = useState<VaultProject[]>([]);
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [currentUser, setCurrentUser]   = useState<Member | null>(null);
  const [isToolkitVisible, setIsToolkitVisible] = useState(true);
  const [isSetup, setIsSetup]           = useState(false);
  const [isLoading, setIsLoading]       = useState(true);
  const [showWhoAreYou, setShowWhoAreYou] = useState(false);

  const [openMemberModal, setOpenMemberModal]   = useState(false);
  const [openTaskModal, setOpenTaskModal]       = useState(false);
  const [openSnippetModal, setOpenSnippetModal] = useState(false);
  const [openNoteModal, setOpenNoteModal]       = useState(false);
  const [openVaultModal, setOpenVaultModal]     = useState(false);
  const [openDeleteModal, setOpenDeleteModal]   = useState(false);
  const [deleteConfig, setDeleteConfig] = useState<{ type: string; id: string; name: string } | null>(null);
  const [editingTask, setEditingTask]       = useState<Task | null>(null);
  const [assignModal, setAssignModal]       = useState<{ taskId: string } | null>(null);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  const [editingVaultProject, setEditingVaultProject] = useState<VaultProject | null>(null);

  const historyRef = useRef<{ notes: Note[]; images: BoardImage[]; drawings: DrawingPath[] }[]>([]);
  const [clipboard, setClipboard] = useState<any>(null);

  const pushToHistory = () => {
    const snap = { notes: [...notes], images: [...boardImages], drawings: [...drawings] };
    const cur = historyRef.current;
    if (cur.length > 0 && JSON.stringify(cur[0]) === JSON.stringify(snap)) return;
    historyRef.current = [snap, ...cur].slice(0, 30);
  };

  // Auto-hide toolkit when entering Pizarra, show when leaving
  useEffect(() => {
    if (activeTab === 'pizarra') {
      setIsToolkitVisible(false);
    } else {
      setIsToolkitVisible(true);
    }
  }, [activeTab]);
  const undo = () => {
    const cur = historyRef.current; if (!cur.length) return;
    const [last, ...rest] = cur; historyRef.current = rest;
    saveNotes(last.notes); saveImages(last.images); saveDrawings(last.drawings);
    toast.success("↩️ Deshecho");
  };

  const [taskFilterMember, setTaskFilterMember] = useState('all');
  const [snippetSearch, setSnippetSearch]       = useState('');

  useEffect(() => {
    const session = sessionStorage.getItem("equipo_dev_session");
    if (!session) { router.replace("/"); return; }

    const load = (k: string) => { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; };
    const m = load("velsat_dev_members");
    if (m) { setMembers(m); } else { setIsSetup(true); }

    const t = load("velsat_dev_tasks");    if (t) setTasks(t);
    const s = load("velsat_dev_snippets"); if (s) setSnippets(s);
    const n = load("velsat_dev_notes");    if (n) setNotes(n);
    const d = load("velsat_dev_drawings"); if (d) setDrawings(d);
    const i = load("velsat_dev_images");   if (i) setBoardImages(i);
    const sh = load("velsat_dev_shapes");  if (sh) setBoardShapes(sh);
    const cs = load("velsat_custom_shapes"); if (cs) setCustomShapes(cs);
    const a = load("velsat_dev_archivos"); if (a) setArchivos(a);
    const v = load("velsat_dev_vault");    if (v) setVaultProjects(v);

    const cu = sessionStorage.getItem("equipo_dev_current_user");
    if (cu) { setCurrentUser(JSON.parse(cu)); }
    else if (m && m.length > 0) { setShowWhoAreYou(true); }

    if (!m || m.length === 0) setIsSetup(true);
    setIsLoading(false);
  }, [router]);

  const saveMembers  = (d: Member[])      => { localStorage.setItem("velsat_dev_members",  JSON.stringify(d)); setMembers(d); };
  const saveTasks    = (d: Task[])        => { localStorage.setItem("velsat_dev_tasks",    JSON.stringify(d)); setTasks(d); };
  const saveSnippets = (d: Snippet[])     => { localStorage.setItem("velsat_dev_snippets", JSON.stringify(d)); setSnippets(d); };
  const saveNotes    = (d: Note[])        => { localStorage.setItem("velsat_dev_notes",    JSON.stringify(d)); setNotes(d); };
  const saveDrawings = (d: DrawingPath[]) => { localStorage.setItem("velsat_dev_drawings", JSON.stringify(d)); setDrawings(d); };
  const saveImages   = (d: BoardImage[])  => { try { localStorage.setItem("velsat_dev_images", JSON.stringify(d)); setBoardImages(d); } catch { toast.error("Imagen demasiado grande"); } };
  const saveShapes       = (d: BoardShape[])   => { try { localStorage.setItem("velsat_dev_shapes",   JSON.stringify(d)); setBoardShapes(d); } catch { toast.error("Error guardando formas"); } };
  const saveCustomShapes = (d: CustomShape[])  => { try { localStorage.setItem("velsat_custom_shapes", JSON.stringify(d)); setCustomShapes(d); } catch { toast.error("Error guardando forma custom"); } };
  const saveArchivos = (d: SharedFile[])  => { try { localStorage.setItem("velsat_dev_archivos", JSON.stringify(d)); setArchivos(d); } catch { toast.error("Archivo demasiado grande"); } };
  const saveVault    = (d: VaultProject[]) => { localStorage.setItem("velsat_dev_vault",    JSON.stringify(d)); setVaultProjects(d); };

  const handleLogout = () => { sessionStorage.removeItem("equipo_dev_session"); sessionStorage.removeItem("equipo_dev_current_user"); router.push("/"); };

  const selectCurrentUser = (member: Member) => {
    sessionStorage.setItem("equipo_dev_current_user", JSON.stringify(member));
    setCurrentUser(member);
    setShowWhoAreYou(false);
    toast.success(`Bienvenido, ${member.name}`);
  };

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

  const handleSaveTask = (payload: string[] | Partial<Task>) => {
    if (Array.isArray(payload)) {
      const newTasks = payload.map(title => ({ id: crypto.randomUUID(), title, status: 'pendiente' as const, assignedTo: '', createdAt: Date.now() }));
      saveTasks([...newTasks, ...tasks]);
      toast.success(`${newTasks.length} tarea${newTasks.length > 1 ? 's' : ''} agregada${newTasks.length > 1 ? 's' : ''}`);
    } else if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...payload } as Task : t));
      if (currentUser && payload.assignedTo === currentUser.id && editingTask.assignedTo !== currentUser.id) {
        showTaskAlert(payload.title || editingTask.title);
      }
      toast.success("Tarea actualizada");
    }
    setOpenTaskModal(false); setEditingTask(null);
  };

  const showTaskAlert = (title: string) => {
    toast.custom(() => (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
        background: '#0E1118', border: '1px solid rgba(255,87,51,0.2)', borderRadius: 12,
        boxShadow: '0 12px 32px rgba(0,0,0,0.5)', minWidth: 290, maxWidth: 340,
        fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,87,51,0.08)',
          border: '1px solid rgba(255,87,51,0.15)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, fontSize: 16 }}>🎯</div>
        <div>
          <p style={{ fontWeight: 700, color: '#EDF0F4', fontSize: 13, margin: 0, lineHeight: 1.3 }}>Nueva tarea asignada</p>
          <p style={{ color: '#FF5733', fontSize: 12, margin: '3px 0 4px', fontWeight: 600 }}>{title}</p>
          <p style={{ color: '#4B5563', fontSize: 11, margin: 0 }}>Ver detalles en <span style={{ color: '#6B7280', fontWeight: 600 }}>Tareas</span></p>
        </div>
      </div>
    ), { duration: 6000, position: 'bottom-left' });
  };

  const handleChangeTaskStatus = (id: string, status: Task['status']) =>
    saveTasks(tasks.map(t => t.id === id ? { ...t, status, ...(status === 'pendiente' ? { assignedTo: '' } : {}) } : t));
  const handleStartTask = (id: string) => setAssignModal({ taskId: id });
  const handleAssignAndStart = (memberId: string) => {
    if (!assignModal) return;
    const task = tasks.find(t => t.id === assignModal.taskId);
    saveTasks(tasks.map(t => t.id === assignModal.taskId ? { ...t, status: 'en progreso' as const, assignedTo: memberId } : t));
    if (currentUser && memberId === currentUser.id && task) showTaskAlert(task.title);
    setAssignModal(null);
    toast.success("Tarea iniciada");
  };
  const handleDeleteTask        = (id: string) => { saveTasks(tasks.filter(t => t.id !== id)); toast.success("Tarea eliminada"); };
  const handleClearCompleted    = () => { saveTasks(tasks.filter(t => t.status !== 'completada')); toast.success("Completadas eliminadas"); };

  const handleSaveSnippet = (data: Partial<Snippet>) => {
    if (editingSnippet) { saveSnippets(snippets.map(s => s.id === editingSnippet.id ? { ...s, ...data } as Snippet : s)); toast.success("Snippet actualizado"); }
    else { saveSnippets([{ id: crypto.randomUUID(), title: data.title||'', content: data.content||'', label: data.label||'otro', authorId: data.authorId||'', createdAt: Date.now() }, ...snippets]); toast.success("Snippet guardado"); }
    setOpenSnippetModal(false); setEditingSnippet(null);
  };
  const handleDeleteSnippet = (id: string) => { saveSnippets(snippets.filter(s => s.id !== id)); toast.success("Snippet eliminado"); };
  const handleCopySnippet   = (c: string)  => { navigator.clipboard.writeText(c); toast.success("Copiado al portapapeles"); };

  const handleSaveVaultProject = (data: Partial<VaultProject>) => {
    if (editingVaultProject) {
      saveVault(vaultProjects.map(p => p.id === editingVaultProject.id ? { ...p, ...data } as VaultProject : p));
      toast.success("Proyecto de bóveda actualizado");
    } else {
      const newId = crypto.randomUUID();
      const newProject = { id: newId, name: data.name || '', description: data.description || '', color: MEMBER_COLORS[vaultProjects.length % MEMBER_COLORS.length], content: '', createdAt: Date.now() };
      saveVault([newProject, ...vaultProjects]);
      toast.success("Proyecto agregado a la bóveda");
      // Si estamos en la sección de boveda, podríamos querer abrirlo.
      // Pero handleSaveVaultProject no tiene acceso directo a setFullViewProject fácilmente sin refactorizar.
      // Sin embargo, puedo hacer que el modal de creación sea más simple.
    }
    setOpenVaultModal(false); setEditingVaultProject(null);
  };
  const handleDeleteVaultProject = (id: string) => { saveVault(vaultProjects.filter(p => p.id !== id)); toast.success("Proyecto eliminado de la bóveda"); };

  const handleAddNote = (content: string, authorId: string) => {
    const m = members.find(m => m.id === authorId);
    saveNotes([{ id: crypto.randomUUID(), content, authorId, createdAt: Date.now(), x: 80 + Math.random() * 300, y: 80 + Math.random() * 200, color: m?.color || '#E85D2F', type: 'text' }, ...notes]);
    toast.success("Nota agregada"); setOpenNoteModal(false);
  };
  const handleDeleteNote  = (id: string) => { saveNotes(notes.filter(n => n.id !== id)); };
  const handleDragNote = (id: string, x: number, y: number, extra?: Partial<Note>) => {
    saveNotes(notes.map(n => n.id === id ? { ...n, x, y, ...extra } : n));
  };
  const handleDragImage   = (id: string, x: number, y: number, w?: number, h?: number) =>
    saveImages(boardImages.map(img => img.id === id ? { ...img, x, y, width: w||img.width, height: h||img.height } : img));

  const filteredTasks = useMemo(() =>
    taskFilterMember === 'all' ? tasks : tasks.filter(t => t.assignedTo === taskFilterMember), [tasks, taskFilterMember]);
  const filteredSnippets = useMemo(() =>
    snippets.filter(s => s.title.toLowerCase().includes(snippetSearch.toLowerCase()) || s.content.toLowerCase().includes(snippetSearch.toLowerCase())), [snippets, snippetSearch]);

  const toasterProps = {
    position: "bottom-right" as const,
    theme: "dark" as const,
    toastOptions: { style: { background: '#0E1118', color: '#EDF0F4', border: '1px solid rgba(255,255,255,0.07)', fontFamily: "'DM Sans', system-ui, sans-serif", borderRadius: 10, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" } }
  };

  if (isLoading) return null;

  // ── Setup screen ──
  if (isSetup) return (
    <SetupScreen
      members={members}
      handleAddMember={handleAddMember}
      onFinish={() => setIsSetup(false)}
      toasterProps={toasterProps}
    />
  );

  // ── "Who are you?" screen ──
  if (showWhoAreYou) return (
    <WhoAreYouScreen
      members={members}
      onSelect={selectCurrentUser}
      onSkip={() => setShowWhoAreYou(false)}
      toasterProps={toasterProps}
    />
  );

  // ── Main layout ──
  const isPizarra = activeTab === 'pizarra';

  return (
    <div className="flex flex-col h-screen overflow-hidden relative" style={{ background: "#080A0D", padding: isPizarra ? "0" : "20px 24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster {...toasterProps} />

      {/* Header - Floating if Pizarra */}
      <header className={`${isPizarra ? 'fixed top-5 left-1/2 -translate-x-1/2 z-[1000] w-auto' : 'mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0'}`}>
        <div className={`${isPizarra ? 'p-1.5 rounded-2xl shadow-2xl flex items-center gap-3' : 'flex flex-col md:flex-row md:items-center justify-between gap-4 w-full'}`}
          style={isPizarra ? { background: "rgba(14,17,24,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)" } : {}}>
          {!isPizarra && (
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, color: "#EDF0F4", margin: 0, letterSpacing: "-0.4px" }}>
                Equipo de <span style={{ color: "#FF5733" }}>Programadores</span>
              </h1>
              <p style={{ fontSize: 12, color: "#4B5563", marginTop: 3, margin: 0 }}>
                Gestión de tareas, snippets y colaboración
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            {currentUser && (
              <button onClick={() => setShowWhoAreYou(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: isPizarra ? '4px 8px 4px 4px' : '5px 10px 5px 5px', background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
                title="Cambiar perfil">
                <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={isPizarra ? 22 : 24} borderRadius={6} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#C9CDD5" }}>{currentUser.name}</span>
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", padding: 4, borderRadius: 11, background: isPizarra ? "transparent" : "#0E1118", border: isPizarra ? "none" : "1px solid rgba(255,255,255,0.05)", flexWrap: "wrap", gap: 2 }}>
              <TabBtn active={activeTab==='equipo'}   onClick={() => setActiveTab('equipo')}   icon={<Users size={13}/>}       label="Equipo"/>
              <TabBtn active={activeTab==='tareas'}   onClick={() => setActiveTab('tareas')}   icon={<CheckSquare size={13}/>} label="Tareas"/>
              <TabBtn active={activeTab==='snippets'} onClick={() => setActiveTab('snippets')} icon={<Code size={13}/>}        label="Snippets"/>
              <TabBtn active={activeTab==='pizarra'}  onClick={() => setActiveTab('pizarra')}  icon={<StickyNote size={13}/>}  label="Pizarra"/>
              <TabBtn active={activeTab==='archivos'} onClick={() => setActiveTab('archivos')} icon={<FolderOpen size={13}/>}  label="Archivos"/>
              <TabBtn active={activeTab==='boveda'}   onClick={() => setActiveTab('boveda')}   icon={<Shield size={13}/>}      label="Bóveda"/>
              <TabBtn active={activeTab==='ajustes'}  onClick={() => setActiveTab('ajustes')}  icon={<Settings size={13}/>}    label="Ajustes"/>
            </div>
            {!isPizarra && (
              <button
                onClick={() => setIsToolkitVisible(!isToolkitVisible)}
                title={isToolkitVisible ? "Ocultar herramientas" : "Mostrar herramientas"}
                style={{
                  padding: "7px 9px",
                  background: isToolkitVisible ? "rgba(255,87,51,0.08)" : "rgba(255,255,255,0.04)",
                  border: isToolkitVisible ? "1px solid rgba(255,87,51,0.2)" : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 9,
                  color: isToolkitVisible ? "#FF5733" : "#4B5563",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isToolkitVisible) { e.currentTarget.style.color = "#C9CDD5"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)"; } }}
                onMouseLeave={e => { if (!isToolkitVisible) { e.currentTarget.style.color = "#4B5563"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; } }}
              >
                <Sparkles size={15} />
              </button>
            )}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{ padding: "7px 9px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 9, color: "#4B5563", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "#FF5733"; e.currentTarget.style.borderColor = "rgba(255,87,51,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#4B5563"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className={`flex-1 overflow-hidden ${isPizarra ? '' : 'flex flex-col lg:flex-row gap-6'}`}>
        <div className="flex-1 h-full overflow-hidden">
          {activeTab==='equipo' && <div className="h-full overflow-y-auto custom-scrollbar pr-1"><SectionEquipo members={members} tasks={tasks} /></div>}
          {activeTab==='tareas' && (
            <SectionTareas tasks={filteredTasks} members={members} filterMember={taskFilterMember}
              setFilterMember={setTaskFilterMember} currentUser={currentUser}
              onAddTask={() => { setEditingTask(null); setOpenTaskModal(true); }}
              onEditTask={t => { setEditingTask(t); setOpenTaskModal(true); }}
              onChangeStatus={handleChangeTaskStatus}
              onStartTask={handleStartTask}
              onDeleteTask={t => { setDeleteConfig({type:'task',id:t.id,name:t.title}); setOpenDeleteModal(true); }}
              onClearCompleted={handleClearCompleted}/>
          )}
          {activeTab==='snippets' && <div className="h-full overflow-y-auto custom-scrollbar pr-1"><SectionSnippets snippets={filteredSnippets} search={snippetSearch} setSearch={setSnippetSearch} members={members} onAddSnippet={() => { setEditingSnippet(null); setOpenSnippetModal(true); }} onEditSnippet={s => { setEditingSnippet(s); setOpenSnippetModal(true); }} onCopy={handleCopySnippet} onDeleteSnippet={s => { setDeleteConfig({type:'snippet',id:s.id,name:s.title}); setOpenDeleteModal(true); }}/></div>}
          {activeTab==='pizarra' && <SectionPizarra notes={notes} drawings={drawings} images={boardImages} shapes={boardShapes} customShapes={customShapes} members={members} onAddNote={() => setOpenNoteModal(true)} onDeleteNote={n => { setDeleteConfig({type:'note',id:n.id,name:'esta nota'}); setOpenDeleteModal(true); }} onDeleteImage={img => { saveImages(boardImages.filter(i => i.id!==img.id)); toast.success("Imagen eliminada"); }} onSaveDrawings={saveDrawings} onSaveImages={saveImages} onSaveNotes={saveNotes} onSaveShapes={saveShapes} onSaveCustomShapes={saveCustomShapes} onDragNote={handleDragNote} onDragImage={handleDragImage} pushToHistory={pushToHistory} undo={undo} clipboard={clipboard} setClipboard={setClipboard} onClearAll={() => { pushToHistory(); saveDrawings([]); saveNotes([]); saveImages([]); saveShapes([]); toast.success("Pizarra limpiada"); }}/>}
          {activeTab==='archivos' && <SectionArchivos archivos={archivos} members={members} currentUser={currentUser} onSave={saveArchivos}/>}
          {activeTab==='boveda' && <SectionBoveda projects={vaultProjects} isUnlocked={isVaultUnlocked} onUnlock={setIsVaultUnlocked} onSaveVault={saveVault} onAddProject={() => { setEditingVaultProject(null); setOpenVaultModal(true); }} onEditProject={p => { setEditingVaultProject(p); setOpenVaultModal(true); }} onDeleteProject={p => { setDeleteConfig({type:'vault',id:p.id,name:p.name}); setOpenDeleteModal(true); }} />}
          {activeTab==='ajustes' && <div className="h-full overflow-y-auto custom-scrollbar pr-1"><SectionAjustes members={members} onAddMember={() => setOpenMemberModal(true)} onDeleteMember={m => { setDeleteConfig({type:'member',id:m.id,name:m.name}); setOpenDeleteModal(true); }} onChangeAvatar={handleChangeAvatar}/></div>}
        </div>

        {/* Right Column: DevToolkit */}
        {isToolkitVisible && (
          <div className="w-full lg:w-[400px] flex-shrink-0 animate-in slide-in-from-right duration-500 ease-in-out">
            <div className="sticky top-0 h-full max-h-[calc(100vh-180px)]">
               <DevToolkit members={members} currentUser={currentUser} />
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <ModalBase open={activeTab==='ajustes' && openMemberModal} title="Agregar Miembro" onClose={() => setOpenMemberModal(false)}>
        <MemberForm onAdd={(n,r) => { handleAddMember(n,r); setOpenMemberModal(false); }}/>
      </ModalBase>
      <ModalBase open={openTaskModal} title={editingTask ? "Editar Tarea" : "Nueva Tarea"} onClose={() => setOpenTaskModal(false)}>
        <TaskForm members={members} initialData={editingTask||undefined} currentUser={currentUser} onSave={handleSaveTask} onCancel={() => { setOpenTaskModal(false); setEditingTask(null); }}/>
      </ModalBase>
      <ModalBase open={!!assignModal} title="¿Quién se encarga?" onClose={() => setAssignModal(null)}>
        <div className="flex flex-col gap-5">
          <p className="text-gray-400 text-sm">Selecciona al miembro que tomará esta tarea.</p>
          <MemberPicker members={members} value="" currentUser={currentUser} onChange={handleAssignAndStart}/>
          <div className="flex justify-end"><ButtonBase variant="secondary" onClick={() => setAssignModal(null)}>Cancelar</ButtonBase></div>
        </div>
      </ModalBase>
      <ModalBase open={openSnippetModal} title={editingSnippet ? "Editar Snippet" : "Nuevo Snippet"} onClose={() => setOpenSnippetModal(false)}>
        <SnippetForm members={members} initialData={editingSnippet||undefined} onSave={handleSaveSnippet} onCancel={() => setOpenSnippetModal(false)}/>
      </ModalBase>
      <ModalBase open={openNoteModal} title="Nueva Nota" onClose={() => setOpenNoteModal(false)}>
        <NoteForm members={members} onSave={handleAddNote} onCancel={() => setOpenNoteModal(false)}/>
      </ModalBase>
      <ModalBase open={openVaultModal} title={editingVaultProject ? "Editar Proyecto en Bóveda" : "Nuevo Proyecto en Bóveda"} onClose={() => setOpenVaultModal(false)}>
        <VaultProjectForm initialData={editingVaultProject||undefined} onSave={handleSaveVaultProject} onCancel={() => setOpenVaultModal(false)}/>
      </ModalBase>
      <ModalEliminar open={openDeleteModal} onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          if (!deleteConfig) return;
          if (deleteConfig.type==='member')  handleDeleteMember(deleteConfig.id);
          if (deleteConfig.type==='task')    handleDeleteTask(deleteConfig.id);
          if (deleteConfig.type==='snippet') handleDeleteSnippet(deleteConfig.id);
          if (deleteConfig.type==='note')    handleDeleteNote(deleteConfig.id);
          if (deleteConfig.type==='archivo') saveArchivos(archivos.filter(a => a.id!==deleteConfig.id));
          if (deleteConfig.type==='vault')   handleDeleteVaultProject(deleteConfig.id);
          setOpenDeleteModal(false);
        }}
        title={`Eliminar ${deleteConfig?.type==='member'?'Miembro':deleteConfig?.type==='task'?'Tarea':deleteConfig?.type==='snippet'?'Snippet':deleteConfig?.type==='archivo'?'Archivo':deleteConfig?.type==='vault'?'Proyecto de Bóveda':'Nota'}`}
        message={`¿Estás seguro de que deseas eliminar "${deleteConfig?.name}"? Esta acción no se puede deshacer.`}/>
    </div>
  );
}
