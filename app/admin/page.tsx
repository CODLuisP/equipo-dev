"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, Trash2,
  Users, CheckSquare, Code, Shield, Loader2, RefreshCw, Crown, X,
  KeyRound, Power, Save, Info, AlertTriangle
} from "lucide-react";
import { api, type AdminTeam } from "@/lib/api";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } }
};

export default function AdminPage() {
  const router = useRouter();
  const [adminKey, setAdminKey]   = useState("");
  const [showKey, setShowKey]     = useState(false);
  const [authed, setAuthed]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [teams, setTeams]         = useState<AdminTeam[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting]   = useState(false);
  const [editId, setEditId]       = useState<string | null>(null);
  const [editPass, setEditPass]   = useState("");
  const [editVault, setEditVault] = useState("");
  const [saving, setSaving]       = useState(false);
  const [toggling, setToggling]   = useState<string | null>(null);
  const [okMsg, setOkMsg]         = useState("");

  const loadTeams = async (key: string) => {
    setLoading(true); setError(""); setOkMsg("");
    try {
      const data = await api.adminGetTeams(key);
      setTeams(data);
      setAuthed(true);
    } catch (err: unknown) {
      let msg = "Clave incorrecta";
      if (err instanceof Error && err.message) {
        try { msg = JSON.parse(err.message).error || msg; } catch {}
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminKey.trim()) { setError("Ingresa la clave"); return; }
    loadTeams(adminKey.trim());
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      await api.adminDeleteTeam(adminKey, id);
      setTeams(prev => prev.filter(t => t.id !== id));
      setConfirmId(null);
      setOkMsg("Equipo eliminado permanentemente.");
    } catch {
      setError("No se pudo eliminar el equipo");
    } finally {
      setDeleting(false);
    }
  };

  const parseErr = (err: unknown, fallback: string) => {
    if (err instanceof Error && err.message) {
      try { return JSON.parse(err.message).error || fallback; } catch { return fallback; }
    }
    return fallback;
  };

  const handleToggle = async (team: AdminTeam) => {
    setToggling(team.id); setError(""); setOkMsg("");
    try {
      await api.adminUpdateTeam(adminKey, team.id, { disabled: !team.disabled });
      setTeams(prev => prev.map(t => t.id === team.id ? { ...t, disabled: !team.disabled } : t));
      setOkMsg(team.disabled ? `"${team.name}" ha sido habilitado` : `"${team.name}" ha sido deshabilitado`);
    } catch (err) {
      setError(parseErr(err, "No se pudo cambiar el estado"));
    } finally {
      setToggling(null);
    }
  };

  const openEdit = (team: AdminTeam) => {
    setEditId(editId === team.id ? null : team.id);
    setEditPass(""); setEditVault(""); setError(""); setOkMsg("");
  };

  const handleSaveEdit = async (team: AdminTeam) => {
    const patch: { password?: string; vaultPassword?: string } = {};
    if (editPass.trim())  patch.password = editPass.trim();
    if (editVault.trim()) patch.vaultPassword = editVault.trim();
    if (!patch.password && !patch.vaultPassword) {
      setError("Escribe la nueva contraseña o la nueva clave de bóveda");
      return;
    }
    setSaving(true); setError(""); setOkMsg("");
    try {
      await api.adminUpdateTeam(adminKey, team.id, patch);
      setEditId(null); setEditPass(""); setEditVault("");
      setOkMsg(`Credenciales de "${team.name}" actualizadas correctamente.`);
    } catch (err) {
      setError(parseErr(err, "No se pudo actualizar"));
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (ts: number | null) =>
    ts ? new Date(ts).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const stat = (icon: React.ReactNode, value: number, label: string) => (
    <div className="flex items-center gap-2 bg-white/5 border border-white/5 px-3 py-1.5 rounded-lg">
      <span className="text-blue-400">{icon}</span>
      <span className="text-[13px] font-bold text-white">{value}</span>
      <span className="text-[11px] text-white/40 font-medium tracking-wide uppercase">{label}</span>
    </div>
  );

  /* ── Pantalla de login ── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-[320px] bg-[#161b22] border border-white/5 rounded-2xl p-6 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl mb-4 bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-inner">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-xl font-extrabold text-white mb-1.5 tracking-tight">
            Acceso Admin
          </h1>
          <p className="text-[12px] text-white/50 mb-6 leading-relaxed">
            Ingresa la clave maestra para gestionar equipos.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-white/30 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                type={showKey ? "text" : "password"}
                value={adminKey}
                onChange={e => { setAdminKey(e.target.value); if (error) setError(""); }}
                placeholder="Clave de administrador"
                autoFocus
                className="w-full h-10 bg-[#0d1117] border border-white/5 focus:border-blue-500/50 rounded-lg pl-9 pr-10 text-white text-[13px] outline-none transition-all focus:bg-[#0d1117]"
              />
              <button 
                type="button" 
                onClick={() => setShowKey(!showKey)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/30 hover:text-white/60 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              className="mt-1 w-full h-10 rounded-lg border-none bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold cursor-pointer transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Autenticar <ArrowRight className="w-3.5 h-3.5" /></>}
            </button>
          </form>

          <button onClick={() => router.push("/")}
            className="mt-6 mx-auto flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/40 hover:text-white/80 transition-colors w-max"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Volver
          </button>
        </motion.div>
      </div>
    );
  }

  /* ── Panel de equipos ── */
  return (
    <div className="min-h-screen bg-[#0d1117] font-sans relative overflow-hidden text-white selection:bg-blue-500/30">
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
           
            </div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">Gestión de Equipos</h1>
            <p className="text-white/50 mt-2 text-[14px]">
              Administra los accesos y credenciales de {teams.length} {teams.length === 1 ? "equipo" : "equipos"}.
            </p>
          </div>
          <button 
            onClick={() => loadTeams(adminKey)} 
            disabled={loading}
            className="h-10 px-4 rounded-lg bg-[#161b22] hover:bg-[#21262d] border border-white/10 text-white text-[13px] font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : 'text-white/60'}`} /> 
            Refrescar datos
          </button>
        </motion.div>

        {/* Global Messages */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" /> {error}
            </motion.div>
          )}
          {okMsg && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-4 rounded-xl flex items-center gap-3 text-sm font-medium">
              <ShieldCheck className="w-5 h-5 flex-shrink-0" /> {okMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Team List */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-5"
        >
          {teams.map(team => (
            <motion.div 
              key={team.id} 
              variants={itemVariants}
              className={`relative overflow-hidden rounded-xl border transition-all duration-300
                ${team.legacy 
                  ? 'bg-[#161b22] border-blue-500/30' 
                  : team.disabled 
                    ? 'bg-[#161b22]/50 border-red-500/20 opacity-80 grayscale-[0.5]' 
                    : 'bg-[#161b22] border-white/5 hover:border-white/10'
                }
              `}
            >
              <div className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Info Section */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-bold text-white tracking-tight">{team.name}</h2>
                      {team.legacy && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                          <Crown className="w-3 h-3" /> Principal
                        </span>
                      )}
                      {team.disabled && (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-wider">
                          <Power className="w-3 h-3" /> Inactivo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-white/40 font-medium">
                      <span>Creado: {fmtDate(team.createdAt)}</span>
                      {team.memberNames.length > 0 && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-white/20" />
                          <span className="truncate max-w-[250px]">{team.memberNames.join(", ")}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Stats Section */}
                  <div className="flex flex-wrap gap-2 lg:gap-3">
                    {stat(<Users className="w-[14px] h-[14px]" />, team.members, "Users")}
                    {stat(<CheckSquare className="w-[14px] h-[14px]" />, team.tasks, "Tasks")}
                    {stat(<Code className="w-[14px] h-[14px]" />, team.snippets, "Codes")}
                    {stat(<Shield className="w-[14px] h-[14px]" />, team.vault, "Vault")}
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center gap-2">
                    {confirmId === team.id ? (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 p-1.5 rounded-lg">
                        <span className="text-xs text-red-400 font-bold px-2">¿Seguro?</span>
                        <button onClick={() => handleDelete(team.id)} disabled={deleting}
                          className="h-8 px-3 rounded-md bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                          {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />} Sí
                        </button>
                        <button onClick={() => setConfirmId(null)}
                          className="h-8 w-8 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors flex items-center justify-center"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ) : (
                      <>
                        <button onClick={() => openEdit(team)} title="Cambiar contraseñas"
                          className={`h-9 w-9 rounded-lg flex items-center justify-center transition-all ${editId === team.id ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-[#21262d] text-blue-400 border border-transparent hover:border-white/10'}`}
                        >
                          <KeyRound className="w-[15px] h-[15px]" />
                        </button>
                        {!team.legacy && (
                          <button onClick={() => handleToggle(team)} disabled={toggling === team.id} title={team.disabled ? "Habilitar equipo" : "Deshabilitar equipo"}
                            className={`h-9 w-9 rounded-lg flex items-center justify-center border transition-all ${team.disabled ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'}`}
                          >
                            {toggling === team.id ? <Loader2 className="w-[15px] h-[15px] animate-spin" /> : <Power className="w-[15px] h-[15px]" />}
                          </button>
                        )}
                        <button onClick={() => setConfirmId(team.id)} title={team.legacy ? "Limpiar datos del equipo principal" : "Eliminar equipo"}
                          className="h-9 w-9 rounded-lg flex items-center justify-center bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-[15px] h-[15px]" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit Credentials Panel */}
                <AnimatePresence>
                  {editId === team.id && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: "auto", marginTop: 24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 border-t border-white/5 flex flex-col md:flex-row gap-3 items-end">
                        <div className="flex-1 w-full">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                            Nueva contraseña del equipo
                          </label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="text"
                              value={editPass}
                              onChange={e => setEditPass(e.target.value)}
                              placeholder="Dejar vacío para no cambiar"
                              className="w-full h-10 bg-[#21262d] border border-transparent rounded-lg pl-10 pr-4 text-[13px] text-white focus:border-blue-500/50 focus:bg-[#282d35] outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <div className="flex-1 w-full">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-white/40 mb-1.5 block">
                            Nueva clave de la bóveda
                          </label>
                          <div className="relative">
                            <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input
                              type="text"
                              value={editVault}
                              onChange={e => setEditVault(e.target.value)}
                              placeholder="Dejar vacío para no cambiar"
                              className="w-full h-10 bg-[#21262d] border border-transparent rounded-lg pl-10 pr-4 text-[13px] text-white focus:border-blue-500/50 focus:bg-[#282d35] outline-none transition-colors"
                            />
                          </div>
                        </div>
                        <button onClick={() => handleSaveEdit(team)} disabled={saving}
                          className="h-10 px-6 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold flex items-center justify-center gap-2 disabled:opacity-70 transition-colors w-full md:w-auto"
                        >
                          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
                          Guardar
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-[13px] text-white/30 text-center mt-12 font-medium">
          Eliminar un equipo borra permanentemente todos sus datos asociados y no se puede deshacer.
        </p>
      </div>
    </div>
  );
}
