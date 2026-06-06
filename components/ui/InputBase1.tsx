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
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.10em",
          textTransform: "uppercase",
          color: "#4a5070",
          fontFamily: "'JetBrains Mono', monospace",
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
            background: "rgba(8,10,20,0.8)",
            border: "1px solid rgba(124,58,237,0.15)",
            color: "#eef0fb",
            outline: "none",
            transition: "border-color 0.15s, box-shadow 0.15s",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onFocus={e => {
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.5)";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.10)";
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.15)";
            e.currentTarget.style.boxShadow = "none";
          }}
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
              color: "#4a5070",
              display: "flex",
              padding: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.color = "#a78bfa"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#4a5070"; }}
          >
            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
    </div>
  );
}
