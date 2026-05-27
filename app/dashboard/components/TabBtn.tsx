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
        gap: 5,
        padding: "5px 10px",
        borderRadius: 7,
        fontSize: 12,
        fontWeight: active ? 700 : 500,
        color: active ? "#EDF0F4" : "#6B7280",
        background: active ? "rgba(255,255,255,0.07)" : "transparent",
        border: active ? "1px solid rgba(255,255,255,0.09)" : "1px solid transparent",
        cursor: "pointer",
        transition: "all 0.15s",
        letterSpacing: "0.01em",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        whiteSpace: "nowrap",
        position: "relative",
      }}
      onMouseEnter={e => {
        if (!active) {
          e.currentTarget.style.color = "#C9CDD5";
          e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={e => {
        if (!active) {
          e.currentTarget.style.color = "#6B7280";
          e.currentTarget.style.background = "transparent";
        }
      }}
    >
      <span style={{ opacity: active ? 1 : 0.6, display: "flex" }}>{icon}</span>
      <span>{label}</span>
      {active && (
        <span style={{
          width: 3,
          height: 3,
          borderRadius: "50%",
          background: "#FF5733",
          flexShrink: 0,
          marginLeft: 1,
        }} />
      )}
    </button>
  );
}
