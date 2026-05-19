"use client";

import { Users, Code, AlertCircle } from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member, Task } from "@/app/dashboard/types";

// ─── PriorityStat ─────────────────────────────────────────────────────────────

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

// ─── Sección: Equipo ──────────────────────────────────────────────────────────

export default function SectionEquipo({ members, tasks }: { members: Member[]; tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {members.map(m => {
        const mt = tasks.filter(t => t.assignedTo === m.id);
        const done = mt.filter(t => t.status === 'completada').length;
        const inProg = mt.filter(t => t.status === 'en progreso').length;
        const pend = mt.filter(t => t.status === 'pendiente').length;
        const total = mt.length;
        const prog = total > 0 ? (done / total) * 100 : 0;

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
                <div style={{ width: `${getPct(inProg)}%`, background: '#E85D2F', opacity: inProg > 0 ? 1 : 0 }} className="h-full rounded-sm transition-all duration-500" title={`En progreso: ${inProg}`} />
                <div style={{ width: `${getPct(done)}%`, background: '#2ECC71', opacity: done > 0 ? 1 : 0 }} className="h-full rounded-sm transition-all duration-500" title={`Completadas: ${done}`} />
                <div style={{ width: `${getPct(pend)}%`, background: '#5A6270', opacity: pend > 0 ? 1 : 0 }} className="h-full rounded-sm transition-all duration-500" title={`Pendientes: ${pend}`} />
              </div>

              <div className="grid grid-cols-3 gap-2 mt-3">
                <PriorityStat count={inProg} color="#E85D2F" label="Activas" />
                <PriorityStat count={done}   color="#2ECC71" label="Listas" />
                <PriorityStat count={pend}   color="#5A6270" label="Espera" />
              </div>
            </div>
          </div>
        );
      })}
      {members.length === 0 && <div className="col-span-3 py-20 text-center border-2 border-dashed border-white/5 rounded-3xl"><Users size={48} className="mx-auto text-white/10 mb-4"/><p className="text-gray-500">Sin miembros aún</p></div>}
    </div>
  );
}
