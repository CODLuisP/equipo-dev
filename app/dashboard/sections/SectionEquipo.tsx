"use client";

import { useState, useRef } from "react";
import {
  motion, AnimatePresence, useMotionValue, useTransform, useSpring,
} from "framer-motion";
import {
  Trash2, Pencil, Check, Plus, Shield, Zap, Code2,
  Palette, Star, Smartphone, Cloud, CheckCircle2, Circle, Clock,
} from "lucide-react";
import type { Member, Task } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleColor(role: string) {
  const r = role.toLowerCase();
  if (r.includes('full') || r.includes('stack'))   return 'var(--blue-soft)';
  if (r.includes('front') || r.includes('ui'))     return '#a78bfa';
  if (r.includes('design'))                         return '#f472b6';
  if (r.includes('back') || r.includes('api'))     return '#34d399';
  if (r.includes('devops') || r.includes('cloud')) return '#fb923c';
  if (r.includes('mobile'))                         return '#facc15';
  return '#94a3b8';
}

function RoleIcon({ role }: { role: string }) {
  const r = role.toLowerCase(); const s = 10;
  if (r.includes('full') || r.includes('stack'))                    return <Zap size={s}/>;
  if (r.includes('front') || r.includes('ui') || r.includes('design')) return <Palette size={s}/>;
  if (r.includes('back') || r.includes('api'))                      return <Code2 size={s}/>;
  if (r.includes('lead') || r.includes('senior'))                   return <Shield size={s}/>;
  if (r.includes('mobile'))                                          return <Smartphone size={s}/>;
  if (r.includes('devops') || r.includes('cloud'))                  return <Cloud size={s}/>;
  return <Star size={s}/>;
}

// ─── Tilt card hook ───────────────────────────────────────────────────────────

function useTilt() {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const springX = useSpring(rawX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rawY, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(springY, [-0.5, 0.5], ['4deg', '-4deg']);
  const rotateY = useTransform(springX, [-0.5, 0.5], ['-4deg', '4deg']);

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    rawX.set((e.clientX - rect.left) / rect.width - 0.5);
    rawY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };
  const onMouseLeave = () => { rawX.set(0); rawY.set(0); };

  return { ref, rotateX, rotateY, onMouseMove, onMouseLeave };
}

// ─── Avatar Editor ────────────────────────────────────────────────────────────

function AvatarEditor({ member, open, onSave, onClose }: {
  member: Member; open: boolean; onSave: (seed: string) => void; onClose: () => void;
}) {
  const [seed, setSeed] = useState(member.avatarSeed || AVATAR_PRESETS[0]);
  const rc = roleColor(member.role);

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent
        className="p-0 overflow-hidden gap-0 outline-none"
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(var(--blue-rgb),0.18)',
          borderRadius: 20,
          maxWidth: 460,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${rc}90, transparent)` }} />

        <DialogHeader className="px-6 pt-6 pb-0 space-y-0">
          <p style={{ fontSize: 10, fontWeight: 700, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: '0.16em', marginBottom: 4 }}>Personalizar</p>
          <DialogTitle style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px', margin: 0 }}>
            Avatar · <span style={{ color: member.color }}>{member.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pt-5 pb-2 flex flex-col gap-5">
          <div className="flex justify-center items-center py-5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <motion.div className="relative" whileHover={{ scale: 1.06 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <div className="absolute inset-0 rounded-full" style={{ outline: `2px solid ${member.color}30`, outlineOffset: 5 }} />
              <AvatarImg seed={seed} name={member.name} color={member.color} size={80} borderRadius={40} />
            </motion.div>
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 10 }}>Elige un avatar</p>
            <div className="flex flex-wrap gap-1.5">
              {AVATAR_PRESETS.map((p, i) => (
                <motion.button key={p} type="button" onClick={() => setSeed(p)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.015, type: 'spring', stiffness: 400, damping: 25 }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  className="rounded-lg p-0.5 cursor-pointer"
                  style={{
                    background: seed === p ? 'rgba(59,130,246,0.12)' : 'transparent',
                    border: `1px solid ${seed === p ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.06)'}`,
                  }}>
                  <AvatarImg seed={p} name={p} color={member.color} size={38} borderRadius={7} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="px-6 py-5 border-t border-white/5 flex gap-2 justify-end">
          <Button
            variant="ghost"
            onClick={onClose}
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => { onSave(seed); onClose(); }}
            style={{ background: 'var(--blue)', color: '#fff', fontSize: 13, fontWeight: 700, border: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Check size={13} /> Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Member Card ──────────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  show:   { opacity: 1, y: 0,  scale: 1,
    transition: { type: 'spring' as const, stiffness: 260, damping: 24 } },
  exit:   { opacity: 0, scale: 0.88, y: -8,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as const } },
};

function MemberCard({ member, index, tasks, onEdit, onDelete }: {
  member: Member; index: number; tasks: Task[];
  onEdit: () => void; onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const tilt = useTilt();
  const rc    = roleColor(member.role);
  const mt    = tasks.filter(t => t.assignedTo === member.id);
  const done  = mt.filter(t => t.status === 'completada').length;
  const prog  = mt.filter(t => t.status === 'en progreso').length;
  const pend  = mt.filter(t => t.status === 'pendiente').length;
  const total = mt.length;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;

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
        position: 'relative',
        background: hovered ? 'var(--bg-raised)' : 'var(--bg-surface)',
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'background 0.18s, border-color 0.18s',
        display: 'flex', flexDirection: 'column',
        perspective: 800,
        willChange: 'transform',
      }}
    >
      {/* Shimmer sweep on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '200%', opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeInOut' }}
            style={{
              position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Accent top line */}
      <motion.div
        animate={{ opacity: hovered ? 0.9 : 0.35, scaleX: hovered ? 1 : 0.6 }}
        transition={{ duration: 0.3 }}
        style={{ height: 2, background: `linear-gradient(90deg, transparent, ${member.color}, transparent)`, transformOrigin: 'center' }}
      />

      <div style={{ padding: '18px 16px 16px', display: 'flex', flexDirection: 'column', gap: 13, flex: 1, position: 'relative', zIndex: 1 }}>

        {/* Avatar + info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <AvatarImg seed={member.avatarSeed ?? 'aventurero'} name={member.name} color={member.color} size={48} borderRadius={12} />
            <motion.div
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: '#22c55e', border: '2px solid var(--bg-surface)' }}
            />
          </div>

          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', margin: 0, letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {member.name}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <span style={{ color: rc, display: 'flex' }}><RoleIcon role={member.role} /></span>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.35)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {member.role}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.04)' }} />

        {/* Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progreso</span>
            <motion.span
              key={pct}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 11, fontWeight: 700, color: pct > 0 ? 'var(--text)' : 'rgba(255,255,255,0.18)' }}
            >
              {pct}%
            </motion.span>
          </div>
          <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 9999, overflow: 'hidden', width: '100%' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              style={{ height: '100%', background: member.color, borderRadius: 9999 }}
            />
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { icon: <Clock size={9}/>,       v: pend, l: 'Pendiente', c: 'rgba(255,255,255,0.25)' },
            { icon: <Circle size={9}/>,       v: prog, l: 'En curso',  c: 'var(--blue-soft)' },
            { icon: <CheckCircle2 size={9}/>, v: done, l: 'Listas',    c: '#4ade80' },
          ].map((s, i) => (
            <motion.div key={s.l}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 + i * 0.04, type: 'spring', stiffness: 300, damping: 22 }}
              style={{ padding: '7px 4px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: 8, textAlign: 'center' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginBottom: 3, color: s.c }}>
                {s.icon}
                <span style={{ fontSize: 13, fontWeight: 800, color: s.v > 0 ? 'var(--text)' : 'rgba(255,255,255,0.15)' }}>{s.v}</span>
              </div>
              <p style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>{s.l}</p>
            </motion.div>
          ))}
        </div>

        {/* Acciones */}
        <div style={{ display: 'flex', gap: 6 }}>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '6px 0', borderRadius: 8, cursor: 'pointer', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', color: 'var(--blue-soft)', fontSize: 11, fontWeight: 700, fontFamily: 'inherit' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(59,130,246,0.15)')}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
          >
            <Pencil size={11}/> Avatar
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}
            style={{ width: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.16)', color: '#f87171', fontFamily: 'inherit' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(239,68,68,0.14)')}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.background = 'rgba(239,68,68,0.06)')}
          >
            <Trash2 size={12}/>
          </motion.button>
        </div>
      </div>

      {/* Index */}
      <span style={{ position: 'absolute', top: 10, right: 12, fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.12)', letterSpacing: '0.06em', fontVariantNumeric: 'tabular-nums' }}>
        {String(index + 1).padStart(2, '0')}
      </span>
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
      whileHover={{ borderColor: 'rgba(59,130,246,0.4)', backgroundColor: 'rgba(59,130,246,0.04)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        minHeight: 260, cursor: 'pointer',
        background: 'transparent',
        border: '1px dashed rgba(255,255,255,0.08)',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.12, rotate: 90 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Plus size={16} color="rgba(255,255,255,0.3)" />
      </motion.div>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.2)' }}>
        Nuevo miembro
      </span>
    </motion.div>
  );
}

// ─── Container variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SectionEquipo({ members, tasks, onAddMember, onDeleteMember, onChangeAvatar }: {
  members: Member[]; tasks: Task[];
  onAddMember: () => void;
  onDeleteMember: (m: Member) => void;
  onChangeAvatar: (id: string, seed: string) => void;
}) {
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, overflowY: 'auto', paddingBottom: 24 }} className="custom-scrollbar">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}
        >
          <AnimatePresence mode="popLayout">
            {members.map((m, i) => (
              <MemberCard key={m.id} member={m} index={i} tasks={tasks}
                onEdit={() => setEditingMember(m)}
                onDelete={() => onDeleteMember(m)}
              />
            ))}
          </AnimatePresence>
          <AddCard onClick={onAddMember} />
        </motion.div>
      </div>

      {editingMember && (
        <AvatarEditor
          member={editingMember} open={!!editingMember}
          onSave={seed => onChangeAvatar(editingMember.id, seed)}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
