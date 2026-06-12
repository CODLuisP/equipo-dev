"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock, Shield, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";

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
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 w-full max-w-[340px] bg-[#161b22] border border-white/5 rounded-2xl p-6 shadow-xl"
      >
        {created ? (
          /* ── Éxito ── */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full mx-auto mb-5 bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-[20px] font-extrabold text-white mb-2 tracking-tight">
              ¡Equipo creado!
            </h1>
            <p className="text-[13px] text-white/50 mb-6 leading-relaxed">
              <strong className="text-blue-400 font-bold">{created}</strong> ya está listo.<br/>
              Inicia sesión con tu contraseña.
            </p>
            <button
              onClick={() => router.push("/")}
              className="w-full h-10 rounded-lg border-none bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              Ir al login <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* ── Formulario ── */
          <>
            <div className="w-10 h-10 rounded-xl mb-4 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <h1 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">
              Crea tu equipo
            </h1>
            <p className="text-[12px] text-white/50 mb-6 leading-relaxed">
              Define los accesos para tu equipo.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Users className="w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="text"
                  value={teamName}
                  onChange={e => { setTeamName(e.target.value); if (error) setError(""); }}
                  placeholder="Nombre del equipo"
                  maxLength={40}
                  className="w-full h-10 bg-[#0d1117] border border-white/5 focus:border-blue-500/50 rounded-lg pl-9 pr-4 text-white text-[13px] outline-none transition-colors"
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); if (error) setError(""); }}
                  placeholder="Contraseña de acceso"
                  autoComplete="new-password"
                  className="w-full h-10 bg-[#0d1117] border border-white/5 focus:border-blue-500/50 rounded-lg pl-9 pr-10 text-white text-[13px] outline-none transition-colors"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield className="w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type={showVault ? "text" : "password"}
                  value={vaultPassword}
                  onChange={e => { setVaultPassword(e.target.value); if (error) setError(""); }}
                  placeholder="Clave de la bóveda"
                  autoComplete="new-password"
                  className="w-full h-10 bg-[#0d1117] border border-white/5 focus:border-blue-500/50 rounded-lg pl-9 pr-10 text-white text-[13px] outline-none transition-colors"
                />
                <button 
                  type="button" 
                  onClick={() => setShowVault(!showVault)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60 transition-colors"
                >
                  {showVault ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 4 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-[11px] font-medium text-red-400 bg-red-500/10 border border-red-500/20 rounded-md px-3 py-2">
                      <AlertTriangle className="w-3.5 h-3.5" /> {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="mt-1 w-full h-10 rounded-lg border-none bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold cursor-pointer transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Crear equipo <ArrowRight className="w-3.5 h-3.5" /></>}
              </button>
            </form>

            <button
              onClick={() => router.push("/")}
              className="mt-6 mx-auto flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-white/80 transition-colors w-max"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Ya tengo un equipo
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}
