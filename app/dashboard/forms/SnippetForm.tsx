"use client";

import { useState } from "react";
import ButtonBase from "@/components/ui/ButtonBase";
import InputBase1 from "@/components/ui/InputBase1";
import type { Member, Snippet } from "@/app/dashboard/types";

// ─── Snippet Form ─────────────────────────────────────────────────────────────

export default function SnippetForm({ members, initialData, onSave, onCancel }: { members:Member[]; initialData?:Snippet; onSave:(d:Partial<Snippet>)=>void; onCancel:()=>void; }) {
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
