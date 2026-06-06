"use client";

import { Users } from "lucide-react";
import { Toaster } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import SetupForm from "@/app/dashboard/forms/SetupForm";
import type { Member } from "@/app/dashboard/types";

interface SetupScreenProps {
  members: Member[];
  handleAddMember: (name: string, role: string) => void;
  onFinish: () => void;
  toasterProps: React.ComponentProps<typeof Toaster>;
}

export default function SetupScreen({ members, handleAddMember, onFinish, toasterProps }: SetupScreenProps) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080a14',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <Toaster {...toasterProps} />

      {/* Background glows */}
      <div style={{ position: 'absolute', top: -100, right: -80, width: 460, height: 460, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -100, left: -80, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,70,229,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Dot grid */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(rgba(124,58,237,0.10) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        background: 'rgba(11,13,28,0.92)',
        border: '1px solid rgba(124,58,237,0.18)',
        borderTop: '1px solid rgba(124,58,237,0.35)',
        borderRadius: 20,
        padding: '40px 36px',
        width: '100%',
        maxWidth: 440,
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 0 0 1px rgba(124,58,237,0.06), 0 4px 0 rgba(124,58,237,0.12), 0 30px 80px rgba(0,0,0,0.6), 0 0 50px rgba(124,58,237,0.06)',
      }}>

        {/* Icon */}
        <div style={{
          width: 64, height: 64, borderRadius: 18,
          background: 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.30)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 30px rgba(124,58,237,0.18)',
        }}>
          <Users size={28} color="#a78bfa" />
        </div>

        <h2 style={{
          fontSize: 24, fontWeight: 800,
          color: '#eef0fb', margin: '0 0 8px',
          letterSpacing: '-0.5px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          Bienvenido al{' '}
          <span style={{
            background: 'linear-gradient(135deg, #a78bfa, #818cf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>Equipo Dev</span>
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 32, lineHeight: 1.5, fontWeight: 400 }}>
          Agrega los miembros de tu equipo para comenzar.
        </p>

        <SetupForm onAddMember={handleAddMember} />

        {members.length > 0 && (
          <div style={{
            marginTop: 28, paddingTop: 24,
            borderTop: '1px solid rgba(124,58,237,0.12)',
          }}>
            <p style={{
              fontSize: 10, fontWeight: 600,
              color: '#4a5070', letterSpacing: '0.12em',
              textTransform: 'uppercase', marginBottom: 14,
              fontFamily: "'JetBrains Mono', monospace",
            }}>
              Miembros ({members.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
              {members.map(m => (
                <span key={m.id} style={{
                  background: `${m.color}18`,
                  border: `1px solid ${m.color}40`,
                  color: m.color,
                  padding: '4px 12px',
                  borderRadius: 50,
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {m.name}
                </span>
              ))}
            </div>
            <div style={{ width: '100%' }}>
              <ButtonBase className="w-full" onClick={onFinish}>
                Comenzar ahora →
              </ButtonBase>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
