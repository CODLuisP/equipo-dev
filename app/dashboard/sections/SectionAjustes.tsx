"use client";

import { useState } from "react";
import { UserPlus, Trash2, Pencil, Check } from "lucide-react";
import ButtonBase from "@/components/ui/ButtonBase";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";

// ─── Sección: Ajustes ─────────────────────────────────────────────────────────

export default function SectionAjustes({ members, onAddMember, onDeleteMember, onChangeAvatar }: {
  members: Member[]; onAddMember: () => void;
  onDeleteMember: (m: Member) => void;
  onChangeAvatar: (id: string, seed: string) => void;
}) {
  const [editingAvatarId, setEditingAvatarId] = useState<string | null>(null);
  const [customSeed, setCustomSeed] = useState('');

  return (
    <div className="max-w-3xl mx-auto">
      <div style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.06)" }} className="rounded-2xl p-8">
        <div className="flex items-center justify-between mb-7">
          <div><h3 className="text-lg font-bold text-white">Gestión de Equipo</h3><p className="text-xs text-gray-500 mt-0.5">Miembros con acceso al panel</p></div>
          <ButtonBase onClick={onAddMember} className="flex items-center gap-2"><UserPlus size={16}/> Agregar</ButtonBase>
        </div>
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.id}>
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setEditingAvatarId(editingAvatarId === m.id ? null : m.id); setCustomSeed(m.avatarSeed || m.name); }}
                    style={{ position:'relative', background:'none', border:'none', padding:0, cursor:'pointer' }}
                    title="Cambiar avatar">
                    <AvatarImg seed={m.avatarSeed || m.name} name={m.name} color={m.color} size={36} />
                    <div style={{ position:'absolute', bottom:-2, right:-2, width:14, height:14, borderRadius:'50%', background:'#1C1F26', border:`1px solid ${m.color}50`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Pencil size={7} color={m.color}/>
                    </div>
                  </button>
                  <div><h4 className="text-white font-bold text-sm">{m.name}</h4><p className="text-xs text-gray-500">{m.role}</p></div>
                </div>
                <button onClick={() => onDeleteMember(m)} className="p-2 text-gray-600 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
              </div>

              {editingAvatarId === m.id && (
                <div style={{ background:'#13161C', border:'1px solid rgba(255,255,255,0.06)', borderRadius:12, padding:16, marginTop:4 }}>
                  <p style={{ fontSize:10, fontWeight:700, color:'#5A6270', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:10 }}>Elige tu avatar</p>
                  <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:12 }}>
                    {AVATAR_PRESETS.map(seed => (
                      <button key={seed} onClick={() => { onChangeAvatar(m.id, seed); setEditingAvatarId(null); }}
                        style={{ background:(m.avatarSeed||m.name)===seed?`${m.color}20`:'transparent', border:`1.5px solid ${(m.avatarSeed||m.name)===seed?m.color:'rgba(255,255,255,0.08)'}`, borderRadius:10, padding:4, cursor:'pointer', transition:'all 0.15s' }}
                        onMouseEnter={e=>{e.currentTarget.style.borderColor=m.color;}}
                        onMouseLeave={e=>{e.currentTarget.style.borderColor=(m.avatarSeed||m.name)===seed?m.color:'rgba(255,255,255,0.08)';}}>
                        <AvatarImg seed={seed} name={seed} color={m.color} size={36} />
                      </button>
                    ))}
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <input
                      placeholder="O escribe tu propio seed…"
                      value={customSeed}
                      onChange={e => setCustomSeed(e.target.value)}
                      onKeyDown={e => { if (e.key==='Enter' && customSeed.trim()) { onChangeAvatar(m.id, customSeed.trim()); setEditingAvatarId(null); } if (e.key==='Escape') setEditingAvatarId(null); }}
                      style={{ flex:1, background:'#0A0C0F', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'7px 10px', fontSize:12, color:'#F4F5F7', outline:'none', fontFamily:"'DM Sans', system-ui, sans-serif" }}
                      onFocus={e=>{e.currentTarget.style.borderColor='rgba(232,93,47,0.5)';}}
                      onBlur={e=>{e.currentTarget.style.borderColor='rgba(255,255,255,0.1)';}}
                    />
                    <button
                      onClick={() => { if (customSeed.trim()) { onChangeAvatar(m.id, customSeed.trim()); setEditingAvatarId(null); } }}
                      style={{ width:34, height:34, background:`${m.color}20`, border:`1px solid ${m.color}40`, borderRadius:8, color:m.color, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                      <Check size={14}/>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
