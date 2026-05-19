"use client";

import { useState } from "react";
import ButtonBase from "@/components/ui/ButtonBase";
import InputBase1 from "@/components/ui/InputBase1";

// ─── Member Form ──────────────────────────────────────────────────────────────

export default function MemberForm({ onAdd }: { onAdd: (n:string,r:string)=>void }) {
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
