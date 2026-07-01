"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

// ─── Setup Form ───────────────────────────────────────────────────────────────

export default function SetupForm({ onAddMember }: { onAddMember: (n: string, r: string) => void }) {
  const [name, setName] = useState(''); const [role, setRole] = useState('Full Stack Developer');
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!name) return; onAddMember(name, role); setName(''); };
  return (
    <>
      <style>{`
        .sf-input {
          width: 100%; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 10px; padding: 12px 14px; font-size: 14px; color: #f1f5f9;
          font-family: inherit; outline: none; transition: border-color .15s, box-shadow .15s;
        }
        .sf-input::placeholder { color: rgba(148,163,184,0.35); }
        .sf-input:focus { border-color: rgba(99,102,241,0.55); box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .sf-btn {
          width: 100%; padding: 13px; border-radius: 10px; border: none; background: #4361ee;
          color: #fff; font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          transition: background .15s, transform .15s, box-shadow .15s;
        }
        .sf-btn:hover:not(:disabled) { background: #1565c0; transform: translateY(-1px); }
        .sf-btn:active:not(:disabled) { transform: translateY(0); }
        .sf-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Nombre</label>
          <input className="sf-input" placeholder="Ej: Luis Paredes" value={name} onChange={e => setName(e.target.value)} required />
        </div>

        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[11px] font-bold text-white/40 uppercase tracking-wider">Rol</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="sf-input" style={{ cursor: "pointer" }}>
            <option style={{ background: "#0f1223" }}>Full Stack Developer</option>
            <option style={{ background: "#0f1223" }}>Frontend Developer</option>
            <option style={{ background: "#0f1223" }}>Backend Developer</option>
            <option style={{ background: "#0f1223" }}>UI/UX Designer</option>
            <option style={{ background: "#0f1223" }}>DevOps Engineer</option>
            <option style={{ background: "#0f1223" }}>Mobile Developer</option>
          </select>
        </div>

        <button type="submit" className="sf-btn"><UserPlus size={17} /> Agregar</button>
      </form>
    </>
  );
}
