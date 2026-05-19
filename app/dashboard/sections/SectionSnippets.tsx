"use client";

import { Plus, Copy, Settings, Trash2, Code } from "lucide-react";
import ButtonBase from "@/components/ui/ButtonBase";
import ImputBuscar from "@/components/ui/ImputBuscar";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member, Snippet } from "@/app/dashboard/types";

// ─── Sección: Snippets ────────────────────────────────────────────────────────

export default function SectionSnippets({ snippets, search, setSearch, members, onAddSnippet, onEditSnippet, onCopy, onDeleteSnippet }: {
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
