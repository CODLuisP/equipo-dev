"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Eye, EyeOff, ArrowRight } from "lucide-react";

const USERS = [
  { username: "dev", password: "velsat" },
  { username: "admin", password: "dev2025" },
];

const CODE_LINES = [
  { indent: 0, color: "#8892A4", text: "const team = await velsat" },
  { indent: 1, color: "#8892A4", text: ".getTeam('dev')" },
  { indent: 1, color: "#8892A4", text: ".filter(m => m.active)" },
  { indent: 0, color: "transparent", text: "" },
  { indent: 0, color: "#E8ECF4", text: "team.forEach(async member => {" },
  { indent: 1, color: "#8892A4", text: "const tasks = getTasks(member.id);" },
  { indent: 1, color: "#2DD4BF", text: "await notify(member, tasks);" },
  { indent: 0, color: "#E8ECF4", text: "});" },
  { indent: 0, color: "transparent", text: "" },
  { indent: 0, color: "#FF5733", text: "// ✓ 12 tareas completadas hoy" },
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

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    background: "rgba(5,7,14,0.8)",
    border: `1px solid ${hasError ? "rgba(255,87,51,0.35)" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 8,
    padding: "11px 14px",
    fontSize: 14,
    color: "#E8ECF4",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "var(--font-body)",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base, #05070E)",
      display: "flex",
      fontFamily: "var(--font-body, 'Instrument Sans', system-ui)",
      overflow: "hidden",
    }}>

      {/* ── Left decorative panel (desktop only) ── */}
      <div
        className="hidden lg:flex"
        style={{
          flex: "0 0 52%",
          position: "relative",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px 68px",
          overflow: "hidden",
          background: "#04060C",
        }}
      >
        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 75% 75% at 40% 50%, black 40%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 40% 50%, black 40%, transparent 100%)",
        }} />

        {/* Sharp angular corner accent — top right */}
        <div style={{
          position: "absolute", top: 0, right: 0,
          width: "55%", height: "55%",
          background: "linear-gradient(225deg, rgba(255,87,51,0.07) 0%, rgba(255,87,51,0.02) 35%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Large wireframe decorative ring */}
        <div style={{
          position: "absolute",
          width: 480, height: 480,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          right: -140, top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          width: 320, height: 320,
          borderRadius: "50%",
          border: "1px solid rgba(255,87,51,0.05)",
          right: -60, top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }} />

        {/* Scanline sweep */}
        <div style={{
          position: "absolute", left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent 0%, rgba(255,87,51,0.07) 30%, rgba(255,87,51,0.12) 50%, rgba(255,87,51,0.07) 70%, transparent 100%)",
          animation: "sweep 9s linear infinite",
          pointerEvents: "none",
        }} />

        {/* Bottom fade */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
          background: "linear-gradient(to top, #04060C, transparent)",
          pointerEvents: "none",
        }} />

        {/* Content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Logo mark */}
          <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 52 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 9,
              background: "rgba(255,87,51,0.06)",
              border: "1px solid rgba(255,87,51,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Terminal size={17} color="#FF5733" strokeWidth={1.75} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{
                fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                fontSize: 10, fontWeight: 500,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: "#4A5568",
              }}>
                Velsat Technology
              </span>
              {/* Live signal */}
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", display: "block", animation: "pulseSignal 2s ease-in-out infinite" }} />
                <span style={{ fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", fontSize: 9, color: "#22C55E", letterSpacing: "0.1em", opacity: 0.7 }}>SISTEMA EN LÍNEA</span>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="fade-up delay-1">
            <h1 style={{
              fontFamily: "var(--font-display, 'Syne', system-ui)",
              fontSize: 40, fontWeight: 700, color: "#E8ECF4",
              margin: 0, lineHeight: 1.15, letterSpacing: "-0.6px",
            }}>
              Equipo{" "}
              <span style={{ color: "#FF5733" }}>Dev.</span>
            </h1>
            <p style={{
              fontSize: 14, color: "#8892A4",
              marginTop: 18, lineHeight: 1.65, maxWidth: 360,
            }}>
              Panel de gestión interna para el equipo de programadores. Tareas, snippets y colaboración en un solo lugar.
            </p>
          </div>

          {/* Code block */}
          <div className="fade-up delay-2" style={{
            marginTop: 40,
            background: "rgba(6,8,16,0.85)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderLeft: "2px solid rgba(255,87,51,0.2)",
            borderRadius: 12,
            padding: "18px 22px",
            backdropFilter: "blur(12px)",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
            fontSize: 12, lineHeight: 1.8,
            maxWidth: 400,
            boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
          }}>
            {/* Traffic lights */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                  <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.7 }} />
                ))}
              </div>
              <span style={{ fontSize: 9, color: "#2D3748", letterSpacing: "0.1em" }}>velsat.js</span>
            </div>
            {CODE_LINES.map((line, i) => (
              <div key={i} style={{ paddingLeft: line.indent * 18, color: line.color, minHeight: "1.8em" }}>
                {line.text || " "}
                {i === CODE_LINES.length - 1 && (
                  <span style={{ display: "inline-block", width: 2, height: "0.9em", background: "#FF5733", marginLeft: 2, verticalAlign: "text-bottom", animation: "blink 1.1s step-end infinite" }} />
                )}
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="fade-up delay-3" style={{ display: "flex", gap: 0, marginTop: 36 }}>
            {[
              { value: "100%", label: "Equipo activo" },
              { value: "∞",    label: "Snippets" },
              { value: "24/7", label: "Disponible" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 32, background: "rgba(255,255,255,0.06)", margin: "0 28px" }} />}
                <div>
                  <div style={{
                    fontFamily: "var(--font-display, 'Syne', system-ui)",
                    fontSize: 20, fontWeight: 700,
                    color: "#E8ECF4", letterSpacing: "-0.4px",
                  }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 10, color: "#3D4A5C", marginTop: 3, letterSpacing: "0.06em", fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)", textTransform: "uppercase" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical separator */}
        <div style={{
          position: "absolute", right: 0, top: "8%", height: "84%", width: 1,
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.06) 30%, rgba(255,87,51,0.08) 50%, rgba(255,255,255,0.06) 70%, transparent)",
        }} />
      </div>

      {/* ── Right login panel ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        position: "relative",
        background: "#05070E",
      }}>
        {/* Subtle top vignette accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "45%",
          background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,87,51,0.05) 0%, transparent 100%)",
          pointerEvents: "none",
        }} />

        <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>
          {/* Mobile logo */}
          <div className="fade-up lg:hidden" style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              width: 46, height: 46, borderRadius: 11,
              background: "rgba(255,87,51,0.08)", border: "1px solid rgba(255,87,51,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 14px",
            }}>
              <Terminal size={20} color="#FF5733" strokeWidth={1.75} />
            </div>
            <h1 style={{
              fontFamily: "var(--font-display, 'Syne', system-ui)",
              fontSize: 28, fontWeight: 800, color: "#E8ECF4",
              margin: 0, letterSpacing: "-0.6px",
            }}>
              Equipo <span style={{ color: "#FF5733" }}>Dev</span>
            </h1>
          </div>

          {/* Form heading */}
          <div className="fade-up" style={{ marginBottom: 24 }}>
            <h2 style={{
              fontFamily: "var(--font-display, 'Syne', system-ui)",
              fontSize: 24, fontWeight: 700,
              color: "#E8ECF4", margin: 0, letterSpacing: "-0.5px",
            }}>
              Bienvenido de vuelta
            </h2>
            <p style={{ fontSize: 13, color: "#6B7A8D", marginTop: 6, fontFamily: "var(--font-body, 'Instrument Sans', system-ui)" }}>
              Accede al panel de gestión del equipo
            </p>
          </div>

          {/* Card */}
          <div className="fade-up delay-1" style={{
            background: "rgba(9,11,20,0.9)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderTop: "1px solid rgba(255,87,51,0.18)",
            borderRadius: 16,
            padding: "28px 24px",
            backdropFilter: "blur(20px)",
            boxShadow: "0 2px 0 rgba(255,87,51,0.12), 0 40px 90px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,87,51,0.04)",
          }}>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Username */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={{
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#3D4A5C",
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
                  style={inputStyle(!!error)}
                  onFocus={e => {
                    e.currentTarget.style.borderColor = "rgba(255,87,51,0.4)";
                    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,87,51,0.07)";
                  }}
                  onBlur={e => {
                    e.currentTarget.style.borderColor = error ? "rgba(255,87,51,0.35)" : "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={{
                  fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: "0.12em", textTransform: "uppercase",
                  color: "#3D4A5C",
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
                    style={{ ...inputStyle(!!error), padding: "11px 42px 11px 14px" }}
                    onFocus={e => {
                      e.currentTarget.style.borderColor = "rgba(255,87,51,0.4)";
                      e.currentTarget.style.boxShadow = "0 0 0 3px rgba(255,87,51,0.07)";
                    }}
                    onBlur={e => {
                      e.currentTarget.style.borderColor = error ? "rgba(255,87,51,0.35)" : "rgba(255,255,255,0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute", right: 12, top: "50%",
                      transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer",
                      color: "#3D4A5C", display: "flex", padding: 0, transition: "color 0.15s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#FF5733"; }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#3D4A5C"; }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: "rgba(255,87,51,0.05)",
                  border: "1px solid rgba(255,87,51,0.17)",
                  borderRadius: 8, padding: "10px 13px",
                  fontSize: 12, color: "#FF6B4E",
                  display: "flex", alignItems: "center", gap: 8,
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
                  marginTop: 6,
                  background: loading ? "rgba(255,87,51,0.4)" : "linear-gradient(135deg, #FF5733, #E84922)",
                  border: "none", borderRadius: 9,
                  padding: "12px 20px",
                  color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  transition: "opacity 0.15s, transform 0.1s",
                  width: "100%",
                  fontFamily: "var(--font-body)",
                  boxShadow: loading ? "none" : "0 4px 18px rgba(255,87,51,0.28)",
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.opacity = "0.92";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.opacity = "1";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff",
                      borderRadius: "50%", display: "inline-block",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Verificando…
                  </>
                ) : (
                  <>
                    Acceder al panel
                    <ArrowRight size={15} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <div style={{ textAlign: "center", marginTop: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <div style={{ height: 1, width: 28, background: "rgba(255,255,255,0.05)" }} />
            <span style={{
              fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
              fontSize: 9, color: "#212840",
              letterSpacing: "0.18em", textTransform: "uppercase",
            }}>
              Velsat Technology © 2025
            </span>
            <div style={{ height: 1, width: 28, background: "rgba(255,255,255,0.05)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
