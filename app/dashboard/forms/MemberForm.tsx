"use client";

import { useState } from "react";
import { UserPlus, Zap, Palette, Code2, Star, Smartphone, Cloud } from "lucide-react";
import { AVATAR_PRESETS } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";

const ROLES = [
  { label: "Full Stack Developer",  icon: Zap,       color: "#60a5fa" },
  { label: "Frontend Developer",    icon: Palette,    color: "#a78bfa" },
  { label: "Backend Developer",     icon: Code2,      color: "#34d399" },
  { label: "UI/UX Designer",        icon: Star,       color: "#f472b6" },
  { label: "DevOps Engineer",       icon: Cloud,      color: "#fb923c" },
  { label: "Mobile Developer",      icon: Smartphone, color: "#facc15" },
];

export default function MemberForm({ onAdd }: { onAdd: (name: string, role: string, avatarSeed: string) => void }) {
  const [name,       setName]       = useState("");
  const [role,       setRole]       = useState("Full Stack Developer");
  const [avatarSeed, setAvatarSeed] = useState(AVATAR_PRESETS[0]);

  const selectedRole = ROLES.find(r => r.label === role) ?? ROLES[0];
  const previewColor = selectedRole.color;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd(name.trim(), role, avatarSeed);
  };

  return (
    <form onSubmit={submit} style={{ fontFamily:"'Plus Jakarta Sans', sans-serif" }}>

      {/* ── Avatar preview grande centrado ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        padding: "20px 0 18px",
        marginBottom: 20,
        background: `radial-gradient(ellipse 70% 80% at 50% 50%, ${previewColor}10 0%, transparent 70%)`,
        borderRadius: 16,
        border: "1px solid rgba(255,255,255,0.05)",
        position: "relative",
      }}>
        {/* Ring + avatar */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -5, borderRadius: "50%", border: `2px solid ${previewColor}50` }} />
          <div style={{ position: "absolute", inset: -10, borderRadius: "50%",
            background: `radial-gradient(circle, ${previewColor}20 0%, transparent 70%)` }} />
          <AvatarImg seed={avatarSeed} name={name || "?"} color={previewColor} size={86} borderRadius={43} />
          <div style={{ position: "absolute", bottom: 2, right: 2,
            width: 14, height: 14, borderRadius: "50%",
            background: "#22c55e", border: "2px solid #090c1a",
            boxShadow: "0 0 8px #22c55e80" }} />
        </div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)" }}>
          {name || "Nombre del miembro"}
        </p>
      </div>

      {/* ── Grid de presets ── */}
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 9, fontWeight: 800, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.18em", margin: "0 0 10px" }}>
          Elige un avatar
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {AVATAR_PRESETS.map(p => (
            <button
              key={p} type="button"
              onClick={() => setAvatarSeed(p)}
              style={{
                padding: 3,
                background: avatarSeed === p ? `${previewColor}18` : "rgba(255,255,255,0.03)",
                border: `1.5px solid ${avatarSeed === p ? previewColor + "70" : "rgba(255,255,255,0.07)"}`,
                borderRadius: 9, cursor: "pointer", transition: "all 0.15s",
                boxShadow: avatarSeed === p ? `0 0 10px ${previewColor}25` : "none",
              }}
              onMouseEnter={e => { if (!(avatarSeed === p)) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; } }}
              onMouseLeave={e => { if (!(avatarSeed === p)) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; } }}
            >
              <AvatarImg seed={p} name={p} color={previewColor} size={38} borderRadius={8} />
            </button>
          ))}
        </div>
      </div>

      {/* ── Nombre ── */}
      <div style={{ marginBottom: 14 }}>
        <label style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 7 }}>
          Nombre
        </label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ej: Luis Paredes"
          required
          autoFocus
          style={{
            width: "100%", boxSizing: "border-box",
            background: "rgba(0,0,0,0.35)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "11px 14px",
            color: "#f0f4ff", fontSize: 14, fontWeight: 600, outline: "none",
            fontFamily: "inherit", transition: "border-color 0.15s",
          }}
          onFocus={e => e.currentTarget.style.borderColor = `${previewColor}60`}
          onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"}
        />
      </div>

      {/* ── Rol como chips ── */}
      <div style={{ marginBottom: 18 }}>
        <label style={{ fontSize: 10, fontWeight: 800, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.14em", display: "block", marginBottom: 10 }}>
          Rol
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {ROLES.map(r => {
            const active = role === r.label;
            const Icon = r.icon;
            return (
              <button
                key={r.label} type="button"
                onClick={() => setRole(r.label)}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "9px 12px",
                  background: active ? `${r.color}14` : "rgba(255,255,255,0.03)",
                  border: `1px solid ${active ? r.color + "50" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 10, cursor: "pointer",
                  transition: "all 0.15s",
                  color: active ? r.color : "rgba(255,255,255,0.35)",
                  fontSize: 11, fontWeight: active ? 700 : 500,
                  boxShadow: active ? `0 0 12px ${r.color}18` : "none",
                  textAlign: "left",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "rgba(255,255,255,0.35)"; } }}
              >
                <Icon size={13} />
                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Submit ── */}
      <button
        type="submit"
        disabled={!name.trim()}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
          padding: "13px 0",
          background: name.trim() ? "#2563eb" : "rgba(37,99,235,0.2)",
          border: "none", borderRadius: 12,
          color: name.trim() ? "#fff" : "rgba(255,255,255,0.25)",
          fontSize: 14, fontWeight: 800, cursor: name.trim() ? "pointer" : "not-allowed",
          boxShadow: name.trim() ? "0 0 24px rgba(37,99,235,0.35), 0 4px 12px rgba(0,0,0,0.4)" : "none",
          transition: "all 0.18s",
          letterSpacing: "-0.2px",
        }}
        onMouseEnter={e => { if (name.trim()) { e.currentTarget.style.background = "#3b82f6"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
        onMouseLeave={e => { if (name.trim()) { e.currentTarget.style.background = "#2563eb"; e.currentTarget.style.transform = "none"; } }}
      >
        <UserPlus size={15} />
        Agregar al equipo
      </button>
    </form>
  );
}
