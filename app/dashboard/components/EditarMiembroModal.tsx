"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import type { Member } from "@/app/dashboard/types";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

// ─── Color por rol (fallback cuando el miembro no tiene color propio) ─────────

export function roleColor(role: string): string {
  const r = role.toLowerCase();
  if (r.includes('full') || r.includes('stack'))   return '#60a5fa';
  if (r.includes('front') || r.includes('ui'))     return '#a78bfa';
  if (r.includes('design'))                         return '#f472b6';
  if (r.includes('back') || r.includes('api'))     return '#34d399';
  if (r.includes('devops') || r.includes('cloud')) return '#fb923c';
  if (r.includes('mobile'))                         return '#facc15';
  return '#94a3b8';
}

// ─── Avatar Groups ────────────────────────────────────────────────────────────

const AVATAR_GROUPS = [
  { label: 'Clásicos',  seeds: AVATAR_PRESETS.slice(0, 10)  },
  { label: 'Guerreros', seeds: AVATAR_PRESETS.slice(10, 20) },
  { label: 'Nombres',   seeds: AVATAR_PRESETS.slice(20, 30) },
  { label: 'Nuevos',    seeds: AVATAR_PRESETS.slice(30, 40) },
];

// ─── Editar Miembro (personalizar avatar) ─────────────────────────────────────

export default function EditarMiembroModal({ member, open, onSave, onClose }: {
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
        background: '#0b0b0d',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        maxWidth: 440,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>

        {/* Header */}
        <div style={{ padding: '24px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <p style={{ fontSize: 9, fontWeight: 600, color: rc, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>
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
