"use client";

import { useState, useRef, useEffect } from "react";
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
import * as THREE from "three";

// ─── Three.js card background ─────────────────────────────────────────────────

function ThreeBg({ color }: { color: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.z = 4;

    const c = new THREE.Color(color);

    // Partículas flotantes
    const count = 60;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 6;
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: c, size: 0.06, transparent: true, opacity: 0.55 });
    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // Esfera central suave
    const sphereGeo = new THREE.SphereGeometry(0.7, 32, 32);
    const sphereMat = new THREE.MeshStandardMaterial({
      color: c, emissive: c, emissiveIntensity: 0.15,
      transparent: true, opacity: 0.12, wireframe: false,
    });
    const sphere = new THREE.Mesh(sphereGeo, sphereMat);
    scene.add(sphere);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    const ro = new ResizeObserver(() => {
      const w = canvas.clientWidth, h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(canvas);

    let id: number;
    const animate = () => {
      id = requestAnimationFrame(animate);
      points.rotation.y += 0.0015;
      points.rotation.x += 0.0008;
      sphere.rotation.y += 0.003;
      renderer.render(scene, camera);
    };
    animate();

    return () => { cancelAnimationFrame(id); ro.disconnect(); renderer.dispose(); };
  }, [color]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />;
}

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
      className="relative flex flex-col rounded-2xl overflow-hidden transition-all duration-200 cursor-default"
      style={{
        rotateX: tilt.rotateX, rotateY: tilt.rotateY,
        transformStyle: 'preserve-3d', perspective: 800, willChange: 'transform',
        background: 'transparent',
        border: 'none',
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
        fontFamily: 'Arial, Helvetica, sans-serif',
      }}
    >
      {/* Avatar centrado con badge online */}
      <div className="flex flex-col items-center pt-7 pb-4 px-4" style={{ position: 'relative' }}>
        <ThreeBg color={member.color} />
        <div className="relative mb-4">
          <div className="rounded-full p-0.5" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}66)` }}>
            <AvatarImg seed={member.avatarSeed ?? 'aventurero'} name={member.name} color={member.color} size={72} borderRadius={36} />
          </div>
          <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2" style={{ ringColor: '#1c1f26', border: '2px solid #1c1f26' }} />
        </div>

        {/* Nombre y rol */}
        <p className="text-[15px] font-bold text-white text-center leading-tight mb-1">{member.name}</p>
        <div className="flex items-center gap-1.5 mb-1">
          <span style={{ color: rc }}><RoleIcon role={member.role} /></span>
          <p className="text-[11px] text-center" style={{ color: '#e9ecef' }}>{member.role}</p>
        </div>
      </div>

      {/* Divider + todo lo de abajo con fondo */}
      <div style={{ background: '#1c1f26' }}>
      <div className="mx-4 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Progress */}
      <div className="px-4 pt-4 pb-3 space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] " style={{ color: '#e9ecef' }}>Progreso</span>
          <span className="text-[11px] font-bold" style={{ color: pct > 0 ? member.color : 'rgba(255,255,255,0.2)' }}>{pct}%</span>
        </div>
        <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            style={{ background: member.color }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 mx-2 mb-4 rounded-xl overflow-hidden" >
        {[
          { v: pend, l: 'Pendiente' },
          { v: prog, l: 'Curso'  },
          { v: done, l: 'Listas'    },
        ].map((s, i) => (
          <div key={s.l} className="flex flex-col items-center py-2.5" style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none' }}>
            <span className="text-base font-bold text-white">{s.v}</span>
            <span className="text-[10px] mt-0.5 font-medium" style={{ color: '#e9ecef' }}>{s.l}</span>
          </div>
        ))}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onEdit(); }}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[12px] font-bold transition-all duration-150 cursor-pointer"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34,197,94,0.1)')}
        >
          <Pencil size={11} /> Avatar
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(); }}
          className="w-9 flex items-center justify-center rounded-md transition-all duration-150 cursor-pointer"
          style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}
          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
        >
          <Trash2 size={13} />
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
      whileHover={{ borderColor: 'rgba(59,130,246,0.7)', backgroundColor: 'rgba(59,130,246,0.18)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        minHeight: 260, cursor: 'pointer',
        background: 'rgba(59,130,246,0.08)',
        border: '1px dashed rgba(59,130,246,0.4)',
        borderRadius: 16,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
    >
      <motion.div
        whileHover={{ scale: 1.12, rotate: 90 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)' }}
      >
        <Plus size={16} color="#60a5fa" />
      </motion.div>
      <span style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>
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
