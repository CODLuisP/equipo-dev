"use client";

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
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "rgba(0,0,0,0.7)",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{
        background: "#1C1F26",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: "24px 28px",
        margin: "0 16px",
        width: "100%",
        maxWidth: 360,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          paddingBottom: 14,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#F4F5F7", margin: 0 }}>
            <span style={{ color: "#E85D2F" }}>|</span> {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 7,
              width: 28,
              height: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#8A9099",
              fontSize: 14,
              fontWeight: 700,
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,93,47,0.12)"; e.currentTarget.style.color = "#E85D2F"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#8A9099"; }}
          >
            ✕
          </button>
        </div>

        <p style={{ fontSize: 13, color: "#8A9099", marginBottom: 24, lineHeight: 1.6 }}>{message}</p>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#ADB5BD",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "8px 18px",
              background: "rgba(232,93,47,0.15)",
              border: "1px solid rgba(232,93,47,0.3)",
              borderRadius: 8,
              color: "#E85D2F",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(232,93,47,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(232,93,47,0.15)"; }}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
