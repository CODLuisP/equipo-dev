"use client";

export default function TabBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 11px",
        borderRadius: 8,
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        color: active ? "#eef0fb" : "#6b7280",
        background: active ? "rgba(37,99,235,0.14)" : "transparent",
        border: active ? "1px solid rgba(37,99,235,0.28)" : "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        letterSpacing: active ? "-0.1px" : "0",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        whiteSpace: "nowrap",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = "#93c5fd";
          e.currentTarget.style.background = "rgba(37,99,235,0.07)";
          e.currentTarget.style.borderColor = "rgba(37,99,235,0.15)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = "#6b7280";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }
      }}
    >
      <span style={{
        display: "flex",
        color: active ? "#60a5fa" : "inherit",
        opacity: active ? 1 : 0.5,
        transition: "color 0.18s, opacity 0.18s",
      }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
