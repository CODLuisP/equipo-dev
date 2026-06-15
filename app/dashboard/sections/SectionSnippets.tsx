"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Plus, Copy, Pencil, Trash2, Code, Check, Filter, Maximize2, X } from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import type { Member, Snippet } from "@/app/dashboard/types";

// ─── Label metadata ────────────────────────────────────────────────────────────

const LABELS = ['env', 'código', 'config', 'otro'] as const;

const LABEL_META: Record<string, { bg: string; color: string; lang: string; dot: string }> = {
  env:    { bg: 'rgba(var(--blue-rgb),0.14)',  color: 'var(--blue-soft)', lang: 'Shell',      dot: 'var(--blue-soft)' },
  código: { bg: 'rgba(34,211,238,0.10)', color: '#22d3ee', lang: 'TypeScript', dot: '#22d3ee' },
  config: { bg: 'rgba(34,197,94,0.12)',  color: '#4ade80', lang: 'JSON',       dot: '#4ade80' },
  otro:   { bg: 'rgba(255,255,255,0.06)',color: '#94a3b8', lang: 'Text',       dot: '#94a3b8' },
};
const lm = (l: string) => LABEL_META[l] ?? LABEL_META.otro;

// ─── Mini Dropdown ─────────────────────────────────────────────────────────────

function MiniDropdown({ options, value, onChange, icon }: {
  options: { id: string; label: string }[];
  value: string; onChange: (v: string) => void;
  icon: React.ReactNode;
}) {
  const [open, setOpen]     = useState(false);
  const triggerRef          = useRef<HTMLDivElement>(null);
  const panelRef            = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (!triggerRef.current?.contains(e.target as Node) && !panelRef.current?.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selected = options.find(o => o.id === value)?.label ?? options[0]?.label;
  const isActive = value !== 'all' && value !== options[0]?.id;
  const rect     = triggerRef.current?.getBoundingClientRect();

  return (
    <div ref={triggerRef} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px',
        background: isActive ? 'rgba(var(--blue-rgb),0.12)' : open ? 'rgba(var(--blue-rgb),0.06)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isActive ? 'rgba(var(--blue-rgb),0.35)' : open ? 'rgba(var(--blue-rgb),0.2)' : 'rgba(255,255,255,0.07)'}`,
        borderRadius: 9, cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
      }}>
        <span style={{ color: isActive ? 'var(--blue-soft)' : '#4a5570', display: 'flex' }}>{icon}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: isActive ? 'var(--blue-light)' : 'var(--text)' }}>{selected}</span>
        <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M2 3.5L5 6.5L8 3.5" stroke="#4a5570" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {open && typeof document !== 'undefined' && createPortal(
        <div ref={panelRef} style={{
          position: 'fixed', zIndex: 99999,
          top: rect ? rect.bottom + 6 : 0, left: rect ? rect.left : 0,
          minWidth: 170, background: '#0d1020',
          border: '1px solid rgba(var(--blue-rgb),0.25)', borderRadius: 12,
          padding: 5, boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        }}>
          {options.map(opt => {
            const active = opt.id === value;
            return (
              <button key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }} style={{
                width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                background: active ? 'rgba(var(--blue-rgb),0.14)' : 'transparent',
                color: active ? 'var(--blue-light)' : '#cbd5e1',
                fontSize: 12, fontWeight: active ? 700 : 500,
                fontFamily: "'Plus Jakarta Sans', sans-serif", transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                {opt.label}
                {active && <Check size={11} color="var(--blue-soft)" />}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Code Block con números de línea ──────────────────────────────────────────

function CodeBlock({ content, lang }: { content: string; lang: string }) {
  const lines = content.split('\n');
  return (
    <div style={{ background: 'rgba(0,0,0,0.35)', position: 'relative', overflow: 'hidden' }}>
      {/* Lenguaje badge */}
      <div style={{
        position: 'absolute', top: 7, right: 8, padding: '2px 7px',
        borderRadius: 5, background: 'rgba(255,255,255,0.06)',
        fontSize: 9, fontWeight: 700, color: '#4a5570',
        fontFamily: "'JetBrains Mono', monospace",
        textTransform: 'uppercase', letterSpacing: '0.08em', zIndex: 1,
      }}>{lang}</div>
      {/* Líneas con números */}
      <div style={{ overflowX: 'auto', padding: '8px 0', maxHeight: 200 }}>
        {lines.map((line, i) => (
          <div key={i} style={{ display: 'flex', minHeight: 17 }}>
            <span style={{
              minWidth: 32, paddingLeft: 8, paddingRight: 10, textAlign: 'right',
              userSelect: 'none', fontSize: 10, lineHeight: '17px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'rgba(255,255,255,0.14)',
              borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
            }}>{i + 1}</span>
            <span style={{
              paddingLeft: 10, paddingRight: 14, fontSize: 11, lineHeight: '17px',
              fontFamily: "'JetBrains Mono', monospace",
              color: 'var(--blue-light)', whiteSpace: 'pre',
            }}>{line || ' '}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Snippet Full Screen ──────────────────────────────────────────────────────

function SnippetFullScreen({ s, author, onClose, onCopy, copied }: {
  s: Snippet; author?: Member; onClose: () => void;
  onCopy: () => void; copied: boolean;
}) {
  const meta  = lm(s.label);
  const lines = s.content.split('\n');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(var(--base-rgb),0.92)',
        backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}
    >
      <div style={{
        width: '100%', maxWidth: 900, maxHeight: '90vh',
        background: '#0b0d1e',
        border: '1px solid rgba(255,255,255,0.08)',
        borderTop: `2px solid ${meta.color}60`,
        borderRadius: 20,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.02)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              background: meta.bg, color: meta.color,
              padding: '3px 9px', borderRadius: 6,
              fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
            }}>{s.label}</span>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.3px' }}>
              {s.title}
            </h2>
            {author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '2px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }}>
                <AvatarImg seed={author.avatarSeed || author.name} name={author.name} color={author.color} size={14} borderRadius={4} />
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{author.name}</span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={onCopy}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9,
                background: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${copied ? 'rgba(34,197,94,0.35)' : 'rgba(255,255,255,0.08)'}`,
                color: copied ? '#4ade80' : '#94a3b8',
                fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s',
              }}
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 9,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.35)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.color='#f87171'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.35)'; }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Código completo */}
        <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.4)' }} className="custom-scrollbar">
          {/* Barra superior del editor */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 16px',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: 6 }}>
              {['#f87171','#fbbf24','#4ade80'].map(c => (
                <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.5 }} />
              ))}
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'JetBrains Mono', monospace" }}>
              {meta.lang} · {lines.length} líneas
            </span>
          </div>

          {/* Líneas de código */}
          <div style={{ padding: '12px 0' }}>
            {lines.map((line, i) => (
              <div key={i} style={{ display: 'flex', minHeight: 22 }}>
                <span style={{
                  minWidth: 48, paddingLeft: 16, paddingRight: 14, textAlign: 'right',
                  userSelect: 'none', fontSize: 12, lineHeight: '22px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'rgba(255,255,255,0.12)',
                  borderRight: '1px solid rgba(255,255,255,0.05)', flexShrink: 0,
                }}>{i + 1}</span>
                <span style={{
                  paddingLeft: 16, paddingRight: 20, fontSize: 13, lineHeight: '22px',
                  fontFamily: "'JetBrains Mono', monospace",
                  color: 'var(--blue-light)', whiteSpace: 'pre',
                }}>{line || ' '}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '10px 18px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(255,255,255,0.01)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 10, color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
            {new Date(s.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', fontWeight: 500 }}>
            Esc para cerrar
          </span>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── Snippet Card ──────────────────────────────────────────────────────────────

function SnippetCard({ s, author, isCurrentUser, onCopy, onEdit, onDelete, onExpand, copiedId }: {
  s: Snippet; author?: Member; isCurrentUser: boolean;
  onCopy: (id: string, content: string) => void;
  onEdit: (s: Snippet) => void;
  onDelete: (s: Snippet) => void;
  onExpand: (s: Snippet) => void;
  copiedId: string | null;
}) {
  const meta   = lm(s.label);
  const copied = copiedId === s.id;

  return (
    <div className="flex flex-col rounded-xl overflow-hidden transition-all" style={{
      background: isCurrentUser ? 'rgba(30,34,45,0.8)' : 'rgba(22,25,31,0.6)',
      border: `1px solid ${isCurrentUser ? 'rgba(var(--blue-rgb),0.25)' : 'rgba(255,255,255,0.06)'}`,
      backdropFilter: 'blur(12px)',
    }}>
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-white/5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span style={{
            background: meta.bg, color: meta.color,
            padding: '2px 7px', borderRadius: 5,
            fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
            letterSpacing: '0.08em', flexShrink: 0,
          }}>{s.label}</span>
          <h3 style={{ color: 'var(--text)', fontWeight: 700, fontSize: 12, letterSpacing: '-0.2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {s.title}
          </h3>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          <button onClick={() => onExpand(s)} title="Pantalla completa"
            style={{ padding: '5px', borderRadius: 6, border: 'none', cursor: 'pointer', color: '#4a5570', background: 'transparent', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a5570'; }}
          >
            <Maximize2 size={11} />
          </button>
          <button onClick={() => onCopy(s.id, s.content)} title="Copiar"
            style={{
              padding: '5px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              color: copied ? '#4ade80' : '#4a5570',
              background: copied ? 'rgba(34,197,94,0.1)' : 'transparent',
            }}
            onMouseEnter={e => { if (!copied) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)'; } }}
            onMouseLeave={e => { if (!copied) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a5570'; } }}
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </button>
          <button onClick={() => onEdit(s)} title="Editar"
            style={{ padding: '5px', borderRadius: 6, border: 'none', cursor: 'pointer', color: '#4a5570', background: 'transparent', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a5570'; }}
          >
            <Pencil size={11} />
          </button>
          <button onClick={() => onDelete(s)} title="Eliminar"
            style={{ padding: '5px', borderRadius: 6, border: 'none', cursor: 'pointer', color: '#4a5570', background: 'transparent', transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; e.currentTarget.style.color = '#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4a5570'; }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>
      {/* Código con números de línea */}
      <CodeBlock content={s.content} lang={meta.lang} />
      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/5 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.01)' }}>
        <div className="flex items-center gap-1.5">
          {author ? (
            <>
              <AvatarImg seed={author.avatarSeed || author.name} name={author.name} color={author.color} size={15} borderRadius={4} />
              <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>{author.name}</span>
            </>
          ) : (
            <span style={{ fontSize: 9, color: 'var(--text-dim)' }}>Anónimo</span>
          )}
        </div>
        <span style={{ fontSize: 9, color: '#374151', fontFamily: "'JetBrains Mono', monospace" }}>
          {new Date(s.createdAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      </div>
    </div>
  );
}

// ─── Stats Sidebar ─────────────────────────────────────────────────────────────

function StatsSidebar({ allSnippets, members, filterLabel, setFilterLabel, filterAuthor, setFilterAuthor }: {
  allSnippets: Snippet[]; members: Member[];
  filterLabel: string; setFilterLabel: (v: string) => void;
  filterAuthor: string; setFilterAuthor: (v: string) => void;
}) {
  const total    = allSnippets.length;
  const byLabel  = LABELS.map(l => ({ label: l, count: allSnippets.filter(s => s.label === l).length }));
  const byMember = members
    .map(m => ({ member: m, count: allSnippets.filter(s => s.authorId === m.id).length }))
    .filter(x => x.count > 0)
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ width: 168, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 10, overflowY: 'auto' }} className="custom-scrollbar">

      {/* Total */}
      <div style={{
        borderRadius: 18, padding: '14px 16px',
        background: 'var(--blue)', boxShadow: '0 10px 30px rgba(var(--blue-rgb),0.25)',
        position: 'relative', overflow: 'hidden', flexShrink: 0,
      }}>
        <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, background: 'rgba(255,255,255,0.08)', borderRadius: '50%', filter: 'blur(20px)' }} />
        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block' }}>Total</span>
        <span style={{ fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, display: 'block', marginTop: 2 }}>{total}</span>
        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', marginTop: 2, display: 'block' }}>snippets guardados</span>
      </div>

      {/* Por categoría */}
      <div style={{ borderRadius: 16, padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, paddingLeft: 4 }}>Por Categoría</span>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {byLabel.map(({ label, count }) => {
            const meta   = lm(label);
            const active = filterLabel === label;
            return (
              <button key={label} onClick={() => setFilterLabel(active ? 'all' : label)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', borderRadius: 8, cursor: 'pointer',
                background: active ? meta.bg : 'transparent',
                border: `1px solid ${active ? meta.color + '30' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: meta.dot, flexShrink: 0,  }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: active ? meta.color : 'var(--text-2)', textTransform: 'capitalize' }}>{label}</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, color: active ? meta.color : '#374151', fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Por miembro */}
      {byMember.length > 0 && (
        <div style={{ borderRadius: 16, padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em', display: 'block', marginBottom: 8, paddingLeft: 4 }}>Por Miembro</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {byMember.map(({ member, count }) => {
              const active = filterAuthor === member.id;
              return (
                <button key={member.id} onClick={() => setFilterAuthor(active ? 'all' : member.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '5px 8px', borderRadius: 8, cursor: 'pointer',
                  background: active ? 'rgba(var(--blue-rgb),0.12)' : 'transparent',
                  border: `1px solid ${active ? 'rgba(var(--blue-rgb),0.25)' : 'transparent'}`,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={16} borderRadius={4} />
                    <span style={{ fontSize: 10, fontWeight: 600, color: active ? 'var(--blue-light)' : 'var(--text-2)' }}>{member.name}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: active ? 'var(--blue-soft)' : '#374151', fontFamily: "'JetBrains Mono', monospace" }}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sección principal ────────────────────────────────────────────────────────

export default function SectionSnippets({ snippets, search, setSearch, members, currentUser, onAddSnippet, onEditSnippet, onCopy, onDeleteSnippet }: {
  snippets: Snippet[]; search: string; setSearch: (v: string) => void;
  members: Member[]; currentUser?: Member | null;
  onAddSnippet: () => void; onEditSnippet: (s: Snippet) => void;
  onCopy: (c: string) => void; onDeleteSnippet: (s: Snippet) => void;
}) {
  const [filterLabel,    setFilterLabel]    = useState('all');
  const [filterAuthor,   setFilterAuthor]   = useState('all');
  const [sortBy,         setSortBy]         = useState('newest');
  const [copiedId,       setCopiedId]       = useState<string | null>(null);
  const [expandedSnippet, setExpandedSnippet] = useState<Snippet | null>(null);
  const [copiedFullscreen, setCopiedFullscreen] = useState(false);

  const handleCopy = (id: string, content: string) => {
    onCopy(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filtros + orden (aplicados sobre todos los snippets)
  const filtered = snippets
    .filter(s =>
      !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.content.toLowerCase().includes(search.toLowerCase())
    )
    .filter(s => filterLabel  === 'all' || s.label     === filterLabel)
    .filter(s => filterAuthor === 'all' || s.authorId  === filterAuthor)
    .sort((a, b) => {
      if (sortBy === 'newest') return b.createdAt - a.createdAt;
      if (sortBy === 'oldest') return a.createdAt - b.createdAt;
      if (sortBy === 'label')  return a.label.localeCompare(b.label);
      if (sortBy === 'title')  return a.title.localeCompare(b.title);
      return 0;
    });

  const hasActiveFilters = filterLabel !== 'all' || filterAuthor !== 'all' || !!search;

  const sortOptions = [
    { id: 'newest', label: 'Más recientes' },
    { id: 'oldest', label: 'Más antiguos'  },
    { id: 'label',  label: 'Por categoría' },
    { id: 'title',  label: 'Por título'    },
  ];

  const memberOptions = [
    { id: 'all', label: 'Todos los autores' },
    ...members.map(m => ({ id: m.id, label: m.name })),
  ];

  const labelOptions = [
    { id: 'all',    label: 'Todas las categorías' },
    { id: 'env',    label: 'ENV'    },
    { id: 'código', label: 'Código' },
    { id: 'config', label: 'Config' },
    { id: 'otro',   label: 'Otro'   },
  ];

  return (
    <div className="h-full flex gap-3 overflow-hidden">

      {/* ── Panel principal ── */}
      <div className="flex-1 flex flex-col gap-3 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Título */}
            <h2 style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13, letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>Snippets</h2>
            <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.06)' }} />

            {/* Buscador inline */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <svg style={{ position: 'absolute', left: 9, color: '#4a5570', pointerEvents: 'none' }} width="11" height="11" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                placeholder="Buscar..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '5px 10px 5px 26px', borderRadius: 9, fontSize: 11,
                  background: search ? 'rgba(var(--blue-rgb),0.08)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${search ? 'rgba(var(--blue-rgb),0.3)' : 'rgba(255,255,255,0.07)'}`,
                  color: 'var(--text)', outline: 'none', width: 140,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  transition: 'all 0.15s',
                }}
              />
            </div>

            {/* Filtro categoría */}
            <MiniDropdown
              options={labelOptions}
              value={filterLabel}
              onChange={setFilterLabel}
              icon={
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4h12M4 8h8M7 12h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />

            {/* Filtro autor */}
            <MiniDropdown
              options={memberOptions}
              value={filterAuthor}
              onChange={setFilterAuthor}
              icon={
                <svg width="11" height="11" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              }
            />


            {/* Contador */}
            <span style={{
              fontSize: 10, fontWeight: 700, color: '#4a5570',
              padding: '3px 8px', background: 'rgba(255,255,255,0.04)',
              borderRadius: 6, fontFamily: "'JetBrains Mono', monospace",
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              {filtered.length}/{snippets.length}
            </span>

            {/* Limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={() => { setFilterLabel('all'); setFilterAuthor('all'); setSortBy('newest'); setSearch(''); }}
                style={{
                  fontSize: 10, color: '#f87171', fontWeight: 700,
                  padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.14)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Nuevo snippet */}
          <button
            onClick={onAddSnippet}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'var(--blue)', color: '#fff',
              padding: '6px 12px', borderRadius: 9,
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(var(--blue-rgb),0.3)',
              transition: 'background 0.15s', flexShrink: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1d4ed8')}
            onMouseLeave={e => (e.currentTarget.style.background = 'var(--blue)')}
          >
            <Plus size={12}/> Nuevo Snippet
          </button>
        </div>

        {/* Lista de snippets */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 10 }}>
            {filtered.map(s => (
              <SnippetCard
                key={s.id}
                s={s}
                author={members.find(m => m.id === s.authorId)}
                isCurrentUser={currentUser?.id === s.authorId}
                onCopy={handleCopy}
                onEdit={onEditSnippet}
                onDelete={onDeleteSnippet}
                onExpand={setExpandedSnippet}
                copiedId={copiedId}
              />
            ))}
          </div>

          {/* Estado vacío — sin resultados con filtros activos */}
          {filtered.length === 0 && snippets.length > 0 && (
            <div style={{
              padding: '48px 0', textAlign: 'center',
              border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 20, marginTop: 4,
            }}>
              <Filter size={28} style={{ margin: '0 auto 10px', color: 'rgba(255,255,255,0.08)', display: 'block' }}/>
              <p style={{ color: 'var(--text-dim)', fontSize: 12, fontWeight: 600 }}>Sin resultados para los filtros activos</p>
              <button
                onClick={() => { setFilterLabel('all'); setFilterAuthor('all'); setSearch(''); }}
                style={{ marginTop: 8, fontSize: 11, color: 'var(--blue-soft)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Limpiar filtros
              </button>
            </div>
          )}

          {/* Estado vacío — sin snippets */}
          {snippets.length === 0 && (
            <div style={{
              padding: '48px 0', textAlign: 'center',
              border: '2px dashed rgba(255,255,255,0.05)', borderRadius: 20, marginTop: 4,
            }}>
              <Code size={28} style={{ margin: '0 auto 10px', color: 'rgba(255,255,255,0.05)', display: 'block' }}/>
              <p style={{ color: '#374151', fontSize: 12, fontWeight: 500 }}>No hay snippets guardados</p>
              <button
                onClick={onAddSnippet}
                style={{ marginTop: 8, fontSize: 11, color: 'var(--blue-soft)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                + Crear el primero
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Fullscreen viewer ── */}
      {expandedSnippet && (
        <SnippetFullScreen
          s={expandedSnippet}
          author={members.find(m => m.id === expandedSnippet.authorId)}
          onClose={() => { setExpandedSnippet(null); setCopiedFullscreen(false); }}
          onCopy={() => { onCopy(expandedSnippet.content); setCopiedFullscreen(true); setTimeout(() => setCopiedFullscreen(false), 2000); }}
          copied={copiedFullscreen}
        />
      )}

      {/* ── Sidebar de stats ── */}
      <StatsSidebar
        allSnippets={snippets}
        members={members}
        filterLabel={filterLabel}
        setFilterLabel={setFilterLabel}
        filterAuthor={filterAuthor}
        setFilterAuthor={setFilterAuthor}
      />
    </div>
  );
}
