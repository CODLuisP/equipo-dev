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

        @media (max-width: 1023px) {
          .login-card-back-1,
          .login-card-back-2 { display: none !important; }
          .login-card-main {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 8px 0 !important;
            border-radius: 0 !important;
          }
          .login-mobile-logo { display: none !important; }
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
            justifyContent: "flex-end",
            padding: "0 0 52px 0",
            overflow: "hidden",
            background: "#07091a",
          }}
        >
          {/* Imagen principal — ocupa casi todo el panel */}
          <img
            src="/assets/equipodev.png"
            alt="Equipo Dev"
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              transform: "translate(-50%, -52%)",
              width: "68%",
              height: "auto",
              objectFit: "contain",
              zIndex: 1,
              filter: "drop-shadow(0 16px 48px rgba(37,99,235,0.30))",
              pointerEvents: "none",
            }}
          />

          {/* Glow detrás de la imagen */}
          <div style={{
            position: "absolute", top: "30%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "70%", height: "55%",
            background: "radial-gradient(ellipse at center, rgba(37,99,235,0.13) 0%, transparent 70%)",
            filter: "blur(28px)",
            pointerEvents: "none", zIndex: 0,
          }} />

          {/* Dot grid sutil */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 2,
            backgroundImage: `radial-gradient(rgba(37,99,235,0.07) 1px, transparent 1px)`,
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }} />

          {/* Gradiente superior para legibilidad del título */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0,
            height: "30%", zIndex: 3,
            background: "linear-gradient(to bottom, #07091a 20%, rgba(7,9,26,0.7) 60%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Gradiente inferior para legibilidad del footer */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0,
            height: "30%", zIndex: 3,
            background: "linear-gradient(to top, #07091a 25%, rgba(7,9,26,0.7) 60%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Scanline sweep */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2, zIndex: 4,
            background: "linear-gradient(90deg, transparent 0%, rgba(37,99,235,0.08) 30%, rgba(37,99,235,0.16) 50%, rgba(37,99,235,0.08) 70%, transparent 100%)",
            animation: "sweep 9s linear infinite",
            pointerEvents: "none",
          }} />

          {/* Título — arriba */}
          <div className="fade-up" style={{ position: "absolute", top: 96, left: 52, right: 52, zIndex: 5 }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 38, fontWeight: 800, color: "#eef0fb",
              margin: 0, lineHeight: 1.12, letterSpacing: "-0.8px",
            }}>
              Equipo{" "}
              <span style={{
                background: "linear-gradient(135deg, #60a5fa, #93c5fd)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>Dev.</span>
            </h1>
            <p style={{
              fontSize: 13, color: "#8b91b8",
              marginTop: 10, lineHeight: 1.6, maxWidth: 380,
              fontWeight: 400,
            }}>
              Panel de gestión interna para el equipo de programadores.
            </p>
          </div>

          {/* Stats — footer */}
          <div className="fade-up delay-1" style={{
            position: "absolute", bottom: 96, left: 52, right: 52, zIndex: 5,
            display: "flex", alignItems: "center",
          }}>
            {[
              { value: "100%", label: "Equipo activo" },
              { value: "∞",    label: "Snippets" },
              { value: "24/7", label: "Disponible" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 28, background: "rgba(37,99,235,0.2)", margin: "0 24px" }} />}
                <div>
                  <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: "#eef0fb", letterSpacing: "-0.4px" }}>
                    {s.value}
                  </div>
                  <div style={{ fontSize: 9, color: "#3a4060", marginTop: 2, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>
                    {s.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

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
          {/* Fade izquierdo — funde con el panel izquierdo sin corte */}
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: "40%",
            background: "linear-gradient(to right, #07091a 0%, rgba(8,10,20,0.6) 50%, transparent 100%)",
            pointerEvents: "none", zIndex: 0,
          }} />
          {/* Glow sutil arriba */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "50%",
            background: "radial-gradient(ellipse 70% 60% at 60% -10%, rgba(37,99,235,0.06) 0%, transparent 100%)",
            pointerEvents: "none",
          }} />

          <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 1 }}>

            {/* Mobile logo */}
            <div className="login-mobile-logo fade-up lg:hidden" style={{ textAlign: "center", marginBottom: 36 }}>
              <img
                src="/assets/equipodev.png"
                alt="Equipo Dev"
                style={{ height: 44, width: "auto", display: "inline-block", filter: "drop-shadow(0 0 10px rgba(37,99,235,0.4))" }}
              />
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 28, fontWeight: 800, color: "#eef0fb", margin: "10px 0 0", letterSpacing: "-0.6px" }}>
                Equipo <span style={{ color: "#60a5fa" }}>Dev</span>
              </h1>
            </div>

            {/* Stacked card effect — capas detrás */}
            <div className="fade-up delay-1" style={{ position: "relative" }}>
              {/* Capa trasera 2 — más inclinada */}
              <div className="login-card-back-2" style={{
                position: "absolute",
                inset: 0, borderRadius: 22,
                background: "rgba(29,78,216,0.30)",
                border: "1px solid rgba(37,99,235,0.20)",
                transform: "rotate(4deg) translate(8px, 6px)",
                transformOrigin: "bottom center",
                zIndex: 0,
              }} />
              {/* Capa trasera 1 — poco inclinada */}
              <div className="login-card-back-1" style={{
                position: "absolute",
                inset: 0, borderRadius: 22,
                background: "rgba(37,99,235,0.45)",
                border: "1px solid rgba(37,99,235,0.35)",
                transform: "rotate(2deg) translate(4px, 3px)",
                transformOrigin: "bottom center",
                zIndex: 1,
              }} />

              {/* Card principal */}
              <div className="login-card-main" style={{
                position: "relative", zIndex: 2,
                background: "#0f1223",
                border: "1px solid rgba(37,99,235,0.22)",
                borderRadius: 22,
                padding: "36px 32px 32px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(37,99,235,0.06)",
              }}>

                {/* Card title */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <img
                      src="/assets/logo.png"
                      alt="Logo"
                      style={{ height: 28, width: "auto"}}
                    />
                    <h2 style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 22, fontWeight: 800,
                      color: "#eef0fb", margin: 0, letterSpacing: "-0.5px",
                    }}>
                      Iniciar sesión
                    </h2>
                  </div>
                  <p style={{ fontSize: 12, color: "#4a5570", margin: 0, fontWeight: 400 }}>
                    Accede al panel de gestión del equipo
                  </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* Username */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12, fontWeight: 600,
                      color: "#8b91b8",
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
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12, fontWeight: 600,
                      color: "#8b91b8",
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
                      marginTop: 6,
                      background: loading ? "rgba(37,99,235,0.35)" : "#2563eb",
                      border: "none", borderRadius: 12,
                      padding: "13px 20px",
                      color: "#fff", fontSize: 14, fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
                      width: "100%",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
                    }}
                    onMouseEnter={e => {
                      if (!loading) {
                        e.currentTarget.style.background = "#1d4ed8";
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.55)";
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = loading ? "rgba(37,99,235,0.35)" : "#2563eb";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.35)";
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
                        Acceder
                        <ArrowRight size={15} strokeWidth={2.5} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
