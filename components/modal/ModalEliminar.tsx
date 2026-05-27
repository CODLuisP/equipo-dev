"use client";

import { Trash2, X } from "lucide-react";

type ModalEliminarProps = {
  open: boolean;
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ModalEliminar({ open, title, message, onClose, onConfirm }: ModalEliminarProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(4,6,10,0.88)",
        backdropFilter: "blur(6px)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0E1118",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 16,
        padding: "24px 28px",
        margin: "0 16px",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 25px 60px rgba(0,0,0,0.65)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(255,87,51,0.07)",
              border: "1px solid rgba(255,87,51,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Trash2 size={15} color="#FF5733" />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#EDF0F4", margin: 0 }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 7,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6B7280",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#EDF0F4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#6B7280"; }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ height: 1, background: "rgba(255,255,255,0.05)", marginBottom: 18 }} />

        <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 24, lineHeight: 1.7 }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "7px 14px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: 8,
              color: "#9CA3AF",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.12s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#EDF0F4"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9CA3AF"; }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "7px 14px",
              background: "rgba(255,87,51,0.08)",
              border: "1px solid rgba(255,87,51,0.18)",
              borderRadius: 8,
              color: "#FF5733",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.12s",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,87,51,0.16)"; e.currentTarget.style.borderColor = "rgba(255,87,51,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,87,51,0.08)"; e.currentTarget.style.borderColor = "rgba(255,87,51,0.18)"; }}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
