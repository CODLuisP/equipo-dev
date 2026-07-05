"use client";

import { useState } from "react";
import { UserPlus, Zap, Palette, Code2, Star, Smartphone, Cloud, Check } from "lucide-react";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";

// ⚠️ Sin CSS vars — solo hex para poder concatenar opacidades en JS
const ROLES = [
  { label: "Full Stack Developer",  icon: Zap,       color: "#60a5fa" },
  { label: "Frontend Developer",    icon: Palette,    color: "#a78bfa" },
  { label: "Backend Developer",     icon: Code2,      color: "#34d399" },
  { label: "UI/UX Designer",        icon: Star,       color: "#f472b6" },
  { label: "DevOps Engineer",       icon: Cloud,      color: "#fb923c" },
  { label: "Mobile Developer",      icon: Smartphone, color: "#facc15" },
];

const AVATAR_GROUPS = [
  { label: "Clásicos",  seeds: AVATAR_PRESETS.slice(0, 10)  },
  { label: "Guerreros", seeds: AVATAR_PRESETS.slice(10, 20) },
  { label: "Nombres",   seeds: AVATAR_PRESETS.slice(20, 30) },
  { label: "Nuevos",    seeds: AVATAR_PRESETS.slice(30, 40) },
];

const LABEL_STYLE: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  color: "rgba(255,255,255,0.55)",
  textTransform: "uppercase",
  letterSpacing: "0.14em",
  display: "block",
  marginBottom: 6,
};

export default function MemberForm({ onAdd }: { onAdd: (name: string, role: string, avatarSeed: string) => void }) {
  const [name,       setName]       = useState("");
  const [role,       setRole]       = useState("Full Stack Developer");
  const [avatarSeed, setAvatarSeed] = useState(AVATAR_PRESETS[0]);

  const selectedRole = ROLES.find(r => r.label === role) ?? ROLES[0];
  const pc = selectedRole.color; // previewColor — siempre hex

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), role, avatarSeed);
  };

  return (
    <form onSubmit={submit} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Fila: preview + nombre + rol ── */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* Avatar preview */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", inset: -4, borderRadius: "50%",
              border: `2px solid ${pc}55`,
              boxShadow: `0 0 12px ${pc}35`,
            }} />
            <AvatarImg seed={avatarSeed} name={name || "?"} color={pc} size={64} borderRadius={32} />
            <div style={{
              position: "absolute", bottom: 1, right: 1,
              width: 12, height: 12, borderRadius: "50%",
              background: "#22c55e", border: "2px solid var(--bg-surface)",
            }} />
          </div>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 600, color: "rgba(255,255,255,0.4)", maxWidth: 68, textAlign: "center", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {name || "Miembro"}
          </p>
        </div>

        {/* Nombre + Rol */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>

          {/* Nombre */}
          <div>
            <label style={LABEL_STYLE}>Nombre</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ej: Luis Paredes"
              required
              autoFocus
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 8, padding: "9px 12px",
                color: "#ffffff", fontSize: 13, fontWeight: 600, outline: "none",
                fontFamily: "inherit", transition: "border-color 0.15s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = `${pc}70`}
              onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
            />
          </div>

          {/* Rol */}
          <div>
            <label style={LABEL_STYLE}>Rol</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {ROLES.map(r => {
                const active = role === r.label;
                const Icon = r.icon;
                return (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => setRole(r.label)}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "7px 9px",
                      background: active ? `${r.color}22` : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${active ? r.color + "60" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: 7, cursor: "pointer",
                      transition: "all 0.13s",
                      color: active ? r.color : "rgba(255,255,255,0.45)",
                      fontSize: 10, fontWeight: active ? 700 : 500,
                      textAlign: "left",
                      outline: "none",
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.color = "rgba(255,255,255,0.45)";
                      }
                    }}
                  >
                    <Icon size={11} />
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Separador ── */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.07)" }} />

      {/* ── Avatares ── */}
      <div>
        <label style={LABEL_STYLE}>Avatar</label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AVATAR_GROUPS.map(group => (
            <div key={group.label}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 5px" }}>
                {group.label}
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 4 }}>
                {group.seeds.map(p => {
                  const selected = avatarSeed === p;
                  return (
                    <button
                      key={p} type="button"
                      onClick={() => setAvatarSeed(p)}
                      title={p}
                      style={{
                        position: "relative",
                        width: "100%", aspectRatio: "1",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        padding: 2,
                        background: selected ? `${pc}20` : "rgba(255,255,255,0.04)",
                        border: `1.5px solid ${selected ? pc + "70" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 7, cursor: "pointer",
                        transition: "all 0.13s",
                        boxShadow: selected ? `0 0 8px ${pc}30` : "none",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    >
                      <AvatarImg seed={p} name={p} color={pc} size={32} borderRadius={5} />
                      {selected && (
                        <div style={{
                          position: "absolute", top: -4, right: -4,
                          width: 13, height: 13, borderRadius: "50%",
                          background: pc,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          border: "1.5px solid var(--bg-surface)",
                        }}>
                          <Check size={7} color="#fff" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={!name.trim()}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "11px 0",
          background: name.trim() ? "linear-gradient(135deg, rgba(var(--blue-rgb),0.9), rgba(var(--blue-rgb),0.55))" : "rgba(59,130,246,0.15)",
          border: "none", borderRadius: 10,
          color: name.trim() ? "#fff" : "rgba(255,255,255,0.25)",
          fontSize: 12, fontWeight: 600, cursor: name.trim() ? "pointer" : "not-allowed",
          transition: "all 0.16s", letterSpacing: "-0.1px",
          outline: "none",
        }}
        onMouseEnter={e => { if (name.trim()) { e.currentTarget.style.background = "rgba(var(--blue-rgb),0.85)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={e => { if (name.trim()) { e.currentTarget.style.background = "linear-gradient(135deg, rgba(var(--blue-rgb),0.9), rgba(var(--blue-rgb),0.55))"; e.currentTarget.style.transform = "none"; } }}
      >
        <UserPlus size={14} />
        Agregar al equipo
      </button>
    </form>
  );
}
