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
        padding: "24px 28px 28px",
        margin: "0 16px",
        width: "100%",
        maxWidth: 520,
        boxShadow: "0 25px 60px rgba(0,0,0,0.65), 0 8px 20px rgba(0,0,0,0.3)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}>
          <h2 style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#EDF0F4",
            margin: 0,
            letterSpacing: "-0.2px",
          }}>
            {title}
          </h2>
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
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,87,51,0.08)";
              e.currentTarget.style.color = "#FF5733";
              e.currentTarget.style.borderColor = "rgba(255,87,51,0.2)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#6B7280";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <X size={14} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
