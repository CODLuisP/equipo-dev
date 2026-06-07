"use client";

import { Users } from "lucide-react";
import { Toaster } from "sonner";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member } from "@/app/dashboard/types";

interface WhoAreYouScreenProps {
  members: Member[];
  onSelect: (member: Member) => void;
  onSkip: () => void;
  toasterProps: React.ComponentProps<typeof Toaster>;
}

export default function WhoAreYouScreen({ members, onSelect, onSkip, toasterProps }: WhoAreYouScreenProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a14',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Toaster {...toasterProps} />

      {/* Background glows */}
      <div style={{ position: 'absolute', top: -120, right: -80, width: 480, height: 480, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -120, left: -80, width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(29,78,216,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.04) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(37,99,235,0.08) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Decorative rings */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 560, height: 560, borderRadius: '50%',
        border: '1px solid rgba(37,99,235,0.07)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 720, height: 720, borderRadius: '50%',
        border: '1px solid rgba(37,99,235,0.04)',
        pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 660, width: '100%' }}>

        {/* Icon */}
        <div style={{
          width: 62, height: 62, borderRadius: 16,
          background: 'rgba(37,99,235,0.10)',
          border: '1px solid rgba(37,99,235,0.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 30px rgba(37,99,235,0.16), 0 0 60px rgba(37,99,235,0.05)',
        }}>
          <Users size={26} color="#60a5fa" />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 30, fontWeight: 800,
          color: '#eef0fb', margin: '0 0 8px',
          letterSpacing: '-0.6px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          ¿Quién eres{' '}
          <span style={{
            background: 'linear-gradient(135deg, #60a5fa, #93c5fd)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>hoy</span>?
        </h1>
        <p style={{
          fontSize: 13, color: '#6b7280',
          margin: '0 0 38px', fontWeight: 400, lineHeight: 1.5,
        }}>
          Selecciona tu perfil para personalizar las notificaciones
        </p>

        {/* Member grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 14,
        }}>
          {members.map((member, i) => (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              style={{
                background: 'rgba(10,12,26,0.9)',
                border: '1px solid rgba(37,99,235,0.14)',
                borderRadius: 16,
                padding: '24px 16px 20px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.22s cubic-bezier(0.4,0,0.2,1)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                animationDelay: `${i * 0.06}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(37,99,235,0.08)';
                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.35)';
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(37,99,235,0.20), 0 0 24px rgba(37,99,235,0.08)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(10,12,26,0.9)';
                e.currentTarget.style.borderColor = 'rgba(37,99,235,0.14)';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
              }}
            >
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', inset: -4, borderRadius: 20,
                  background: `radial-gradient(circle, ${member.color}22 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={62} borderRadius={16} />
              </div>

              <div>
                <p style={{
                  color: '#eef0fb', fontWeight: 700, fontSize: 14,
                  margin: 0, letterSpacing: '-0.1px',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>{member.name}</p>
                <p style={{
                  color: '#6b7280', fontSize: 11,
                  margin: '4px 0 0', fontWeight: 500,
                }}>{member.role}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          style={{
            marginTop: 32, background: 'none', border: 'none',
            color: '#3a4060', fontSize: 12, cursor: 'pointer',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 500,
            transition: 'color 0.15s',
            display: 'flex', alignItems: 'center', gap: 6,
            margin: '32px auto 0',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#8b91b8'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#3a4060'; }}
        >
          Continuar sin seleccionar
        </button>
      </div>
    </div>
  );
}
