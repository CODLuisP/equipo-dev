"use client";

import { X } from "lucide-react";

type ModalBaseProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalBase({ open, title, onClose, children }: ModalBaseProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.35)", backdropFilter: "blur(6px)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "var(--bg-surface)",
        border: "1px solid rgba(var(--blue-rgb),0.18)",
        borderTop: "1px solid rgba(var(--blue-rgb),0.32)",
        borderRadius: 18, padding: "24px 28px 28px",
        margin: "0 16px", width: "100%", maxWidth: 520,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20, paddingBottom: 16,
          borderBottom: "1px solid rgba(var(--blue-rgb),0.10)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.2px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid rgba(var(--blue-rgb),0.15)",
              borderRadius: 7, width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "var(--text-3)", transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--blue-rgb),0.10)"; e.currentTarget.style.color = "var(--blue-soft)"; e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.15)"; }}
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
