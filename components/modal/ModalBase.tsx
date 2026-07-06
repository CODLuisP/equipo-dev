"use client";

import { X } from "lucide-react";

type ModalBaseProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  closeOnOverlayClick?: boolean;
};

export default function ModalBase({ open, title, onClose, children, closeOnOverlayClick = true }: ModalBaseProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onClick={e => { if (closeOnOverlayClick && e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#0b0b0d",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 18, padding: "24px 28px 28px",
        margin: "0 16px", width: "100%", maxWidth: 520,
      }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 20, paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f6", margin: 0, letterSpacing: "-0.2px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#8a8a92", transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#d4d4d8"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8a8a92"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
          >
            <X size={15} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
