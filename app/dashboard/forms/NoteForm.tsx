"use client";

import { useState } from "react";
import ButtonBase from "@/components/ui/ButtonBase";
import type { Member } from "@/app/dashboard/types";

// ─── Note Form ────────────────────────────────────────────────────────────────

export default function NoteForm({ members, onSave, onCancel }: { members:Member[]; onSave:(c:string,a:string)=>void; onCancel:()=>void; }) {
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
