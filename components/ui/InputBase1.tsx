"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

type InputBaseProps = {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  required?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function InputBase1({
  label,
  type = "text",
  placeholder,
  value,
  required = false,
  onChange,
}: InputBaseProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {label && (
        <label style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#d1d5db",
        }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        <input
          required={required}
          type={isPassword && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          style={{
            display: "block",
            width: "100%",
            fontSize: 14,
            paddingLeft: 12,
            paddingRight: isPassword ? 36 : 12,
            paddingTop: 9,
            paddingBottom: 9,
            borderRadius: 9,
            background: "rgba(var(--surface-rgb),0.9)",
            border: "1px solid rgba(var(--blue-rgb),0.15)",
            color: "var(--text)",
            outline: "none",
            transition: "border-color 0.15s",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.5)"; }}
          onBlur={e =>  { e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.15)"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", color: "var(--text-dim)",
              display: "flex", padding: 0, transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "var(--blue-soft)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
