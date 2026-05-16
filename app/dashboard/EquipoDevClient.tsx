"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Users, CheckSquare, Code, StickyNote, Plus, Trash2, UserPlus,
  Copy, Filter, Settings, MessageSquare, ExternalLink, ChevronRight,
  RefreshCw, ZoomIn, ZoomOut, Maximize, LogOut, FolderOpen,
  Download, FileText, Image as ImageIcon, FileCode, Archive, Film, Music,
  Link as LinkIcon, UploadCloud, X, GripVertical, ChevronLeft, Bell,
  ChevronRight as ChevronRightIcon, Pencil, Check, Clock, AlertCircle,
  Calendar, ArrowRight, Globe, Share2, User, Info, Trophy, Sparkles, Shield
} from "lucide-react";
import ButtonBase from "@/components/ui/ButtonBase";
import ModalBase from "@/components/modal/ModalBase";
import ModalEliminar from "@/components/modal/ModalEliminar";
import InputBase1 from "@/components/ui/InputBase1";
import ImputBuscar from "@/components/ui/ImputBuscar";
import { toast, Toaster } from "sonner";
import { createAvatar } from "@dicebear/core";
import { adventurer } from "@dicebear/collection";
import DevToolkit from "@/components/DevToolkit";
import { SectionBoveda, VaultProjectForm, type VaultProject } from "@/components/VaultSection";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Member { id: string; name: string; role: string; color: string; avatarSeed?: string; }
interface Task {
  id: string; title: string; description: string;
  priority: 'alta' | 'media' | 'baja';
  status: 'pendiente' | 'en progreso' | 'completada';
  assignedTo: string; createdAt: number;
}
interface Snippet { id: string; title: string; content: string; label: 'env' | 'código' | 'config' | 'otro'; authorId: string; createdAt: number; }
interface Note { id: string; content: string; authorId: string; createdAt: number; x: number; y: number; color?: string; }
interface BoardImage { id: string; src: string; x: number; y: number; width: number; height: number; }
interface DrawingPath { points: { x: number; y: number }[]; color: string; width: number; }
interface SharedFile { id: string; name: string; type: string; size: number; dataUrl: string; x: number; y: number; createdAt: number; authorName: string; }

type Tab = 'equipo' | 'tareas' | 'snippets' | 'pizarra' | 'archivos' | 'boveda' | 'ajustes';
const STATUSES: Task['status'][] = ['pendiente', 'en progreso', 'completada'];
const MEMBER_COLORS = ['#E85D2F','#3498DB','#2ECC71','#F1C40F','#9B59B6','#E74C3C','#1ABC9C','#F39C12','#D35400','#27AE60'];
const AVATAR_PRESETS = ['aventurero','creativo','tecnico','disenador','ninja','heroe','mago','explorador','lider','builder'];

// ─── Avatar Component ─────────────────────────────────────────────────────────

function AvatarImg({ seed, name = '?', color = '#E85D2F', size = 40, borderRadius = '50%', style }: {
  seed: string; name?: string; color?: string; size?: number;
  borderRadius?: string | number; style?: React.CSSProperties;
}) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    try {
      setSrc(createAvatar(adventurer, { seed }).toDataUri());
    } catch { setSrc(''); }
  }, [seed]);

  return (
    <div style={{ width: size, height: size, borderRadius, overflow: 'hidden', flexShrink: 0,
      border: `1.5px solid ${color}40`, background: `${color}15`, ...style }}>
      {src
        ? <img src={src} alt="" style={{ width: '100%', height: '100%' }} draggable={false} />
        : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: size * 0.38, fontWeight: 800, color }}>
            {name[0]?.toUpperCase()}
          </div>
      }
    </div>
  );
}

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

  // Auto-hide toolkit when entering Pizarra
  useEffect(() => {
    if (activeTab === 'pizarra') {
      setIsToolkitVisible(false);
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

  const handleSaveTask = (data: Partial<Task>) => {
    if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...data } as Task : t));
      if (currentUser && data.assignedTo === currentUser.id && editingTask.assignedTo !== currentUser.id) {
        showTaskAlert(data.title || editingTask.title);
      }
      toast.success("Tarea actualizada");
    } else {
      saveTasks([{ id: crypto.randomUUID(), title: data.title || '', description: data.description || '', priority: data.priority || 'media', status: 'pendiente', assignedTo: data.assignedTo || '', createdAt: Date.now() }, ...tasks]);
      if (currentUser && data.assignedTo === currentUser.id) {
        setTimeout(() => showTaskAlert(data.title || ''), 400);
      }
      toast.success("Tarea creada");
    }
    setOpenTaskModal(false); setEditingTask(null);
  };

  const showTaskAlert = (title: string) => {
    toast.custom(() => (
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
        background: '#1C1F26', border: '1px solid rgba(232,93,47,0.4)', borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)', minWidth: 290, maxWidth: 340,
        fontFamily: "'DM Sans', system-ui, sans-serif" }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(232,93,47,0.15)',
          border: '1px solid rgba(232,93,47,0.35)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>🎯</div>
        <div>
          <p style={{ fontWeight: 700, color: '#F4F5F7', fontSize: 13, margin: 0, lineHeight: 1.3 }}>Se te asignó una nueva tarea</p>
          <p style={{ color: '#E85D2F', fontSize: 12, margin: '3px 0 4px', fontWeight: 600 }}>{title}</p>
          <p style={{ color: '#5A6270', fontSize: 11, margin: 0 }}>Mira los detalles en <span style={{ color: '#8A9099', fontWeight: 600 }}>Tareas</span></p>
        </div>
      </div>
    ), { duration: 6000, position: 'bottom-left' });
  };

  const handleChangeTaskStatus = (id: string, status: Task['status']) => saveTasks(tasks.map(t => t.id === id ? { ...t, status } : t));
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
    saveNotes([{ id: crypto.randomUUID(), content, authorId, createdAt: Date.now(), x: 80 + Math.random() * 300, y: 80 + Math.random() * 200, color: m?.color || '#E85D2F' }, ...notes]);
    toast.success("Nota agregada"); setOpenNoteModal(false);
  };
  const handleDeleteNote  = (id: string) => { saveNotes(notes.filter(n => n.id !== id)); };
  const handleDragNote    = (id: string, x: number, y: number) => saveNotes(notes.map(n => n.id === id ? { ...n, x, y } : n));
  const handleDragImage   = (id: string, x: number, y: number, w?: number, h?: number) =>
    saveImages(boardImages.map(img => img.id === id ? { ...img, x, y, width: w||img.width, height: h||img.height } : img));

  const filteredTasks = useMemo(() =>
    taskFilterMember === 'all' ? tasks : tasks.filter(t => t.assignedTo === taskFilterMember), [tasks, taskFilterMember]);
  const filteredSnippets = useMemo(() =>
    snippets.filter(s => s.title.toLowerCase().includes(snippetSearch.toLowerCase()) || s.content.toLowerCase().includes(snippetSearch.toLowerCase())), [snippets, snippetSearch]);

  const toasterProps = {
    position: "bottom-right" as const,
    theme: "dark" as const,
    toastOptions: { style: { background: '#1C1F26', color: '#F4F5F7', border: '1px solid rgba(255,255,255,0.08)', fontFamily: "'DM Sans', system-ui, sans-serif" } }
  };

  if (isLoading) return null;

  // ── Setup screen ──
  if (isSetup) return (
    <div className="h-screen flex items-center justify-center p-4" style={{ background: "#0A0C0F" }}>
      <Toaster {...toasterProps} />
      <div style={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 40 }} className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#E85D2F]/20 rounded-full flex items-center justify-center mx-auto mb-6"><Users size={32} className="text-[#E85D2F]" /></div>
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido al Equipo Dev</h2>
        <p className="text-gray-400 mb-8">Agrega los miembros de tu equipo para comenzar.</p>
        <SetupForm onAddMember={handleAddMember} />
        {members.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Miembros ({members.length})</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {members.map(m => <span key={m.id} style={{ background:`${m.color}20`, border:`1px solid ${m.color}40`, color:m.color }} className="px-3 py-1 rounded-full text-xs font-medium">{m.name}</span>)}
            </div>
            <ButtonBase className="w-full mt-6" onClick={() => setIsSetup(false)}>Comenzar ahora</ButtonBase>
          </div>
        )}
      </div>
    </div>
  );

  // ── "Who are you?" screen ──
  if (showWhoAreYou) return (
    <div style={{ minHeight: '100vh', background: '#0A0C0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <Toaster {...toasterProps} />
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,93,47,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,152,219,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 640, width: '100%' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(232,93,47,0.12)', border: '1px solid rgba(232,93,47,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(232,93,47,0.1)' }}>
          <Users size={26} color="#E85D2F" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F4F5F7', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          ¿Quién eres <span style={{ color: '#E85D2F' }}>hoy</span>?
        </h1>
        <p style={{ fontSize: 13, color: '#5A6270', margin: '0 0 36px', fontWeight: 500 }}>
          Selecciona tu perfil para personalizar las notificaciones
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
          {members.map(member => (
            <button key={member.id} onClick={() => selectCurrentUser(member)}
              style={{ background: '#13161C', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 16, padding: '22px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = `${member.color}12`; e.currentTarget.style.borderColor = `${member.color}50`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${member.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#13161C'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={60} borderRadius={16} />
              <div>
                <p style={{ color: '#F4F5F7', fontWeight: 700, fontSize: 14, margin: 0 }}>{member.name}</p>
                <p style={{ color: '#5A6270', fontSize: 11, margin: '3px 0 0', fontWeight: 500 }}>{member.role}</p>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => setShowWhoAreYou(false)} style={{ marginTop: 28, background: 'none', border: 'none', color: '#3A3F4A', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#8A9099'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3A3F4A'; }}>
          Continuar sin seleccionar
        </button>
      </div>
    </div>
  );

  // ── Main layout ──
  return (
    <div className="flex flex-col h-screen" style={{ background: "#0A0C0F", padding: "20px 24px", fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <Toaster {...toasterProps} />

      {/* Header */}
      <header className="mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-white">Equipo de <span className="text-[#E85D2F]">Programadores</span></h1>
          <p className="text-xs text-gray-500 mt-0.5">Gestión de tareas, snippets y colaboración</p>
        </div>
        <div className="flex items-center gap-3">
          {currentUser && (
            <button onClick={() => setShowWhoAreYou(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px 5px 5px', background: `${currentUser.color}12`, border: `1px solid ${currentUser.color}30`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${currentUser.color}20`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${currentUser.color}12`; }}
              title="Cambiar perfil">
              <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={26} borderRadius={7} />
              <span style={{ fontSize: 12, fontWeight: 600, color: currentUser.color }}>{currentUser.name}</span>
            </button>
          )}
          <div className="flex bg-[#1C1F26] p-1 rounded-xl border border-white/5 flex-wrap gap-0.5">
            <TabBtn active={activeTab==='equipo'}   onClick={() => setActiveTab('equipo')}   icon={<Users size={14}/>}       label="Equipo"/>
            <TabBtn active={activeTab==='tareas'}   onClick={() => setActiveTab('tareas')}   icon={<CheckSquare size={14}/>} label="Tareas"/>
            <TabBtn active={activeTab==='snippets'} onClick={() => setActiveTab('snippets')} icon={<Code size={14}/>}        label="Snippets"/>
            <TabBtn active={activeTab==='pizarra'}  onClick={() => setActiveTab('pizarra')}  icon={<StickyNote size={14}/>}  label="Pizarra"/>
            <TabBtn active={activeTab==='archivos'} onClick={() => setActiveTab('archivos')} icon={<FolderOpen size={14}/>}  label="Archivos"/>
            <TabBtn active={activeTab==='boveda'}   onClick={() => setActiveTab('boveda')} icon={<Shield size={14}/>} label="Bóveda"/>
            <TabBtn active={activeTab==='ajustes'}  onClick={() => setActiveTab('ajustes')}  icon={<Settings size={14}/>}   label="Ajustes"/>
          </div>
          <button onClick={() => setIsToolkitVisible(!isToolkitVisible)} title={isToolkitVisible ? "Ocultar herramientas" : "Mostrar herramientas"} className={`p-2 rounded-xl border transition-all flex items-center justify-center ${isToolkitVisible ? 'bg-[#E85D2F]/10 border-[#E85D2F]/30 text-[#E85D2F]' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white'}`}>
            <Sparkles size={16} className={isToolkitVisible ? 'animate-pulse' : ''} />
          </button>
          <button onClick={handleLogout} title="Cerrar sesión" style={{ padding:"8px 10px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:10, color:"#5A6270", cursor:"pointer", display:"flex", alignItems:"center", transition:"all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.color="#E85D2F"; e.currentTarget.style.borderColor="rgba(232,93,47,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.color="#5A6270"; e.currentTarget.style.borderColor="rgba(255,255,255,0.07)"; }}>
            <LogOut size={15}/>
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6">
        <div className="flex-1 overflow-hidden">
          {activeTab==='equipo' && <div className="h-full overflow-y-auto custom-scrollbar pr-1"><SectionEquipo members={members} tasks={tasks} /></div>}
          {activeTab==='tareas' && (
            <SectionTareas tasks={filteredTasks} members={members} filterMember={taskFilterMember}
              setFilterMember={setTaskFilterMember} currentUser={currentUser}
              onAddTask={() => { setEditingTask(null); setOpenTaskModal(true); }}
              onEditTask={t => { setEditingTask(t); setOpenTaskModal(true); }}
              onChangeStatus={handleChangeTaskStatus}
              onDeleteTask={t => { setDeleteConfig({type:'task',id:t.id,name:t.title}); setOpenDeleteModal(true); }}
              onClearCompleted={handleClearCompleted}/>
          )}
          {activeTab==='snippets' && <div className="h-full overflow-y-auto custom-scrollbar pr-1"><SectionSnippets snippets={filteredSnippets} search={snippetSearch} setSearch={setSnippetSearch} members={members} onAddSnippet={() => { setEditingSnippet(null); setOpenSnippetModal(true); }} onEditSnippet={s => { setEditingSnippet(s); setOpenSnippetModal(true); }} onCopy={handleCopySnippet} onDeleteSnippet={s => { setDeleteConfig({type:'snippet',id:s.id,name:s.title}); setOpenDeleteModal(true); }}/></div>}
          {activeTab==='pizarra' && <SectionPizarra notes={notes} drawings={drawings} images={boardImages} members={members} onAddNote={() => setOpenNoteModal(true)} onDeleteNote={n => { setDeleteConfig({type:'note',id:n.id,name:'esta nota'}); setOpenDeleteModal(true); }} onDeleteImage={img => { saveImages(boardImages.filter(i => i.id!==img.id)); toast.success("Imagen eliminada"); }} onSaveDrawings={saveDrawings} onSaveImages={saveImages} onSaveNotes={saveNotes} onDragNote={handleDragNote} onDragImage={handleDragImage} pushToHistory={pushToHistory} undo={undo} clipboard={clipboard} setClipboard={setClipboard} onClearAll={() => { pushToHistory(); saveDrawings([]); saveNotes([]); saveImages([]); toast.success("Pizarra limpiada"); }}/>}
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
        <TaskForm members={members} initialData={editingTask||undefined} currentUser={currentUser} onSave={handleSaveTask} onCancel={() => setOpenTaskModal(false)}/>
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

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active ? 'bg-[#E85D2F] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}<span>{label}</span>
    </button>
  );
}

// ─── Setup Form ───────────────────────────────────────────────────────────────
function SetupForm({ onAddMember }: { onAddMember: (n: string, r: string) => void }) {
  const [name, setName] = useState(''); const [role, setRole] = useState('Full Stack Developer');
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!name) return; onAddMember(name, role); setName(''); };
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <InputBase1 label="Nombre" placeholder="Ej: Luis Paredes" value={name} onChange={e => setName(e.target.value)} required/>
      <div className="flex flex-col gap-1.5 text-left">
        <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rol</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="w-full bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none">
          <option>Full Stack Developer</option><option>Frontend Developer</option><option>Backend Developer</option>
          <option>UI/UX Designer</option><option>DevOps Engineer</option><option>Mobile Developer</option>
        </select>
      </div>
      <ButtonBase type="submit" variant="secondary" className="flex items-center justify-center gap-2"><UserPlus size={17}/> Agregar</ButtonBase>
    </form>
  );
}

// ─── Sección: Equipo ──────────────────────────────────────────────────────────
function SectionEquipo({ members, tasks }: { members: Member[]; tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {members.map(m => {
        const mt = tasks.filter(t => t.assignedTo === m.id);
        const done = mt.filter(t => t.status === 'completada').length;
        const prog = mt.length > 0 ? (done / mt.length) * 100 : 0;
        
        // Carga de trabajo por prioridad
        const high = mt.filter(t => t.priority === 'alta').length;
        const med  = mt.filter(t => t.priority === 'media').length;
        const low  = mt.filter(t => t.priority === 'baja').length;
        const total = high + med + low;

        const getPct = (n: number) => total > 0 ? (n / total) * 100 : 0;

        return (
          <div key={m.id} style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.06)" }} className="rounded-2xl p-6 relative overflow-hidden flex flex-col group">
            <div className="absolute top-0 right-0 w-28 h-28 opacity-10 blur-3xl rounded-full" style={{ background: m.color }}/>
            
            <div className="flex items-start justify-between mb-5 relative z-10">
              <div className="flex items-start gap-4">
                <div className="relative">
                  <AvatarImg seed={m.avatarSeed || m.name} name={m.name} color={m.color} size={52} borderRadius={14} />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#2ECC71] border-2 border-[#1C1F26] rounded-full" title="Online" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base group-hover:text-[#E85D2F] transition-colors">{m.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{m.role}</span>
                    <span className="w-1 h-1 bg-gray-700 rounded-full" />
                    <span className="text-[10px] text-gray-400 font-mono">@{m.name.toLowerCase().replace(/\s/g, '')}</span>
                  </div>
                </div>
              </div>
              <div className="p-2 bg-white/5 rounded-lg border border-white/5">
                <Code size={14} className="text-gray-500" />
              </div>
            </div>

            <div className="flex justify-between text-[10px] mb-2 relative z-10">
              <span className="text-gray-500 uppercase tracking-widest font-bold">Productividad General</span>
              <span className="text-white font-bold">{Math.round(prog)}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-6 relative z-10">
              <div className="h-full transition-all duration-1000 ease-out" style={{ width:`${prog}%`, background:m.color, boxShadow:`0 0 10px ${m.color}40` }}/>
            </div>

            {/* Visual Workload Chart */}
            <div className="bg-black/20 rounded-xl p-4 border border-white/5 relative z-10 mt-auto">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={12} className="text-gray-500" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Carga de Trabajo</span>
                </div>
                <span className="text-[10px] font-mono text-gray-600">{total} tareas</span>
              </div>
              
              <div className="flex h-6 w-full rounded-lg overflow-hidden bg-white/5 p-1 gap-1">
                <div style={{ width: `${getPct(high)}%`, background: '#FF4D4D', opacity: high > 0 ? 1 : 0 }} className="h-full rounded-sm transition-all duration-500" title={`Alta: ${high}`} />
                <div style={{ width: `${getPct(med)}%`, background: '#FFB84D', opacity: med > 0 ? 1 : 0 }} className="h-full rounded-sm transition-all duration-500" title={`Media: ${med}`} />
                <div style={{ width: `${getPct(low)}%`, background: '#4DABFF', opacity: low > 0 ? 1 : 0 }} className="h-full rounded-sm transition-all duration-500" title={`Baja: ${low}`} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <PriorityStat count={high} color="#FF4D4D" label="Alta" />
                <PriorityStat count={med}  color="#FFB84D" label="Media" />
                <PriorityStat count={low}  color="#4DABFF" label="Baja" />
              </div>
            </div>
          </div>
        );
      })}
      {members.length === 0 && <div className="col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl"><Users size={48} className="mx-auto text-white/10 mb-4"/><p className="text-gray-500">Sin miembros aún</p></div>}
    </div>
  );
}

function PriorityStat({ count, color, label }: { count: number; color: string; label: string }) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5 mb-0.5">
        <div className="w-1 h-1 rounded-full" style={{ background: color }} />
        <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      </div>
      <span className="text-xs font-bold text-white pl-2.5">{count}</span>
    </div>
  );
}

// ─── Sub-componente: Task Card (Estilo HUD) ──────────────────────────────────
function TaskCard({ task, member, isCurrentUser, size = 'md', onEdit, onDelete, onChangeStatus }: {
  task: Task; member?: Member; isCurrentUser: boolean; size?: 'sm' | 'md' | 'lg';
  onEdit: (t: Task) => void; onDelete: (t: Task) => void;
  onChangeStatus: (id: string, s: Task['status']) => void;
}) {
  const PC: Record<string, { color: string, glow: string }> = {
    alta:  { color: '#FF4D4D', glow: 'rgba(255, 77, 77, 0.4)' },
    media: { color: '#FFB84D', glow: 'rgba(255, 184, 77, 0.4)' },
    baja:  { color: '#4DABFF', glow: 'rgba(77, 171, 255, 0.4)' }
  };
  const p = PC[task.priority] || PC.media;

  return (
    <div 
      className={`group relative flex flex-col gap-3 rounded-2xl transition-all duration-500 hover:-translate-y-1 ${size === 'lg' ? 'p-6' : 'p-4'}`}
      style={{ 
        background: isCurrentUser ? 'rgba(30, 34, 45, 0.8)' : 'rgba(22, 25, 31, 0.6)',
        border: `1px solid ${isCurrentUser ? 'rgba(232,93,47,0.3)' : 'rgba(255,255,255,0.08)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isCurrentUser ? `0 10px 40px -10px rgba(0,0,0,0.5), 0 0 0 1px rgba(232,93,47,0.1)` : '0 10px 30px -10px rgba(0,0,0,0.3)'
      }}
    >
      {/* Decorative Corner */}
      <div className="absolute top-0 left-0 w-8 h-8 pointer-events-none overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-px h-full" style={{ background: `linear-gradient(to bottom, ${p.color}, transparent)` }} />
        <div className="absolute top-0 left-0 h-px w-full" style={{ background: `linear-gradient(to right, ${p.color}, transparent)` }} />
      </div>

      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: p.color, boxShadow: `0 0 8px ${p.glow}` }} />
          <span className="text-[9px] font-bold uppercase tracking-wider opacity-60" style={{ color: p.color }}>{task.priority}</span>
        </div>
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-500 hover:text-white transition-colors"><Settings size={12}/></button>
          <button onClick={() => onDelete(task)} className="p-1 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
        </div>
      </div>

      <div className="z-10 flex-1">
        <h4 className={`text-white font-bold leading-tight mb-2 group-hover:text-[#E85D2F] transition-colors ${size === 'lg' ? 'text-lg' : 'text-sm'}`}>
          {task.title}
        </h4>
        {task.description && (
          <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2 font-medium">
            {task.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5 z-10 mt-auto">
        <div className="flex items-center gap-2">
          {member && <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={size === 'lg' ? 28 : 22} borderRadius={8} />}
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 font-bold leading-none">{member?.name || 'Sin asignar'}</span>
            <span className="text-[8px] text-gray-600 font-bold uppercase tracking-wide mt-1">Responsable</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {task.status !== 'pendiente' && (
            <button onClick={() => onChangeStatus(task.id, task.status === 'completada' ? 'en progreso' : 'pendiente')}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={14} />
            </button>
          )}
          {task.status !== 'completada' && (
            <button onClick={() => onChangeStatus(task.id, task.status === 'pendiente' ? 'en progreso' : 'completada')}
              className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: '#E85D2F', color: '#fff', boxShadow: '0 4px 15px rgba(232,93,47,0.3)' }}>
              {task.status === 'pendiente' ? 'Iniciar' : 'Finalizar'}
            </button>
          )}
          {task.status === 'completada' && (
             <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                <Check size={14} className="text-green-500" />
             </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sección: Tareas — Centro de Comando Bento ────────────────────────────────
function SectionTareas({ tasks, members, filterMember, setFilterMember, currentUser, onAddTask, onEditTask, onChangeStatus, onDeleteTask, onClearCompleted }: {
  tasks: Task[]; members: Member[]; filterMember: string; setFilterMember: (v: string) => void;
  currentUser: Member | null; onAddTask: () => void; onEditTask: (t: Task) => void;
  onChangeStatus: (id: string, s: Task['status']) => void; onDeleteTask: (t: Task) => void; onClearCompleted: () => void;
}) {
  const pending    = tasks.filter(t => t.status === 'pendiente');
  const inProgress = tasks.filter(t => t.status === 'en progreso');
  const done       = tasks.filter(t => t.status === 'completada');
  const total      = tasks.length;
  const pct        = total > 0 ? Math.round((done.length / total) * 100) : 0;
  
  const metaSemanal = 15;
  const metaProgreso = Math.min(Math.round((done.length / metaSemanal) * 100), 100);

  return (
    <div className="flex flex-col h-full gap-6 overflow-hidden relative">
      
      {/* Background HUD elements */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#E85D2F]/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── Top Control HUD ── */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
           <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#E85D2F] uppercase tracking-widest">Gestión de Tareas</span>
              <h2 className="text-white font-bold text-2xl tracking-tight">Centro de <span className="text-gray-500">Control</span></h2>
           </div>
           <div className="h-10 w-px bg-white/5 mx-2" />
           <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
             <Filter size={12} className="text-gray-500" />
             <select value={filterMember} onChange={e => setFilterMember(e.target.value)} className="bg-transparent text-[11px] font-bold text-white outline-none">
               <option value="all">Filtro: Todos</option>
               {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
             </select>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-500 uppercase">Capacidad Operativa</p>
                <p className="text-sm font-bold text-white">{pct}%</p>
              </div>
              <div className="w-12 h-12 rounded-full border-2 border-white/5 flex items-center justify-center relative">
                 <svg className="w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                    <circle cx="24" cy="24" r="20" fill="none" stroke="#E85D2F" strokeWidth="4" strokeDasharray={`${pct*1.25} 125`} />
                 </svg>
                 <span className="absolute text-[8px] font-bold text-[#E85D2F]">{done.length}</span>
              </div>
           </div>
           <button onClick={onAddTask} className="flex items-center gap-2 bg-[#E85D2F] hover:bg-[#FF6B3D] text-white px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_10px_30px_rgba(232,93,47,0.3)]">
             <Plus size={16}/> Nueva Tarea
           </button>
        </div>
      </div>

      {/* ── Main Bento Grid ── */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-6 min-h-0 z-10">
        
        {/* Panel 1: Backlog (Left, 3 units) */}
        <div className="col-span-3 row-span-6 flex flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-[32px] p-5 overflow-hidden">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
              <h3 className="text-[11px] font-bold text-white uppercase tracking-wider">Pendientes</h3>
            </div>
            <span className="text-[10px] font-mono text-gray-500">[{pending.length}]</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-3">
            {pending.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="sm" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} />
            ))}
            {pending.length === 0 && <div className="py-10 text-center opacity-20 italic text-xs">En espera...</div>}
          </div>
        </div>

        {/* Panel 2: Focus Arena (Center, 6 units) */}
        <div className="col-span-6 row-span-6 flex flex-col gap-5 bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 rounded-[40px] p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8">
             <div className="flex items-center gap-2 px-3 py-1 bg-[#E85D2F]/10 border border-[#E85D2F]/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-[#E85D2F] animate-ping" />
                <span className="text-[9px] font-bold text-[#E85D2F] uppercase tracking-widest">Enfoque Activo</span>
             </div>
          </div>

          <div className="flex flex-col mb-4">
             <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-1">Área de Ejecución</h3>
             <p className="text-gray-500 text-xs font-medium">Tareas principales actualmente en desarrollo</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-5 content-start">
            {inProgress.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="lg" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} />
            ))}
            {inProgress.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-[32px]">
                 <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4"><CheckSquare size={32} className="text-gray-700" /></div>
                 <p className="text-gray-600 font-bold uppercase text-[10px] tracking-widest">Todo despejado. Esperando tareas.</p>
              </div>
            )}
          </div>
          
          {/* Bottom HUD bar */}
          <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between opacity-50">
             <div className="flex gap-4">
                <div className="flex flex-col"><span className="text-[8px] font-bold text-gray-500 uppercase">Latencia</span><span className="text-[10px] font-mono text-white">12ms</span></div>
                <div className="flex flex-col"><span className="text-[8px] font-bold text-gray-500 uppercase">Nodos</span><span className="text-[10px] font-mono text-white">{inProgress.length}</span></div>
             </div>
             <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Sistema en Línea</span>
             </div>
          </div>
        </div>

        {/* Panel 3: Vault & Performance (Right, 3 units) */}
        <div className="col-span-3 row-span-6 flex flex-col gap-6">
          
          {/* Performance Card */}
          <div className="flex flex-col gap-4 bg-[#E85D2F] rounded-[32px] p-6 shadow-[0_20px_50px_rgba(232,93,47,0.2)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-16 translate-x-16" />
             <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Rendimiento</span>
                <RefreshCw size={14} className="text-white/60" />
             </div>
             <div className="flex flex-col relative z-10">
                <span className="text-4xl font-bold text-white">{pct}%</span>
                <span className="text-[10px] font-bold text-white/80">Tasa de completado</span>
             </div>
             <div className="h-1.5 w-full bg-black/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${pct}%` }} />
             </div>
          </div>

          {/* Meta del Equipo Card */}
          <div className="bg-[#1C1F26] border border-white/5 rounded-[28px] p-5 flex flex-col gap-3">
             <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#E85D2F]/10 rounded-lg"><Users size={14} className="text-[#E85D2F]" /></div>
                <h4 className="text-[11px] font-bold text-white uppercase tracking-wider">Meta del Equipo</h4>
             </div>
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-2xl font-bold text-white">{done.length}<span className="text-gray-600 text-sm ml-1">/ {metaSemanal}</span></p>
                   <p className="text-[10px] text-gray-500 font-medium">Tareas logradas esta semana</p>
                </div>
                <div className="text-right">
                   <p className="text-sm font-bold text-[#E85D2F]">{metaProgreso}%</p>
                </div>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#E85D2F] to-[#FF8E66] transition-all duration-1000" style={{ width: `${metaProgreso}%` }} />
             </div>
          </div>

          {/* The Vault Card */}
          <div className="flex-1 flex flex-col gap-4 bg-white/[0.02] border border-white/5 rounded-[32px] p-5 overflow-hidden">
             <div className="flex items-center justify-between px-2">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                 <span className="text-[11px] font-bold text-white uppercase tracking-wider">Bóveda</span>
               </div>
               {done.length > 0 && <button onClick={onClearCompleted} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-red-500 transition-all"><Trash2 size={12}/></button>}
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
               {done.map(task => (
                 <div key={task.id} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl flex items-center justify-between group opacity-60 hover:opacity-100 transition-all">
                    <div className="flex flex-col min-w-0">
                       <span className="text-white text-[11px] font-bold truncate">{task.title}</span>
                       <span className="text-[8px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Misión Completada</span>
                    </div>
                    <button onClick={() => onChangeStatus(task.id, 'en progreso')} className="p-1.5 opacity-0 group-hover:opacity-100 transition-all text-gray-500 hover:text-white"><ChevronLeft size={12} /></button>
                 </div>
               ))}
               {done.length === 0 && <div className="py-10 text-center opacity-20 italic text-xs">Sin datos...</div>}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

// ─── Sección: Snippets ────────────────────────────────────────────────────────
function SectionSnippets({ snippets, search, setSearch, members, onAddSnippet, onEditSnippet, onCopy, onDeleteSnippet }: {
  snippets: Snippet[]; search: string; setSearch: (v: string) => void; members: Member[];
  onAddSnippet: () => void; onEditSnippet: (s: Snippet) => void; onCopy: (c: string) => void; onDeleteSnippet: (s: Snippet) => void;
}) {
  const lc = (l: string) => ({ env:'#E85D2F','código':'#3498DB',config:'#2ECC71' }[l]||'#8A9099');
  return (
    <div className="h-full flex flex-col gap-5 overflow-y-auto custom-scrollbar pr-1">
      <div className="flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10 bg-[#0A0C0F] pb-2">
        <div className="flex-1 min-w-[200px]"><ImputBuscar placeholder="Buscar snippets..." value={search} onChange={e => setSearch(e.target.value)}/></div>
        <ButtonBase onClick={onAddSnippet} className="flex items-center gap-2"><Plus size={16}/> Nuevo Snippet</ButtonBase>
      </div>
      <div className="grid grid-cols-1 gap-5">
        {snippets.map(s => {
          const author = members.find(m => m.id === s.authorId);
          return (
            <div key={s.id} style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.06)" }} className="rounded-2xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{ background:`${lc(s.label)}20`, color:lc(s.label) }} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest">{s.label}</div>
                  <h3 className="text-white font-bold text-sm">{s.title}</h3>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => onCopy(s.content)} className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"><Copy size={15}/></button>
                  <button onClick={() => onEditSnippet(s)} className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-white transition-colors"><Settings size={15}/></button>
                  <button onClick={() => onDeleteSnippet(s)} className="p-1.5 hover:bg-white/5 rounded text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                </div>
              </div>
              <div className="bg-black/40 p-4 font-mono text-[11px] text-blue-300 overflow-x-auto whitespace-pre">{s.content}</div>
              <div className="p-3 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {author && <AvatarImg seed={author.avatarSeed || author.name} name={author.name} color={author.color} size={18} />}
                  <span className="text-[10px] text-gray-500">{author?.name||'Anónimo'}</span>
                </div>
                <span className="text-[10px] text-gray-600">{new Date(s.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          );
        })}
        {snippets.length === 0 && <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-3xl"><Code size={48} className="mx-auto text-white/5 mb-4"/><p className="text-gray-500">No hay snippets guardados</p></div>}
      </div>
    </div>
  );
}

// ─── Sección: Pizarra ─────────────────────────────────────────────────────────
function SectionPizarra({ notes, drawings, images, members, onAddNote, onDeleteNote, onDeleteImage, onSaveDrawings, onSaveImages, onSaveNotes, onDragNote, onDragImage, onClearAll, pushToHistory, undo, clipboard, setClipboard }: {
  notes: Note[]; drawings: DrawingPath[]; images: BoardImage[]; members: Member[];
  onAddNote: () => void; onDeleteNote: (n: Note) => void; onDeleteImage: (img: BoardImage) => void;
  onSaveDrawings: (d: DrawingPath[]) => void; onSaveImages: (i: BoardImage[]) => void; onSaveNotes: (n: Note[]) => void;
  onDragNote: (id: string, x: number, y: number) => void; onDragImage: (id: string, x: number, y: number, w?: number, h?: number) => void;
  onClearAll: () => void; pushToHistory: () => void; undo: () => void; clipboard: any; setClipboard: (v: any) => void;
}) {
  const [tool, setTool]         = useState<'select'|'pencil'|'eraser'|'hand'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [offset, setOffset]     = useState({ x:0, y:0 });
  const [zoom, setZoom]         = useState(1);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const zoomIn  = () => setZoom(p => Math.min(p+0.1, 3));
  const zoomOut = () => setZoom(p => Math.max(p-0.1, 0.3));
  const resetZoom = () => { setZoom(1); setOffset({x:0,y:0}); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName==='INPUT'||document.activeElement?.tagName==='TEXTAREA') return;
      if ((e.key==='Delete'||e.key==='Backspace') && selectedId) {
        pushToHistory();
        const n = notes.find(n => n.id===selectedId); if (n) onDeleteNote(n);
        const i = images.find(i => i.id===selectedId); if (i) onDeleteImage(i);
        setSelectedId(null);
      }
      if (e.ctrlKey||e.metaKey) {
        if (e.key==='z') { e.preventDefault(); undo(); }
        if (e.key==='c') { e.preventDefault(); const el=notes.find(n => n.id===selectedId); if (el) { setClipboard(el); toast.success("Copiado"); } }
        if (e.key==='='||e.key==='+') { e.preventDefault(); zoomIn(); }
        else if (e.key==='-') { e.preventDefault(); zoomOut(); }
        else if (e.key==='0') { e.preventDefault(); resetZoom(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, notes, images, clipboard, pushToHistory, undo]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName==='INPUT'||document.activeElement?.tagName==='TEXTAREA') return;
      const items = e.clipboardData?.items; if (!items) return;
      for (let i=0; i<items.length; i++) {
        if (items[i].type.indexOf("image")!==-1) {
          e.preventDefault(); const file=items[i].getAsFile(); if (!file) continue;
          const reader=new FileReader();
          reader.onload = ev => {
            const src=ev.target?.result as string;
            const img=new window.Image();
            img.onload = () => { pushToHistory(); onSaveImages([...images, { id:crypto.randomUUID(), src, x:100-offset.x+Math.random()*50, y:100-offset.y+Math.random()*50, width:Math.min(img.width,300), height:(img.height*Math.min(img.width,300))/img.width }]); toast.success("Imagen pegada"); };
            img.src=src;
          };
          reader.readAsDataURL(file); return;
        }
      }
      if (clipboard && 'content' in clipboard) {
        e.preventDefault(); pushToHistory();
        const newId=crypto.randomUUID();
        onSaveNotes([...notes, { ...clipboard, id:newId, x:clipboard.x+20, y:clipboard.y+20, createdAt:Date.now() }]);
        setSelectedId(newId); toast.success("Nota duplicada");
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [images, notes, clipboard, onSaveImages, onSaveNotes, offset, pushToHistory]);

  useEffect(() => {
    const canvas=canvasRef.current; if (!canvas) return;
    const ctx=canvas.getContext('2d'); if (!ctx) return;
    const redraw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height); ctx.save(); ctx.translate(offset.x,offset.y); ctx.scale(zoom,zoom);
      drawings.forEach(p => {
        if (p.points.length<2) return;
        ctx.beginPath(); ctx.strokeStyle=p.color; ctx.lineWidth=p.width; ctx.lineJoin='round'; ctx.lineCap='round';
        ctx.moveTo(p.points[0].x,p.points[0].y);
        for (let i=1;i<p.points.length;i++) ctx.lineTo(p.points[i].x,p.points[i].y);
        ctx.stroke();
      });
      ctx.restore();
    };
    const resize = () => { if (containerRef.current) { canvas.width=containerRef.current.clientWidth; canvas.height=containerRef.current.clientHeight; redraw(); } };
    window.addEventListener('resize', resize); resize();
    return () => window.removeEventListener('resize', resize);
  }, [drawings, offset, zoom]);

  const onMD=(e:React.MouseEvent)=>{
    if (tool==='select') { const t=e.target as HTMLElement; if (t===canvasRef.current||t===containerRef.current) setSelectedId(null); }
    if (tool==='hand') { setIsPanning(true); return; }
    if (tool==='pencil'||tool==='eraser') {
      pushToHistory(); setIsDrawing(true);
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      onSaveDrawings([...drawings, { points:[{x,y}], color:tool==='eraser'?'#0A0C0F':'#E85D2F', width:(tool==='eraser'?30:3)/zoom }]);
    }
  };
  const onMM=(e:React.MouseEvent)=>{
    if (isPanning) { setOffset(p=>({x:p.x+e.movementX,y:p.y+e.movementY})); return; }
    if (isDrawing) {
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      const d=[...drawings]; d[d.length-1].points.push({x,y}); onSaveDrawings(d);
    }
  };
  const onMU=()=>{ setIsDrawing(false); setIsPanning(false); };
  const getCursor=()=>tool==='hand'?(isPanning?'grabbing':'grab'):tool==='pencil'?'crosshair':tool==='eraser'?'cell':'default';

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#1C1F26] p-1.5 rounded-xl border border-white/5">
          <ToolBtn active={tool==='select'} onClick={()=>setTool('select')} icon={<ChevronRight size={16} className="-rotate-45"/>} title="Seleccionar"/>
          <ToolBtn active={tool==='hand'}   onClick={()=>setTool('hand')}   icon={<Users size={16}/>} title="Mano"/>
          <div className="w-px h-5 bg-white/5 mx-0.5"/>
          <ToolBtn active={false} onClick={zoomIn}    icon={<ZoomIn size={16}/>}  title="Zoom +"/>
          <ToolBtn active={false} onClick={zoomOut}   icon={<ZoomOut size={16}/>} title="Zoom -"/>
          <ToolBtn active={false} onClick={resetZoom} icon={<Maximize size={16}/>} title="Reset zoom"/>
          <span className="text-[10px] text-gray-500 font-bold px-2">{Math.round(zoom*100)}%</span>
          <div className="w-px h-5 bg-white/5 mx-0.5"/>
          <ToolBtn active={tool==='pencil'} onClick={()=>setTool('pencil')} icon={<Code size={16}/>}   title="Lápiz"/>
          <ToolBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} icon={<Trash2 size={16}/>} title="Borrador"/>
          <div className="w-px h-5 bg-white/5 mx-0.5"/>
          <button onClick={onClearAll} className="p-1.5 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all" title="Limpiar todo"><RefreshCw size={15}/></button>
        </div>
        <ButtonBase onClick={onAddNote} className="flex items-center gap-2"><Plus size={16}/> Agregar Nota</ButtonBase>
      </div>
      <div ref={containerRef}
        style={{ background:"#0A0C0F", backgroundImage:`radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize:`${24*zoom}px ${24*zoom}px`, backgroundPosition:`${offset.x}px ${offset.y}px`, border:"1px solid rgba(255,255,255,0.06)", borderRadius:18, cursor:getCursor(), position:'relative', overflow:'hidden', flex:1 }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none' }}/>
        <div style={{ position:'absolute', inset:0, transform:`translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin:'0 0', pointerEvents: tool==='select'?'auto':'none' }}>
          {images.map(img => <DraggableImage key={img.id} image={img} onDrag={onDragImage} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===img.id} onSelect={()=>setSelectedId(img.id)}/>)}
          {notes.map(note => <DraggableNote key={note.id} note={note} members={members} onDrag={onDragNote} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===note.id} onSelect={()=>setSelectedId(note.id)}/>)}
        </div>
        {notes.length===0&&drawings.length===0&&images.length===0&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none opacity-10">
            <StickyNote size={64}/><p className="text-xl font-bold uppercase tracking-widest">Pizarra colaborativa</p>
            <p className="text-sm">Dibuja, agrega notas o pega imágenes</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Sección: Archivos ────────────────────────────────────────────────────────
function SectionArchivos({ archivos, members, currentUser, onSave }: { archivos: SharedFile[]; members: Member[]; currentUser: Member | null; onSave: (d: SharedFile[]) => void; }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkInput, setLinkInput]   = useState('');
  const [showLink, setShowLink]     = useState(false);
  const authorName = currentUser?.name || members[0]?.name || 'Equipo';

  const processFile = (file: File) => {
    if (file.size > 5*1024*1024) { toast.error(`"${file.name}" supera 5MB. Usa un enlace.`); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      onSave([...archivos, { id:crypto.randomUUID(), name:file.name, type:file.type||'application/octet-stream', size:file.size, dataUrl:ev.target?.result as string, x:60+Math.random()*500, y:60+Math.random()*280, createdAt:Date.now(), authorName }]);
      toast.success(`"${file.name}" compartido`);
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    const url = linkInput.trim(); if (!url) return;
    let name = url; try { name = new URL(url).hostname; } catch {}
    onSave([...archivos, { id:crypto.randomUUID(), name, type:'link', size:0, dataUrl:url, x:60+Math.random()*500, y:60+Math.random()*280, createdAt:Date.now(), authorName }]);
    setLinkInput(''); setShowLink(false); toast.success("Enlace agregado");
  };

  return (
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
        <p className="text-xs text-gray-500"><span className="text-white font-semibold">{archivos.length}</span> {archivos.length===1?'archivo':'archivos'} compartidos</p>
        <div className="flex items-center gap-2">
          {showLink ? (
            <div className="flex items-center gap-2">
              <input autoFocus type="url" placeholder="https://..." value={linkInput} onChange={e=>setLinkInput(e.target.value)}
                onKeyDown={e=>{ if (e.key==='Enter') addLink(); if (e.key==='Escape') setShowLink(false); }}
                style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 12px", fontSize:13, color:"#F4F5F7", outline:"none", width:240 }}
                onFocus={e=>{e.currentTarget.style.borderColor="rgba(232,93,47,0.5)";}} onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}/>
              <ButtonBase onClick={addLink} className="flex items-center gap-1.5"><LinkIcon size={13}/> Agregar</ButtonBase>
              <button onClick={()=>setShowLink(false)} style={{ color:"#5A6270", background:"none", border:"none", cursor:"pointer", display:"flex" }}><X size={17}/></button>
            </div>
          ) : (
            <>
              <button onClick={()=>setShowLink(true)}
                style={{ padding:"7px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#8A9099", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#F4F5F7";}} onMouseLeave={e=>{e.currentTarget.style.color="#8A9099";}}>
                <LinkIcon size={13}/> Pegar enlace
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e=>{Array.from(e.target.files||[]).forEach(processFile);e.target.value='';}}/>
              <ButtonBase onClick={()=>fileInputRef.current?.click()} className="flex items-center gap-2"><UploadCloud size={15}/> Subir archivo</ButtonBase>
            </>
          )}
        </div>
      </div>
      <div style={{ flex:1, position:'relative', overflow:'hidden', borderRadius:18, background:"#0D1017", backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"32px 32px", border:isDragOver?"2px dashed #E85D2F":"1px solid rgba(255,255,255,0.06)", transition:"border-color 0.15s" }}
        onDragOver={e=>{e.preventDefault();setIsDragOver(true);}} onDragLeave={()=>setIsDragOver(false)}
        onDrop={e=>{e.preventDefault();setIsDragOver(false);Array.from(e.dataTransfer.files).forEach(processFile);}}>
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm rounded-[16px] pointer-events-none">
            <UploadCloud size={52} className="text-[#E85D2F]"/>
            <p className="text-white text-lg font-bold">Suelta para compartir</p>
            <p className="text-gray-400 text-xs">PDF, imágenes, ZIP, Word y más · máx 5 MB</p>
          </div>
        )}
        {archivos.length===0&&!isDragOver&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none opacity-15">
            <FolderOpen size={64}/><p className="text-lg font-bold uppercase tracking-widest">Espacio de archivos</p>
            <p className="text-xs uppercase tracking-widest">Arrastra archivos o usa el botón de arriba</p>
          </div>
        )}
        {archivos.map(a=><FloatingFileCard key={a.id} file={a} onDelete={()=>onSave(archivos.filter(f=>f.id!==a.id))} onDrop={(id,x,y)=>onSave(archivos.map(f=>f.id===id?{...f,x,y}:f))}/>)}
        <div className="absolute bottom-4 right-4 text-[10px] text-gray-800 font-bold uppercase tracking-widest pointer-events-none flex items-center gap-1.5"><FolderOpen size={10}/> Espacio compartido</div>
      </div>
    </div>
  );
}

// ─── Floating File Card ───────────────────────────────────────────────────────
function FloatingFileCard({ file, onDelete, onDrop }: { file: SharedFile; onDelete: () => void; onDrop: (id: string, x: number, y: number) => void; }) {
  const [pos, setPos] = useState({ x:file.x, y:file.y });
  const [isDragging, setIsDragging] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);

  const getTypeInfo = (): { icon: React.ReactNode; accent: string; label: string } => {
    const t = file.type;
    if (t==='link')   return { icon:<LinkIcon size={20}/>,   accent:'#3498DB', label:'Enlace' };
    if (t.includes('pdf'))   return { icon:<FileText size={20}/>,  accent:'#E74C3C', label:'PDF' };
    if (t.includes('image')) return { icon:<ImageIcon size={20}/>, accent:'#9B59B6', label:'Imagen' };
    if (t.includes('zip')||t.includes('rar')) return { icon:<Archive size={20}/>,  accent:'#F39C12', label:'ZIP' };
    if (t.includes('word')||t.includes('document')) return { icon:<FileText size={20}/>, accent:'#2980B9', label:'Word' };
    if (t.includes('sheet')||t.includes('excel'))   return { icon:<FileText size={20}/>, accent:'#27AE60', label:'Excel' };
    if (t.includes('video')) return { icon:<Film size={20}/>,      accent:'#E85D2F', label:'Video' };
    if (t.includes('audio')) return { icon:<Music size={20}/>,     accent:'#1ABC9C', label:'Audio' };
    if (t.includes('javascript')||t.includes('typescript')||t.includes('html')||t.includes('css')) return { icon:<FileCode size={20}/>, accent:'#F1C40F', label:'Código' };
    return { icon:<FileText size={20}/>, accent:'#8A9099', label:'Archivo' };
  };

  const formatSize = (b:number) => { if (!b) return ''; if (b<1024) return `${b} B`; if (b<1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; };
  const handleAction = () => { if (file.type==='link') window.open(file.dataUrl,'_blank'); else { const a=document.createElement('a');a.href=file.dataUrl;a.download=file.name;a.click(); } };

  const handleShare = async () => {
    if (showShare) { setShowShare(false); return; }
    setIsSharing(true);
    
    try {
      let finalDataUrl = file.dataUrl;
      const isPhysicalFile = file.type !== 'link' && file.dataUrl.startsWith('data:');

      // Si es un archivo físico, lo subimos a través de nuestra API local (Proxy)
      // para evitar errores de CORS y URLs demasiado largas (Error 431)
      if (isPhysicalFile) {
        const formData = new FormData();
        const resBlob = await fetch(file.dataUrl);
        const blob = await resBlob.blob();
        formData.append('file', blob, file.name);
        
        const response = await fetch('/api/share', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const text = await response.text();
          let msg = 'Error en el servidor';
          try { const d = JSON.parse(text); msg = d.error || msg; } catch(e) {}
          throw new Error(msg);
        }
        
        const data = await response.json();
        // Importante: Convertir ruta relativa (/shares/...) en absoluta para el payload
        finalDataUrl = window.location.origin + data.link;
      }

      const payload = { 
        name: file.name, 
        type: file.type, 
        size: file.size, 
        authorName: file.authorName, 
        createdAt: file.createdAt, 
        expiresAt: Date.now() + 15 * 60 * 1000, 
        dataUrl: finalDataUrl 
      };

      const json = JSON.stringify(payload);
      const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/gi, (_, p) => String.fromCharCode(parseInt(p, 16))));
      const safe = b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');
      
      setPublicLink(`${window.location.origin}/compartir?d=${safe}`);
      setShowShare(true);
    } catch (err: any) {
      toast.error(err.message || "No se pudo generar el link");
      console.error("Share error:", err);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    const onMM=(e:MouseEvent)=>{ if (!isDragging) return; setPos(p=>({x:p.x+e.movementX,y:p.y+e.movementY})); };
    const onMU=()=>{ if (isDragging) { setIsDragging(false); onDrop(file.id,pos.x,pos.y); } };
    if (isDragging) { window.addEventListener('mousemove',onMM); window.addEventListener('mouseup',onMU); }
    return ()=>{ window.removeEventListener('mousemove',onMM); window.removeEventListener('mouseup',onMU); };
  }, [isDragging, pos, file.id, onDrop]);

  const { icon, accent, label } = getTypeInfo();

  return (
    <div style={{ position:'absolute', left:pos.x, top:pos.y, width:215, zIndex:isDragging?100:10, cursor:isDragging?'grabbing':'grab', borderRadius:16, overflow:'hidden', background:'#1A1D24', border:`1px solid ${accent}25`, boxShadow:isDragging?`0 20px 60px rgba(0,0,0,0.7),0 0 0 2px ${accent}50`:`0 8px 28px rgba(0,0,0,0.5),0 0 0 1px ${accent}15`, transition:isDragging?'none':'box-shadow 0.2s', userSelect:'none' }}
      onMouseDown={e=>{ if ((e.target as HTMLElement).closest('button')) return; setIsDragging(true); }}>
      <div style={{ background:`linear-gradient(135deg,${accent}20 0%,${accent}07 100%)`, borderBottom:`1px solid ${accent}18`, padding:'14px 14px 10px' }}>
        <div className="flex items-start justify-between mb-2">
          <div style={{ color:accent, background:`${accent}18`, borderRadius:9, padding:'7px 8px', display:'flex' }}>{icon}</div>
          <div className="flex items-center gap-1">
            <button 
              onClick={handleShare} 
              disabled={isSharing}
              title="Generar link público" 
              style={{ color:showShare?'#3498DB':(isSharing?'#5A6270':'#3A3F4A'), background:'none', border:'none', cursor:isSharing?'wait':'pointer', padding:'2px', display:'flex', transition:'color 0.15s' }} 
              onMouseEnter={e=>{ if(!isSharing) e.currentTarget.style.color='#3498DB'; }} 
              onMouseLeave={e=>{ if(!isSharing) e.currentTarget.style.color=showShare?'#3498DB':'#3A3F4A'; }}>
              {isSharing ? <RefreshCw size={13} className="animate-spin text-blue-400" /> : <Globe size={13}/>}
            </button>
            <button onClick={onDelete} style={{ color:'#3A3F4A', background:'none', border:'none', cursor:'pointer', padding:'2px', display:'flex', transition:'color 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.color='#E74C3C';}} onMouseLeave={e=>{e.currentTarget.style.color='#3A3F4A';}}><X size={14}/></button>
          </div>
        </div>
        <p className="text-white font-bold text-xs leading-tight truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span style={{ color:accent, background:`${accent}18`, borderRadius:4, padding:'1px 6px', fontSize:9, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
          {file.size>0&&<span className="text-[10px] text-gray-600">{formatSize(file.size)}</span>}
        </div>
      </div>
      <div style={{ padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><p className="text-[10px] text-gray-500 font-medium">{file.authorName}</p><p className="text-[9px] text-gray-700">{new Date(file.createdAt).toLocaleDateString()}</p></div>
        <button onClick={handleAction} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:`${accent}15`, border:`1px solid ${accent}28`, borderRadius:8, color:accent, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background=`${accent}28`;}} onMouseLeave={e=>{e.currentTarget.style.background=`${accent}15`;}}>
          {file.type==='link'?<ExternalLink size={11}/>:<Download size={11}/>}
          {file.type==='link'?'Abrir':'Bajar'}
        </button>
      </div>
      {showShare && (
        <div style={{ borderTop:'1px solid rgba(52,152,219,0.15)', background:'rgba(52,152,219,0.04)', padding:'9px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
            <Globe size={9} color="#3498DB"/>
            <span style={{ fontSize:9, fontWeight:800, color:'#3498DB', textTransform:'uppercase', letterSpacing:'0.07em' }}>Link público · 15 min</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ flex:1, background:'rgba(0,0,0,0.3)', border:'1px solid rgba(52,152,219,0.18)', borderRadius:7, padding:'4px 7px', fontSize:9, color:'#5A6270', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{publicLink}</div>
            <button onClick={handleCopy} title={copied?'Copiado':'Copiar link'} style={{ flexShrink:0, padding:'5px 7px', background:copied?'rgba(46,204,113,0.12)':'rgba(52,152,219,0.12)', border:`1px solid ${copied?'rgba(46,204,113,0.35)':'rgba(52,152,219,0.25)'}`, borderRadius:7, color:copied?'#2ECC71':'#3498DB', cursor:'pointer', display:'flex', transition:'all 0.2s' }}>
              {copied?<Check size={11}/>:<Copy size={11}/>}
            </button>
          </div>
          <p style={{ fontSize:8, color:'#3A3F4A', marginTop:5, letterSpacing:'0.03em' }}>Cualquiera con el link puede descargar</p>
        </div>
      )}
    </div>
  );
}

// ─── Sección: Ajustes ─────────────────────────────────────────────────────────
function SectionAjustes({ members, onAddMember, onDeleteMember, onChangeAvatar }: {
  members: Member[]; onAddMember: () => void;
  onDeleteMember: (m: Member) => void;
  onChangeAvatar: (id: string, seed: string) => void;
}) {
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [customSeed, setCustomSeed] = useState('');

  return (
    <div className="max-w-3xl mx-auto">
      <div style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.06)" }} className="rounded-2xl p-8">
        <div className="flex items-center justify-between mb-7">
          <div><h3 className="text-lg font-bold text-white">Gestión de Equipo</h3><p className="text-xs text-gray-500 mt-0.5">Miembros con acceso al panel</p></div>
          <ButtonBase onClick={onAddMember} className="flex items-center gap-2"><UserPlus size={16}/> Agregar</ButtonBase>
        </div>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id}>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditingAvatarId(editingAvatarId === m.id ? null : m.id); setCustomSeed(m.avatarSeed || m.name); }}
                    style={{ position:'relative', background:'none', border:'none', padding:0, cursor:'pointer' }}
                    title="Cambiar avatar">
                    <AvatarImg seed={m.avatarSeed || m.name} name={m.name} color={m.color} size={36} />
                    <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14, borderRadius:'50%', background:'#1C1F26', border:`1px solid ${m.color}50`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Pencil size={7} color={m.color}/>
                    </div>
                  </button>
                  <div><h4 className="text-white font-bold text-sm">{m.name}</h4><p className="text-xs text-gray-500">{m.role}</p></div>
                </div>
                <button onClick={() => onDeleteMember(m)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>

              {editingAvatarId === m.id && (
                <div style={{ background:'#13161C', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:16, marginTop:4 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#5A6270', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Elige tu avatar</p>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                    {AVATAR_PRESETS.map(seed => (
                      <button key={seed} onClick={() => { onChangeAvatar(m.id, seed); setEditingAvatarId(null); }}
                        style={{ background:(m.avatarSeed||m.name)===seed?`${m.color}20`:'transparent', border:`1.5px solid ${(m.avatarSeed||m.name)===seed?m.color:'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:4, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=m.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=(m.avatarSeed||m.name)===seed?m.color:'rgba(255,255,255,0.08)';}}>
                        <AvatarImg seed={seed} name={seed} color={m.color} size={36} />
                      </button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input
                      placeholder="O escribe tu propio seed…"
                      value={customSeed}
                      onChange={e => setCustomSeed(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter' && customSeed.trim()) { onChangeAvatar(m.id, customSeed.trim()); setEditingAvatarId(null); } if (e.key==='Escape') setEditingAvatarId(null); }}
                      style={{ flex:1, background:'#0A0C0F', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 10px', fontSize:12, color:'#F4F5F7', outline:'none', fontFamily:"'DM Sans', system-ui, sans-serif" }}
                      onFocus={e=>{e.currentTarget.style.borderColor='rgba(232,93,47,0.5)';}}
                      onBlur={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}
                    />
                    <button
                      onClick={() => { if (customSeed.trim()) { onChangeAvatar(m.id, customSeed.trim()); setEditingAvatarId(null); } }}
                      style={{ width:34, height:34, background:`${m.color}20`, border:`1px solid ${m.color}40`, borderRadius:8, color:m.color, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <Check size={14}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pizarra Helpers ──────────────────────────────────────────────────────────
function ToolBtn({ active, onClick, icon, title }: any) {
  return <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-all ${active?'bg-[#E85D2F] text-white':'text-gray-500 hover:text-white hover:bg-white/5'}`}>{icon}</button>;
}

function DraggableImage({ image, onDrag, disabled, zoom, isSelected, onSelect }: any) {
  const [pos, setPos] = useState({ x:image.x, y:image.y, w:image.width, h:image.height });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir]   = useState<string|null>(null);
  useEffect(() => {
    const onMM=(e:MouseEvent)=>{
      if (isDragging) setPos(p=>({...p,x:p.x+e.movementX/zoom,y:p.y+e.movementY/zoom}));
      if (resizeDir) setPos(p=>{ let{x,y,w,h}=p; const dx=e.movementX/zoom,dy=e.movementY/zoom; if(resizeDir.includes('e'))w+=dx; if(resizeDir.includes('w')){x+=dx;w-=dx;} if(resizeDir.includes('s'))h+=dy; if(resizeDir.includes('n')){y+=dy;h-=dy;} if(resizeDir==='se'||resizeDir==='nw')h=w/(image.width/image.height); return{x,y,w:Math.max(20,w),h:Math.max(20,h)}; });
    };
    const onMU=()=>{ if(isDragging||resizeDir){setIsDragging(false);setResizeDir(null);onDrag(image.id,pos.x,pos.y,pos.w,pos.h);} };
    if(isDragging||resizeDir){window.addEventListener('mousemove',onMM);window.addEventListener('mouseup',onMU);}
    return()=>{window.removeEventListener('mousemove',onMM);window.removeEventListener('mouseup',onMU);};
  },[isDragging,resizeDir,pos,image.id,onDrag,zoom,image.width,image.height]);
  return (
    <div style={{ position:'absolute',left:pos.x,top:pos.y,width:pos.w,height:pos.h,zIndex:(isDragging||resizeDir)?49:9,cursor:disabled?'inherit':(isDragging?'grabbing':'grab'),boxShadow:isSelected?`0 0 0 2px #E85D2F,0 10px 30px rgba(0,0,0,0.5)`:"0 10px 30px rgba(0,0,0,0.3)",pointerEvents:'auto' }}
      onMouseDown={()=>{ if(disabled)return; onSelect(); setIsDragging(true); }} className="group select-none">
      <img src={image.src} className="w-full h-full object-cover rounded-xl border border-white/10" draggable="false"/>
      {isSelected&&!disabled&&(['nw','ne','sw','se'] as const).map(dir=>(
        <div key={dir} onMouseDown={e=>{e.stopPropagation();onSelect();setResizeDir(dir);}}
          className={`absolute w-3 h-3 bg-white rounded-full border-2 border-[#E85D2F] z-50 ${dir==='nw'?'-top-1.5 -left-1.5 cursor-nw-resize':dir==='ne'?'-top-1.5 -right-1.5 cursor-ne-resize':dir==='sw'?'-bottom-1.5 -left-1.5 cursor-sw-resize':'-bottom-1.5 -right-1.5 cursor-se-resize'}`}/>
      ))}
    </div>
  );
}

function DraggableNote({ note, members, onDrag, disabled, zoom, isSelected, onSelect }: any) {
  const [pos, setPos] = useState({ x:note.x, y:note.y });
  const [isDragging, setIsDragging] = useState(false);
  const author = members.find((m:any) => m.id===note.authorId);
  useEffect(()=>{
    const onMM=(e:MouseEvent)=>{ if(!isDragging)return; setPos(p=>({x:p.x+e.movementX/zoom,y:p.y+e.movementY/zoom})); };
    const onMU=()=>{ if(isDragging){setIsDragging(false);onDrag(note.id,pos.x,pos.y);} };
    if(isDragging){window.addEventListener('mousemove',onMM);window.addEventListener('mouseup',onMU);}
    return()=>{window.removeEventListener('mousemove',onMM);window.removeEventListener('mouseup',onMU);};
  },[isDragging,pos,note.id,onDrag,zoom]);
  return (
    <div style={{ position:'absolute',left:pos.x,top:pos.y,background:"#1C1F26",border:`1px solid ${note.color}40`,width:220,boxShadow:isSelected?`0 0 0 2px #E85D2F,0 10px 30px rgba(0,0,0,0.5)`:"0 10px 30px rgba(0,0,0,0.5)",zIndex:isDragging?50:10,cursor:disabled?'inherit':(isDragging?'grabbing':'grab'),transform:`rotate(${((note.createdAt%10)-5)/2}deg)`,pointerEvents:'auto' }}
      onMouseDown={e=>{ if(disabled||(e.target as HTMLElement).closest('button'))return; onSelect(); setIsDragging(true); }}
      className="rounded-xl p-4 select-none">
      <div className="flex items-center gap-2 mb-3">
        {author
          ? <AvatarImg seed={author.avatarSeed || author.name} name={author.name} color={author.color} size={20} borderRadius={6} />
          : <div style={{ width:20, height:20, borderRadius:6, background: note.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:'#fff' }}>?</div>
        }
        <span className="text-[10px] text-gray-400 font-bold">{author?.name}</span>
      </div>
      <p className="text-gray-200 text-xs leading-relaxed whitespace-pre-wrap">{note.content}</p>
    </div>
  );
}

// ─── Forms ────────────────────────────────────────────────────────────────────
function MemberForm({ onAdd }: { onAdd: (n:string,r:string)=>void }) {
  const [name,setName]=useState(''); const [role,setRole]=useState('Full Stack Developer');
  return (
    <div className="flex flex-col gap-4">
      <InputBase1 label="Nombre" placeholder="Ej: Luis Paredes" value={name} onChange={e=>setName(e.target.value)}/>
      <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Rol</label>
        <select value={role} onChange={e=>setRole(e.target.value)} className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none">
          <option>Full Stack Developer</option><option>Frontend Developer</option><option>Backend Developer</option><option>UI/UX Designer</option><option>DevOps Engineer</option>
        </select>
      </div>
      <div className="flex justify-end mt-3"><ButtonBase onClick={()=>onAdd(name,role)}>Guardar Miembro</ButtonBase></div>
    </div>
  );
}

function MemberPicker({ members, value, currentUser, onChange }: { members: Member[]; value: string; currentUser: Member|null; onChange: (id: string) => void; }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <label style={{ fontSize:11, fontWeight:700, color:'#5A6270', textTransform:'uppercase', letterSpacing:'0.1em' }}>Asignar a</label>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(members.length, 4)}, 1fr)`, gap:8 }}>
        {members.map(m => {
          const selected = value === m.id;
          const isMe = currentUser?.id === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:7,
                padding:'12px 8px 10px',
                background: selected ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                border: selected ? `1.5px solid ${m.color}` : '1.5px solid rgba(255,255,255,0.07)',
                borderRadius:12,
                cursor:'pointer',
                transition:'all 0.15s',
                position:'relative',
                outline:'none',
              }}
              onMouseEnter={e => { if (!selected) { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; } }}
              onMouseLeave={e => { if (!selected) { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; } }}
            >
              {selected && (
                <span style={{ position:'absolute', top:5, right:5, width:14, height:14, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Check size={8} color="#fff"/>
                </span>
              )}
              <AvatarImg seed={m.avatarSeed||m.name} name={m.name} color={m.color} size={36} borderRadius={10}/>
              <div style={{ textAlign:'center', width:'100%' }}>
                <p style={{ fontSize:11, fontWeight:700, color: selected ? '#F4F5F7' : '#8A9099', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', transition:'color 0.15s' }}>
                  {m.name}{isMe ? ' (tú)' : ''}
                </p>
                <p style={{ fontSize:9, fontWeight:500, color: selected ? m.color : '#3A3F48', margin:'2px 0 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', transition:'color 0.15s' }}>
                  {m.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function TaskForm({ members, initialData, currentUser, onSave, onCancel }: { members: Member[]; initialData?: Task; currentUser: Member|null; onSave: (d:Partial<Task>)=>void; onCancel:()=>void; }) {
  const [form,setForm]=useState<any>(initialData||{ title:'', description:'', priority:'media', assignedTo: currentUser?.id||members[0]?.id||'' });
  const PC: Record<string,{color:string;label:string}> = { baja:{color:'#3498DB',label:'Baja'}, media:{color:'#F1C40F',label:'Media'}, alta:{color:'#E74C3C',label:'Alta'} };
  return (
    <div className="flex flex-col gap-4">
      <InputBase1 label="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Descripción</label>
        <textarea className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none min-h-[80px]" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
        <label style={{ fontSize:11, fontWeight:700, color:'#5A6270', textTransform:'uppercase', letterSpacing:'0.1em' }}>Prioridad</label>
        <div style={{ display:'flex', gap:8 }}>
          {Object.entries(PC).map(([key, { color, label }]) => {
            const sel = form.priority === key;
            return (
              <button key={key} type="button" onClick={() => setForm({...form, priority: key})}
                style={{ flex:1, padding:'9px 4px', borderRadius:9, border: sel ? `1.5px solid ${color}` : '1.5px solid rgba(255,255,255,0.07)',
                  background: sel ? `${color}18` : 'rgba(255,255,255,0.03)', color: sel ? color : '#5A6270',
                  fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.15s', display:'flex', alignItems:'center', justifyContent:'center', gap:5 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:color, display:'inline-block', flexShrink:0 }}/>
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <MemberPicker members={members} value={form.assignedTo} currentUser={currentUser} onChange={id=>setForm({...form,assignedTo:id})}/>
      <div className="flex justify-end gap-3 mt-2">
        <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
        <ButtonBase onClick={()=>onSave(form)}>{initialData?'Actualizar':'Crear Tarea'}</ButtonBase>
      </div>
    </div>
  );
}

function SnippetForm({ members, initialData, onSave, onCancel }: { members:Member[]; initialData?:Snippet; onSave:(d:Partial<Snippet>)=>void; onCancel:()=>void; }) {
  const [form,setForm]=useState<any>(initialData||{ title:'', content:'', label:'código', authorId:members[0]?.id||'' });
  return (
    <div className="flex flex-col gap-4">
      <InputBase1 label="Título" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contenido</label>
        <textarea className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm font-mono outline-none min-h-[130px]" value={form.content} onChange={e=>setForm({...form,content:e.target.value})}/>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Etiqueta</label>
          <select value={form.label} onChange={e=>setForm({...form,label:e.target.value})} className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none">
            <option value="código">Código</option><option value="env">Variable .env</option><option value="config">Configuración</option><option value="otro">Otro</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Autor</label>
          <select value={form.authorId} onChange={e=>setForm({...form,authorId:e.target.value})} className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none">
            {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-4"><ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase><ButtonBase onClick={()=>onSave(form)}>Guardar Snippet</ButtonBase></div>
    </div>
  );
}

function NoteForm({ members, onSave, onCancel }: { members:Member[]; onSave:(c:string,a:string)=>void; onCancel:()=>void; }) {
  const [content,setContent]=useState(''); const [authorId,setAuthorId]=useState(members[0]?.id||'');
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Contenido</label>
        <textarea className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none min-h-[110px]" placeholder="Escribe algo importante..." value={content} onChange={e=>setContent(e.target.value)}/>
      </div>
      <div className="flex flex-col gap-1.5"><label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Autor</label>
        <select value={authorId} onChange={e=>setAuthorId(e.target.value)} className="bg-[#0A0C0F] border border-white/10 rounded-lg text-white p-3 text-sm outline-none">
          {members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="flex justify-end gap-3 mt-4"><ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase><ButtonBase onClick={()=>onSave(content,authorId)}>Publicar Nota</ButtonBase></div>
    </div>
  );
}

