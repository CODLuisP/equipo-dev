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
    bg: "#FF5733",
    color: "#fff",
    border: "1px solid #FF5733",
    hoverBg: "#E84C2A",
  },
  secondary: {
    bg: "transparent",
    color: "#9CA3AF",
    border: "1px solid rgba(255,255,255,0.09)",
    hoverBg: "rgba(255,255,255,0.05)",
  },
  danger: {
    bg: "transparent",
    color: "#FF5733",
    border: "1px solid rgba(255,87,51,0.2)",
    hoverBg: "rgba(255,87,51,0.08)",
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
        padding: "7px 14px",
        borderRadius: 8,
        fontSize: 13,
        fontWeight: 600,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        cursor: disabled ? "not-allowed" : "pointer",
        border: v.border,
        background: v.bg,
        color: v.color,
        transition: "background 0.12s, opacity 0.12s",
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
