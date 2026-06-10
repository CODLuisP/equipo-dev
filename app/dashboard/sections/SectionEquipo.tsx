"use client";

import { useState, useEffect } from "react";
import { Trash2, Pencil, Check, X, Plus, Shield, Zap, Code2, Palette, Star } from "lucide-react";
import type { Member, Task } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";

// ─── Role icon ────────────────────────────────────────────────────────────────
function RoleIcon({ role }: { role: string }) {
  const r = role.toLowerCase();
  if (r.includes('full') || r.includes('stack')) return <Zap size={10} />;
  if (r.includes('front') || r.includes('ui') || r.includes('design')) return <Palette size={10} />;
  if (r.includes('back') || r.includes('api') || r.includes('server')) return <Code2 size={10} />;
  if (r.includes('lead') || r.includes('senior')) return <Shield size={10} />;
  return <Star size={10} />;
}

// ─── Avatar Editor ────────────────────────────────────────────────────────────
function AvatarEditor({ member, onSave, onClose }: {
  member: Member; onSave: (seed: string) => void; onClose: () => void;
}) {
  const [seed, setSeed] = useState(member.avatarSeed || AVATAR_PRESETS[0]);
  return (
    <div
      style={{ position:'fixed', inset:0, zIndex:50, background:'rgba(3,5,14,0.88)', backdropFilter:'blur(22px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background:'rgba(9,12,26,0.99)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, padding:'28px 28px 30px', width:420, maxWidth:'95vw' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:9, color:'#60a5fa', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.2em', marginBottom:5 }}>Personalizar</div>
            <div style={{ fontSize:17, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.3px' }}>Avatar de <span style={{ color:member.color }}>{member.name}</span></div>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:8, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.35)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.35)'; }}>
            <X size={13}/>
          </button>
        </div>
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20, padding:'16px 0', background:`radial-gradient(ellipse 60% 60% at 50% 50%, ${member.color}15 0%, transparent 70%)`, borderRadius:14, border:'1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-5, borderRadius:'50%', border:`2px solid ${member.color}55` }}/>
            <AvatarImg seed={seed} name={member.name} color={member.color} size={84} borderRadius={42}/>
          </div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.22)', fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', marginBottom:10 }}>Presets</div>
          <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
            {AVATAR_PRESETS.map(p => (
              <button key={p} onClick={()=>setSeed(p)} style={{ padding:4, background:seed===p?'rgba(37,99,235,0.15)':'rgba(255,255,255,0.03)', border:`1.5px solid ${seed===p?'rgba(37,99,235,0.6)':'rgba(255,255,255,0.07)'}`, borderRadius:10, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{ if(seed!==p){ e.currentTarget.style.borderColor='rgba(255,255,255,0.18)'; e.currentTarget.style.background='rgba(255,255,255,0.06)'; }}}
                onMouseLeave={e=>{ if(seed!==p){ e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.background='rgba(255,255,255,0.03)'; }}}>
                <AvatarImg seed={p} name={p} color={member.color} size={42} borderRadius={9}/>
              </button>
            ))}
          </div>
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end' }}>
          <button onClick={()=>{onSave(seed);onClose();}} style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 22px', background:'#2563eb', border:'none', borderRadius:10, color:'#fff', fontSize:13, fontWeight:700, cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.background='#3b82f6'}
            onMouseLeave={e=>e.currentTarget.style.background='#2563eb'}>
            <Check size={14}/> Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Member Card (con stats + edición) ────────────────────────────────────────
function MemberCard({ member, index, tasks, onEdit, onDelete }: {
  member: Member; index: number; tasks: Task[];
  onEdit: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const mt     = tasks.filter(t => t.assignedTo === member.id);
  const done   = mt.filter(t => t.status === 'completada').length;
  const inProg = mt.filter(t => t.status === 'en progreso').length;
  const pend   = mt.filter(t => t.status === 'pendiente').length;
  const total  = mt.length;
  const prog   = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position:'relative',
        background: hovered ? 'rgba(13,17,35,0.97)' : 'rgba(9,12,26,0.85)',
        border:`1px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius:20, overflow:'hidden',
        transition:'all 0.22s ease',
        backdropFilter:'blur(12px)',
        display:'flex', flexDirection:'column',
      }}
    >
      {/* Top accent line */}
      <div style={{ height:2, background:`linear-gradient(90deg, transparent 0%, ${member.color}cc 50%, transparent 100%)`, opacity: hovered ? 0.9 : 0.4, transition:'opacity 0.3s' }}/>

      <div style={{ padding:'22px 18px 18px', display:'flex', flexDirection:'column', gap:12, flex:1 }}>

        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{ position:'relative' }}>
            <div style={{ position:'absolute', inset:-10, borderRadius:'50%', background:`radial-gradient(circle, ${member.color}28 0%, transparent 68%)`, opacity: hovered ? 1 : 0.4, transition:'opacity 0.3s', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', inset:-3, borderRadius:'50%', border:`1.5px solid ${member.color}${hovered ? '80' : '38'}`, transition:'border-color 0.3s' }}/>
            <div style={{ position:'relative', zIndex:1, borderRadius:'50%', overflow:'hidden' }}>
              <AvatarImg seed={member.avatarSeed ?? 'aventurero'} name={member.name} color={member.color} size={72} borderRadius={36}/>
            </div>
            <div style={{ position:'absolute', bottom:1, right:1, zIndex:2, width:11, height:11, borderRadius:'50%', background:'#22c55e', border:'2px solid #090c1a' }}/>
          </div>

          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:15, fontWeight:800, color:'#f0f4ff', letterSpacing:'-0.3px', marginBottom:5 }}>{member.name}</div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 9px', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:20, color:'rgba(255,255,255,0.5)', fontSize:9, fontWeight:700, letterSpacing:'0.05em', textTransform:'uppercase' }}>
              <span style={{ color:member.color, display:'flex' }}><RoleIcon role={member.role}/></span>
              {member.role}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height:1, background:'rgba(255,255,255,0.05)' }}/>

        {/* Progress */}
        <div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
            <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em' }}>Completado</span>
            <span style={{ fontSize:12, fontWeight:800, color: prog > 0 ? '#eef0fb' : 'rgba(255,255,255,0.15)' }}>{prog}%</span>
          </div>
          <div style={{ height:3, background:'rgba(255,255,255,0.05)', borderRadius:6, overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${prog}%`, background:member.color, borderRadius:6, transition:'width 0.9s cubic-bezier(0.4,0,0.2,1)' }}/>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:5 }}>
          {[{ v:inProg, l:'Activas' }, { v:done, l:'Listas' }, { v:pend, l:'Espera' }].map(s => (
            <div key={s.l} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:8, padding:'6px 4px', textAlign:'center' }}>
              <div style={{ fontSize:14, fontWeight:800, color: hovered && s.v > 0 ? member.color : (s.v > 0 ? '#eef0fb' : 'rgba(255,255,255,0.15)'), transition:'color 0.2s' }}>{s.v}</div>
              <div style={{ fontSize:8, fontWeight:700, color:'rgba(255,255,255,0.2)', textTransform:'uppercase', letterSpacing:'0.08em', marginTop:1 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:6, opacity: hovered ? 1 : 0, transform: hovered ? 'translateY(0)' : 'translateY(5px)', transition:'opacity 0.2s, transform 0.2s', marginTop:2 }}>
          <button onClick={e=>{e.stopPropagation();onEdit();}}
            style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'7px 0', background:'rgba(37,99,235,0.12)', border:'1px solid rgba(37,99,235,0.28)', borderRadius:9, color:'#60a5fa', fontSize:11, fontWeight:700, cursor:'pointer', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(37,99,235,0.24)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(37,99,235,0.12)'}>
            <Pencil size={11}/> Avatar
          </button>
          <button onClick={e=>{e.stopPropagation();onDelete();}}
            style={{ width:34, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:9, color:'#f87171', cursor:'pointer', transition:'background 0.15s' }}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,0.2)'}
            onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,0.08)'}>
            <Trash2 size={12}/>
          </button>
        </div>
      </div>

      {/* Index badge */}
      <div style={{ position:'absolute', top:9, right:11, fontSize:8, fontWeight:800, color:'rgba(255,255,255,0.15)', letterSpacing:'0.1em' }}>
        #{String(index + 1).padStart(2, '0')}
      </div>
    </div>
  );
}

// ─── Add Card ─────────────────────────────────────────────────────────────────
function AddCard({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
      style={{ minHeight:300, cursor:'pointer', background: hovered ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.015)', border:`1.5px dashed rgba(37,99,235,${hovered ? '0.45' : '0.18'})`, borderRadius:20, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:10, transition:'all 0.22s', transform: hovered ? 'translateY(-4px)' : 'none', backdropFilter:'blur(8px)' }}>
      <div style={{ width:48, height:48, borderRadius:14, background: hovered ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.06)', border:`1px solid rgba(37,99,235,${hovered ? '0.4' : '0.18'})`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.22s' }}>
        <Plus size={20} color="#2563eb"/>
      </div>
      <span style={{ fontSize:11, fontWeight:700, letterSpacing:'0.06em', color: hovered ? '#93c5fd' : 'rgba(148,163,184,0.7)', transition:'color 0.2s' }}>
        Nuevo miembro
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SectionEquipo({ members, tasks, onAddMember, onDeleteMember, onChangeAvatar }: {
  members: Member[];
  tasks: Task[];
  onAddMember: () => void;
  onDeleteMember: (m: Member) => void;
  onChangeAvatar: (id: string, seed: string) => void;
}) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    <div style={{ position:'relative', width:'100%', height:'100%', overflow:'hidden', fontFamily:"'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ position:'absolute', inset:0, zIndex:2, overflowY:'auto', padding:'4px 0 24px' }} className="custom-scrollbar">

        {/* Header */}
        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(190px, 1fr))', gap:16 }}>
          {members.map((m, i) => (
            <MemberCard
              key={m.id}
              member={m}
              index={i}
              tasks={tasks}
              onEdit={() => setEditingMember(m)}
              onDelete={() => onDeleteMember(m)}
            />
          ))}
          <AddCard onClick={onAddMember}/>
        </div>
      </div>

      {editingMember && (
        <AvatarEditor
          member={editingMember}
          onSave={seed => onChangeAvatar(editingMember.id, seed)}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
