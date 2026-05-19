"use client";

import { Users } from "lucide-react";
import { Toaster } from "sonner";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member } from "@/app/dashboard/types";

// ─── WhoAreYou Screen ─────────────────────────────────────────────────────────

interface WhoAreYouScreenProps {
  members: Member[];
  onSelect: (member: Member) => void;
  onSkip: () => void;
  toasterProps: React.ComponentProps<typeof Toaster>;
}

export default function WhoAreYouScreen({ members, onSelect, onSkip, toasterProps }: WhoAreYouScreenProps) {
  return (
    <div style={{ minHeight: '100vh', background: '#0A0C0F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: "'DM Sans', system-ui, sans-serif", position: 'relative', overflow: 'hidden' }}>
      <Toaster {...toasterProps} />
      <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,93,47,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -100, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(52,152,219,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.03) 1px, transparent 0)', backgroundSize: '28px 28px', pointerEvents: 'none' }} />

      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 640, width: '100%' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: 'rgba(232,93,47,0.12)', border: '1px solid rgba(232,93,47,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 30px rgba(232,93,47,0.1)' }}>
          <Users size={26} color="#E85D2F" />
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#F4F5F7', margin: '0 0 8px', letterSpacing: '-0.5px' }}>
          ¿Quién eres <span style={{ color: '#E85D2F' }}>hoy</span>?
        </h1>
        <p style={{ fontSize: 13, color: '#5A6270', margin: '0 0 36px', fontWeight: 500 }}>
          Selecciona tu perfil para personalizar las notificaciones
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 14 }}>
          {members.map(member => (
            <button key={member.id} onClick={() => onSelect(member)}
              style={{ background: '#13161C', border: `1px solid rgba(255,255,255,0.06)`, borderRadius: 16, padding: '22px 16px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
              onMouseEnter={e => { e.currentTarget.style.background = `${member.color}12`; e.currentTarget.style.borderColor = `${member.color}50`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.4), 0 0 0 1px ${member.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#13161C'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={60} borderRadius={16} />
              <div>
                <p style={{ color: '#F4F5F7', fontWeight: 700, fontSize: 14, margin: 0 }}>{member.name}</p>
                <p style={{ color: '#5A6270', fontSize: 11, margin: '3px 0 0', fontWeight: 500 }}>{member.role}</p>
              </div>
            </button>
          ))}
        </div>

        <button onClick={onSkip} style={{ marginTop: 28, background: 'none', border: 'none', color: '#3A3F4A', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', transition: 'color 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#8A9099'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3A3F4A'; }}>
          Continuar sin seleccionar
        </button>
      </div>
    </div>
  );
}
