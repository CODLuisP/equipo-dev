"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users, CheckSquare, Plus, Trash2, Pencil, Filter, RefreshCw,
  ChevronLeft, Check, Search, X, AlertTriangle,
} from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { Member, Task } from "@/app/dashboard/types";

// ─── Task Detail Modal ───────────────────────────────────────────────────────

function TaskDetailModal({ task, member, open, onClose }: {
  task: Task | null; member?: Member; open: boolean; onClose: () => void;
}) {
  const [lightbox, setLightbox] = useState<string | null>(null);
  if (!task) return null;

  const statusLabel = task.status === 'completada' ? 'Completada' : task.status === 'en progreso' ? 'En progreso' : 'Pendiente';
  const statusColor = task.status === 'completada' ? '#22c55e' : task.status === 'en progreso' ? '#f59e0b' : '#94a3b8';

  return (
    <>
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden gap-0 outline-none flex flex-col" style={{
        background: '#1a1d27',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 18,
        maxWidth: 560,
        maxHeight: '82vh',
        fontFamily: 'Arial, sans-serif',
      }}>
        {/* Header minimalista */}
        <div style={{ padding: '22px 28px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            {member && (
              <>
                <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={16} borderRadius={4} />
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>{member.name}</span>
                <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontFamily: 'system-ui, sans-serif' }}>·</span>
              </>
            )}
            <span style={{ fontSize: 10, color: statusColor, fontWeight: 600, fontFamily: 'system-ui, sans-serif' }}>{statusLabel}</span>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#f1f3f9', margin: '0 0 18px', lineHeight: 1.35, letterSpacing: '-0.2px' }}>
            {task.title}
          </h2>
          <div style={{ height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {/* Cuerpo tipo bloc de notas — bloques en orden */}
        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '20px 28px 28px' }}>
          {task.blocks && task.blocks.length > 0 ? (
            task.blocks.map(block => block.type === 'text' ? (
              block.content?.trim() ? (
                <p key={block.id} style={{ fontSize: 14, color: '#c8cdd8', lineHeight: 1.75, margin: '0 0 14px', whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
                  {block.content}
                </p>
              ) : null
            ) : (
              <div key={block.id} style={{ marginBottom: 10 }}>
                <img
                  src={block.url} alt={block.name}
                  onClick={() => setLightbox(block.url!)}
                  style={{ display: 'block', maxWidth: '100%', maxHeight: 280, objectFit: 'contain', objectPosition: 'left', borderRadius: 8, cursor: 'zoom-in' }}
                />
              </div>
            ))
          ) : task.description ? (
            <p style={{ fontSize: 14, color: '#c8cdd8', lineHeight: 1.75, margin: '0 0 22px', whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
              {task.description}
            </p>
          ) : (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.18)', lineHeight: 1.6, margin: 0, fontStyle: 'italic', fontFamily: 'Arial, sans-serif' }}>
              Sin descripción — edita la tarea para agregar instrucciones.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>

    {lightbox && createPortal(
      <div onClick={() => setLightbox(null)} style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.88)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'zoom-out',
      }}>
        <img src={lightbox} style={{ maxWidth: '92vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 10 }} />
      </div>,
      document.body
    )}
    </>
  );
}

// ─── Sub-componente: Task Card ──────────────────────────────────────────────

function TaskCard({ task, member, isCurrentUser, size = 'md', onEdit, onDelete, onChangeStatus, onStart, onViewDetail }: {
  task: Task; member?: Member; isCurrentUser: boolean; size?: 'sm' | 'md' | 'lg';
  onEdit: (t: Task) => void; onDelete: (t: Task) => void;
  onChangeStatus: (id: string, s: Task['status']) => void;
  onStart: (id: string) => void;
  onViewDetail?: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('taskStatus', task.status);
        e.dataTransfer.effectAllowed = 'move';
      }}
      onClick={onViewDetail ? onViewDetail : undefined}
      className={`group relative flex flex-col gap-2 rounded-xl bg-[#212529] hover:bg-[#2a2e38] ${size === 'lg' ? 'p-4' : 'p-3'}`}
      style={{
        border: `1px solid ${isCurrentUser ? 'rgba(var(--blue-rgb),0.3)' : 'rgba(255,255,255,0.08)'}`,
        cursor: onViewDetail ? 'pointer' : 'grab',
      }}
    >
      <div className="z-10 flex-1">
        <h4 className={`text-[12px] text-gray-300 leading-tight ${size === 'lg' ? 'text-sm' : ''}`}>
          {task.title}
        </h4>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 z-10 mt-auto gap-2">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {member && <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={size === 'lg' ? 22 : 18} borderRadius={6} />}
          <div className="flex flex-col min-w-0">
            <span className="text-[9px] text-gray-200 font-bold leading-none truncate">{member?.name || 'Sin asignar'}</span>
            <span className="text-[9px] text-blue-300 mt-0.5">Responsable</span>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(task); }} className="p-1 bg-white/5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all" title="Editar">
            <Pencil size={9} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(task); }} className="p-1 bg-white/5 hover:bg-red-500/15 rounded-md text-gray-500 hover:text-red-400 transition-all" title="Eliminar">
            <Trash2 size={9} />
          </button>
          {task.status !== 'pendiente' && (
            <button onClick={e => { e.stopPropagation(); onChangeStatus(task.id, task.status === 'completada' ? 'en progreso' : 'pendiente'); }}
              className="p-1 bg-white/5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={10} />
            </button>
          )}
          {task.status === 'pendiente' && (
            <button onClick={e => { e.stopPropagation(); onStart(task.id); }}
              className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all bg-(--blue) text-white shadow-[0_3px_10px_rgba(var(--blue-rgb),0.3)]">
              Iniciar
            </button>
          )}
          {task.status === 'en progreso' && (
            <button onClick={e => { e.stopPropagation(); onChangeStatus(task.id, 'completada'); }}
              className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all bg-(--blue) text-white shadow-[0_3px_10px_rgba(var(--blue-rgb),0.3)]">
              Finalizar
            </button>
          )}
          {task.status === 'completada' && (
            <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Check size={9} className="text-green-500" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Custom Filter Dropdown ──────────────────────────────────────────────────

function FilterDropdown({ value, onChange, members }: {
  value: string; onChange: (v: string) => void; members: Member[];
}) {
  const [open, setOpen] = useState(false);
  const ref        = useRef<HTMLDivElement>(null);
  const panelRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const inTrigger = ref.current?.contains(e.target as Node);
      const inPanel   = panelRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const options = [{ id: 'all', label: 'Todos los miembros' }, ...members.map(m => ({ id: m.id, label: m.name }))];
  const selected = options.find(o => o.id === value) ?? options[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 10px',
          background: open ? 'rgba(var(--blue-rgb),0.10)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(var(--blue-rgb),0.35)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 10, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Filter size={11} color="#4a5570" />
        <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap' }}>
          {selected.label}
        </span>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#4a5570" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Dropdown via portal — evita el stacking context de backdropFilter */}
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={panelRef} style={{
          position: 'fixed', zIndex: 99999,
          minWidth: 200,
          background: '#161b22',
          border: '1px solid rgba(var(--blue-rgb),0.25)',
          borderRadius: 14,
          padding: '6px',
          maxHeight: 280,
          overflowY: 'auto',
          top: ref.current ? ref.current.getBoundingClientRect().bottom + 6 : 60,
          left: ref.current ? ref.current.getBoundingClientRect().left : 0,
        }}>
          {options.map(opt => {
            const active = opt.id === value;
            return (
              <button
                key={opt.id}
                onClick={() => { onChange(opt.id); setOpen(false); }}
                style={{
                  width: '100%', textAlign: 'left',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: 9, border: 'none', cursor: 'pointer',
                  background: active ? 'rgba(var(--blue-rgb),0.14)' : 'transparent',
                  color: active ? 'var(--blue-light)' : '#cbd5e1',
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(var(--blue-rgb),0.14)' : 'transparent'; }}
              >
                {opt.label}
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 6L5 9L10 3" stroke="var(--blue-soft)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Sección: Tareas — Centro de Comando Bento ────────────────────────────────

export default function SectionTareas({ tasks, members, filterMember, setFilterMember, currentUser, onAddTask, onEditTask, onChangeStatus, onStartTask, onDeleteTask, onClearCompleted }: {
  tasks: Task[]; members: Member[]; filterMember: string; setFilterMember: (v: string) => void;
  currentUser: Member | null; onAddTask: () => void; onEditTask: (t: Task) => void;
  onChangeStatus: (id: string, s: Task['status']) => void; onStartTask: (id: string) => void;
  onDeleteTask: (t: Task) => void; onClearCompleted: () => void;
}) {
  const [search, setSearch] = useState('');
  const [overPending,  setOverPending]  = useState(false);
  const [overProgress, setOverProgress] = useState(false);
  const [overDone,     setOverDone]     = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const detailTask = detailTaskId ? (tasks.find(t => t.id === detailTaskId) ?? null) : null;

  // Estadísticas: sobre TODAS las tareas (no se alteran al buscar)
  const total   = tasks.length;
  const doneAll = tasks.filter(t => t.status === 'completada');
  const pct     = total > 0 ? Math.round((doneAll.length / total) * 100) : 0;
  const metaSemanal  = total > 0 ? total : 1;
  const metaProgreso = Math.min(Math.round((doneAll.length / metaSemanal) * 100), 100);

  // Listas visibles: filtradas por el buscador de título
  const q = search.trim().toLowerCase();
  const matches = (t: Task) => !q || t.title.toLowerCase().includes(q);
  const pending    = tasks.filter(t => t.status === 'pendiente'   && matches(t));
  const inProgress = tasks.filter(t => t.status === 'en progreso' && matches(t));
  const done       = tasks.filter(t => t.status === 'completada'  && matches(t));

  const handleDropOnProgress = (e: React.DragEvent) => {
    e.preventDefault();
    setOverProgress(false);
    const id     = e.dataTransfer.getData('taskId');
    const status = e.dataTransfer.getData('taskStatus');
    if (id && status === 'pendiente') onStartTask(id);
  };

  const handleDropOnPending = (e: React.DragEvent) => {
    e.preventDefault();
    setOverPending(false);
    const id     = e.dataTransfer.getData('taskId');
    const status = e.dataTransfer.getData('taskStatus');
    if (id && status === 'en progreso') onChangeStatus(id, 'pendiente');
  };

  const handleDropOnDone = (e: React.DragEvent) => {
    e.preventDefault();
    setOverDone(false);
    const id     = e.dataTransfer.getData('taskId');
    const status = e.dataTransfer.getData('taskStatus');
    if (id && status !== 'completada') onChangeStatus(id, 'completada');
  };

  return (
    <div className="flex flex-col gap-3 overflow-y-auto md:h-full md:overflow-hidden relative">

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-(--blue)/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Top Control HUD ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 z-10">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.3px" }}>Gestión de Tareas</h2>
          <div className="h-6 w-px bg-white/5 hidden sm:block" />
          <FilterDropdown value={filterMember} onChange={setFilterMember} members={members} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={11} style={{ position: 'absolute', left: 10, color: '#4a5570', pointerEvents: 'none' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tarea…"
              style={{
                height: 29, width: 150, paddingLeft: 28, paddingRight: search ? 26 : 10,
                background: search ? 'rgba(var(--blue-rgb),0.10)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${search ? 'rgba(var(--blue-rgb),0.35)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 10, color: 'var(--text)', fontSize: 11, fontWeight: 600, outline: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.15s',
              }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 7, background: 'transparent', border: 'none', cursor: 'pointer', color: '#4a5570', display: 'flex', padding: 0 }} title="Limpiar">
                <X size={12} />
              </button>
            )}
          </div>
        </div>
        <button onClick={onAddTask} className="flex items-center gap-1.5 bg-(--blue) hover:bg-[#1d4ed8] text-gray-100 px-4 py-2 rounded-lg font-semibold text-[10px] uppercase tracking-wider transition-all shadow-[0_6px_20px_rgba(var(--blue-rgb),0.3)]">
          <Plus size={12}/> Nueva Tarea
        </button>
      </div>

      {/* ── Main Bento Grid ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 md:grid-rows-6 gap-3 md:min-h-0 z-10">

        {/* Panel 1: Pendientes */}
        <div
          className="md:col-span-3 md:row-span-6 flex flex-col gap-2 rounded-[24px] p-3 overflow-hidden max-h-64 md:max-h-none"
          style={{
            background: overPending ? 'rgba(var(--blue-rgb),0.06)' : 'rgba(255,255,255,0.02)',
            border: overPending ? '1px solid rgba(var(--blue-rgb),0.35)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onDragOver={e => { e.preventDefault(); if (!overPending) setOverPending(true); }}
          onDragLeave={() => setOverPending(false)}
          onDrop={handleDropOnPending}
        >
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-1.5">
              
              <h3 className="text-[10px] font-semibold uppercase text-gray-300 mb-1" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>Pendientes</h3>
            </div>
            <span className="text-[9px] font-mono text-gray-200">[{pending.length}]</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
            {pending.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="sm" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} onStart={onStartTask} onViewDetail={() => setDetailTaskId(task.id)} />
            ))}
            {pending.length === 0 && (
              q ? <div className="py-8 text-center opacity-20 italic text-[10px]">Sin resultados</div>
                : <button onClick={onAddTask} className="py-8 flex flex-col items-center gap-2 opacity-40 hover:opacity-80 transition-all">
                    <Plus size={16} className="text-gray-400" />
                    <span className="italic text-[10px]">Agregar tarea</span>
                  </button>
            )}
          </div>
        </div>

        {/* Panel 2: Área de Ejecución */}
        <div
          className="md:col-span-7 md:row-span-6 flex flex-col gap-3 rounded-[28px] p-4 md:p-5 overflow-hidden relative min-h-80 md:min-h-0"
          style={{
            background: overProgress ? 'rgba(var(--blue-rgb),0.07)' : 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)',
            border: overProgress ? '1px solid rgba(var(--blue-rgb),0.40)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onDragOver={e => { e.preventDefault(); if (!overProgress) setOverProgress(true); }}
          onDragLeave={() => setOverProgress(false)}
          onDrop={handleDropOnProgress}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] rounded-[28px] overflow-hidden" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

<h3 className="text-[10px] font-semibold uppercase text-gray-300 mb-1" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>Tareas en Progreso</h3>




<div className="flex-1 overflow-y-auto custom-scrollbar pr-1 grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
            {inProgress.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="md" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} onStart={onStartTask} onViewDetail={() => setDetailTaskId(task.id)} />
            ))}
            {inProgress.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-14 border-2 border-dashed border-white/5 rounded-[20px]">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3"><CheckSquare size={20} className="text-gray-700" /></div>
                <p className="text-gray-600 font-bold uppercase text-[9px] tracking-widest">{q ? 'Sin resultados' : 'Todo despejado. Arrastra una tarea aquí.'}</p>
                {!q && (
                  <button onClick={onAddTask} className="mt-3 flex items-center gap-1.5 bg-(--blue) hover:bg-[#1d4ed8] text-gray-100 px-3 py-1.5 rounded-lg font-semibold text-[9px] uppercase tracking-wider transition-all">
                    <Plus size={11}/> Nueva Tarea
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="pt-2 border-t border-white/5 flex items-center justify-between opacity-40">
            <div className="flex gap-3">
              <div className="flex flex-col"><span className="text-[7px] font-bold text-gray-500 uppercase">En progreso</span><span className="text-[9px] font-mono text-white">{inProgress.length}</span></div>
              <div className="flex flex-col"><span className="text-[7px] font-bold text-gray-500 uppercase">Total</span><span className="text-[9px] font-mono text-white">{total}</span></div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{pct}% completado</span>
            </div>
          </div>
        </div>

        {/* Panel 3: Stats + Bóveda */}
        <div className="md:col-span-2 md:row-span-6 flex flex-col gap-3">

          {/* Performance + Meta: side by side on mobile, stacked on desktop */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-3">
            {/* Performance Card */}
            <div className="flex flex-col gap-2 md:gap-3 bg-(--blue) rounded-[22px] p-3 md:p-4 shadow-[0_12px_32px_rgba(var(--blue-rgb),0.2)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">Rendimiento</span>
                <RefreshCw size={11} className="text-white/60" />
              </div>
              <div className="flex flex-col relative z-10">
                <span className="text-2xl md:text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-1.5px" }}>{pct}%</span>
              </div>
              <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Meta del Equipo Card */}
            <div className="bg-[#1C1F26] border border-white/5 rounded-[20px] p-3 flex flex-col gap-2">
              <div className="flex items-center gap-1.5">
                <div className="p-1 bg-(--blue)/10 rounded-md"><Users size={11} className="text-(--blue)" /></div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Meta</h4>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.8px" }}>{done.length}<span className="text-gray-600 text-xs ml-1">/ {metaSemanal}</span></p>
                  <p className="text-[9px] text-gray-400 hidden md:block">Tareas esta semana</p>
                </div>
                <p className="text-xs font-bold text-(--blue)">{metaProgreso}%</p>
              </div>
              <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-linear-to-r from-(--blue) to-(--blue-soft) transition-all duration-1000" style={{ width: `${metaProgreso}%` }} />
              </div>
            </div>
          </div>

          {/* Bóveda */}
          <div
            className="flex-1 flex flex-col gap-2 border rounded-[22px] p-3 overflow-hidden max-h-52 md:max-h-none"
            style={{
              background: overDone ? 'rgba(var(--blue-rgb),0.06)' : 'rgba(255,255,255,0.02)',
              borderColor: overDone ? 'rgba(var(--blue-rgb),0.35)' : 'rgba(255,255,255,0.05)',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onDragOver={e => { e.preventDefault(); if (!overDone) setOverDone(true); }}
            onDragLeave={() => setOverDone(false)}
            onDrop={handleDropOnDone}
          >
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
<h3 className="text-[10px] font-semibold uppercase text-gray-300 mb-1" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>Bóveda</h3>
              </div>
              {doneAll.length > 0 && <button onClick={() => setConfirmClear(true)} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-red-500 transition-all" title="Vaciar completadas"><Trash2 size={10}/></button>}
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5">
              {done.map(task => (
                <div key={task.id} onClick={() => setDetailTaskId(task.id)} className="p-2 bg-white/2 border border-white/5 rounded-lg flex items-center justify-between group opacity-60 hover:opacity-100 transition-all cursor-pointer">
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-[10px] font-bold truncate">{task.title}</span>
                    <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Completada</span>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button onClick={e => { e.stopPropagation(); onChangeStatus(task.id, 'en progreso'); }} className="p-1 opacity-0 group-hover:opacity-100 transition-all text-gray-500 hover:text-white" title="Reabrir"><ChevronLeft size={10} /></button>
                    <button onClick={e => { e.stopPropagation(); onDeleteTask(task); }} className="p-1 opacity-0 group-hover:opacity-100 transition-all text-gray-500 hover:text-red-400" title="Eliminar"><Trash2 size={9} /></button>
                  </div>
                </div>
              ))}
              {done.length === 0 && <div className="py-8 text-center opacity-80 italic text-[10px]">{q ? 'Sin resultados' : 'Sin datos...'}</div>}
            </div>
          </div>

        </div>

      </div>

      <TaskDetailModal
        task={detailTask}
        member={detailTask ? members.find(m => m.id === detailTask.assignedTo) : undefined}
        open={!!detailTask}
        onClose={() => setDetailTaskId(null)}
      />

      {/* Confirmación: vaciar bóveda */}
      <Dialog open={confirmClear} onOpenChange={v => { if (!v) setConfirmClear(false); }}>
        <DialogContent className="p-0 overflow-hidden gap-0 outline-none" style={{
          background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, maxWidth: 380,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          <div style={{ padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', marginBottom: 14 }}>
              <AlertTriangle size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#f4f4f6', margin: '0 0 6px' }}>Vaciar bóveda</h3>
            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)', margin: '0 0 20px', lineHeight: 1.5 }}>
              Se eliminarán <b style={{ color: 'rgba(255,255,255,0.75)' }}>{doneAll.length}</b> tarea{doneAll.length !== 1 ? 's' : ''} completada{doneAll.length !== 1 ? 's' : ''}. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setConfirmClear(false)} style={{ height: 36, padding: '0 16px', borderRadius: 9, border: '1px solid rgba(255,255,255,0.1)', background: 'transparent', color: 'rgba(255,255,255,0.7)', fontSize: 12.5, fontWeight: 700, cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => { onClearCompleted(); setConfirmClear(false); }} style={{ height: 36, padding: '0 18px', borderRadius: 9, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.18)', color: '#f87171', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}>Vaciar</button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
