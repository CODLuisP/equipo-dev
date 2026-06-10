"use client";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

const variants = {
  primary: {
    bg: "var(--blue)",
    color: "#fff",
    border: "1px solid rgba(var(--blue-rgb),0.5)",
    hoverBg: "#1d4ed8",
  },
  secondary: {
    bg: "transparent",
    color: "var(--text-2)",
    border: "1px solid rgba(var(--blue-rgb),0.15)",
    hoverBg: "rgba(var(--blue-rgb),0.07)",
  },
  danger: {
    bg: "transparent",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    hoverBg: "rgba(239,68,68,0.08)",
  },
};

export default function ButtonBase({
  children,
  variant = "primary",
  type = "button",
  onClick,
  disabled = false,
  className,
}: ButtonProps) {
  const v = variants[variant];
  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "8px 16px",
        borderRadius: 9,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        border: v.border,
        background: v.bg,
        color: v.color,
        transition: "all 0.15s",
        outline: "none",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.4 : 1,
        letterSpacing: "0.01em",
      }}
      onMouseEnter={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = v.hoverBg;
      }}
      onMouseLeave={e => {
        if (!disabled) (e.currentTarget as HTMLButtonElement).style.background = v.bg;
      }}
    >
      {children}
    </button>
  );
}
