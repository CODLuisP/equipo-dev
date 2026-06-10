"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Users, CheckSquare, Plus, Trash2, Pencil, Filter, RefreshCw,
  ChevronLeft, Check
} from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member, Task } from "@/app/dashboard/types";

// ─── Sub-componente: Task Card ──────────────────────────────────────────────

function TaskCard({ task, member, isCurrentUser, size = 'md', onEdit, onDelete, onChangeStatus, onStart }: {
  task: Task; member?: Member; isCurrentUser: boolean; size?: 'sm' | 'md' | 'lg';
  onEdit: (t: Task) => void; onDelete: (t: Task) => void;
  onChangeStatus: (id: string, s: Task['status']) => void;
  onStart: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={e => {
        e.dataTransfer.setData('taskId', task.id);
        e.dataTransfer.setData('taskStatus', task.status);
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={`group relative flex flex-col gap-2 rounded-xl ${size === 'lg' ? 'p-4' : 'p-3'}`}
      style={{
        background: isCurrentUser ? 'rgba(30, 34, 45, 0.8)' : 'rgba(22, 25, 31, 0.6)',
        border: `1px solid ${isCurrentUser ? 'rgba(37,99,235,0.3)' : 'rgba(255,255,255,0.08)'}`,
        backdropFilter: 'blur(12px)',
        boxShadow: isCurrentUser ? `0 8px 24px -8px rgba(0,0,0,0.5), 0 0 0 1px rgba(37,99,235,0.1)` : '0 6px 20px -8px rgba(0,0,0,0.3)',
        transition: 'background 0.2s, border-color 0.2s',
        cursor: 'grab',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = isCurrentUser ? 'rgba(37,99,235,0.10)' : 'rgba(30,33,42,0.85)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = isCurrentUser ? 'rgba(30,34,45,0.8)' : 'rgba(22,25,31,0.6)'; }}
    >
      <div className="z-10 flex-1">
        <h4 className={`text-white font-bold leading-tight group-hover:text-[#2563eb] transition-colors ${size === 'lg' ? 'text-sm' : 'text-xs'}`} style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.2px" }}>
          {task.title}
        </h4>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5 z-10 mt-auto">
        <div className="flex items-center gap-1.5">
          {member && <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={size === 'lg' ? 22 : 18} borderRadius={6} />}
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-400 font-bold leading-none">{member?.name || 'Sin asignar'}</span>
            <span className="text-[7px] text-gray-600 font-bold uppercase tracking-wide mt-0.5">Responsable</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Editar y eliminar en el footer */}
          <button onClick={() => onEdit(task)} className="p-1 bg-white/5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all" title="Editar">
            <Pencil size={9} />
          </button>
          <button onClick={() => onDelete(task)} className="p-1 bg-white/5 hover:bg-red-500/15 rounded-md text-gray-500 hover:text-red-400 transition-all" title="Eliminar">
            <Trash2 size={9} />
          </button>
          {/* Separador */}
          <div className="w-px h-3 bg-white/5 mx-0.5" />
          {task.status !== 'pendiente' && (
            <button onClick={() => onChangeStatus(task.id, task.status === 'completada' ? 'en progreso' : 'pendiente')}
              className="p-1 bg-white/5 hover:bg-white/10 rounded-md text-gray-500 hover:text-white transition-all">
              <ChevronLeft size={10} />
            </button>
          )}
          {task.status === 'pendiente' && (
            <button onClick={() => onStart(task.id)}
              className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all"
              style={{ background: '#2563eb', color: '#fff', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
              Iniciar
            </button>
          )}
          {task.status === 'en progreso' && (
            <button onClick={() => onChangeStatus(task.id, 'completada')}
              className="px-2 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider transition-all"
              style={{ background: '#2563eb', color: '#fff', boxShadow: '0 3px 10px rgba(37,99,235,0.3)' }}>
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
          background: open ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(37,99,235,0.35)' : 'rgba(255,255,255,0.07)'}`,
          borderRadius: 10, cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Filter size={11} color="#4a5570" />
        <span style={{ fontSize: 11, fontWeight: 600, color: '#eef0fb', whiteSpace: 'nowrap' }}>
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
          background: '#0d1020',
          border: '1px solid rgba(37,99,235,0.25)',
          borderRadius: 14,
          padding: '6px',
          boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(37,99,235,0.10)',
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
                  background: active ? 'rgba(37,99,235,0.14)' : 'transparent',
                  color: active ? '#93c5fd' : '#cbd5e1',
                  fontSize: 12, fontWeight: active ? 700 : 500,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.12s',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = active ? 'rgba(37,99,235,0.14)' : 'transparent'; }}
              >
                {opt.label}
                {active && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M2 6L5 9L10 3" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
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
  const pending    = tasks.filter(t => t.status === 'pendiente');
  const inProgress = tasks.filter(t => t.status === 'en progreso');
  const done       = tasks.filter(t => t.status === 'completada');
  const total      = tasks.length;
  const pct        = total > 0 ? Math.round((done.length / total) * 100) : 0;

  const metaSemanal = total > 0 ? total : 1;
  const metaProgreso = Math.min(Math.round((done.length / metaSemanal) * 100), 100);

  const [overPending,  setOverPending]  = useState(false);
  const [overProgress, setOverProgress] = useState(false);

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

  return (
    <div className="flex flex-col h-full gap-3 overflow-hidden relative">

      {/* Background glow solo — sin grid global */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#2563eb]/5 rounded-full blur-[100px] pointer-events-none" />

      {/* ── Top Control HUD ── */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
           <h2 className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.3px" }}>Gestión de Tareas</h2>
           <div className="h-6 w-px bg-white/5" />
           <FilterDropdown
             value={filterMember}
             onChange={setFilterMember}
             members={members}
           />
        </div>

        <button onClick={onAddTask} className="flex items-center gap-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_6px_20px_rgba(37,99,235,0.3)]">
          <Plus size={12}/> Nueva Tarea
        </button>
      </div>

      {/* ── Main Bento Grid ── */}
      <div className="flex-1 grid grid-cols-12 grid-rows-6 gap-3 min-h-0 z-10">

        {/* Panel 1: Pendientes — drop zone desde "en progreso" */}
        <div
          className="col-span-3 row-span-6 flex flex-col gap-2 rounded-[24px] p-3 overflow-hidden"
          style={{
            background: overPending ? 'rgba(37,99,235,0.06)' : 'rgba(255,255,255,0.02)',
            border: overPending ? '1px solid rgba(37,99,235,0.35)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onDragOver={e => { e.preventDefault(); if (!overPending) setOverPending(true); }}
          onDragLeave={() => setOverPending(false)}
          onDrop={handleDropOnPending}
        >
          <div className="flex items-center justify-between px-1 py-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <h3 className="text-[10px] font-bold text-white uppercase tracking-wider">Pendientes</h3>
            </div>
            <span className="text-[9px] font-mono text-gray-500">[{pending.length}]</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
            {pending.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="sm" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} onStart={onStartTask} />
            ))}
            {pending.length === 0 && <div className="py-8 text-center opacity-20 italic text-[10px]">En espera...</div>}
          </div>
        </div>

        {/* Panel 2: Área de Ejecución — drop zone desde "pendiente" */}
        <div
          className="col-span-6 row-span-6 flex flex-col gap-3 rounded-[28px] p-5 overflow-hidden relative"
          style={{
            background: overProgress ? 'rgba(37,99,235,0.07)' : 'linear-gradient(to bottom, rgba(255,255,255,0.03), transparent)',
            border: overProgress ? '1px solid rgba(37,99,235,0.40)' : '1px solid rgba(255,255,255,0.05)',
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onDragOver={e => { e.preventDefault(); if (!overProgress) setOverProgress(true); }}
          onDragLeave={() => setOverProgress(false)}
          onDrop={handleDropOnProgress}
        >
          {/* Grid cuadriculado solo en este panel */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.04] rounded-[28px] overflow-hidden" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="absolute top-0 right-0 p-4">
             <div className="flex items-center gap-1.5 px-2 py-1 bg-[#2563eb]/10 border border-[#2563eb]/20 rounded-full">
                <div className="w-1 h-1 rounded-full bg-[#2563eb] animate-ping" />
                <span className="text-[8px] font-bold text-[#2563eb] uppercase tracking-widest">Activo</span>
             </div>
          </div>

          <div className="flex flex-col mb-1">
             <h3 className="text-[10px] font-bold text-white uppercase" style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", letterSpacing: "0.12em" }}>Área de Ejecución</h3>
             <p className="text-gray-500 text-[10px]">Tareas actualmente en desarrollo</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
            {inProgress.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="md" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} onStart={onStartTask} />
            ))}
            {inProgress.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-14 border-2 border-dashed border-white/5 rounded-[20px]">
                 <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3"><CheckSquare size={20} className="text-gray-700" /></div>
                 <p className="text-gray-600 font-bold uppercase text-[9px] tracking-widest">Todo despejado. Esperando tareas.</p>
              </div>
            )}
          </div>

          {/* Bottom HUD bar */}
          <div className="pt-2 border-t border-white/5 flex items-center justify-between opacity-40">
             <div className="flex gap-3">
                <div className="flex flex-col"><span className="text-[7px] font-bold text-gray-500 uppercase">Latencia</span><span className="text-[9px] font-mono text-white">12ms</span></div>
                <div className="flex flex-col"><span className="text-[7px] font-bold text-gray-500 uppercase">Nodos</span><span className="text-[9px] font-mono text-white">{inProgress.length}</span></div>
             </div>
             <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-green-500" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sistema en Línea</span>
             </div>
          </div>
        </div>

        {/* Panel 3: Vault & Performance (Right, 3 units) */}
        <div className="col-span-3 row-span-6 flex flex-col gap-3">

          {/* Performance Card */}
          <div className="flex flex-col gap-3 bg-[#2563eb] rounded-[22px] p-4 shadow-[0_12px_32px_rgba(37,99,235,0.2)] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10" />
             <div className="flex items-center justify-between relative z-10">
                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Rendimiento</span>
                <RefreshCw size={11} className="text-white/60" />
             </div>
             <div className="flex flex-col relative z-10">
                <span className="text-3xl font-bold text-white" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-1.5px" }}>{pct}%</span>
                <span className="text-[9px] font-bold text-white/70" style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", letterSpacing: "0.06em" }}>Tasa de completado</span>
             </div>
             <div className="h-1 w-full bg-black/10 rounded-full overflow-hidden relative z-10">
                <div className="h-full bg-white transition-all duration-1000" style={{ width: `${pct}%` }} />
             </div>
          </div>

          {/* Meta del Equipo Card */}
          <div className="bg-[#1C1F26] border border-white/5 rounded-[20px] p-3 flex flex-col gap-2">
             <div className="flex items-center gap-1.5">
                <div className="p-1 bg-[#2563eb]/10 rounded-md"><Users size={11} className="text-[#2563eb]" /></div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">Meta del Equipo</h4>
             </div>
             <div className="flex items-end justify-between">
                <div>
                   <p className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.8px" }}>{done.length}<span className="text-gray-600 text-xs ml-1">/ {metaSemanal}</span></p>
                   <p className="text-[9px] text-gray-500">Tareas esta semana</p>
                </div>
                <p className="text-xs font-bold text-[#2563eb]">{metaProgreso}%</p>
             </div>
             <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#2563eb] to-[#60a5fa] transition-all duration-1000" style={{ width: `${metaProgreso}%` }} />
             </div>
          </div>

          {/* The Vault Card */}
          <div className="flex-1 flex flex-col gap-2 bg-white/[0.02] border border-white/5 rounded-[22px] p-3 overflow-hidden">
             <div className="flex items-center justify-between px-1">
               <div className="flex items-center gap-1.5">
                 <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-wider">Bóveda</span>
               </div>
               {done.length > 0 && <button onClick={onClearCompleted} className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-red-500 transition-all"><Trash2 size={10}/></button>}
             </div>
             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-1.5">
               {done.map(task => (
                 <div key={task.id} className="p-2 bg-white/[0.02] border border-white/5 rounded-lg flex items-center justify-between group opacity-60 hover:opacity-100 transition-all">
                    <div className="flex flex-col min-w-0">
                       <span className="text-white text-[10px] font-bold truncate">{task.title}</span>
                       <span className="text-[7px] text-gray-600 font-bold uppercase tracking-widest mt-0.5">Completada</span>
                    </div>
                    <button onClick={() => onChangeStatus(task.id, 'en progreso')} className="p-1 opacity-0 group-hover:opacity-100 transition-all text-gray-500 hover:text-white"><ChevronLeft size={10} /></button>
                 </div>
               ))}
               {done.length === 0 && <div className="py-8 text-center opacity-20 italic text-[10px]">Sin datos...</div>}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
