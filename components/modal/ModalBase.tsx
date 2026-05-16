"use client";

type ModalBaseProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

export default function ModalBase({ open, title, onClose, children }: ModalBaseProps) {
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
        padding: 28,
        margin: "0 16px",
        width: "100%",
        maxWidth: 520,
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          paddingBottom: 16,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#F4F5F7", margin: 0 }}>
            <span style={{ color: "#E85D2F" }}>|</span> {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 7,
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#8A9099",
              fontSize: 16,
              fontWeight: 700,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(232,93,47,0.12)";
              e.currentTarget.style.color = "#E85D2F";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#8A9099";
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
