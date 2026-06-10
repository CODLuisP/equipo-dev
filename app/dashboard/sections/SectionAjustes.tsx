"use client";

import { useState, useEffect, useRef } from "react";
import { UserPlus, Trash2, Pencil, Check, X, Plus, Shield, Zap, Code2, Palette, Star } from "lucide-react";
import type { Member } from "@/app/dashboard/types";
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

// ─── Member Card ──────────────────────────────────────────────────────────────
function MemberCard({ member, index, onEdit, onDelete }: {
  member: Member; index: number;
  onEdit: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered
          ? 'rgba(13,17,35,0.97)'
          : 'rgba(9,12,26,0.85)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 20,
        overflow: 'hidden',
        transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)',
        transform: hovered ? 'translateY(-7px) scale(1.02)' : 'none',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* Top accent line — member color, subtle */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, transparent 0%, ${member.color}cc 50%, transparent 100%)`,
        opacity: hovered ? 0.9 : 0.4,
        transition: 'opacity 0.3s',
      }} />

      <div style={{ padding: '22px 18px 18px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 11 }}>

        {/* Avatar with ring */}
        <div style={{ position: 'relative' }}>
          {/* Glow */}
          <div style={{
            position: 'absolute', inset: -10, borderRadius: '50%',
            background: `radial-gradient(circle, ${member.color}28 0%, transparent 68%)`,
            opacity: hovered ? 1 : 0.4,
            transition: 'opacity 0.3s',
            pointerEvents: 'none',
          }} />
          {/* Ring */}
          <div style={{
            position: 'absolute', inset: -3, borderRadius: '50%',
            border: `1.5px solid ${member.color}${hovered ? '80' : '38'}`,
            transition: 'border-color 0.3s',
          }} />
          {/* Avatar image */}
          <div style={{ position: 'relative', zIndex: 1, borderRadius: '50%', overflow: 'hidden' }}>
            <AvatarImg
              seed={member.avatarSeed || member.name}
              name={member.name}
              color={member.color}
              size={76}
              borderRadius={38}
            />
          </div>
          {/* Online dot */}
          <div style={{
            position: 'absolute', bottom: 1, right: 1, zIndex: 2,
            width: 11, height: 11, borderRadius: '50%',
            background: '#22c55e', border: '2px solid #161929',
          }} />
        </div>

        {/* Name */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.3px', marginBottom: 5 }}>
            {member.name}
          </div>
          {/* Role badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '3px 9px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.09)',
            borderRadius: 20,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}>
            <span style={{ color: member.color, display: 'flex' }}><RoleIcon role={member.role} /></span>
            {member.role}
          </div>
        </div>

        {/* Mini stats */}
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
          {[
            { label: 'LVL', value: String(((member.name.length * 7) % 40 + 60)) },
            { label: 'XP', value: `${String(((member.name.charCodeAt(0) * 97) % 900 + 100))}` },
          ].map(s => (
            <div key={s.label} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 7, padding: '5px 6px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', fontWeight: 700, letterSpacing: '0.12em', marginBottom: 2 }}>
                {s.label}
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: hovered ? member.color : 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{
          width: '100%', display: 'flex', gap: 6,
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(5px)',
          transition: 'opacity 0.2s, transform 0.2s',
          marginTop: 2,
        }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '7px 0',
              background: 'rgba(37,99,235,0.12)',
              border: '1px solid rgba(37,99,235,0.28)',
              borderRadius: 9, color: '#60a5fa',
              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(37,99,235,0.24)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(37,99,235,0.12)'}
          >
            <Pencil size={11} /> Editar
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              width: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 9, color: '#f87171', cursor: 'pointer', transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Index */}
      <div style={{
        position: 'absolute', top: 9, right: 11,
        fontSize: 8, fontWeight: 800, color: 'rgba(255,255,255,0.15)', letterSpacing: '0.1em',
      }}>
        #{String(index + 1).padStart(2, '0')}
      </div>
    </div>
  );
}

// ─── Add Card ─────────────────────────────────────────────────────────────────
function AddCard({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minHeight: 270, cursor: 'pointer',
        background: hovered ? 'rgba(37,99,235,0.05)' : 'rgba(37,99,235,0.015)',
        border: `1.5px dashed rgba(37,99,235,${hovered ? '0.45' : '0.18'})`,
        borderRadius: 20,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
        transition: 'all 0.22s',
        transform: hovered ? 'translateY(-4px)' : 'none',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: hovered ? 'rgba(37,99,235,0.15)' : 'rgba(37,99,235,0.06)',
        border: `1px solid rgba(37,99,235,${hovered ? '0.4' : '0.18'})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.22s',
      }}>
        <Plus size={20} color="#2563eb" />
      </div>
      <span style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.06em',
        color: hovered ? '#60a5fa' : 'rgba(37,99,235,0.5)',
        transition: 'color 0.2s',
      }}>
        Nuevo miembro
      </span>
    </div>
  );
}

// ─── Avatar Editor Modal ──────────────────────────────────────────────────────
function AvatarEditor({ member, onSave, onClose }: {
  member: Member; onSave: (seed: string) => void; onClose: () => void;
}) {
  const [seed, setSeed] = useState(member.avatarSeed || member.name);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        background: 'rgba(3,5,14,0.88)', backdropFilter: 'blur(22px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'rgba(9,12,26,0.99)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24, padding: '28px 28px 30px',
        width: 420, maxWidth: '95vw',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9, color: '#60a5fa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 5 }}>
              Personalizar
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.3px' }}>
              Avatar de <span style={{ color: member.color }}>{member.name}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
          ><X size={13} /></button>
        </div>

        {/* Live preview */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 20,
          padding: '16px 0',
          background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${member.color}15 0%, transparent 70%)`,
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -5, borderRadius: '50%', border: `2px solid ${member.color}55` }} />
            <AvatarImg seed={seed} name={member.name} color={member.color} size={84} borderRadius={42} />
          </div>
        </div>

        {/* Preset grid */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.22)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: 10 }}>
            Presets de avatar
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            {AVATAR_PRESETS.map(p => (
              <button key={p} onClick={() => setSeed(p)} style={{
                padding: 4,
                background: seed === p ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1.5px solid ${seed === p ? 'rgba(37,99,235,0.6)' : 'rgba(255,255,255,0.07)'}`,
                borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { if (seed !== p) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; } }}
                onMouseLeave={e => { if (seed !== p) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; } }}
              >
                <AvatarImg seed={p} name={p} color={member.color} size={42} borderRadius={9} />
              </button>
            ))}
          </div>
        </div>

        {/* Custom seed + save */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            value={seed}
            onChange={e => setSeed(e.target.value)}
            placeholder="O escribe un seed personalizado…"
            style={{
              flex: 1, background: 'rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
              padding: '9px 13px', color: '#f0f4ff', fontSize: 12, outline: 'none',
              fontFamily: 'inherit', transition: 'border-color 0.15s',
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'rgba(37,99,235,0.55)'}
            onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
            onKeyDown={e => { if (e.key === 'Enter') { onSave(seed); onClose(); } if (e.key === 'Escape') onClose(); }}
          />
          <button
            onClick={() => { onSave(seed); onClose(); }}
            style={{
              width: 41, height: 41, flexShrink: 0,
              background: '#2563eb', border: 'none', borderRadius: 10,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#3b82f6'}
            onMouseLeave={e => e.currentTarget.style.background = '#2563eb'}
          >
            <Check size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SectionAjustes({ members, onAddMember, onDeleteMember, onChangeAvatar }: {
  members: Member[];
  onAddMember: () => void;
  onDeleteMember: (m: Member) => void;
  onChangeAvatar: (id: string, seed: string) => void;
}) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const prevLenRef = useRef(members.length);

  // Auto-open avatar editor when a new member is added
  useEffect(() => {
    if (members.length > prevLenRef.current) {
      const newest = members[members.length - 1];
      if (newest) setEditingMember(newest);
    }
    prevLenRef.current = members.length;
  }, [members]);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        overflowY: 'auto', padding: '32px 32px 48px',
      }} className="custom-scrollbar">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 38 }}>
          <div>
            <div style={{
              fontSize: 9, fontWeight: 800, color: '#3b82f6',
              textTransform: 'uppercase', letterSpacing: '0.22em', marginBottom: 7,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
              Gestión del Equipo
            </div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: '#f0f4ff', letterSpacing: '-0.7px', lineHeight: 1.1 }}>
              Miembros del{' '}
              <span style={{ background: 'linear-gradient(90deg, #60a5fa, #93c5fd)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Equipo
              </span>
            </h1>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
              {members.length} miembro{members.length !== 1 ? 's' : ''} · Haz hover en una tarjeta para editar
            </p>
          </div>

          <button onClick={onAddMember} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: '#2563eb',
            border: '1px solid rgba(96,165,250,0.3)',
            borderRadius: 12, color: '#fff', fontSize: 12, fontWeight: 700,
            cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.18s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3b82f6'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'none'; }}
          >
            <UserPlus size={14} /> Agregar Miembro
          </button>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}>
          {members.map((m, i) => (
            <MemberCard
              key={m.id}
              member={m}
              index={i}
              onEdit={() => setEditingMember(m)}
              onDelete={() => onDeleteMember(m)}
            />
          ))}
          <AddCard onClick={onAddMember} />
        </div>
      </div>

      {/* Avatar editor modal */}
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
