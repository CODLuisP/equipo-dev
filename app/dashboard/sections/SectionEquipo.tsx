"use client";

import { useState, useRef, useEffect, memo } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Trash2, Pencil, Plus, Shield, Zap, Code2,
  Palette, Star, Smartphone, Cloud, ChevronRight,
  User,
  MonitorSmartphone,
} from "lucide-react";
import type { Member, Task } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import EditarMiembroModal, { roleColor } from "@/app/dashboard/components/EditarMiembroModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function RoleIcon({ role, size = 11 }: { role: string; size?: number }) {
  const r = role.toLowerCase();
  if (r.includes('full') || r.includes('stack'))                       return <Zap size={size} />;
  if (r.includes('front') || r.includes('ui') || r.includes('design')) return <Palette size={size} />;
  if (r.includes('back') || r.includes('api'))                         return <Code2 size={size} />;
  if (r.includes('lead') || r.includes('senior'))                      return <Shield size={size} />;
  if (r.includes('mobile'))                                             return <Smartphone size={size} />;
  if (r.includes('devops') || r.includes('cloud'))                     return <Cloud size={size} />;
  return <Star size={size} />;
}

// ─── Tilt hook ────────────────────────────────────────────────────────────────

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const sx = useSpring(rawX, { stiffness: 280, damping: 28 });
  const sy = useSpring(rawY, { stiffness: 280, damping: 28 });
  const rotateX = useTransform(sy, [-0.5, 0.5], ['5deg', '-5deg']);
  const rotateY = useTransform(sx, [-0.5, 0.5], ['-5deg', '5deg']);
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const onMouseLeave = () => { rawX.set(0); rawY.set(0); };
  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ─── Member Card — diseño horizontal compacto ─────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  show:   { opacity: 1, y: 0,  scale: 1, transition: { type: 'spring' as const, stiffness: 300, damping: 26 } },
  exit:   { opacity: 0, scale: 0.92, y: -8, transition: { duration: 0.18 } },
};

function MemberCard({ member, tasks, onEdit, onDelete }: {
  member: Member; tasks: Task[];
  onEdit: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tilt = useTilt();
  const rc  = member.color || roleColor(member.role);
  const mt  = tasks.filter(t => t.assignedTo === member.id);
  const done = mt.filter(t => t.status === 'completada').length;
  const prog = mt.filter(t => t.status === 'en progreso').length;
  const pend = mt.filter(t => t.status === 'pendiente').length;
  const pct  = mt.length > 0 ? Math.round((done / mt.length) * 100) : 0;

  return (
    <motion.div
      variants={cardVariants}
      layout
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={() => { tilt.onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      style={{
        rotateX: tilt.rotateX,
        rotateY: tilt.rotateY,
        transformStyle: 'preserve-3d',
        perspective: 900,
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        background: hovered
          ? `rgba(33, 37, 41, 0.92)`
          : `#212529`,
        border: 'none',
     
        transition: 'box-shadow 0.2s, background 0.2s',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: 'default',
      }}
    >

      {/* Glow ambiental */}
      <div style={{
        position: 'absolute', top: -20, left: -10, width: 100, height: 100,
        background: `radial-gradient(circle, ${rc}15 0%, transparent 70%)`,
        pointerEvents: 'none',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.3s',
      }} />

      <div style={{ padding: '14px 14px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Fila 1: Avatar + Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              padding: 2, borderRadius: '50%',
              background: `linear-gradient(135deg, ${rc}80, ${rc}20)`,
            }}>
              <AvatarImg
                seed={member.avatarSeed ?? 'aventurero'}
                name={member.name}
                color={rc}
                size={46}
                borderRadius={23}
              />
            </div>
          </div>

          {/* Nombre + rol */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              margin: 0, fontSize: 13, fontWeight: 700,
              color: '#f0f6fc', letterSpacing: '-0.2px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
              {member.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
              <span style={{ color: rc, display: 'flex', alignItems: 'center' }}>
                <MonitorSmartphone  role={member.role} size={9} />
              </span>
              <p style={{
                margin: 0, fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: 500,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {member.role}
              </p>
            </div>
          </div>
        </div>

        {/* Fila 3: Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          borderRadius: 8,
          background: 'rgba(255,255,255,0.03)',
          border: 'none',
          overflow: 'hidden',
        }}>
          {[
            { v: pend, l: 'Pendiente', c: 'rgba(255,255,255,0.95)' },
            { v: prog, l: 'En curso',  c: 'rgba(255,255,255,0.95)' },
            { v: done, l: 'Listas',    c: 'rgba(255,255,255,0.95)' },
          ].map((s, i) => (
            <div key={s.l} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: '7px 4px',
              borderRight: 'none',
            }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</span>
              <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontWeight: 500 }}>{s.l}</span>
            </div>
          ))}
        </div>

        {/* Fila 4: Acciones */}
        <div style={{ display: 'flex', gap: 6 }}>
          <button
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '6px 0',
              background: "linear-gradient(135deg, rgba(var(--blue-rgb),0.9), rgba(var(--blue-rgb),0.55))",
              border: 'none',
              borderRadius: 8, cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              color: '#fff',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              outline: 'none',
            }}
          >
            <User size={10} /> Avatar
          </button>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, cursor: 'pointer',
              color: 'rgba(255,255,255,0.3)',
              transition: 'all 0.15s',
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.3)';
            }}
          >
            <Trash2 size={11} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Add Card ─────────────────────────────────────────────────────────────────

function AddCard({ onClick }: { onClick: () => void }) {
  return (
    <motion.div
      variants={cardVariants}
      layout
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
      style={{
        position: 'relative',
        borderRadius: 14,
        overflow: 'hidden',
        cursor: 'pointer',
        backgroundImage: "url('/assets/nuevomienbro.webp')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(33, 37, 41, 0.6)',
        border: '1.5px dashed rgba(67,97,238,0.2)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        gap: 8, minHeight: 160, padding: '0 0 10px',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(67,97,238,0.45)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(67,97,238,0.2)';
      }}
    >
      {/* Capa oscura para legibilidad */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,14,0.55)', pointerEvents: 'none' }} />
      <motion.div
        whileHover={{ rotate: 90, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        style={{
          position: 'relative', zIndex: 1,
          width: 32, height: 32, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(67,97,238,0.25)',
          border: '1px solid rgba(67,97,238,0.4)',
          backdropFilter: 'blur(4px)',
        }}
      >
        <Plus size={14} color="#93c5fd" />
      </motion.div>
      <span style={{ position: 'relative', zIndex: 1, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.02em' }}>
        Nuevo miembro
      </span>
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function SectionEquipo({ members, tasks, onAddMember, onDeleteMember, onChangeAvatar }: {
  members: Member[]; tasks: Task[];
  onAddMember: () => void;
  onDeleteMember: (m: Member) => void;
  onChangeAvatar: (id: string, seed: string) => void;
}) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%', overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflowY: 'auto', padding: '0 2px 24px' }} className="custom-scrollbar">


        <motion.div
          initial="hidden"
          animate="show"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))',
            gap: 10,
          }}
        >
          <AnimatePresence mode="popLayout">
            {members.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                tasks={tasks}
                onEdit={() => setEditingMember(m)}
                onDelete={() => onDeleteMember(m)}
              />
            ))}
          </AnimatePresence>
          <AddCard onClick={onAddMember} />
        </motion.div>
      </div>

      {editingMember && (
        <EditarMiembroModal
          member={editingMember}
          open={!!editingMember}
          onSave={seed => onChangeAvatar(editingMember.id, seed)}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

export default memo(SectionEquipo);
