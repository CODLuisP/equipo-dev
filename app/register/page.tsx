"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock, Shield, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

const HERO_IMG = "/assets/registerfondo.jpg";

export default function RegisterPage() {
  const router = useRouter();
  const [teamName, setTeamName]           = useState("");
  const [password, setPassword]           = useState("");
  const [vaultPassword, setVaultPassword] = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [showVault, setShowVault] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [created, setCreated]     = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!teamName.trim() || !password.trim() || !vaultPassword.trim()) {
      setError("Completa todos los campos");
      return;
    }
    setLoading(true);
    try {
      const res = await api.register(teamName.trim(), password.trim(), vaultPassword.trim());
      setCreated(res.teamName);
    } catch (err: unknown) {
      let msg = "No se pudo crear el equipo";
      if (err instanceof Error && err.message) {
        try { msg = JSON.parse(err.message).error || msg; } catch { msg = err.message; }
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .rg-input {
          width: 100%; height: 44px; background: transparent;
          border: none; border-bottom: 1px solid rgba(255,255,255,0.18);
          color: #fff; font-size: 14px; font-family: 'Inter', sans-serif;
          outline: none; padding: 0 34px 0 2px; transition: border-color .2s;
        }
        .rg-input::placeholder { color: rgba(255,255,255,0.35); }
        .rg-input:focus { border-bottom-color: #4361ee; }
        .rg-label { font-size: 11px; font-weight: 600; letter-spacing: .12em; text-transform: uppercase; color: rgba(255,255,255,0.45); margin-bottom: 4px; display: block; }
      `}</style>

      <div className="relative min-h-screen w-full flex items-center overflow-hidden" style={{ fontFamily: "'Inter', sans-serif", background: "#0b0d1a" }}>

        {/* ── Imagen de fondo de TODA la pantalla ── */}
        <img src={HERO_IMG} alt="" aria-hidden
          className="absolute inset-0 w-full h-full object-cover" style={{ transform: "scale(1.03)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "rgba(8,9,28,0.7)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(120deg, rgba(11,13,26,0.78) 0%, rgba(11,13,26,0.30) 55%, rgba(11,13,26,0.20) 100%)" }} />

        {/* Logo global arriba-izquierda */}
        <motion.div
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="absolute top-0 left-0 z-20 flex items-center gap-2.5 p-8 md:p-10">
          <img src="/assets/codexa.webp" alt="Codexa" className="h-6" />
          <span className="text-white font-semibold text-[15px]">Codexa</span>
        </motion.div>

        {/* ── Hero (texto izquierda) ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}
          className="relative z-10 hidden lg:block flex-1 px-14 xl:px-20">
          <h2 className="text-white text-[42px] font-extrabold tracking-tight m-0 leading-tight">
            ¿Aún no tienes<br/>un equipo?
          </h2>
          <p className="text-white/65 text-[15px] leading-relaxed mt-5 max-w-[400px]">
            Regístralo para acceder a todas las herramientas de tu equipo de desarrollo en un solo lugar. Snippets, bóveda, pizarras y más.
          </p>
          <div className="flex items-center gap-4 mt-8 text-white/50">
            {["Snippets", "Bóveda", "Pizarras", "Archivos"].map((t, i) => (
              <span key={t} className="flex items-center gap-4 text-[12px] font-medium">
                {i > 0 && <span className="w-1 h-1 rounded-full bg-white/30" />}
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        {/* ── Panel glass del formulario: ocupa todo el alto, pegado a la derecha ── */}
        <div className="relative z-10 w-full lg:w-[440px] xl:w-[480px] h-screen shrink-0 ml-auto">
          <motion.div
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute inset-0 w-full h-full flex items-center justify-center px-6 lg:px-14 p-9 md:p-11"
            style={{
              background: "rgba(255,255,255,0.06)",
              backdropFilter: "blur(20px) saturate(1.4)",
              WebkitBackdropFilter: "blur(20px) saturate(1.4)",
              borderLeft: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "-30px 0 80px -20px rgba(0,0,0,0.45)",
            }}>
          <div className="w-full max-w-[340px]">

            {created ? (
              /* ── Éxito ── */
              <div className="text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 bg-green-500/10 border border-green-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-[22px] font-extrabold text-white mb-3 tracking-tight">
                  ¡Equipo creado!
                </h1>
                <p className="text-[14px] text-white/50 mb-8 leading-relaxed">
                  <strong className="text-[#7a93ff] font-semibold">{created}</strong> ya está listo.<br/>
                  Inicia sesión con tu contraseña.
                </p>
                <button onClick={() => router.push("/")}
                  className="w-full h-12 rounded-lg border-none text-white text-[14px] font-semibold cursor-pointer transition-all flex items-center justify-center gap-2"
                  style={{ background: "#4361ee" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#3651d4")}
                  onMouseLeave={e => (e.currentTarget.style.background = "#4361ee")}>
                  Ir al login <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* ── Formulario ── */
              <>
                <h1 className="text-[26px] font-extrabold text-white tracking-tight m-0">
                  Crear equipo
                </h1>
                <p className="text-[13.5px] text-white/45 mt-2 mb-9">
                  Define los accesos de tu nuevo espacio de trabajo.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                  {/* Nombre del equipo */}
                  <div>
                    <label className="rg-label">Nombre del equipo</label>
                    <div className="relative">
                      <input className="rg-input" type="text" value={teamName} maxLength={40}
                        onChange={e => { setTeamName(e.target.value); if (error) setError(""); }}
                        placeholder="Mi equipo de desarrollo" />
                      <Users className="w-4 h-4 absolute right-1 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  </div>

                  {/* Contraseña de acceso */}
                  <div>
                    <label className="rg-label">Contraseña de acceso</label>
                    <div className="relative">
                      <input className="rg-input" type={showPass ? "text" : "password"} value={password}
                        autoComplete="new-password"
                        onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPass(!showPass)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Clave de la bóveda */}
                  <div>
                    <label className="rg-label">Clave de la bóveda</label>
                    <div className="relative">
                      <input className="rg-input" type={showVault ? "text" : "password"} value={vaultPassword}
                        autoComplete="new-password"
                        onChange={e => { setVaultPassword(e.target.value); if (error) setError(""); }}
                        placeholder="••••••••" />
                      <button type="button" onClick={() => setShowVault(!showVault)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors">
                        {showVault ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="flex items-center gap-1.5 text-[11px] text-white/30 mt-2">
                      <Shield className="w-3 h-3" /> Protege el acceso a las credenciales sensibles.
                    </p>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden">
                        <div className="flex items-center gap-2 text-[12px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2.5">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {error}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button type="submit" disabled={loading}
                    className="mt-1 w-full h-12 rounded-lg border-none text-white text-[14px] font-semibold cursor-pointer transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                    style={{ background: "#4361ee", boxShadow: "0 10px 30px -10px rgba(67,97,238,0.6)" }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = "#3651d4"; }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = "#4361ee"; }}>
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Crear equipo <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <button onClick={() => router.push("/")}
                  className="mt-8 flex items-center gap-1.5 text-[12.5px] font-medium text-white/40 hover:text-white/80 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Ya tengo un equipo
                </button>
              </>
            )}
          </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
