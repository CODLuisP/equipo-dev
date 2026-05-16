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
    <div style={{ display: "flex", flexDirection: "column", gap: 4, fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      {label && (
        <label style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#8A9099",
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
            fontSize: 13,
            paddingLeft: 12,
            paddingRight: isPassword ? 36 : 12,
            paddingTop: 8,
            paddingBottom: 8,
            borderRadius: 7,
            background: "#0A0C0F",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#F4F5F7",
            outline: "none",
            transition: "border-color 0.15s",
          }}
          onFocus={e => { e.currentTarget.style.borderColor = "rgba(232,93,47,0.5)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: 10,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#8A9099",
              display: "flex",
              padding: 0,
            }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
