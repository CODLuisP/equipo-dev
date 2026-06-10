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
        background: "rgba(4,6,14,0.88)",
        backdropFilter: "blur(8px)",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#161929",
        border: "1px solid rgba(37,99,235,0.18)",
        borderTop: "1px solid rgba(37,99,235,0.32)",
        borderRadius: 18,
        padding: "24px 28px 28px",
        margin: "0 16px",
        width: "100%",
        maxWidth: 520,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(37,99,235,0.10)",
        }}>
          <h2 style={{
            fontSize: 15,
            fontWeight: 700,
            color: "#eef0fb",
            margin: 0,
            letterSpacing: "-0.2px",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            {title}
          </h2>
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
        {children}
      </div>
    </div>
  );
}
