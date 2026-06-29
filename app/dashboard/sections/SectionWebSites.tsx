"use client";

import { useState, useRef, useMemo } from "react";
import {
  Globe, Plus, Search, ExternalLink, Pencil, Trash2, Copy, Check,
  Eye, EyeOff, Star, X, Image as ImageIcon, User, KeyRound, Upload, Users,
} from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/app/dashboard/DashboardContext";
import type { WebSite, WebAccount } from "@/app/dashboard/types";
import ButtonBase from "@/components/ui/ButtonBase";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const uid = () => (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2));

function hostOf(url: string): string {
  if (!url) return "";
  try { return new URL(/^https?:\/\//.test(url) ? url : `https://${url}`).hostname.replace(/^www\./, ""); }
  catch { return url.replace(/^https?:\/\//, "").replace(/^www\./, ""); }
}

function primaryOf(site: WebSite): WebAccount | undefined {
  return site.accounts?.find(a => a.isPrimary) ?? site.accounts?.[0];
}

async function copyText(text: string, label = "Copiado") {
  try { await navigator.clipboard.writeText(text); toast.success(label); }
  catch { toast.error("No se pudo copiar"); }
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyBtn({ value, title }: { value: string; title: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      title={title}
      onClick={(e) => { e.stopPropagation(); if (!value) return; copyText(value, `${title} copiado`); setDone(true); setTimeout(() => setDone(false), 1200); }}
      style={{
        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
        border: "1px solid rgba(var(--blue-rgb),0.15)", background: "transparent",
        color: done ? "#22c55e" : "var(--text-3)", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--blue-rgb),0.10)"; if (!done) e.currentTarget.style.color = "var(--blue-soft)"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; if (!done) e.currentTarget.style.color = "var(--text-3)"; }}
    >
      {done ? <Check size={13} /> : <Copy size={13} />}
    </button>
  );
}

// ─── Account row (read-only, used in card & detail) ───────────────────────────

function AccountRow({ acc, compact = false, multi = false }: { acc: WebAccount; compact?: boolean; multi?: boolean }) {
  const [show, setShow] = useState(false);
  const showPrimary = multi && acc.isPrimary; // solo tiene sentido marcar "principal" si hay varias
  return (
    <div style={{
      display: "flex", flexDirection: "column", gap: 7,
      padding: compact ? "9px 11px" : "12px 14px",
      borderRadius: 12, background: "rgba(var(--blue-rgb),0.04)",
      border: "1px solid rgba(var(--blue-rgb),0.10)",
    }}>
      {(acc.label || showPrimary) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {showPrimary && (
            <span title="Cuenta principal" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "rgba(245,185,66,0.18)", border: "1px solid rgba(245,185,66,0.35)" }}>
              <Star size={10} fill="#f5b942" color="#f5b942" />
            </span>
          )}
          {acc.label && <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-2)" }}>{acc.label}</span>}
        </div>
      )}

      {/* Usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <User size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--text)", fontFamily: "var(--font-mono), monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {acc.username || <span style={{ color: "var(--text-3)" }}>—</span>}
        </span>
        {acc.username && <CopyBtn value={acc.username} title="Usuario" />}
      </div>

      {/* Contraseña */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <KeyRound size={13} style={{ color: "var(--text-3)", flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "var(--text)", fontFamily: "var(--font-mono), monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: show ? 0 : 2 }}>
          {acc.password ? (show ? acc.password : "•".repeat(Math.min(12, acc.password.length || 8))) : <span style={{ color: "var(--text-3)", letterSpacing: 0 }}>—</span>}
        </span>
        {acc.password && (
          <button
            title={show ? "Ocultar" : "Mostrar"}
            onClick={(e) => { e.stopPropagation(); setShow(s => !s); }}
            style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--blue-rgb),0.10)"; e.currentTarget.style.color = "var(--blue-soft)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
          >
            {show ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        )}
        {acc.password && <CopyBtn value={acc.password} title="Contraseña" />}
      </div>
    </div>
  );
}

// ─── Site card ────────────────────────────────────────────────────────────────

function SiteCard({ site, onOpen, onEdit, onDelete }: { site: WebSite; onOpen: () => void; onEdit: () => void; onDelete: () => void; }) {
  const [hov, setHov] = useState(false);
  const host = hostOf(site.url);
  const count = site.accounts?.length ?? 0;

  const tx  = hov ? "#ffffff"               : "var(--text-1)";
  const mu  = hov ? "rgba(255,255,255,0.55)" : "var(--text-3)";
  const bd  = hov ? "rgba(255,255,255,0.12)" : "rgba(var(--blue-rgb),0.12)";
  const t   = "all 0.2s ease";

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", borderRadius: 16, overflow: "hidden", cursor: "pointer",
        background: hov ? "linear-gradient(140deg, #0d1b38 0%, #091224 100%)" : "var(--bg-surface)",
        border: `1px solid ${bd}`,
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 20px 44px -18px rgba(0,0,0,0.75)" : "none",
        transition: t, minHeight: 210,
      }}
    >
      {/* Contenido principal */}
      <div style={{ padding: "16px 14px 10px", flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: tx, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: t }}>
          {site.name}
        </div>
        {host && (
          <div style={{ fontSize: 10.5, fontWeight: 600, color: mu, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: t }}>
            {host}
          </div>
        )}
        {count > 0 && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4, alignSelf: "flex-start", marginTop: 2,
            fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6,
            color: hov ? "rgba(255,255,255,0.8)" : "var(--blue-light)",
            background: hov ? "rgba(255,255,255,0.1)" : "rgba(var(--blue-rgb),0.1)",
            border: `1px solid ${hov ? "rgba(255,255,255,0.15)" : "rgba(var(--blue-rgb),0.2)"}`,
            transition: t,
          }}>
            <Users size={10} /> {count} cuenta{count !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Imagen pequeña con ondas circulares */}
      <div style={{ position: "relative", height: 88, overflow: "hidden" }}>
        {/* Ondas */}
        {[80, 118, 156].map((sz, i) => (
          <div key={i} style={{
            position: "absolute", bottom: -(sz * 0.3), right: -(sz * 0.3),
            width: sz, height: sz, borderRadius: "50%",
            border: `1px solid ${hov ? "rgba(255,255,255,0.09)" : "rgba(var(--blue-rgb),0.13)"}`,
            transition: t, pointerEvents: "none",
          }} />
        ))}
        {site.image
          ? <img src={site.image} alt={site.name} draggable={false} style={{ position: "absolute", bottom: 0, right: 6, height: "86%", width: "auto", maxWidth: "55%", objectFit: "contain" }} />
          : <div style={{ position: "absolute", bottom: 10, right: 12, width: 48, height: 48, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: mu, transition: t }}><Globe size={22} /></div>}
      </div>

      {/* Acciones */}
      <div style={{ padding: "8px 10px", borderTop: `1px solid ${bd}`, display: "flex", gap: 5, transition: t }}>
        <button
          onClick={e => { e.stopPropagation(); if (site.url) window.open(/^https?:\/\//.test(site.url) ? site.url : `https://${site.url}`, "_blank"); else toast.error("Sin URL"); }}
          style={{ flex: 1, height: 30, borderRadius: 8, border: `1px solid ${hov ? "rgba(255,255,255,0.2)" : "rgba(var(--blue-rgb),0.22)"}`, background: hov ? "rgba(255,255,255,0.1)" : "rgba(var(--blue-rgb),0.08)", color: hov ? "#fff" : "var(--blue-light)", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, transition: t }}
        >
          <ExternalLink size={11} /> Abrir
        </button>
        <button title="Editar" onClick={e => { e.stopPropagation(); onEdit(); }}
          style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${bd}`, background: "transparent", color: mu, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: t }}>
          <Pencil size={12} />
        </button>
        <button title="Eliminar" onClick={e => { e.stopPropagation(); onDelete(); }}
          style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${bd}`, background: "transparent", color: mu, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: t }}>
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({ site, onClose, onEdit }: { site: WebSite; onClose: () => void; onEdit: () => void; }) {
  const host = hostOf(site.url);
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 480, margin: "0 16px", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "1px solid rgba(var(--blue-rgb),0.18)", borderRadius: 18, overflow: "hidden" }}>
        {/* Header con imagen */}
        <div style={{ position: "relative", height: 150, flexShrink: 0, background: "linear-gradient(135deg, rgba(var(--blue-rgb),0.22), rgba(var(--blue-rgb),0.06))" }}>
          {site.image
            ? <img src={site.image} alt={site.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(var(--blue-rgb),0.5)" }}><Globe size={42} /></div>}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(10,12,15,0.88), transparent 60%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>{site.name}</div>
            {host && <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{host}</div>}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="ws-scroll" style={{ padding: 18, overflowY: "auto", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { if (site.url) window.open(/^https?:\/\//.test(site.url) ? site.url : `https://${site.url}`, "_blank"); }}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 38, borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.25)", background: "rgba(var(--blue-rgb),0.10)", color: "var(--blue-light)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              <ExternalLink size={14} /> Abrir sitio
            </button>
            <button onClick={onEdit}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "transparent", color: "var(--text-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              <Pencil size={13} /> Editar
            </button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
            {(site.accounts?.length ?? 0)} cuenta{(site.accounts?.length ?? 0) !== 1 ? "s" : ""}
          </div>
          {(site.accounts ?? []).length === 0
            ? <div style={{ padding: "16px", borderRadius: 12, background: "rgba(var(--blue-rgb),0.04)", border: "1px dashed rgba(var(--blue-rgb),0.15)", fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>Este sitio no tiene credenciales guardadas</div>
            : (site.accounts ?? []).map(acc => <AccountRow key={acc.id} acc={acc} multi={(site.accounts ?? []).length > 1} />)}
        </div>
      </div>
    </div>
  );
}

// ─── Form modal (crear / editar) ──────────────────────────────────────────────

type DraftAccount = WebAccount;

function FormModal({ initial, onClose, onSave }: { initial: WebSite | null; onClose: () => void; onSave: (data: Partial<WebSite>, id?: string) => Promise<void>; }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  const [accounts, setAccounts] = useState<DraftAccount[]>(
    initial?.accounts?.length
      ? initial.accounts.map(a => ({ ...a }))
      : [{ id: uid(), label: "", username: "", password: "", isPrimary: true }]
  );
  const [saving, setSaving] = useState(false);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const readImage = (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Debe ser una imagen"); return; }
    if (file.size > 8 * 1024 * 1024) { toast.error("Imagen muy grande (máx 8MB)"); return; }
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const setPrimary = (id: string) => setAccounts(prev => prev.map(a => ({ ...a, isPrimary: a.id === id })));
  const updateAcc = (id: string, patch: Partial<DraftAccount>) => setAccounts(prev => prev.map(a => a.id === id ? { ...a, ...patch } : a));
  const addAcc = () => setAccounts(prev => [...prev, { id: uid(), label: "", username: "", password: "", isPrimary: prev.length === 0 }]);
  const removeAcc = (id: string) => setAccounts(prev => {
    const next = prev.filter(a => a.id !== id);
    if (next.length && !next.some(a => a.isPrimary)) next[0].isPrimary = true;
    return next;
  });

  const submit = async () => {
    if (!name.trim()) { toast.error("Ponle un nombre al sitio"); return; }
    const cleanAccounts = accounts.filter(a => a.username.trim() || a.password.trim() || (a.label || "").trim());
    setSaving(true);
    try {
      await onSave({ name: name.trim(), url: url.trim(), image, accounts: cleanAccounts }, initial?.id);
      onClose();
    } catch { toast.error("No se pudo guardar"); }
    finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", background: "rgba(0,0,0,0.22)",
    border: "1px solid rgba(var(--blue-rgb),0.15)", borderRadius: 9, padding: "9px 11px",
    color: "var(--text)", fontSize: 12.5, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 540, margin: "0 16px", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "var(--bg-surface)", border: "1px solid rgba(var(--blue-rgb),0.18)", borderTop: "1px solid rgba(var(--blue-rgb),0.32)", borderRadius: 18, overflow: "hidden" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 22px", borderBottom: "1px solid rgba(var(--blue-rgb),0.10)", flexShrink: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.2px" }}>{initial ? "Editar sitio" : "Nuevo sitio"}</h2>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(var(--blue-rgb),0.15)", borderRadius: 7, width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-3)" }}><X size={14} /></button>
        </div>

        <div className="ws-scroll" style={{ padding: 22, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Nombre + URL */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>Nombre</label>
            <input style={inputStyle} placeholder="Ej: Panel Admin Velsat" value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>URL</label>
            <input style={{ ...inputStyle, fontFamily: "var(--font-mono), monospace" }} placeholder="https://ejemplo.com" value={url} onChange={e => setUrl(e.target.value)} />
          </div>

          {/* Imagen de referencia */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>Imagen de referencia</label>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) readImage(f); e.target.value = ""; }} />
            {image ? (
              <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(var(--blue-rgb),0.15)" }}>
                <img src={image} alt="referencia" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
                <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                  <button onClick={() => fileRef.current?.click()} style={{ height: 28, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.45)", color: "#fff", fontSize: 11, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Upload size={12} /> Cambiar</button>
                  <button onClick={() => setImage("")} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.45)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) readImage(f); }}
                onPaste={e => { const f = e.clipboardData.files?.[0]; if (f) readImage(f); }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 110, borderRadius: 12, border: `1.5px dashed rgba(var(--blue-rgb),${dragOver ? 0.5 : 0.2})`, background: dragOver ? "rgba(var(--blue-rgb),0.08)" : "rgba(var(--blue-rgb),0.03)", cursor: "pointer", transition: "all 0.15s" }}
              >
                <ImageIcon size={22} style={{ color: "rgba(var(--blue-rgb),0.5)" }} />
                <span style={{ fontSize: 11.5, color: "var(--text-3)", fontWeight: 600 }}>Arrastra, pega o haz clic para subir un screenshot</span>
              </div>
            )}
          </div>

          {/* Cuentas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)" }}>Cuentas ({accounts.length})</label>
              <button onClick={addAcc} style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(var(--blue-rgb),0.25)", background: "rgba(var(--blue-rgb),0.10)", color: "var(--blue-light)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                <Plus size={12} /> Añadir cuenta
              </button>
            </div>

            {accounts.map((acc, i) => (
              <div key={acc.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 12, background: "rgba(var(--blue-rgb),0.04)", border: `1px solid rgba(var(--blue-rgb),${acc.isPrimary ? 0.28 : 0.10})` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {accounts.length > 1 && (
                    <button onClick={() => setPrimary(acc.id)} title="Marcar como principal"
                      style={{ display: "flex", alignItems: "center", gap: 5, height: 26, padding: "0 8px", borderRadius: 7, border: `1px solid ${acc.isPrimary ? "rgba(var(--blue-rgb),0.4)" : "rgba(var(--blue-rgb),0.15)"}`, background: acc.isPrimary ? "rgba(var(--blue-rgb),0.14)" : "transparent", color: acc.isPrimary ? "var(--blue-light)" : "var(--text-3)", fontSize: 10.5, fontWeight: 800, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.03em", flexShrink: 0 }}>
                      <Star size={11} fill={acc.isPrimary ? "currentColor" : "none"} /> {acc.isPrimary ? "Principal" : "Marcar"}
                    </button>
                  )}
                  <input style={{ ...inputStyle, flex: 1, padding: "7px 10px" }} placeholder={`Etiqueta (opcional) — cuenta ${i + 1}`} value={acc.label ?? ""} onChange={e => updateAcc(acc.id, { label: e.target.value })} />
                  {accounts.length > 1 && (
                    <button onClick={() => removeAcc(acc.id)} title="Quitar cuenta" style={{ width: 30, height: 30, flexShrink: 0, borderRadius: 8, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--text-3)"; e.currentTarget.style.borderColor = "rgba(var(--blue-rgb),0.15)"; }}>
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                    <User size={13} style={{ position: "absolute", left: 10, color: "var(--text-3)" }} />
                    <input style={{ ...inputStyle, paddingLeft: 30, fontFamily: "var(--font-mono), monospace" }} placeholder="Usuario / email" value={acc.username} onChange={e => updateAcc(acc.id, { username: e.target.value })} />
                  </div>
                  <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                    <KeyRound size={13} style={{ position: "absolute", left: 10, color: "var(--text-3)" }} />
                    <input type={reveal[acc.id] ? "text" : "password"} style={{ ...inputStyle, paddingLeft: 30, paddingRight: 34, fontFamily: "var(--font-mono), monospace" }} placeholder="Contraseña" value={acc.password} onChange={e => updateAcc(acc.id, { password: e.target.value })} />
                    <button onClick={() => setReveal(r => ({ ...r, [acc.id]: !r[acc.id] }))} tabIndex={-1} style={{ position: "absolute", right: 6, width: 24, height: 24, borderRadius: 6, border: "none", background: "transparent", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {reveal[acc.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 22px", borderTop: "1px solid rgba(var(--blue-rgb),0.10)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 36, padding: "0 16px", borderRadius: 9, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "transparent", color: "var(--text-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
          <button onClick={submit} disabled={saving} style={{ height: 36, padding: "0 20px", borderRadius: 9, border: "1px solid rgba(var(--blue-rgb),0.4)", background: "rgba(var(--blue-rgb),0.18)", color: "var(--blue-light)", fontSize: 12.5, fontWeight: 800, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Guardando…" : initial ? "Guardar cambios" : "Crear sitio"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function SectionWebSites() {
  const { websites, handleSaveWebsite, handleDeleteWebsite } = useDashboard();
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState<WebSite | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WebSite | null>(null);
  const [confirmDel, setConfirmDel] = useState<WebSite | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = [...websites].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    if (!q) return list;
    return list.filter(w =>
      w.name.toLowerCase().includes(q) ||
      (w.url || "").toLowerCase().includes(q) ||
      (w.accounts || []).some(a => (a.username || "").toLowerCase().includes(q) || (a.label || "").toLowerCase().includes(q))
    );
  }, [websites, search]);

  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (w: WebSite) => { setEditing(w); setFormOpen(true); setDetail(null); };

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 18, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(var(--blue-rgb),0.12)", border: "1px solid rgba(var(--blue-rgb),0.22)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--blue-light)" }}>
            <Globe size={19} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.4px" }}>Web Sites</h1>
            <p style={{ fontSize: 11.5, color: "var(--text-3)", margin: 0, fontWeight: 500 }}>{websites.length} sitio{websites.length !== 1 ? "s" : ""} con credenciales</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={14} style={{ position: "absolute", left: 11, color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar…"
              style={{ height: 38, width: 190, maxWidth: "40vw", paddingLeft: 32, paddingRight: 12, borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "rgba(0,0,0,0.22)", color: "var(--text)", fontSize: 12.5, outline: "none" }} />
          </div>
          <ButtonBase onClick={openNew} className="flex items-center gap-2"><Plus size={15} /> Nuevo sitio</ButtonBase>
        </div>
      </div>

      {/* Grid */}
      <div className="ws-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(var(--blue-rgb),0.08)", border: "1px solid rgba(var(--blue-rgb),0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(var(--blue-rgb),0.5)" }}>
              <Globe size={30} />
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", margin: 0 }}>{search ? "Sin resultados" : "Aún no hay sitios"}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "4px 0 0" }}>{search ? "Prueba con otro término" : "Guarda webs con sus credenciales para acceder rápido"}</p>
            </div>
            {!search && (
              <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 18px", borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.4)", background: "rgba(var(--blue-rgb),0.18)", color: "var(--blue-light)", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>
                <Plus size={15} /> Agregar el primero
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, paddingBottom: 8 }}>
            {filtered.map(site => (
              <SiteCard key={site.id} site={site} onOpen={() => setDetail(site)} onEdit={() => openEdit(site)} onDelete={() => setConfirmDel(site)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {detail && <DetailModal site={detail} onClose={() => setDetail(null)} onEdit={() => openEdit(detail)} />}
      {formOpen && <FormModal initial={editing} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSaveWebsite} />}
      {confirmDel && (
        <div style={{ position: "fixed", inset: 0, zIndex: 70, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(6px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          onClick={e => { if (e.target === e.currentTarget) setConfirmDel(null); }}>
          <div style={{ width: "100%", maxWidth: 380, margin: "0 16px", background: "var(--bg-surface)", border: "1px solid rgba(var(--blue-rgb),0.18)", borderRadius: 16, padding: 24 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", marginBottom: 14 }}>
              <Trash2 size={20} />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text)", margin: "0 0 6px" }}>Eliminar sitio</h3>
            <p style={{ fontSize: 12.5, color: "var(--text-3)", margin: "0 0 20px", lineHeight: 1.5 }}>
              ¿Seguro que quieres eliminar <b style={{ color: "var(--text-2)" }}>{confirmDel.name}</b> y todas sus credenciales? Esta acción no se puede deshacer.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setConfirmDel(null)} style={{ height: 36, padding: "0 16px", borderRadius: 9, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "transparent", color: "var(--text-2)", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>Cancelar</button>
              <button onClick={() => { handleDeleteWebsite(confirmDel.id); setConfirmDel(null); }} style={{ height: 36, padding: "0 18px", borderRadius: 9, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.18)", color: "#f87171", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ws-scroll::-webkit-scrollbar { width: 6px; }
        .ws-scroll::-webkit-scrollbar-track { background: transparent; }
        .ws-scroll::-webkit-scrollbar-thumb { background: rgba(var(--blue-rgb),0.18); border-radius: 10px; }
        .ws-scroll::-webkit-scrollbar-thumb:hover { background: rgba(var(--blue-rgb),0.32); }
      `}</style>
    </div>
  );
}
