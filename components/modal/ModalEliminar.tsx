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
        background: "rgba(4,6,14,0.88)",
        backdropFilter: "blur(8px)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0d0f22",
        border: "1px solid rgba(37,99,235,0.18)",
        borderTop: "1px solid rgba(37,99,235,0.32)",
        borderRadius: 18,
        padding: "24px 28px",
        margin: "0 16px",
        width: "100%",
        maxWidth: 380,
        boxShadow: "0 0 0 1px rgba(37,99,235,0.06), 0 4px 0 rgba(37,99,235,0.10), 0 25px 60px rgba(0,0,0,0.65)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <Trash2 size={15} color="#f87171" />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#eef0fb", margin: 0, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "1px solid rgba(37,99,235,0.15)",
              borderRadius: 7,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6b7280",
              transition: "all 0.15s",
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(37,99,235,0.10)";
              e.currentTarget.style.color = "#60a5fa";
              e.currentTarget.style.borderColor = "rgba(37,99,235,0.28)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#6b7280";
              e.currentTarget.style.borderColor = "rgba(37,99,235,0.15)";
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ height: 1, background: "rgba(37,99,235,0.10)", marginBottom: 18 }} />

        <p style={{ fontSize: 13, color: "#8b91b8", marginBottom: 24, lineHeight: 1.7, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {message}
        </p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "1px solid rgba(37,99,235,0.15)",
              borderRadius: 9,
              color: "#8b91b8",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.12s",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(37,99,235,0.07)";
              e.currentTarget.style.color = "#93c5fd";
              e.currentTarget.style.borderColor = "rgba(37,99,235,0.28)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#8b91b8";
              e.currentTarget.style.borderColor = "rgba(37,99,235,0.15)";
            }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 16px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.22)",
              borderRadius: 9,
              color: "#f87171",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.12s",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.15)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.35)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(239,68,68,0.08)";
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.22)";
            }}
          >
            <Trash2 size={13} /> Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
