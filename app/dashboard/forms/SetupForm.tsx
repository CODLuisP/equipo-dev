"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import ButtonBase from "@/components/ui/ButtonBase";
import InputBase1 from "@/components/ui/InputBase1";

// ─── Setup Form ───────────────────────────────────────────────────────────────

export default function SetupForm({ onAddMember }: { onAddMember: (n: string, r: string) => void }) {
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
