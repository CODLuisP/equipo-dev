"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Terminal, Eye, EyeOff, ArrowRight } from "lucide-react";

const USERS = [
  { username: "dev", password: "velsat" },
  { username: "admin", password: "dev2025" },
];

const CODE_LINES = [
  { indent: 0, color: "#8b91b8", text: "const team = await velsat" },
  { indent: 1, color: "#8b91b8", text: ".getTeam('dev')" },
  { indent: 1, color: "#8b91b8", text: ".filter(m => m.active)" },
  { indent: 0, color: "transparent", text: "" },
  { indent: 0, color: "#eef0fb", text: "team.forEach(async member => {" },
  { indent: 1, color: "#8b91b8", text: "const tasks = getTasks(member.id);" },
  { indent: 1, color: "#60a5fa", text: "await notify(member, tasks);" },
  { indent: 0, color: "#eef0fb", text: "});" },
  { indent: 0, color: "transparent", text: "" },
  { indent: 0, color: "#2563eb", text: "// ✓ 12 tareas completadas hoy" },
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
    background: "rgba(8,10,20,0.8)",
    border: `1px solid ${hasError ? "rgba(239,68,68,0.35)" : "rgba(37,99,235,0.15)"}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 14,
    color: "#eef0fb",
    outline: "none",
    width: "100%",
    transition: "border-color 0.2s, box-shadow 0.2s",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes sweep {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseSignal {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
          50%       { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .fade-up          { animation: fadeUp 0.55s ease both; }
        .delay-1          { animation-delay: 0.1s; }
        .delay-2          { animation-delay: 0.2s; }
        .delay-3          { animation-delay: 0.3s; }

        .login-input:focus {
          border-color: rgba(37,99,235,0.5) !important;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.10) !important;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080a14",
        display: "flex",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}>

        {/* ── Left decorative panel ── */}
        <div
          className="hidden lg:flex"
          style={{
            flex: "0 0 52%",
            position: "relative",
            flexDirection: "column",
            justifyContent: "center",
            padding: "60px 68px",
            overflow: "hidden",
            background: "#07091a",
          }}
        >
          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: `radial-gradient(rgba(37,99,235,0.12) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            maskImage: "radial-gradient(ellipse 75% 75% at 40% 50%, black 40%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 75% at 40% 50%, black 40%, transparent 100%)",
          }} />

          {/* Purple corner glow */}
          <div style={{
            position: "absolute", top: 0, right: 0,
            width: "60%", height: "60%",
            background: "radial-gradient(ellipse at top right, rgba(37,99,235,0.10) 0%, rgba(29,78,216,0.05) 40%, transparent 70%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: 0,
            width: "50%", height: "40%",
            background: "radial-gradient(ellipse at bottom left, rgba(29,78,216,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          {/* Decorative rings */}
          <div style={{
            position: "absolute",
            width: 480, height: 480,
            borderRadius: "50%",
            border: "1px solid rgba(37,99,235,0.06)",
            right: -140, top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute",
            width: 320, height: 320,
            borderRadius: "50%",
            border: "1px solid rgba(37,99,235,0.09)",
            right: -60, top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }} />

          {/* Scanline sweep */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.06) 30%, rgba(37,99,235,0.14) 50%, rgba(37,99,235,0.06) 70%, transparent 100%)",
            animation: "sweep 9s linear infinite",
            pointerEvents: "none",
          }} />

          {/* Bottom fade */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: 120,
            background: "linear-gradient(to top, #07091a, transparent)",
            pointerEvents: "none",
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Logo */}
            <div className="fade-up" style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 52 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 0 16px rgba(37,99,235,0.15)",
              }}>
                <Terminal size={17} color="#60a5fa" strokeWidth={1.75} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, fontWeight: 500,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "#4a5070",
                }}>
                  Velsat Technology
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", display: "block", animation: "pulseSignal 2s ease-in-out infinite" }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#22c55e", letterSpacing: "0.1em", opacity: 0.75 }}>SISTEMA EN LÍNEA</span>
                </div>
              </div>
            </div>

            {/* Heading */}
            <div className="fade-up delay-1">
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 42, fontWeight: 800, color: "#eef0fb",
                margin: 0, lineHeight: 1.12, letterSpacing: "-1px",
              }}>
                Equipo{" "}
                <span style={{
                  background: "linear-gradient(135deg, #60a5fa, #93c5fd)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>Dev.</span>
              </h1>
              <p style={{
                fontSize: 14, color: "#8b91b8",
                marginTop: 18, lineHeight: 1.65, maxWidth: 360,
                fontWeight: 400,
              }}>
                Panel de gestión interna para el equipo de programadores. Tareas, snippets y colaboración en un solo lugar.
              </p>
            </div>

            {/* Code block */}
            <div className="fade-up delay-2" style={{
              marginTop: 40,
              background: "rgba(8,10,20,0.85)",
              border: "1px solid rgba(37,99,235,0.14)",
              borderLeft: "2px solid rgba(37,99,235,0.35)",
              borderRadius: 14,
              padding: "18px 22px",
              backdropFilter: "blur(12px)",
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 12, lineHeight: 1.8,
              maxWidth: 400,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(37,99,235,0.06)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {["#FF5F57","#FEBC2E","#28C840"].map(c => (
                    <div key={c} style={{ width: 9, height: 9, borderRadius: "50%", background: c, opacity: 0.65 }} />
                  ))}
                </div>
                <span style={{ fontSize: 9, color: "#2d3460", letterSpacing: "0.1em" }}>velsat.js</span>
              </div>
              {CODE_LINES.map((line, i) => (
                <div key={i} style={{ paddingLeft: line.indent * 18, color: line.color, minHeight: "1.8em" }}>
                  {line.text || " "}
                  {i === CODE_LINES.length - 1 && (
                    <span style={{
                      display: "inline-block", width: 2, height: "0.9em",
                      background: "#2563eb", marginLeft: 2,
                      verticalAlign: "text-bottom",
                      animation: "blink 1.1s step-end infinite",
                    }} />
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
                  {i > 0 && <div style={{ width: 1, height: 32, background: "rgba(37,99,235,0.15)", margin: "0 28px" }} />}
                  <div>
                    <div style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 20, fontWeight: 800,
                      color: "#eef0fb", letterSpacing: "-0.5px",
                    }}>
                      {s.value}
                    </div>
                    <div style={{
                      fontSize: 10, color: "#3a4060", marginTop: 3,
                      letterSpacing: "0.08em",
                      fontFamily: "'JetBrains Mono', monospace",
                      textTransform: "uppercase",
                    }}>
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
            background: "linear-gradient(to bottom, transparent, rgba(37,99,235,0.10) 30%, rgba(37,99,235,0.18) 50%, rgba(37,99,235,0.10) 70%, transparent)",
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
          background: "#080a14",
        }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(37,99,235,0.08) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: 0, left: "50%", transform: "translateX(-50%)",
            width: 300, height: 300,
            background: "radial-gradient(circle, rgba(29,78,216,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ width: "100%", maxWidth: 380, position: "relative", zIndex: 1 }}>

            {/* Mobile logo */}
            <div className="fade-up lg:hidden" style={{ textAlign: "center", marginBottom: 36 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 12,
                background: "rgba(37,99,235,0.12)",
                border: "1px solid rgba(37,99,235,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
                margin: "0 auto 14px",
                boxShadow: "0 0 20px rgba(37,99,235,0.15)",
              }}>
                <Terminal size={20} color="#60a5fa" strokeWidth={1.75} />
              </div>
              <h1 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 28, fontWeight: 800, color: "#eef0fb",
                margin: 0, letterSpacing: "-0.6px",
              }}>
                Equipo <span style={{ color: "#60a5fa" }}>Dev</span>
              </h1>
            </div>

            {/* Form heading */}
            <div className="fade-up" style={{ marginBottom: 26 }}>
              <h2 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontSize: 26, fontWeight: 800,
                color: "#eef0fb", margin: 0, letterSpacing: "-0.6px",
              }}>
                Bienvenido de vuelta
              </h2>
              <p style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontWeight: 400 }}>
                Accede al panel de gestión del equipo
              </p>
            </div>

            {/* Card */}
            <div className="fade-up delay-1" style={{
              background: "rgba(11,13,28,0.9)",
              border: "1px solid rgba(37,99,235,0.18)",
              borderTop: "1px solid rgba(37,99,235,0.35)",
              borderRadius: 18,
              padding: "28px 26px",
              backdropFilter: "blur(20px)",
              boxShadow: "0 0 0 1px rgba(37,99,235,0.06), 0 4px 0 rgba(37,99,235,0.12), 0 40px 90px rgba(0,0,0,0.6), 0 0 40px rgba(37,99,235,0.06)",
            }}>
              <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

                {/* Username */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, fontWeight: 500,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#4a5070",
                  }}>
                    Usuario
                  </label>
                  <input
                    className="login-input"
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    placeholder="tu usuario"
                    required
                    autoComplete="username"
                    style={inputStyle(!!error)}
                  />
                </div>

                {/* Password */}
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <label style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 10, fontWeight: 500,
                    letterSpacing: "0.12em", textTransform: "uppercase",
                    color: "#4a5070",
                  }}>
                    Contraseña
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      className="login-input"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete="current-password"
                      style={{ ...inputStyle(!!error), padding: "11px 42px 11px 14px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute", right: 12, top: "50%",
                        transform: "translateY(-50%)",
                        background: "none", border: "none", cursor: "pointer",
                        color: "#4a5070", display: "flex", padding: 0, transition: "color 0.15s",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#60a5fa"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "#4a5070"; }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div style={{
                    background: "rgba(239,68,68,0.06)",
                    border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 10, padding: "10px 13px",
                    fontSize: 12, color: "#f87171",
                    display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 4,
                    background: loading
                      ? "rgba(37,99,235,0.35)"
                      : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                    border: "none", borderRadius: 11,
                    padding: "13px 20px",
                    color: "#fff", fontSize: 14, fontWeight: 700,
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    transition: "opacity 0.15s, transform 0.15s, box-shadow 0.15s",
                    width: "100%",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    letterSpacing: "0.01em",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.4), 0 1px 0 rgba(255,255,255,0.08) inset",
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.transform = "translateY(-1px)";
                      e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.5), 0 1px 0 rgba(255,255,255,0.08) inset";
                    }
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = loading ? "none" : "0 4px 20px rgba(37,99,235,0.4), 0 1px 0 rgba(255,255,255,0.08) inset";
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
            <div style={{ textAlign: "center", marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <div style={{ height: 1, width: 28, background: "rgba(37,99,235,0.12)" }} />
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, color: "#252a45",
                letterSpacing: "0.18em", textTransform: "uppercase",
              }}>
                Velsat Technology © 2025
              </span>
              <div style={{ height: 1, width: 28, background: "rgba(37,99,235,0.12)" }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
