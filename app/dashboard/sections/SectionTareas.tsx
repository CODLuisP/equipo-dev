"use client";

import {
  Users, CheckSquare, Plus, Trash2, Settings, Filter, RefreshCw,
  ChevronLeft, Check
} from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member, Task } from "@/app/dashboard/types";

// ─── Sub-componente: Task Card (Estilo HUD) ──────────────────────────────────

function TaskCard({ task, member, isCurrentUser, size = 'md', onEdit, onDelete, onChangeStatus, onStart }: {
  task: Task; member?: Member; isCurrentUser: boolean; size?: 'sm' | 'md' | 'lg';
  onEdit: (t: Task) => void; onDelete: (t: Task) => void;
  onChangeStatus: (id: string, s: Task['status']) => void;
  onStart: (id: string) => void;
}) {
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
      <div className="flex items-center justify-between z-10">
        <div className="w-1.5 h-1.5 rounded-full bg-[#E85D2F]/50" />
        <div className="flex gap-1.5">
          <button onClick={() => onEdit(task)} className="p-1 text-gray-500 hover:text-white transition-colors"><Settings size={12}/></button>
          <button onClick={() => onDelete(task)} className="p-1 text-gray-500 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
        </div>
      </div>

      <div className="z-10 flex-1">
        <h4 className={`text-white font-bold leading-tight group-hover:text-[#E85D2F] transition-colors ${size === 'lg' ? 'text-lg' : 'text-sm'}`} style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.3px" }}>
          {task.title}
        </h4>
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
          {task.status === 'pendiente' && (
            <button onClick={() => onStart(task.id)}
              className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: '#E85D2F', color: '#fff', boxShadow: '0 4px 15px rgba(232,93,47,0.3)' }}>
              Iniciar
            </button>
          )}
          {task.status === 'en progreso' && (
            <button onClick={() => onChangeStatus(task.id, 'completada')}
              className="px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all"
              style={{ background: '#E85D2F', color: '#fff', boxShadow: '0 4px 15px rgba(232,93,47,0.3)' }}>
              Finalizar
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
              <span className="text-[10px] font-bold text-[#E85D2F] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", letterSpacing: "0.14em" }}>Gestión de Tareas</span>
              <h2 className="text-white font-bold text-2xl" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.6px", marginTop: 2 }}>Centro de <span className="text-gray-500">Control</span></h2>
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
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="sm" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} onStart={onStartTask} />
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
             <h3 className="text-xs font-bold text-white uppercase mb-1" style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", letterSpacing: "0.12em" }}>Área de Ejecución</h3>
             <p className="text-gray-500 text-xs" style={{ fontFamily: "var(--font-body, 'Instrument Sans', system-ui)" }}>Tareas actualmente en desarrollo</p>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-5 content-start">
            {inProgress.map(task => (
              <TaskCard key={task.id} task={task} member={members.find(m => m.id === task.assignedTo)} isCurrentUser={currentUser?.id === task.assignedTo} size="lg" onEdit={onEditTask} onDelete={onDeleteTask} onChangeStatus={onChangeStatus} onStart={onStartTask} />
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
                <span className="text-4xl font-bold text-white" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-1.5px" }}>{pct}%</span>
                <span className="text-[10px] font-bold text-white/80" style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", letterSpacing: "0.08em" }}>Tasa de completado</span>
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
                   <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-display, 'Syne', system-ui)", letterSpacing: "-0.8px" }}>{done.length}<span className="text-gray-600 text-sm ml-1">/ {metaSemanal}</span></p>
                   <p className="text-[10px] text-gray-500" style={{ fontFamily: "var(--font-body, 'Instrument Sans', system-ui)" }}>Tareas logradas esta semana</p>
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
