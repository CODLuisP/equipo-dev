"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Lock, Users } from "lucide-react";
import { api } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Badge { label: string; img: string; top: string; right: string; delay: string; dur: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const BADGES: Badge[] = [
  { label: "React",        img: "/assets/svg/react_dark.svg",       top: "8%",  right: "44%", delay: "0s",   dur: "3.8s" },
  { label: "TypeScript",   img: "/assets/svg/typescript.svg",        top: "18%", right: "3%",  delay: "0.6s", dur: "4.2s" },
  { label: "Next.js",      img: "/assets/svg/nextjs_icon_dark.svg",  top: "32%", right: "26%", delay: "1.1s", dur: "3.5s" },
  { label: "Node.js",      img: "/assets/svg/nodejs.svg",            top: "48%", right: "2%",  delay: "1.7s", dur: "4.6s" },
  { label: "Git",          img: "/assets/svg/git.svg",               top: "62%", right: "38%", delay: "2.1s", dur: "3.2s" },
  { label: "GitHub",       img: "/assets/svg/github_dark.svg",       top: "22%", right: "60%", delay: "2.6s", dur: "4.0s" },
  { label: "Claude AI",    img: "/assets/svg/claude-ai-icon.svg",    top: "76%", right: "10%", delay: "3.0s", dur: "3.7s" },
  { label: "Cloudflare",   img: "/assets/svg/cloudflare.svg",        top: "54%", right: "58%", delay: "0.9s", dur: "4.3s" },
  { label: "DigitalOcean", img: "/assets/svg/digitalocean.svg",      top: "88%", right: "34%", delay: "1.9s", dur: "3.9s" },
];

// ─── Login ────────────────────────────────────────────────────────────────────

export default function Login() {
  const router                          = useRouter();
  const [password,     setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [ready,        setReady]        = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("equipo_dev_token");
    if (!token) { setReady(true); return; }
    api.getMembers()
      .then(() => router.replace("/dashboard"))
      .catch(() => { localStorage.removeItem("equipo_dev_token"); router.replace("/register"); });
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const { token } = await api.login(password);
      localStorage.setItem("equipo_dev_token", token);
      router.push("/dashboard");
    } catch {
      setError("Contraseña incorrecta.");
      setLoading(false);
    }
  };

  if (!ready) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500&display=swap');

        @keyframes spin       { to { transform: rotate(360deg); } }
        @keyframes slideUp    { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shake      { 0%,100% { transform:translateX(0); } 25%,75% { transform:translateX(-4px); } 50% { transform:translateX(4px); } }
        @keyframes badgeIn    { 0% { opacity:0; transform:translateX(14px) scale(0.88); } 100% { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes badgeFloat { 0%,100% { transform:translateY(0px); } 50% { transform:translateY(-8px); } }

        * { box-sizing: border-box; }

        .l-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.09); border-radius:10px; padding:12px 44px; font-size:14px; color:#f1f5f9; font-family:inherit; outline:none; transition:border-color .15s, box-shadow .15s; }
        .l-input::placeholder { color:rgba(148,163,184,0.35); }
        .l-input:focus { border-color:rgba(33,37,41,0.9); box-shadow:0 0 0 3px rgba(33,37,41,0.35); }

        .l-btn { width:100%; padding:13px; border-radius:10px; border:none; background:#4361ee; color:#fff; font-size:14px; font-weight:600; font-family:inherit; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; transition:background .15s, transform .15s, box-shadow .15s; }
        .l-btn:hover:not(:disabled) { background:#1565c0; transform:translateY(-1px); }
        .l-btn:active:not(:disabled) { transform:translateY(0); }
        .l-btn:disabled { opacity:0.5; cursor:not-allowed; }

        .l-eye { position:absolute; right:14px; top:50%; transform:translateY(-50%); background:none; border:none; cursor:pointer; color:rgba(148,163,184,0.45); display:flex; padding:0; transition:color .15s; }
        .l-eye:hover { color:rgba(148,163,184,0.9); }

        .slide-1 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .1s  both; }
        .slide-2 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .22s both; }
        .slide-3 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .34s both; }
        .slide-4 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .46s both; }
        .slide-5 { animation: slideUp .5s cubic-bezier(.16,1,.3,1) .58s both; }

        .badge { animation: badgeIn 0.6s cubic-bezier(.16,1,.3,1) var(--delay) both, badgeFloat var(--dur) ease-in-out var(--delay) infinite; }
        .err-shake   { animation: shake .35s ease; }
        .spinner     { animation: spin .7s linear infinite; }
      `}</style>

      {/* ── Root ── */}
      <div className="relative h-screen overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#161b22" }}>

        {/* Lado derecho */}
        <div className="absolute inset-y-0 right-0 flex items-center justify-center" style={{ width: "60%" }}>
          <img
            src="/assets/fondo.webp"
            alt=""
            aria-hidden
            style={{ width: "920px", height: "auto", objectFit: "contain" }}
          />
        </div>

        {/* Degradado que funde hacia la izquierda */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ background: "linear-gradient(to right, #141417 30%, rgba(20,20,23,0.85) 55%, rgba(20,20,23,0.1) 100%)" }}
        />

        {/* ── Form con imagen de fondo ── */}
        <div
          className="absolute inset-y-0 left-0 z-20 flex flex-col justify-between w-110 px-12 py-10"
       
        >
          {/* Capa del mismo tono que el fondo derecho */}
          <div aria-hidden className="absolute inset-0" style={{ background: "rgba(20,20,23,0.88)" }} />

          {/* Logo */}
          <div className="slide-1 flex items-center gap-2.5">
            <img src="/assets/codexa.webp" alt="Codexa" className="h-6" />
            <span className="text-white font-semibold text-[15px]">
              Codexa
            </span>
          </div>

          {/* Form area */}
          <div className="flex flex-col gap-8">

            <div className="slide-2">
              <h1 className="text-[28px] font-bold text-[#f1f5f9] leading-tight tracking-tight m-0">
                Bienvenido de vuelta
              </h1>
              <p className="text-[14px] text-gray-300 mt-2 m-0 leading-relaxed">
                Acceso exclusivo al equipo de desarrollo.
              </p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-3">

              <div className="slide-3 flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-300 uppercase tracking-widest">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#1565c0] pointer-events-none flex">
                    <Lock size={15} />
                  </div>
                  <input
                    className={`l-input${error ? " border-red-500/40!" : ""}`}
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                    placeholder="Ingresa la contraseña del equipo"
                    required
                    autoComplete="current-password"
                    autoFocus
                  />
                  <button type="button" className="l-eye" onClick={() => setShowPassword(p => !p)}>
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="err-shake flex items-center gap-2 text-[13px] text-red-400 bg-red-500/6 border border-red-500/20 rounded-lg px-3 py-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                  {error}
                </div>
              )}

              <div className="slide-4 mt-1">
                <button type="submit" disabled={loading} className="l-btn">
                  {loading
                    ? <><span className="spinner w-4 h-4 border-2 border-white/20 border-t-white rounded-full inline-block" /> Verificando…</>
                    : <>Acceder <ArrowRight size={15} /></>
                  }
                </button>
              </div>

            </form>

            {/* Registro */}
            <div className="slide-5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 20 }}>
              <p style={{ fontSize: 12, color: "rgba(148,163,184,0.5)", margin: "0 0 10px", lineHeight: 1.5 }}>
                ¿Aún no has creado tu equipo?
              </p>
              <a
                href="/register"
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  width: "100%", padding: "11px 16px", borderRadius: 10,
                  border: "1px solid rgba(67,97,238,0.28)",
                  background: "rgba(67,97,238,0.08)",
                  color: "#70a6ee", fontSize: 13, fontWeight: 600,
                  textDecoration: "none", transition: "all .15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(67,97,238,0.16)"; e.currentTarget.style.borderColor = "rgba(67,97,238,0.5)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(67,97,238,0.08)"; e.currentTarget.style.borderColor = "rgba(67,97,238,0.28)"; }}
              >
                <Users size={15} />
                Crear mi equipo
                <ArrowRight size={13} style={{ marginLeft: "auto", opacity: 0.6 }} />
              </a>
            </div>

          </div>

          {/* Footer */}
          <p className="text-[11px] text-[#1e293b] tracking-wide">
            Acceso restringido · solo equipo interno
          </p>
        </div>

        {/* ── Badges flotantes sobre el canvas ── */}

       

        {BADGES.map(b => (
          <div
            key={b.label}
            className="badge absolute z-10 pointer-events-none flex items-center gap-1.5 text-[11px] font-medium text-white/70"
            style={{ top: b.top, right: b.right, "--dur": b.dur, "--delay": b.delay } as React.CSSProperties}
          >
            <img src={b.img} alt={b.label} className="w-4 h-4 object-contain opacity-75" />
            {b.label}
          </div>
        ))}

        
  

        {/* Branding inferior derecha */}
<div className="absolute top-10 right-12 z-10 pointer-events-none">
  <h2 className="text-[24px] md:text-[28px] font-bold tracking-tight text-white/90">
    Donde el código{" "}
    <span
      className="bg-clip-text  text-[#788eee]"

    >
      cobra vida.
    </span>
  </h2>
</div>


        {/* Metric cards */}
        <div className="absolute bottom-10 right-12 z-10 pointer-events-none flex gap-3">
          {[
            { value: "100%", label: "Equipo activo" },
            { value: "∞",    label: "Snippets"      },
            { value: "24/7", label: "Disponible"    },
          ].map((s, i) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-1.5 px-5 py-4 rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(18px)",
                WebkitBackdropFilter: "blur(18px)",
                border: "1px solid rgba(255,255,255,0.09)",
                borderTop: "1px solid rgba(255,255,255,0.16)",
                animation: `slideUp 0.5s cubic-bezier(.16,1,.3,1) ${0.3 + i * 0.1}s both`,
              }}
            >
              <span className="text-[20px] font-bold text-white leading-none">{s.value}</span>
              <span className="text-[9px] text-white/40 uppercase tracking-widest whitespace-nowrap">{s.label}</span>
            </div>
          ))}
        </div>

      </div>
    </>
  );
}
