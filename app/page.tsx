"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

const USERS = [
  { username: "dev", password: "velsat" },
  { username: "admin", password: "dev2025" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername]         = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [mounted, setMounted]           = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = sessionStorage.getItem("equipo_dev_session");
    if (s) router.replace("/dashboard");
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
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes sweep {
          0%   { top: -4px; }
          100% { top: 100%; }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, -52%); }
          50%       { transform: translate(-50%, -55%); }
        }

        .fade-up  { animation: fadeUp 0.55s ease both; }
        .delay-1  { animation-delay: 0.12s; }

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
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080a14",
        display: "flex",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        overflow: "hidden",
      }}>

        {/* ── Left panel ── */}
        <div
          className="hidden lg:flex"
          style={{
            flex: "0 0 52%",
            position: "relative",
            overflow: "hidden",
            background: "#07091a",
          }}
        >
          {/* Imagen — flota suavemente */}
          <img
            src="/assets/equipodev.png"
            alt="Equipo Dev"
            style={{
              position: "absolute",
              top: "50%", left: "50%",
              width: "68%", height: "auto",
              objectFit: "contain",
              zIndex: 2,
              filter: "drop-shadow(0 16px 52px rgba(37,99,235,0.32))",
              pointerEvents: "none",
              animation: "float 6s ease-in-out infinite",
            }}
          />

          {/* Glow detrás */}
          <div style={{
            position: "absolute", top: "38%", left: "50%",
            transform: "translate(-50%, -50%)",
            width: "65%", height: "50%",
            background: "radial-gradient(ellipse at center, rgba(37,99,235,0.16) 0%, transparent 70%)",
            filter: "blur(32px)",
            pointerEvents: "none", zIndex: 1,
          }} />

          {/* Dot grid */}
          <div style={{
            position: "absolute", inset: 0, zIndex: 1,
            backgroundImage: "radial-gradient(rgba(37,99,235,0.07) 1px, transparent 1px)",
            backgroundSize: "28px 28px",
            pointerEvents: "none",
          }} />

          {/* Gradiente superior */}
          <div style={{
            position: "absolute", top: 0, left: 0, right: 0, height: "30%", zIndex: 3,
            background: "linear-gradient(to bottom, #07091a 15%, rgba(7,9,26,0.6) 60%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Gradiente inferior */}
          <div style={{
            position: "absolute", bottom: 0, left: 0, right: 0, height: "35%", zIndex: 3,
            background: "linear-gradient(to top, #07091a 20%, rgba(7,9,26,0.6) 60%, transparent 100%)",
            pointerEvents: "none",
          }} />

          {/* Scanline */}
          <div style={{
            position: "absolute", left: 0, right: 0, height: 2, zIndex: 4,
            background: "linear-gradient(90deg, transparent, rgba(37,99,235,0.14) 40%, rgba(96,165,250,0.22) 50%, rgba(37,99,235,0.14) 60%, transparent)",
            animation: "sweep 8s linear infinite",
            pointerEvents: "none",
          }} />

          {/* Título */}
          <div className="fade-up" style={{ position: "absolute", top: 42, left: 52, right: 52, zIndex: 5 }}>
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
            <p style={{ fontSize: 13, color: "#8b91b8", marginTop: 10, lineHeight: 1.6, fontWeight: 400 }}>
              Panel de gestión interna para el equipo de programadores.
            </p>
          </div>

          {/* Stats footer */}
          <div className="fade-up delay-1" style={{
            position: "absolute", bottom: 36, left: 52, right: 52, zIndex: 5,
            display: "flex", alignItems: "center",
          }}>
            {[
              { value: "100%", label: "Equipo activo" },
              { value: "∞",    label: "Snippets" },
              { value: "24/7", label: "Disponible" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <div style={{ width: 1, height: 28, background: "rgba(37,99,235,0.2)", margin: "0 20px" }} />}
                <div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: "#eef0fb", letterSpacing: "-0.4px" }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#3a4060", marginTop: 2, letterSpacing: "0.1em", fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase" }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right panel ── */}
        <div style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
          position: "relative",
          background: "#080a14",
        }}>
          {/* Fade izquierdo */}
          <div style={{
            position: "absolute", top: 0, left: 0, bottom: 0, width: "40%",
            background: "linear-gradient(to right, #07091a 0%, rgba(8,10,20,0.5) 50%, transparent 100%)",
            pointerEvents: "none", zIndex: 0,
          }} />

          <div style={{ width: "100%", maxWidth: 360, position: "relative", zIndex: 1 }}>
            <div className="fade-up delay-1" style={{ position: "relative" }}>

              {/* Capas inclinadas detrás */}
              <div className="login-card-back-2" style={{
                position: "absolute", inset: 0, borderRadius: 22,
                background: "rgba(29,78,216,0.28)",
                border: "1px solid rgba(37,99,235,0.18)",
                transform: "rotate(4deg) translate(8px, 6px)",
                transformOrigin: "bottom center", zIndex: 0,
              }} />
              <div className="login-card-back-1" style={{
                position: "absolute", inset: 0, borderRadius: 22,
                background: "rgba(37,99,235,0.42)",
                border: "1px solid rgba(37,99,235,0.32)",
                transform: "rotate(2deg) translate(4px, 3px)",
                transformOrigin: "bottom center", zIndex: 1,
              }} />

              {/* Card */}
              <div className="login-card-main" style={{
                position: "relative", zIndex: 2,
                background: "#0f1223",
                border: "1px solid rgba(37,99,235,0.22)",
                borderRadius: 22,
                padding: "36px 32px 32px",
                boxShadow: "0 24px 64px rgba(0,0,0,0.55), 0 0 0 1px rgba(37,99,235,0.06)",
              }}>
                <div style={{ marginBottom: 28 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <img src="/assets/logo.png" alt="Logo" style={{ height: 26, width: "auto" }} />
                    <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 22, fontWeight: 800, color: "#eef0fb", margin: 0, letterSpacing: "-0.5px" }}>
                      Iniciar sesión
                    </h2>
                  </div>
                  <p style={{ fontSize: 12, color: "#4a5570", margin: 0 }}>
                    Accede al panel de gestión del equipo
                  </p>
                </div>

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#8b91b8" }}>Usuario</label>
                    <input className="login-input" type="text" value={username} onChange={e => setUsername(e.target.value)}
                      placeholder="tu usuario" required autoComplete="username" style={inputStyle(!!error)} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    <label style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#8b91b8" }}>Contraseña</label>
                    <div style={{ position: "relative" }}>
                      <input className="login-input" type={showPassword ? "text" : "password"} value={password}
                        onChange={e => setPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password"
                        style={{ ...inputStyle(!!error), padding: "11px 42px 11px 14px" }} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#4a5070", display: "flex", padding: 0, transition: "color 0.15s" }}
                        onMouseEnter={e => { e.currentTarget.style.color = "#60a5fa"; }}
                        onMouseLeave={e => { e.currentTarget.style.color = "#4a5070"; }}>
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 10, padding: "10px 13px", fontSize: 12, color: "#f87171", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
                      {error}
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    style={{
                      marginTop: 6, background: loading ? "rgba(37,99,235,0.35)" : "#2563eb",
                      border: "none", borderRadius: 12, padding: "13px 20px",
                      color: "#fff", fontSize: 14, fontWeight: 700,
                      cursor: loading ? "not-allowed" : "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                      transition: "background 0.15s, transform 0.15s, box-shadow 0.15s",
                      width: "100%", fontFamily: "'Plus Jakarta Sans', sans-serif",
                      boxShadow: "0 4px 20px rgba(37,99,235,0.35)",
                    }}
                    onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#1d4ed8"; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.55)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.background = loading ? "rgba(37,99,235,0.35)" : "#2563eb"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.35)"; }}
                    onMouseDown={e => { if (!loading) e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    {loading ? (
                      <><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.25)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />Verificando…</>
                    ) : (
                      <>Acceder <ArrowRight size={15} strokeWidth={2.5} /></>
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
