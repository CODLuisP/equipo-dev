"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from "framer-motion";
import {
  Trash2, Pencil, Check, Plus, Shield, Zap, Code2,
  Palette, Star, Smartphone, Cloud, ChevronRight,
} from "lucide-react";
import type { Member, Task } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import * as THREE from "three";

// ─── Three.js background component ───────────────────────────────────────────

function ThreeBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const canvas = document.createElement("canvas");
    canvas.style.position = "absolute";
    canvas.style.inset = "0";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.pointerEvents = "none";
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = container.clientWidth);
    let height = (canvas.height = container.clientHeight);

    // Ultra-soft glowing orbs (monochrome greyscale for obsidian look)
    const orbs = [
      {
        x: width * 0.2,
        y: height * 0.3,
        targetX: width * 0.2,
        targetY: height * 0.3,
        vx: 0.05,
        vy: 0.03,
        radius: Math.min(width, height) * 0.45,
        colorStart: "rgba(255, 255, 255, 0.035)",
        colorMid: "rgba(255, 255, 255, 0.01)",
      },
      {
        x: width * 0.8,
        y: height * 0.7,
        targetX: width * 0.8,
        targetY: height * 0.7,
        vx: -0.04,
        vy: -0.05,
        radius: Math.min(width, height) * 0.5,
        colorStart: "rgba(255, 255, 255, 0.025)",
        colorMid: "rgba(255, 255, 255, 0.008)",
      },
      {
        x: width * 0.5,
        y: height * 0.5,
        targetX: width * 0.5,
        targetY: height * 0.5,
        vx: 0.03,
        vy: -0.03,
        radius: Math.min(width, height) * 0.4,
        colorStart: "rgba(255, 255, 255, 0.015)",
        colorMid: "rgba(255, 255, 255, 0.004)",
      },
    ];

    let targetMouseX = width / 2;
    let targetMouseY = height / 2;
    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        width = canvas.width = entry.contentRect.width;
        height = canvas.height = entry.contentRect.height;
        orbs[0].radius = Math.min(width, height) * 0.45;
        orbs[1].radius = Math.min(width, height) * 0.5;
        orbs[2].radius = Math.min(width, height) * 0.4;
      }
    });
    resizeObserver.observe(container);

    let animId: number;
    const draw = () => {
      animId = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, width, height);

      // Interpolate mouse movement with high damping for extreme calmness
      mouseX += (targetMouseX - mouseX) * 0.015;
      mouseY += (targetMouseY - mouseY) * 0.015;

      orbs.forEach((orb) => {
        // Drifting movement
        orb.targetX += orb.vx;
        orb.targetY += orb.vy;

        // Wrap-around logic
        if (orb.targetX < -orb.radius) orb.targetX = width + orb.radius;
        if (orb.targetX > width + orb.radius) orb.targetX = -orb.radius;
        if (orb.targetY < -orb.radius) orb.targetY = height + orb.radius;
        if (orb.targetY > height + orb.radius) orb.targetY = -orb.radius;

        // Faint attraction to cursor
        const dx = mouseX - orb.targetX;
        const dy = mouseY - orb.targetY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Gentle cursor influence
        let pullX = 0;
        let pullY = 0;
        if (dist < 600) {
          const force = (600 - dist) * 0.04;
          pullX = (dx / dist) * force;
          pullY = (dy / dist) * force;
        }

        // Apply smooth interpolation for positions
        orb.x += (orb.targetX + pullX - orb.x) * 0.05;
        orb.y += (orb.targetY + pullY - orb.y) * 0.05;

        // Render ambient radial gradient glow
        const grad = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.radius
        );
        grad.addColorStop(0, orb.colorStart);
        grad.addColorStop(0.5, orb.colorMid);
        grad.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0.95,
      }}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function roleColor(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('full') || r.includes('stack'))   return '#60a5fa';
  if (r.includes('front') || r.includes('ui'))     return '#a78bfa';
  if (r.includes('design'))                         return '#f472b6';
  if (r.includes('back') || r.includes('api'))     return '#34d399';
  if (r.includes('devops') || r.includes('cloud')) return '#fb923c';
  if (r.includes('mobile'))                         return '#facc15';
  return '#94a3b8';
}

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

// ─── Avatar Groups ────────────────────────────────────────────────────────────

const AVATAR_GROUPS = [
  { label: 'Clásicos',  seeds: AVATAR_PRESETS.slice(0, 10)  },
  { label: 'Guerreros', seeds: AVATAR_PRESETS.slice(10, 20) },
  { label: 'Nombres',   seeds: AVATAR_PRESETS.slice(20, 30) },
  { label: 'Nuevos',    seeds: AVATAR_PRESETS.slice(30, 40) },
];

// ─── Avatar Editor ────────────────────────────────────────────────────────────

function AvatarEditor({ member, open, onSave, onClose }: {
  member: Member; open: boolean; onSave: (seed: string) => void; onClose: () => void;
}) {
  const [seed, setSeed] = useState(member.avatarSeed || AVATAR_PRESETS[0]);
  const [activeTab, setActiveTab] = useState(0);
  const rc = member.color || roleColor(member.role);
  const seedLabel = seed.charAt(0).toUpperCase() + seed.slice(1);

  // Tabs matching AVATAR_GROUPS
  const tabs = ['🎮 Clásicos', '⚔️ Guerreros', '👤 Nombres', '✨ Nuevos'];

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="p-0 overflow-hidden gap-0 outline-none" style={{
        background: 'rgba(10, 12, 18, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        maxWidth: 440,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 800, color: rc, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 6 }}>
            Personalizar Perfil
          </p>
          <DialogTitle style={{ fontSize: 16, fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.3px', margin: 0 }}>
            {member.name}
          </DialogTitle>
          <p style={{ margin: '4px 0 0', fontSize: 11, color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
            {member.role}
          </p>
        </div>

        <div style={{ padding: '0 24px 24px' }}>
          {/* Large Preview & Ring */}
          <div style={{
            display: 'flex', justifyContent: 'center', marginBottom: 24, position: 'relative'
          }}>
            <div style={{ position: 'relative', width: 92, height: 92 }}>
              {/* Spinning Glow Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                style={{
                  position: 'absolute', inset: -5, borderRadius: '50%',
                  border: `2px dashed ${rc}50`,
                  boxShadow: `0 0 20px ${rc}25`,
                }}
              />
              <div style={{
                position: 'absolute', inset: -2, borderRadius: '50%',
                border: `2px solid ${rc}`,
                boxShadow: `0 0 15px ${rc}40`,
              }} />
              <div style={{ borderRadius: '50%', overflow: 'hidden', width: 92, height: 92, background: 'rgba(255,255,255,0.03)' }}>
                <AvatarImg seed={seed} name={member.name} color={rc} size={92} borderRadius={46} />
              </div>
            </div>
          </div>

          {/* Sliding Tabs Segment Control */}
          <div style={{
            display: 'flex',
            padding: 3,
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: 20,
            position: 'relative',
          }}>
            {tabs.map((t, idx) => {
              const isActive = activeTab === idx;
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => setActiveTab(idx)}
                  style={{
                    flex: 1,
                    position: 'relative',
                    padding: '8px 0',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 7,
                    fontSize: 10,
                    fontWeight: 700,
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                    cursor: 'pointer',
                    outline: 'none',
                    transition: 'color 0.2s',
                    zIndex: 2,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabPill"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 7,
                        zIndex: -1,
                      }}
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                  {t.split(' ')[1]}
                </button>
              );
            })}
          </div>

          {/* Category Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Colección {tabs[activeTab]}
            </p>
            <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: rc }}>
              {seedLabel}
            </p>
          </div>

          {/* Roomy 5x2 Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
            <AnimatePresence mode="popLayout">
              {AVATAR_GROUPS[activeTab].seeds.map((p) => {
                const sel = seed === p;
                return (
                  <motion.button
                    key={p}
                    type="button"
                    onClick={() => setSeed(p)}
                    title={p}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      position: 'relative',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      aspectRatio: '1',
                      padding: 4,
                      background: sel ? `${rc}25` : 'rgba(255,255,255,0.02)',
                      border: `1.5px solid ${sel ? rc : 'rgba(255,255,255,0.05)'}`,
                      borderRadius: 12,
                      cursor: 'pointer',
                      outline: 'none',
                      boxShadow: 'none',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.2s, background-color 0.2s',
                    }}
                  >
                    <AvatarImg seed={p} name={p} color={rc} size={50} borderRadius={8} />
                    {sel && (
                      <div style={{
                        position: 'absolute', top: -4, right: -4,
                        width: 14, height: 14, borderRadius: '50%',
                        background: rc,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '1.5px solid #0f1117',
                        boxShadow: 'none',
                      }}>
                        <Check size={8} color="#fff" strokeWidth={4} />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
          padding: '16px 24px 22px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)'
        }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255,255,255,0.4)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: 8,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.4)'}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => { onSave(seed); onClose(); }}
            style={{
              background: rc,
              color: '#fff',
              fontSize: 12,
              fontWeight: 700,
              border: 'none',
              borderRadius: 9,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 18px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              transition: 'opacity 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Check size={12} strokeWidth={2.5} /> Guardar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
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
          ? `rgba(40, 45, 50, 0.96)`
          : `rgba(33, 37, 41, 0.92)`,
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: 'none',
        boxShadow: hovered
          ? `0 12px 32px rgba(0,0,0,0.5)`
          : '0 4px 20px rgba(0,0,0,0.2)',
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
                <RoleIcon role={member.role} size={9} />
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
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              padding: '6px 0',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 8, cursor: 'pointer',
              fontSize: 11, fontWeight: 600,
              color: 'rgba(255,255,255,0.55)',
              transition: 'all 0.15s',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              outline: 'none',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = `${rc}18`;
              e.currentTarget.style.borderColor = `${rc}50`;
              e.currentTarget.style.color = rc;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
            }}
          >
            <Pencil size={10} /> Avatar
          </motion.button>

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
        backgroundImage: "url('/assets/nuevomienbro.png')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'rgba(33, 37, 41, 0.6)',
        border: '1.5px dashed rgba(67,97,238,0.2)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-end',
        gap: 8, minHeight: 180, padding: '0 0 10px',
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

export default function SectionEquipo({ members, tasks, onAddMember, onDeleteMember, onChangeAvatar }: {
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
      <ThreeBackground />
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
        <AvatarEditor
          member={editingMember}
          open={!!editingMember}
          onSave={seed => onChangeAvatar(editingMember.id, seed)}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}
