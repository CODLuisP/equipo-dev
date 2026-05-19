"use client";

import { Check } from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member } from "@/app/dashboard/types";

// ─── Member Picker ────────────────────────────────────────────────────────────

export default function MemberPicker({ members, value, currentUser, onChange }: { members: Member[]; value: string; currentUser: Member|null; onChange: (id: string) => void; }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      <label style={{ fontSize:11, fontWeight:700, color:'#5A6270', textTransform:'uppercase', letterSpacing:'0.1em' }}>Asignar a</label>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(members.length, 4)}, 1fr)`, gap:8 }}>
        {members.map(m => {
          const selected = value === m.id;
          const isMe = currentUser?.id === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:7,
                padding:'12px 8px 10px',
                background: selected ? `${m.color}18` : 'rgba(255,255,255,0.03)',
                border: selected ? `1.5px solid ${m.color}` : '1.5px solid rgba(255,255,255,0.07)',
                borderRadius:12,
                cursor:'pointer',
                transition:'all 0.15s',
                position:'relative',
                outline:'none',
              }}
              onMouseEnter={e => { if (!selected) { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.15)'; } }}
              onMouseLeave={e => { if (!selected) { e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; } }}
            >
              {selected && (
                <span style={{ position:'absolute', top:5, right:5, width:14, height:14, borderRadius:'50%', background:m.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Check size={8} color="#fff"/>
                </span>
              )}
              <AvatarImg seed={m.avatarSeed||m.name} name={m.name} color={m.color} size={36} borderRadius={10}/>
              <div style={{ textAlign:'center', width:'100%' }}>
                <p style={{ fontSize:11, fontWeight:700, color: selected ? '#F4F5F7' : '#8A9099', margin:0, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', transition:'color 0.15s' }}>
                  {m.name}{isMe ? ' (tú)' : ''}
                </p>
                <p style={{ fontSize:9, fontWeight:500, color: selected ? m.color : '#3A3F48', margin:'2px 0 0', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', transition:'color 0.15s' }}>
                  {m.role}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
