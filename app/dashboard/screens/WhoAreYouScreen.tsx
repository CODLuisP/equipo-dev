"use client";

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
      minHeight: "100vh",
      background: "#070917",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <Toaster {...toasterProps} />

      {/* UI content */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 680, width: "100%" }}>

        {/* Icon */}
        <div style={{
          width: 58, height: 58, borderRadius: 15,
          background: "rgba(var(--blue-rgb),0.10)",
          border: "1px solid rgba(var(--blue-rgb),0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 22px",
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--blue-soft)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 28, fontWeight: 800, color: "var(--text)",
          margin: "0 0 8px", letterSpacing: "-0.6px",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          ¿Quién eres{" "}
          <span style={{
            background: "linear-gradient(135deg,var(--blue-soft),var(--blue-light))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>hoy</span>?
        </h1>
        <p style={{ fontSize: 13, color: "var(--text-3)", margin: "0 0 34px", lineHeight: 1.5 }}>
          Selecciona tu perfil para personalizar las notificaciones
        </p>

        {/* Member cards */}
        <div style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 12,
        }}>
          {members.map((member, i) => (
            <button
              key={member.id}
              onClick={() => onSelect(member)}
              style={{
                background: "rgba(var(--surface-rgb),0.92)",
                border: "1px solid rgba(var(--blue-rgb),0.14)",
                borderRadius: 16,
                padding: "22px 14px 18px",
                cursor: "pointer",
                textAlign: "center",
                backdropFilter: "blur(12px)",
                transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 11,
                animationDelay: `${i * 0.06}s`,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = "rgba(var(--blue-rgb),0.10)";
                e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.38)";
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = "rgba(var(--surface-rgb),0.92)";
                e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.14)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{ position: "relative" }}>
                <div style={{
                  position: "absolute", inset: -4, borderRadius: 18,
                  background: `radial-gradient(circle, ${member.color}22 0%, transparent 70%)`,
                  pointerEvents: "none",
                }} />
                <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={58} borderRadius={14} />
              </div>
              <div>
                <p style={{ color: "var(--text)", fontWeight: 700, fontSize: 13, margin: 0, letterSpacing: "-0.1px" }}>
                  {member.name}
                </p>
                <p style={{ color: "var(--text-3)", fontSize: 11, margin: "3px 0 0", fontWeight: 500 }}>
                  {member.role}
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Skip */}
        <button
          onClick={onSkip}
          style={{
            marginTop: 28, background: "none", border: "none",
            color: "#3a4060", fontSize: 12, cursor: "pointer",
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500,
            transition: "color 0.15s",
            display: "flex", alignItems: "center", gap: 6,
            margin: "28px auto 0",
          }}
          onMouseEnter={e => { e.currentTarget.style.color = "var(--text-2)"; }}
          onMouseLeave={e => { e.currentTarget.style.color = "#3a4060"; }}
        >
          Continuar sin seleccionar
        </button>
      </div>
    </div>
  );
}
