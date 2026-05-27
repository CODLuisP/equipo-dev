"use client";

import { Search } from "lucide-react";

type InputBuscarProps = {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function ImputBuscar({ placeholder = "Buscar...", value, onChange }: InputBuscarProps) {
  return (
    <div style={{ position: "relative" }}>
      <Search
        size={14}
        style={{
          position: "absolute",
          left: 11,
          top: "50%",
          transform: "translateY(-50%)",
          color: "#4B5563",
          pointerEvents: "none",
        }}
      />
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        style={{
          display: "block",
          width: "100%",
          fontSize: 13,
          paddingLeft: 34,
          paddingRight: 12,
          paddingTop: 9,
          paddingBottom: 9,
          background: "#0E1118",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 8,
          color: "#EDF0F4",
          outline: "none",
          transition: "border-color 0.15s",
        }}
        onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,87,51,0.4)"; }}
        onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
      />
    </div>
  );
}
