"use client";

import { Users } from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member, Task } from "@/app/dashboard/types";

function StatCol({ count, label }: { count: number; label: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
      <span style={{ fontSize: 18, fontWeight: 800, color: count > 0 ? "#EDF0F4" : "#2D3748", lineHeight: 1, fontFamily: "var(--font-display, 'Syne', system-ui)" }}>
        {count}
      </span>
      <span style={{ fontSize: 9, fontWeight: 600, color: "#3D4A5C", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
        {label}
      </span>
    </div>
  );
}

export default function SectionEquipo({ members, tasks }: { members: Member[]; tasks: Task[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map(m => {
        const mt = tasks.filter(t => t.assignedTo === m.id);
        const done   = mt.filter(t => t.status === 'completada').length;
        const inProg = mt.filter(t => t.status === 'en progreso').length;
        const pend   = mt.filter(t => t.status === 'pendiente').length;
        const total  = mt.length;
        const prog   = total > 0 ? Math.round((done / total) * 100) : 0;

        return (
          <div
            key={m.id}
            style={{
              background: "#0E1118",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 18,
              transition: "border-color 0.2s, transform 0.2s",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Identity */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <AvatarImg
                    seed={m.avatarSeed || m.name}
                    name={m.name}
                    color={m.color}
                    size={46}
                    borderRadius={12}
                  />
                  <div style={{
                    position: "absolute",
                    bottom: -2,
                    right: -2,
                    width: 11,
                    height: 11,
                    background: "#22C55E",
                    border: "2px solid #0E1118",
                    borderRadius: "50%",
                  }} />
                </div>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#EDF0F4", margin: 0, letterSpacing: "-0.3px", fontFamily: "var(--font-display, 'Syne', system-ui)" }}>
                    {m.name}
                  </h3>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#4B5563", fontWeight: 500, fontFamily: "var(--font-body, 'Instrument Sans', system-ui)" }}>
                      {m.role}
                    </span>
                    <span style={{ width: 2, height: 2, borderRadius: "50%", background: "#2D3748", flexShrink: 0 }} />
                    <code style={{ fontSize: 10, color: "#2D3748", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
                      @{m.name.toLowerCase().replace(/\s/g, '_')}
                    </code>
                  </div>
                </div>
              </div>
              <div style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: m.color,
                flexShrink: 0,
                alignSelf: "flex-start",
                marginTop: 4,
              }} />
            </div>

            {/* Progress bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: "#3D4A5C", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)" }}>
                  Completado
                </span>
                <span style={{ fontSize: 13, fontWeight: 800, color: prog > 0 ? "#EDF0F4" : "#2D3748", fontFamily: "var(--font-display, 'Syne', system-ui)" }}>
                  {prog}%
                </span>
              </div>
              <div style={{ height: 3, background: "rgba(255,255,255,0.05)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${prog}%`,
                  background: m.color,
                  borderRadius: 6,
                  transition: "width 0.9s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />

            {/* Stats */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around" }}>
              <StatCol count={inProg} label="Activas" />
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.05)" }} />
              <StatCol count={done} label="Listas" />
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.05)" }} />
              <StatCol count={pend} label="Espera" />
              <div style={{ width: 1, height: 28, background: "rgba(255,255,255,0.05)" }} />
              <StatCol count={total} label="Total" />
            </div>
          </div>
        );
      })}

      {members.length === 0 && (
        <div style={{
          gridColumn: "1/-1",
          padding: "64px 0",
          textAlign: "center",
          border: "1px dashed rgba(255,255,255,0.06)",
          borderRadius: 14,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}>
          <Users size={36} color="#1F2937" />
          <p style={{ color: "#374151", fontSize: 14, margin: 0 }}>Sin miembros aún</p>
        </div>
      )}
    </div>
  );
}
