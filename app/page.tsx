"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Code2, Eye, EyeOff, Terminal, Shield, ChevronRight } from "lucide-react";

const USERS = [
  { username: "dev", password: "velsat" },
  { username: "admin", password: "dev2025" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = sessionStorage.getItem("equipo_dev_session");
    if (session) router.replace("/dashboard");
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise(r => setTimeout(r, 600));

    const match = USERS.find(
      u => u.username === username.trim().toLowerCase() && u.password === password
    );

    if (match) {
      sessionStorage.setItem("equipo_dev_session", JSON.stringify({ user: match.username, at: Date.now() }));
      router.push("/dashboard");
    } else {
      setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0C0F",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Background glow decorations */}
      <div style={{
        position: "absolute",
        top: "-80px",
        right: "-80px",
        width: 420,
        height: 420,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,93,47,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        bottom: "-100px",
        left: "-100px",
        width: 380,
        height: 380,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(232,93,47,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Dot grid pattern */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.035) 1px, transparent 0)",
        backgroundSize: "28px 28px",
        pointerEvents: "none",
      }} />

      {/* Login Card */}
      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: 420,
        margin: "0 20px",
        background: "#13161C",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 20,
        padding: "40px 36px 36px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,93,47,0.06)",
      }}>

        {/* Top badge */}
        <div style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 32,
        }}>
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 14,
          }}>
            {/* Icon */}
            <div style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "rgba(232,93,47,0.12)",
              border: "1px solid rgba(232,93,47,0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 32px rgba(232,93,47,0.15)",
            }}>
              <Terminal size={32} color="#E85D2F" />
            </div>

            {/* Brand */}
            <div style={{ textAlign: "center" }}>
              <h1 style={{
                fontSize: 26,
                fontWeight: 800,
                color: "#F4F5F7",
                letterSpacing: "-0.5px",
                margin: 0,
              }}>
                Equipo <span style={{ color: "#E85D2F" }}>Dev</span>
              </h1>
              <p style={{
                fontSize: 12,
                color: "#5A6270",
                marginTop: 4,
                fontWeight: 500,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}>
                Panel de gestión interna
              </p>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{
          height: 1,
          background: "rgba(255,255,255,0.05)",
          marginBottom: 28,
        }} />

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Username */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#5A6270",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="tu usuario"
              required
              autoComplete="username"
              style={{
                background: "#0A0C0F",
                border: `1px solid ${error ? "rgba(232,93,47,0.5)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 10,
                padding: "11px 14px",
                fontSize: 14,
                color: "#F4F5F7",
                outline: "none",
                transition: "border-color 0.15s",
                width: "100%",
              }}
              onFocus={e => { e.currentTarget.style.borderColor = "rgba(232,93,47,0.5)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = error ? "rgba(232,93,47,0.5)" : "rgba(255,255,255,0.08)"; }}
            />
          </div>

          {/* Password */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#5A6270",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}>
              Contraseña
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  background: "#0A0C0F",
                  border: `1px solid ${error ? "rgba(232,93,47,0.5)" : "rgba(255,255,255,0.08)"}`,
                  borderRadius: 10,
                  padding: "11px 40px 11px 14px",
                  fontSize: 14,
                  color: "#F4F5F7",
                  outline: "none",
                  transition: "border-color 0.15s",
                  width: "100%",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(232,93,47,0.5)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = error ? "rgba(232,93,47,0.5)" : "rgba(255,255,255,0.08)"; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#5A6270",
                  display: "flex",
                  padding: 0,
                  transition: "color 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.color = "#E85D2F"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#5A6270"; }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: "rgba(232,93,47,0.08)",
              border: "1px solid rgba(232,93,47,0.2)",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 12,
              color: "#E85D2F",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <Shield size={14} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 8,
              background: loading ? "rgba(232,93,47,0.5)" : "#E85D2F",
              border: "none",
              borderRadius: 10,
              padding: "13px 20px",
              color: "#fff",
              fontSize: 14,
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.15s, transform 0.1s",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#cf4e24"; }}
            onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#E85D2F"; }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16,
                  height: 16,
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#fff",
                  borderRadius: "50%",
                  display: "inline-block",
                  animation: "spin 0.7s linear infinite",
                }} />
                Verificando...
              </>
            ) : (
              <>
                Acceder al panel
                <ChevronRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: 28,
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.04)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
        }}>
          <Code2 size={12} color="#2A2D35" />
          <span style={{
            fontSize: 11,
            color: "#2A2D35",
            fontWeight: 500,
            letterSpacing: "0.05em",
          }}>
            VELSAT TECHNOLOGY · EQUIPO DE PROGRAMADORES
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #3A3F48; }
      `}</style>
    </div>
  );
}
