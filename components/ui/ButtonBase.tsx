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
    bg: "#2563eb",
    color: "#fff",
    border: "1px solid rgba(37,99,235,0.5)",
    hoverBg: "#1d4ed8",
    shadow: "0 6px 20px rgba(37,99,235,0.3)",
  },
  secondary: {
    bg: "transparent",
    color: "#8b91b8",
    border: "1px solid rgba(37,99,235,0.15)",
    hoverBg: "rgba(37,99,235,0.07)",
    shadow: "none",
  },
  danger: {
    bg: "transparent",
    color: "#f87171",
    border: "1px solid rgba(239,68,68,0.2)",
    hoverBg: "rgba(239,68,68,0.08)",
    shadow: "none",
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
        boxShadow: v.shadow,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = v.hoverBg;
          if (variant === 'primary') (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = v.bg;
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }
      }}
    >
      {children}
    </button>
  );
}
