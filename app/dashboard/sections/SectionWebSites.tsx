"use client";

import { useState, useRef, useMemo } from "react";
import {
  Globe, Plus, Search, ExternalLink, Pencil, Trash2, Copy, Check,
  Eye, EyeOff, Star, X, Image as ImageIcon, User, KeyRound, Upload, Users,
  KeyRound as KeyIcon, Sparkles, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/app/dashboard/DashboardContext";
import type { WebSite, WebAccount, Member } from "@/app/dashboard/types";
import ButtonBase from "@/components/ui/ButtonBase";
import AvatarImg from "@/app/dashboard/components/AvatarImg";

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
        border: "1px solid rgba(255,255,255,0.1)", background: "transparent",
        color: done ? "#22c55e" : "#8a8a92", cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s",
      }}
      onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; if (!done) e.currentTarget.style.color = "#d4d4d8"; }}
      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; if (!done) e.currentTarget.style.color = "#8a8a92"; }}
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
      display: "flex", flexDirection: "column", gap: 8,
      padding: compact ? "9px 11px" : "12px 14px",
      borderRadius: 12, background: "#111113",
      border: `1px solid rgba(255,255,255,${showPrimary ? 0.12 : 0.06})`,
    }}>
      {(acc.label || showPrimary) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {showPrimary && (
            <span title="Cuenta principal" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 6, background: "rgba(245,185,66,0.18)", border: "1px solid rgba(245,185,66,0.35)" }}>
              <Star size={10} fill="#f5b942" color="#f5b942" />
            </span>
          )}
          {acc.label && <span style={{ fontSize: 11.5, fontWeight: 700, color: "#d4d4d8" }}>{acc.label}</span>}
        </div>
      )}

      {/* Usuario */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <User size={13} style={{ color: "#6a6a72", flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#e7e7ea", fontFamily: "var(--font-mono), monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {acc.username || <span style={{ color: "#6a6a72" }}>—</span>}
        </span>
        {acc.username && <CopyBtn value={acc.username} title="Usuario" />}
      </div>

      {/* Contraseña */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <KeyRound size={13} style={{ color: "#6a6a72", flexShrink: 0 }} />
        <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: "#e7e7ea", fontFamily: "var(--font-mono), monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: show ? 0 : 2 }}>
          {acc.password ? (show ? acc.password : "•".repeat(Math.min(12, acc.password.length || 8))) : <span style={{ color: "#6a6a72", letterSpacing: 0 }}>—</span>}
        </span>
        {acc.password && (
          <button
            title={show ? "Ocultar" : "Mostrar"}
            onClick={(e) => { e.stopPropagation(); setShow(s => !s); }}
            style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8a8a92", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "#d4d4d8"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#8a8a92"; }}
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

function SiteCard({ site, author, onOpen, onEdit, onDelete }: { site: WebSite; author?: Member; onOpen: () => void; onEdit: () => void; onDelete: () => void; }) {
  const [hov, setHov] = useState(false);
  const host = hostOf(site.url);
  const count = site.accounts?.length ?? 0;
  const isResource = site.kind === 'resource';

  const tx  = "#f4f4f6";
  const mu  = "#8a8a92";
  const bd  = "rgba(255,255,255,0.08)";
  const initial = (site.name || "?").charAt(0).toUpperCase();

  const openUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (site.url) window.open(/^https?:\/\//.test(site.url) ? site.url : `https://${site.url}`, "_blank");
    else toast.error("Sin URL");
  };

  return (
    <div
      onClick={onOpen}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", borderRadius: 18, overflow: "hidden", cursor: "pointer",
        background: hov ? "#141417" : "#0b0b0d",
        border: `1px solid ${bd}`,
      }}
    >
      {/* Banner con imagen */}
      <div style={{ position: "relative", height: 118, overflow: "hidden", background: "#141417" }}>
        {site.image
          ? <img src={site.image} alt={site.name} draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#2f2f35" }}><Globe size={34} /></div>}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, transparent 40%, rgba(11,11,13,0.9) 100%)" }} />

        {/* Acciones flotantes */}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
          <button title="Editar" onClick={e => { e.stopPropagation(); onEdit(); }}
            style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", color: "#e7e7ea", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Pencil size={12} />
          </button>
          <button title="Eliminar" onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)", color: "#e7e7ea", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "#e7e7ea"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.16)"; }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: "0 16px 16px", position: "relative" }}>
        {/* Avatar del creador, sobrepuesto */}
        <div style={{
          width: 54, height: 54, borderRadius: "50%", marginTop: -27, overflow: "hidden",
          border: `3px solid ${hov ? "#141417" : "#0b0b0d"}`, background: "#1c1c20",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {author
            ? <AvatarImg seed={author.avatarSeed || author.name} name={author.name} color={author.color} size={54} borderRadius="50%" />
            : <span style={{ fontSize: 20, fontWeight: 800, color: "#8a8a92" }}>{initial}</span>}
        </div>

        {/* Nombre + Abrir */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginTop: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 800, color: tx, letterSpacing: "-0.3px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {site.name}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 15, height: 15, borderRadius: "50%", background: "var(--blue-light)", flexShrink: 0 }}>
                <Check size={9} color="#0b0b0d" strokeWidth={3.5} />
              </span>
            </div>
            {host && <div style={{ fontSize: 11.5, fontWeight: 500, color: mu, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{host}</div>}
          </div>

          <button onClick={openUrl}
            style={{ flexShrink: 0, height: 32, padding: "0 16px", borderRadius: 20, border: "none", background: "var(--blue-light)", color: "#0b0b0d", fontSize: 12, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
            <ExternalLink size={12} /> Abrir
          </button>
        </div>

        {/* Descripción */}
        {isResource && site.description && (
          <p style={{ margin: "10px 0 0", fontSize: 11.5, lineHeight: 1.5, color: mu, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {site.description}
          </p>
        )}

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 14 }}>
          {isResource ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: mu }}>
              <Sparkles size={12} color="var(--blue-light)" /> <b style={{ color: tx, fontWeight: 800 }}>Recurso</b>
            </span>
          ) : (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: mu }}>
              <b style={{ color: tx, fontWeight: 800 }}>{count}</b> cuenta{count !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail modal ─────────────────────────────────────────────────────────────

function DetailModal({ site, onClose, onEdit }: { site: WebSite; onClose: () => void; onEdit: () => void; }) {
  const host = hostOf(site.url);
  const accountCount = site.accounts?.length ?? 0;
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 500, margin: "0 16px", maxHeight: "88vh", display: "flex", flexDirection: "column", background: "#0b0b0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>
        {/* Header con imagen */}
        <div style={{ position: "relative", height: 150, flexShrink: 0, background: "#141417" }}>
          {site.image
            ? <img src={site.image} alt={site.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} draggable={false} />
            : <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#3a3a40" }}><Globe size={42} /></div>}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(11,11,13,0.92), transparent 60%)" }} />
          <button onClick={onClose} style={{ position: "absolute", top: 12, right: 12, width: 30, height: 30, borderRadius: 8, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X size={15} />
          </button>
          <div style={{ position: "absolute", left: 18, right: 18, bottom: 12 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>{site.name}</div>
            {host && <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>{host}</div>}
          </div>
        </div>

        {/* Cuerpo */}
        <div className="ws-scroll" style={{ padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { if (site.url) window.open(/^https?:\/\//.test(site.url) ? site.url : `https://${site.url}`, "_blank"); }}
              style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 38, borderRadius: 10, border: "none", background: "var(--blue-light)", color: "#0b0b0d", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              <ExternalLink size={14} /> Abrir sitio
            </button>
            <button onClick={onEdit}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 38, padding: "0 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#d4d4d8", fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
              <Pencil size={13} /> Editar
            </button>
          </div>

          {site.kind === 'resource' ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8a92", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2, display: "flex", alignItems: "center", gap: 6 }}>
                <FileText size={12} /> ¿Para qué sirve?
              </div>
              {site.description
                ? <p style={{ margin: 0, padding: "12px 14px", borderRadius: 12, background: "#111113", border: "1px solid rgba(255,255,255,0.06)", fontSize: 13, lineHeight: 1.6, color: "#e7e7ea" }}>{site.description}</p>
                : <div style={{ padding: "16px", borderRadius: 12, background: "#111113", border: "1px dashed rgba(255,255,255,0.1)", fontSize: 12, color: "#8a8a92", textAlign: "center" }}>Sin descripción</div>}
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#8a8a92", textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2 }}>
                {accountCount} cuenta{accountCount !== 1 ? "s" : ""}
              </div>
              {accountCount === 0
                ? <div style={{ padding: "16px", borderRadius: 12, background: "#111113", border: "1px dashed rgba(255,255,255,0.1)", fontSize: 12, color: "#8a8a92", textAlign: "center" }}>Este sitio no tiene credenciales guardadas</div>
                : (site.accounts ?? []).map(acc => <AccountRow key={acc.id} acc={acc} multi={accountCount > 1} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Form modal (crear / editar) ──────────────────────────────────────────────

type DraftAccount = WebAccount;

function FormModal({ initial, initialKind = 'credentials', onClose, onSave }: { initial: WebSite | null; initialKind?: 'credentials' | 'resource'; onClose: () => void; onSave: (data: Partial<WebSite>, id?: string) => Promise<void>; }) {
  const [name, setName] = useState(initial?.name ?? "");
  const [url, setUrl] = useState(initial?.url ?? "");
  const [image, setImage] = useState(initial?.image ?? "");
  // El tipo queda fijado: por la pestaña activa al crear, o por el registro al editar.
  const kind: 'credentials' | 'resource' = initial?.kind ?? initialKind;
  const isResourceForm = kind === 'resource';
  const [description, setDescription] = useState(initial?.description ?? "");
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
    const cleanAccounts = kind === 'resource'
      ? []
      : accounts.filter(a => a.username.trim() || a.password.trim() || (a.label || "").trim());
    setSaving(true);
    try {
      await onSave({ name: name.trim(), url: url.trim(), image, kind, description: kind === 'resource' ? description.trim() : "", accounts: cleanAccounts }, initial?.id);
      onClose();
    } catch { toast.error("No se pudo guardar"); }
    finally { setSaving(false); }
  };

  const accent = "var(--blue-light)";
  const accentRgb = "var(--blue-rgb)";

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box", background: "#141417",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "11px 13px",
    color: "#e7e7ea", fontSize: 13, outline: "none", fontFamily: "inherit", transition: "border-color 0.15s",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 500, color: "#9a9aa2", marginBottom: 7, display: "block",
  };
  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = `rgba(${accentRgb},0.55)`; };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; };

  const SectionHeader = ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div style={{ marginBottom: 4 }}>
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f6", margin: 0, letterSpacing: "-0.2px" }}>{title}</h3>
      <p style={{ fontSize: 12.5, color: "#8a8a92", margin: "3px 0 0" }}>{subtitle}</p>
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "100%", maxWidth: 560, margin: "0 16px", maxHeight: "90vh", display: "flex", flexDirection: "column", background: "#0b0b0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 18, overflow: "hidden" }}>

        {/* Header con chip de tipo (estilo referencia) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: `rgba(${accentRgb},0.12)`, border: `1px solid rgba(${accentRgb},0.25)`, color: accent }}>
              {isResourceForm ? <Sparkles size={16} /> : <KeyIcon size={16} />}
            </div>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#f4f4f6", margin: 0, letterSpacing: "-0.2px" }}>{initial ? (isResourceForm ? "Editar recurso" : "Editar sitio") : (isResourceForm ? "Nuevo recurso" : "Nuevo sitio")}</h2>
              <p style={{ fontSize: 11.5, color: "#7c7c84", margin: "1px 0 0" }}>{isResourceForm ? "Link útil sin credenciales" : "Sitio con usuario y contraseña"}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#8a8a92" }}><X size={15} /></button>
        </div>

        <div className="ws-scroll" style={{ padding: "0 24px 24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 24 }}>

          {/* ── Sección: Detalles ── */}
          <div>
            <SectionHeader title={isResourceForm ? "Detalles del recurso" : "Detalles del sitio"} subtitle={isResourceForm ? "Ingresa la información del recurso." : "Ingresa la información del sitio."} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 16 }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input style={inputStyle} onFocus={onFocus} onBlur={onBlur} placeholder={isResourceForm ? "Ej: Coolors" : "Ej: Panel Admin"} value={name} onChange={e => setName(e.target.value)} autoFocus />
              </div>
              <div>
                <label style={labelStyle}>URL</label>
                <input style={{ ...inputStyle, fontFamily: "var(--font-mono), monospace" }} onFocus={onFocus} onBlur={onBlur} placeholder="https://ejemplo.com" value={url} onChange={e => setUrl(e.target.value)} />
              </div>
            </div>

            {/* Descripción (solo recursos) */}
            {kind === 'resource' && (
              <div style={{ marginTop: 14 }}>
                <label style={labelStyle}>¿Para qué sirve?</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 84, resize: "vertical", lineHeight: 1.5 }}
                  onFocus={onFocus} onBlur={onBlur}
                  placeholder="Ej: Generador de paletas de colores. Útil para elegir combinaciones rápido."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>
            )}

            {/* Imagen de referencia */}
            <div style={{ marginTop: 14 }}>
              <label style={labelStyle}>Imagen de referencia</label>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) readImage(f); e.target.value = ""; }} />
              {image ? (
                <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <img src={image} alt="referencia" style={{ width: "100%", height: 150, objectFit: "cover", display: "block" }} />
                  <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                    <button onClick={() => fileRef.current?.click()} style={{ height: 28, padding: "0 10px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}><Upload size={12} /> Cambiar</button>
                    <button onClick={() => setImage("")} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "rgba(0,0,0,0.55)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Trash2 size={13} /></button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) readImage(f); }}
                  onPaste={e => { const f = e.clipboardData.files?.[0]; if (f) readImage(f); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, height: 110, borderRadius: 12, border: `1.5px dashed rgba(255,255,255,${dragOver ? 0.25 : 0.1})`, background: dragOver ? "rgba(255,255,255,0.04)" : "#141417", cursor: "pointer", transition: "all 0.15s" }}
                >
                  <ImageIcon size={22} style={{ color: "#6a6a72" }} />
                  <span style={{ fontSize: 12, color: "#8a8a92", fontWeight: 500 }}>Arrastra, pega o haz clic para subir un screenshot</span>
                </div>
              )}
            </div>
          </div>

          {/* ── Sección: Cuentas (solo credenciales) ── */}
          {kind === 'credentials' && (
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 22 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <SectionHeader title="Cuentas" subtitle="Agrega los accesos de este sitio." />
                <button onClick={addAcc} style={{ display: "flex", alignItems: "center", gap: 5, height: 32, padding: "0 12px", borderRadius: 9, border: "1px solid rgba(255,255,255,0.1)", background: "#141417", color: "#d4d4d8", fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0 }}>
                  <Plus size={13} /> Añadir
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
                {accounts.map((acc, i) => (
                  <div key={acc.id} style={{ display: "flex", flexDirection: "column", gap: 8, padding: 12, borderRadius: 12, background: "#111113", border: `1px solid rgba(255,255,255,${acc.isPrimary ? 0.12 : 0.06})` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      {accounts.length > 1 && (
                        <button onClick={() => setPrimary(acc.id)} title="Marcar como principal"
                          style={{ display: "flex", alignItems: "center", gap: 5, height: 28, padding: "0 9px", borderRadius: 8, border: `1px solid ${acc.isPrimary ? `rgba(${accentRgb},0.4)` : "rgba(255,255,255,0.1)"}`, background: acc.isPrimary ? `rgba(${accentRgb},0.14)` : "transparent", color: acc.isPrimary ? accent : "#8a8a92", fontSize: 10.5, fontWeight: 700, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.03em", flexShrink: 0 }}>
                          <Star size={11} fill={acc.isPrimary ? "currentColor" : "none"} /> {acc.isPrimary ? "Principal" : "Marcar"}
                        </button>
                      )}
                      <input style={{ ...inputStyle, flex: 1, padding: "8px 11px" }} onFocus={onFocus} onBlur={onBlur} placeholder={`Etiqueta (opcional) — cuenta ${i + 1}`} value={acc.label ?? ""} onChange={e => updateAcc(acc.id, { label: e.target.value })} />
                      {accounts.length > 1 && (
                        <button onClick={() => removeAcc(acc.id)} title="Quitar cuenta" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#8a8a92", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                          onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#8a8a92"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}>
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                        <User size={13} style={{ position: "absolute", left: 11, color: "#6a6a72" }} />
                        <input style={{ ...inputStyle, paddingLeft: 32, fontFamily: "var(--font-mono), monospace" }} onFocus={onFocus} onBlur={onBlur} placeholder="Usuario / email" value={acc.username} onChange={e => updateAcc(acc.id, { username: e.target.value })} />
                      </div>
                      <div style={{ flex: 1, position: "relative", display: "flex", alignItems: "center" }}>
                        <KeyRound size={13} style={{ position: "absolute", left: 11, color: "#6a6a72" }} />
                        <input type={reveal[acc.id] ? "text" : "password"} style={{ ...inputStyle, paddingLeft: 32, paddingRight: 36, fontFamily: "var(--font-mono), monospace" }} onFocus={onFocus} onBlur={onBlur} placeholder="Contraseña" value={acc.password} onChange={e => updateAcc(acc.id, { password: e.target.value })} />
                        <button onClick={() => setReveal(r => ({ ...r, [acc.id]: !r[acc.id] }))} tabIndex={-1} style={{ position: "absolute", right: 7, width: 24, height: 24, borderRadius: 6, border: "none", background: "transparent", color: "#6a6a72", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {reveal[acc.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 }}>
          <button onClick={onClose} style={{ height: 38, padding: "0 18px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "#c4c4c8", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Cancelar</button>
          <button onClick={submit} disabled={saving} style={{ height: 38, padding: "0 22px", borderRadius: 10, border: "none", background: accent, color: "#0b0b0d", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
            {saving ? "Guardando…" : initial ? "Guardar cambios" : (isResourceForm ? "Crear recurso" : "Crear sitio")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main section ─────────────────────────────────────────────────────────────

export default function SectionWebSites() {
  const { websites, members, handleSaveWebsite, handleDeleteWebsite } = useDashboard();
  const authorOf = (w: WebSite) => members.find(m => m.id === w.authorId);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<'credentials' | 'resource'>('credentials');
  const [detail, setDetail] = useState<WebSite | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<WebSite | null>(null);
  const [confirmDel, setConfirmDel] = useState<WebSite | null>(null);

  const isResource = (w: WebSite) => w.kind === 'resource';
  const credCount = useMemo(() => websites.filter(w => !isResource(w)).length, [websites]);
  const resCount  = useMemo(() => websites.filter(isResource).length, [websites]);
  const onResources = tab === 'resource';

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = [...websites].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    list = tab === 'resource' ? list.filter(isResource) : list.filter(w => !isResource(w));
    if (!q) return list;
    return list.filter(w =>
      w.name.toLowerCase().includes(q) ||
      (w.url || "").toLowerCase().includes(q) ||
      (w.description || "").toLowerCase().includes(q) ||
      (w.accounts || []).some(a => (a.username || "").toLowerCase().includes(q) || (a.label || "").toLowerCase().includes(q))
    );
  }, [websites, search, tab]);

  // Al crear, el tipo queda fijado por la pestaña activa
  const openNew = () => { setEditing(null); setFormOpen(true); };
  const openEdit = (w: WebSite) => { setEditing(w); setFormOpen(true); setDetail(null); };

  return (
    <div className="h-full flex flex-col" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap" style={{ marginBottom: 16, flexShrink: 0 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <h1 style={{ fontSize: 13, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.3px", whiteSpace: "nowrap" }}>
            {onResources ? "Recursos" : "Credenciales"}
          </h1>
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.06)" }} />

          {/* Selector de vista: Credenciales | Recursos (sin íconos) */}
          <div style={{
            display: "flex", gap: 4, padding: 3,
            background: "rgba(0,0,0,0.22)", borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.10)",
          }}>
            {([
              { val: 'credentials' as const, label: "Credenciales", n: credCount, accent: "#d4d4d8", bg: "rgba(255,255,255,0.10)", bd: "rgba(255,255,255,0.22)" },
              { val: 'resource' as const,    label: "Recursos",     n: resCount, accent: "#d4d4d8", bg: "rgba(255,255,255,0.10)", bd: "rgba(255,255,255,0.22)" },
            ]).map(opt => {
              const active = tab === opt.val;
              return (
                <button key={opt.val} onClick={() => { setTab(opt.val); setSearch(""); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 6, height: 28, padding: "0 12px", borderRadius: 8,
                    border: "none",
                    background: active ? opt.bg : "transparent",
                    color: active ? opt.accent : "var(--text-3)",
                    fontSize: 11.5, fontWeight: 700, cursor: "pointer", transition: "all 0.15s",
                  }}>
                  {opt.label}
                  <span style={{ fontSize: 9.5, fontWeight: 800, padding: "1px 6px", borderRadius: 6, background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)" }}>{opt.n}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={14} style={{ position: "absolute", left: 11, color: "var(--text-3)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={onResources ? "Buscar recurso…" : "Buscar sitio…"}
              style={{ height: 38, width: 190, maxWidth: "40vw", paddingLeft: 32, paddingRight: 12, borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.15)", background: "rgba(0,0,0,0.22)", color: "var(--text)", fontSize: 12.5, outline: "none" }} />
          </div>
          <ButtonBase onClick={openNew} className="flex items-center gap-2"><Plus size={15} /> {onResources ? "Nuevo recurso" : "Nuevo sitio"}</ButtonBase>
        </div>
      </div>

      {/* Grid */}
      <div className="ws-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: 4 }}>
        {filtered.length === 0 ? (
          <div style={{ height: "100%", minHeight: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
            <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(var(--blue-rgb),0.08)", border: "1px solid rgba(var(--blue-rgb),0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(var(--blue-rgb),0.5)" }}>
              {onResources ? <Sparkles size={30} /> : <KeyIcon size={30} />}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-2)", margin: 0 }}>{search ? "Sin resultados" : onResources ? "Aún no hay recursos" : "Aún no hay sitios"}</p>
              <p style={{ fontSize: 12, color: "var(--text-3)", margin: "4px 0 0" }}>{search ? "Prueba con otro término" : onResources ? "Guarda links útiles (paletas, IA, herramientas) con su descripción" : "Guarda webs con sus credenciales para acceder rápido"}</p>
            </div>
            {!search && (
              <button onClick={openNew} style={{ display: "flex", alignItems: "center", gap: 7, height: 38, padding: "0 18px", borderRadius: 10, border: "1px solid rgba(var(--blue-rgb),0.4)", background: "rgba(var(--blue-rgb),0.18)", color: "var(--blue-light)", fontSize: 12.5, fontWeight: 800, cursor: "pointer" }}>
                <Plus size={15} /> {onResources ? "Agregar recurso" : "Agregar el primero"}
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16, paddingBottom: 8 }}>
            {filtered.map(site => (
              <SiteCard key={site.id} site={site} author={authorOf(site)} onOpen={() => setDetail(site)} onEdit={() => openEdit(site)} onDelete={() => setConfirmDel(site)} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {detail && <DetailModal site={detail} onClose={() => setDetail(null)} onEdit={() => openEdit(detail)} />}
      {formOpen && <FormModal initial={editing} initialKind={tab} onClose={() => { setFormOpen(false); setEditing(null); }} onSave={handleSaveWebsite} />}
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
