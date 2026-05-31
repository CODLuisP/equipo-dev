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
        color: active ? "#E8ECF4" : "#6B7A8D",
        background: active ? "rgba(255,87,51,0.1)" : "transparent",
        border: active ? "1px solid rgba(255,87,51,0.22)" : "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
        letterSpacing: active ? "-0.1px" : "0",
        fontFamily: "var(--font-display, 'Syne', system-ui, sans-serif)",
        whiteSpace: "nowrap",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = "#C9CDD5";
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = "#6B7A8D";
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "transparent";
        }
      }}
    >
      <span style={{
        display: "flex",
        color: active ? "#FF5733" : "inherit",
        opacity: active ? 1 : 0.5,
        transition: "color 0.18s, opacity 0.18s",
      }}>
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}
