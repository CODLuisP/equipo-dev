"use client";

import { useState, useRef, useEffect } from "react";
import {
  Download, FileText, Image as ImageIcon, Archive, Film,
  Link as LinkIcon, Clock, AlertCircle, ExternalLink, CheckCircle,
  Lock, ShieldCheck, File, Calendar, User, Info, Search, ArrowRight,
} from "lucide-react";

interface SharePayload {
  name: string;
  type: string;
  size: number;
  authorName: string;
  createdAt: number;
  expiresAt: number;
  dataUrl: string;
}

function getTypeInfo(type: string) {
  if (type === 'link')                              return { icon: <LinkIcon size={40} />,   accent: '#3498DB', label: 'Enlace Web',    bg: 'rgba(52,152,219,0.12)' };
  if (type.includes('pdf'))                         return { icon: <FileText size={40} />,   accent: '#E74C3C', label: 'PDF',           bg: 'rgba(231,76,60,0.12)' };
  if (type.includes('image'))                       return { icon: <ImageIcon size={40} />,  accent: '#9B59B6', label: 'Imagen',        bg: 'rgba(155,89,182,0.12)' };
  if (type.includes('zip') || type.includes('rar')) return { icon: <Archive size={40} />,   accent: '#F39C12', label: 'Comprimido',    bg: 'rgba(243,156,18,0.12)' };
  if (type.includes('video'))                       return { icon: <Film size={40} />,       accent: '#E85D2F', label: 'Video',         bg: 'rgba(232,93,47,0.12)' };
  return { icon: <File size={40} />, accent: '#8A9099', label: 'Archivo', bg: 'rgba(138,144,153,0.12)' };
}

function formatSize(b: number) {
  if (!b) return '---';
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(1)} MB`;
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '00:00';
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export default function FileSearchPage() {
  const [code, setCode]           = useState('');
  const [state, setState]         = useState<'idle' | 'loading' | 'valid' | 'expired' | 'error'>('idle');
  const [payload, setPayload]     = useState<SharePayload | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [downloaded, setDownloaded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (state !== 'valid' || !payload) return;
    const interval = setInterval(() => {
      const r = payload.expiresAt - Date.now();
      if (r <= 0) { setState('expired'); clearInterval(interval); return; }
      setRemaining(r);
    }, 1000);
    return () => clearInterval(interval);
  }, [state, payload]);

  const search = async () => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return;
    setState('loading');
    setPayload(null);
    setDownloaded(false);
    try {
      const res = await fetch(`/api/shortlink?code=${trimmed}`);
      if (!res.ok) { setState('error'); return; }
      const data: SharePayload = await res.json();
      if (Date.now() >= data.expiresAt) { setState('expired'); return; }
      setPayload(data);
      setRemaining(data.expiresAt - Date.now());
      setState('valid');
    } catch {
      setState('error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') search(); };

  const handleDownload = () => {
    if (!payload) return;
    if (payload.type === 'link') window.open(payload.dataUrl, '_blank');
    else {
      const a = document.createElement('a');
      a.href = payload.dataUrl;
      a.download = payload.name;
      a.click();
    }
    setDownloaded(true);
  };

  const reset = () => { setState('idle'); setCode(''); setPayload(null); setTimeout(() => inputRef.current?.focus(), 50); };

  const typeInfo = payload ? getTypeInfo(payload.type) : null;
  const urgent   = remaining < 2 * 60 * 1000;

  return (
    <div style={{
      minHeight: '100vh', background: '#05070A', color: '#fff',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', 'Plus Jakarta Sans', sans-serif", padding: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Background blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-15%', left: '-10%', width: '55%', height: '55%', background: 'radial-gradient(circle, rgba(52,152,219,0.12) 0%, transparent 70%)', filter: 'blur(80px)', animation: 'floatA 18s infinite alternate' }} />
        <div style={{ position: 'absolute', bottom: '-15%', right: '-10%', width: '65%', height: '65%', background: 'radial-gradient(circle, rgba(155,89,182,0.09) 0%, transparent 70%)', filter: 'blur(100px)', animation: 'floatB 24s infinite alternate-reverse' }} />
        <div style={{ position: 'absolute', top: '40%', left: '50%', width: '40%', height: '40%', background: 'radial-gradient(circle, rgba(232,93,47,0.05) 0%, transparent 70%)', filter: 'blur(90px)', transform: 'translate(-50%,-50%)' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 10, width: '100%', maxWidth: 520 }}>

        {/* Logo / Branding */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(52,152,219,0.15)', border: '1px solid rgba(52,152,219,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Search size={16} color="#3498DB" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#97c0ea', letterSpacing: '-0.3px', fontFamily: 'JetBrains Mono, monospace' }}>CODEXA</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 900, margin: '0 0 10px', letterSpacing: '-0.8px', lineHeight: 1.15 }}>
            Buscar archivo
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0 }}>
            Ingresa el código que te compartieron
          </p>
        </div>

        {/* Search box */}
        {(state === 'idle' || state === 'loading' || state === 'error' || state === 'expired') && (
          <div style={{ marginBottom: state !== 'idle' ? 24 : 0 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 0,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, overflow: 'hidden',
              transition: 'border-color 0.2s',
              boxShadow: '0 0 0 0 rgba(52,152,219,0)',
            }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(52,152,219,0.5)')}
              onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)')}
            >
              <div style={{ paddingLeft: 18, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <Search size={16} />
              </div>
              <input
                ref={inputRef}
                value={code}
                onChange={e => setCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                onKeyDown={handleKeyDown}
                placeholder="ej: ab3x9f"
                maxLength={12}
                style={{
                  flex: 1, background: 'none', border: 'none', outline: 'none',
                  color: '#fff', fontSize: 22, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '18px 12px 18px 14px', letterSpacing: '0.08em',
                }}
              />
              <button
                onClick={search}
                disabled={!code.trim() || state === 'loading'}
                style={{
                  flexShrink: 0, height: '100%', padding: '0 22px',
                  background: code.trim() ? '#3498DB' : 'rgba(255,255,255,0.05)',
                  border: 'none', cursor: code.trim() ? 'pointer' : 'default',
                  color: code.trim() ? '#fff' : 'rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 13, fontWeight: 700,
                  transition: 'background 0.2s, color 0.2s',
                  minWidth: 110, justifyContent: 'center',
                }}
                onMouseEnter={e => { if (code.trim()) e.currentTarget.style.background = '#2980B9'; }}
                onMouseLeave={e => { if (code.trim()) e.currentTarget.style.background = '#3498DB'; }}
              >
                {state === 'loading' ? (
                  <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <><ArrowRight size={15} /> Buscar</>
                )}
              </button>
            </div>

            {/* Error / Expired states */}
            {(state === 'error' || state === 'expired') && (
              <div style={{
                marginTop: 16, padding: '14px 18px', borderRadius: 12,
                background: state === 'expired' ? 'rgba(243,156,18,0.08)' : 'rgba(231,76,60,0.08)',
                border: `1px solid ${state === 'expired' ? 'rgba(243,156,18,0.2)' : 'rgba(231,76,60,0.2)'}`,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <AlertCircle size={16} color={state === 'expired' ? '#F39C12' : '#E74C3C'} />
                <span style={{ fontSize: 13, color: state === 'expired' ? '#F39C12' : '#E74C3C', fontWeight: 600 }}>
                  {state === 'expired' ? 'Este código ha expirado.' : 'Código no encontrado. Verifica que sea correcto.'}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Result card */}
        {state === 'valid' && payload && typeInfo && (
          <div style={{
            background: 'rgba(18,21,35,0.9)', backdropFilter: 'blur(40px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 28, overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
            animation: 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
          }}>
            {/* File header */}
            <div style={{ padding: '32px 32px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 18 }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: typeInfo.bg, border: `1px solid ${typeInfo.accent}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: typeInfo.accent, flexShrink: 0 }}>
                {typeInfo.icon}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: typeInfo.accent, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 5px' }}>{typeInfo.label}</p>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#f1f3f9', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{payload.name}</h2>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{formatSize(payload.size)}</span>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding: '20px 32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { icon: <User size={11} />, label: 'Enviado por', value: payload.authorName },
                { icon: <Calendar size={11} />, label: 'Fecha', value: formatDate(payload.createdAt) },
                { icon: <Clock size={11} />, label: 'Expira en', value: formatCountdown(remaining), urgent },
                { icon: <Info size={11} />, label: 'Tamaño', value: formatSize(payload.size) },
              ].map(({ icon, label, value, urgent: u }) => (
                <div key={label} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '12px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.25)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{icon}{label}</div>
                  <p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: u ? '#F39C12' : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{ margin: '0 32px', height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (remaining / (15 * 60 * 1000)) * 100)}%`, background: urgent ? '#E74C3C' : typeInfo.accent, transition: 'width 1s linear, background 0.3s' }} />
            </div>

            {/* Download button */}
            <div style={{ padding: '20px 32px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button
                onClick={handleDownload}
                style={{
                  width: '100%', height: 56, borderRadius: 16,
                  background: downloaded ? 'rgba(46,204,113,0.1)' : typeInfo.accent,
                  border: downloaded ? '1px solid #2ECC71' : 'none',
                  color: downloaded ? '#2ECC71' : '#000',
                  fontSize: 15, fontWeight: 800, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  transition: 'all 0.25s', boxShadow: downloaded ? 'none' : `0 8px 24px ${typeInfo.accent}40`,
                }}
                onMouseEnter={e => { if (!downloaded) e.currentTarget.style.opacity = '0.88'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
              >
                {downloaded
                  ? <><CheckCircle size={18} /> LISTO — DESCARGADO</>
                  : payload.type === 'link'
                    ? <><ExternalLink size={18} /> ABRIR ENLACE</>
                    : <><Download size={18} /> DESCARGAR ARCHIVO</>
                }
              </button>

              <button onClick={reset} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 12, cursor: 'pointer', padding: '4px 0', fontWeight: 600, transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.5)'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
                ← Buscar otro código
              </button>
            </div>

            {/* Trust */}
            <div style={{ padding: '0 32px 20px', display: 'flex', gap: 20, justifyContent: 'center', opacity: 0.18 }}>
              {[<><ShieldCheck size={13}/> SSL SECURE</>, <><Lock size={13}/> CIFRADO</>].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800 }}>{b}</div>
              ))}
            </div>
          </div>
        )}

        <p style={{ textAlign: 'center', marginTop: 36, fontSize: 11, color: 'rgba(255,255,255,0.12)', fontWeight: 700, letterSpacing: '0.1em' }}>
          CODEXA · PORTAL DE TRANSFERENCIA
        </p>
      </div>

      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
      <style>{`
        @keyframes floatA { 0% { transform: translate(0,0); } 100% { transform: translate(4%,6%); } }
        @keyframes floatB { 0% { transform: translate(0,0); } 100% { transform: translate(-4%,-5%); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
