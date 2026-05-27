"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Eye, EyeOff, ArrowRight } from "lucide-react";

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
    await new Promise(r => setTimeout(r, 500));
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
    <div style={{
      minHeight: "100vh",
      background: "#080A0D",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Subtle dot grid */}
      <div style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.02) 1px, transparent 0)",
        backgroundSize: "32px 32px",
        pointerEvents: "none",
      }} />

      {/* Single ambient glow */}
      <div style={{
        position: "absolute",
        top: "15%",
        left: "50%",
        transform: "translateX(-50%)",
        width: 700,
        height: 350,
        background: "radial-gradient(ellipse, rgba(255,87,51,0.05) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      <div style={{
        position: "relative",
        zIndex: 10,
        width: "100%",
        maxWidth: 400,
        margin: "0 20px",
      }}>
        {/* Brand */}
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <div style={{
            width: 48,
            height: 48,
            borderRadius: 13,
            background: "rgba(255,87,51,0.07)",
            border: "1px solid rgba(255,87,51,0.14)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
          }}>
            <Terminal size={21} color="#FF5733" strokeWidth={1.75} />
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: "#EDF0F4",
            margin: 0,
            letterSpacing: "-0.6px",
            lineHeight: 1.1,
          }}>
            Equipo <span style={{ color: "#FF5733" }}>Dev</span>
          </h1>
          <p style={{
            fontSize: 13,
            color: "#4B5563",
            marginTop: 7,
            fontWeight: 400,
            lineHeight: 1.5,
          }}>
            Panel de gestión interna
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "#0E1118",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: "32px 28px",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.25)",
        }}>
          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {/* Username */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4B5563",
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
                  background: "#080A0D",
                  border: `1px solid ${error ? "rgba(255,87,51,0.3)" : "rgba(255,255,255,0.07)"}`,
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 14,
                  color: "#EDF0F4",
                  outline: "none",
                  width: "100%",
                  transition: "border-color 0.15s",
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,87,51,0.4)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = error ? "rgba(255,87,51,0.3)" : "rgba(255,255,255,0.07)"; }}
              />
            </div>

            {/* Password */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#4B5563",
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
                    background: "#080A0D",
                    border: `1px solid ${error ? "rgba(255,87,51,0.3)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: 8,
                    padding: "10px 38px 10px 12px",
                    fontSize: 14,
                    color: "#EDF0F4",
                    outline: "none",
                    width: "100%",
                    transition: "border-color 0.15s",
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(255,87,51,0.4)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = error ? "rgba(255,87,51,0.3)" : "rgba(255,255,255,0.07)"; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: 11,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#4B5563",
                    display: "flex",
                    padding: 0,
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#FF5733"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#4B5563"; }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: "rgba(255,87,51,0.05)",
                border: "1px solid rgba(255,87,51,0.14)",
                borderRadius: 8,
                padding: "9px 12px",
                fontSize: 12,
                color: "#FF5733",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FF5733", flexShrink: 0 }} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4,
                background: loading ? "rgba(255,87,51,0.45)" : "#FF5733",
                border: "none",
                borderRadius: 8,
                padding: "11px 20px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.15s",
                letterSpacing: "0.01em",
                width: "100%",
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#E84C2A"; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#FF5733"; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.25)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Verificando
                </>
              ) : (
                <>
                  Acceder
                  <ArrowRight size={15} strokeWidth={2.5} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <span style={{ fontSize: 11, color: "#1C2030", letterSpacing: "0.1em", fontWeight: 600 }}>
            VELSAT TECHNOLOGY
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: #374151; }
      `}</style>
    </div>
  );
}
