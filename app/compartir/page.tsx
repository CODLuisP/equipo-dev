"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Download, FileText, Image as ImageIcon, FileCode, Archive, Film, Music,
  Link as LinkIcon, Clock, AlertCircle, ExternalLink, Shield, CheckCircle,
  Lock, Globe, Cpu, Zap, Fingerprint, ShieldCheck, File, Calendar, User, Info
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

function decodePayload(encoded: string): SharePayload {
  const b64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '=='.slice(0, (4 - b64.length % 4) % 4);
  const json = decodeURIComponent(
    atob(padded).split('').map(c => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
  );
  return JSON.parse(json);
}

function getTypeInfo(type: string): { icon: React.ReactNode; accent: string; label: string; bg: string } {
  if (type === 'link')          return { icon: <LinkIcon size={36} />,    accent: '#3498DB', label: 'Enlace Web',  bg: 'rgba(52,152,219,0.1)' };
  if (type.includes('pdf'))    return { icon: <FileText size={36} />,    accent: '#E74C3C', label: 'Documento PDF', bg: 'rgba(231,76,60,0.1)' };
  if (type.includes('image'))  return { icon: <ImageIcon size={36} />,   accent: '#9B59B6', label: 'Imagen Digital', bg: 'rgba(155,89,182,0.1)' };
  if (type.includes('zip') || type.includes('rar')) return { icon: <Archive size={36} />,   accent: '#F39C12', label: 'Compresión', bg: 'rgba(243,156,18,0.1)' };
  if (type.includes('word') || type.includes('document')) return { icon: <FileText size={36} />, accent: '#2980B9', label: 'Documento Word', bg: 'rgba(41,128,185,0.1)' };
  if (type.includes('sheet') || type.includes('excel'))   return { icon: <FileText size={36} />, accent: '#27AE60', label: 'Hoja de Cálculo', bg: 'rgba(39,174,96,0.1)' };
  if (type.includes('video')) return { icon: <Film size={36} />,      accent: '#E85D2F', label: 'Archivo Video', bg: 'rgba(232,93,47,0.1)' };
  return { icon: <File size={36} />, accent: '#8A9099', label: 'Archivo Binario', bg: 'rgba(138,144,153,0.1)' };
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
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60).toString().padStart(2, '0');
  const sec = (totalSec % 60).toString().padStart(2, '0');
  return `${min}:${sec}`;
}

function ShareView() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<'loading' | 'valid' | 'expired' | 'error'>('loading');
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const d = searchParams.get('d');
    if (!d) { setState('error'); return; }
    try {
      const data = decodePayload(d);
      const now = Date.now();
      if (now >= data.expiresAt) { setState('expired'); return; }
      setPayload(data);
      setRemaining(data.expiresAt - now);
      setState('valid');
    } catch {
      setState('error');
    }
  }, [searchParams]);

  useEffect(() => {
    if (state !== 'valid' || !payload) return;
    const interval = setInterval(() => {
      const r = payload.expiresAt - Date.now();
      if (r <= 0) { setState('expired'); clearInterval(interval); return; }
      setRemaining(r);
    }, 1000);
    return () => clearInterval(interval);
  }, [state, payload]);

  const handleDownload = () => {
    if (!payload) return;
    if (payload.type === 'link') {
      window.open(payload.dataUrl, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = payload.dataUrl;
      a.download = payload.name;
      a.click();
    }
    setDownloaded(true);
  };

  return (
    <div className="share-page">
      
      {/* Mesh Background */}
      <div className="mesh-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>

      <div className="share-container">
        
        {state === 'loading' && (
          <div className="state-loading">
            <div className="spinner"></div>
          </div>
        )}

        {state === 'error' || state === 'expired' ? (
          <div className="state-card">
            <div className={`icon-box ${state === 'error' ? 'red' : 'orange'}`}>
              <AlertCircle size={48} />
            </div>
            <h2>{state === 'error' ? 'ERROR DE ENLACE' : 'ENLACE EXPIRADO'}</h2>
            <p>Solicita un nuevo acceso al administrador del equipo.</p>
          </div>
        ) : state === 'valid' && payload && (() => {
          const { icon, accent, label, bg } = getTypeInfo(payload.type);
          const isLink = payload.type === 'link';
          const urgent = remaining < 2 * 60 * 1000;

          return (
            <div className="main-card" style={{ '--accent': accent } as any}>
              
              {/* Header Visual */}
              <div className="card-header">
                 <div className="main-icon" style={{ background: bg }}>
                   {icon}
                 </div>
                 <h1>{payload.name}</h1>
                 <span className="type-badge">{label}</span>
              </div>

              {/* Information Grid */}
              <div className="card-body">
                <div className="info-grid">
                  <div className="info-item">
                    <div className="label"><User size={12} /> Emisor</div>
                    <p>{payload.authorName}</p>
                  </div>
                  <div className="info-item">
                    <div className="label"><Calendar size={12} /> Fecha</div>
                    <p>{formatDate(payload.createdAt)}</p>
                  </div>
                  <div className="info-item">
                    <div className="label"><Info size={12} /> Tamaño</div>
                    <p>{formatSize(payload.size)}</p>
                  </div>
                  <div className="info-item">
                    <div className="label"><Clock size={12} /> Expira</div>
                    <p className={urgent ? 'urgent' : ''}>{formatCountdown(remaining)}</p>
                  </div>
                </div>

                <div className="progress-container">
                  <div className="progress-bar" style={{ width: `${(remaining / (15 * 60 * 1000)) * 100}%`, background: urgent ? '#E74C3C' : accent }}></div>
                </div>

                <button onClick={handleDownload} className={`download-btn ${downloaded ? 'done' : ''}`}>
                  {downloaded ? <><CheckCircle size={20} /> DESCARGA LISTA</> : isLink ? <><ExternalLink size={20} /> ABRIR ENLACE</> : <><Download size={20} /> DESCARGAR AHORA</>}
                </button>

                <div className="trust-badges">
                  <div className="badge"><ShieldCheck size={16}/><span>SSL SECURE</span></div>
                  <div className="badge"><Lock size={16}/><span>CIFRADO</span></div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      <div className="footer-info">EQUIPO DEV · PORTAL DE TRANSFERENCIA</div>

      <style>{`
        .share-page {
          min-height: 100vh;
          background: #05070A;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .mesh-bg { position: absolute; inset: 0; opacity: 0.8; pointer-events: none; }
        .blob { position: absolute; filter: blur(100px); }
        .blob-1 { top: -10%; left: -10%; width: 60%; height: 60%; background: radial-gradient(circle, rgba(52,152,219,0.15) 0%, transparent 70%); animation: float 20s infinite alternate; }
        .blob-2 { bottom: -10%; right: -10%; width: 70%; height: 70%; background: radial-gradient(circle, rgba(155,89,182,0.1) 0%, transparent 70%); animation: float 25s infinite alternate-reverse; }

        .share-container { 
          width: 100%; 
          max-width: 480px; 
          margin: 0 auto;
          position: relative; 
          z-index: 10; 
        }

        .state-card { background: rgba(255,255,255,0.02); backdrop-filter: blur(40px); border: 1px solid rgba(255,255,255,0.05); border-radius: 32px; padding: 48px 32px; text-align: center; }
        .state-card h2 { font-size: 20px; font-weight: 800; margin-bottom: 12px; }
        .state-card p { color: rgba(255,255,255,0.4); font-size: 14px; }
        .icon-box { width: 80px; height: 80px; border-radius: 24px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .icon-box.red { background: rgba(231,76,60,0.1); color: #E74C3C; }
        .icon-box.orange { background: rgba(243,156,18,0.1); color: #F39C12; }

        .main-card { 
          background: rgba(22,25,41,0.85);
          backdrop-filter: blur(50px); 
          border: 1px solid rgba(255,255,255,0.06); 
          border-radius: 40px; 
          overflow: hidden; 
          box-shadow: 0 40px 100px rgba(0,0,0,0.8); 
        }

        .card-header { padding: 48px 40px 24px; text-align: center; }
        .main-icon { width: 88px; height: 88px; border: 1px solid rgba(255,255,255,0.08); border-radius: 28px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: var(--accent); }
        .card-header h1 { font-size: 26px; font-weight: 900; color: #fff; margin-bottom: 16px; letter-spacing: -0.02em; word-break: break-all; }
        .type-badge { font-size: 12px; font-weight: 700; color: var(--accent); background: rgba(255,255,255,0.03); padding: 6px 16px; border-radius: 100px; text-transform: uppercase; letter-spacing: 0.1em; }

        .card-body { padding: 0 40px 48px; }
        .info-grid { 
          display: grid; 
          grid-template-columns: repeat(2, 1fr); 
          gap: 24px; 
          background: rgba(0,0,0,0.25); 
          border: 1px solid rgba(255,255,255,0.04); 
          border-radius: 24px; 
          padding: 28px; 
          margin-bottom: 32px; 
        }
        .label { display: flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; opacity: 0.3; margin-bottom: 6px; }
        .info-item p { font-size: 15px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .urgent { color: #E74C3C; }

        .progress-container { height: 4px; background: rgba(255,255,255,0.04); border-radius: 4px; margin-bottom: 36px; overflow: hidden; }
        .progress-bar { height: 100%; transition: width 1s linear; }

        .download-btn { 
          width: 100%; 
          height: 64px; 
          background: var(--accent); 
          border: none; 
          border-radius: 20px; 
          color: #000; 
          font-size: 16px; 
          font-weight: 800; 
          cursor: pointer; 
          transition: all 0.3s; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          gap: 12px; 
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .download-btn.done { background: rgba(46,204,113,0.1); border: 1px solid #2ECC71; color: #2ECC71; box-shadow: none; }
        .download-btn:hover:not(.done) { opacity: 0.9; transform: translateY(-2px); }

        .trust-badges { display: flex; align-items: center; justify-content: center; gap: 24px; margin-top: 32px; opacity: 0.2; }
        .badge { display: flex; align-items: center; gap: 8px; font-size: 10px; font-weight: 800; }

        .footer-info { margin-top: 40px; opacity: 0.2; font-size: 11px; font-weight: 800; letter-spacing: 0.1em; }

        .spinner { width: 40px; height: 40px; border: 3px solid rgba(255,255,255,0.05); border-top-color: #3498DB; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto; }

        @media (max-width: 600px) {
          .share-container { max-width: 100%; padding: 0 10px; }
          .card-header { padding: 40px 24px 20px; }
          .card-header h1 { font-size: 22px; }
          .card-body { padding: 0 24px 40px; }
          .info-grid { grid-template-columns: 1fr; gap: 20px; padding: 24px; }
          .main-icon { width: 72px; height: 72px; }
          .download-btn { height: 58px; font-size: 15px; }
        }

        @keyframes float { 0% { transform: translate(0, 0); } 100% { transform: translate(5%, 5%); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap" rel="stylesheet" />
    </div>
  );
}

export default function CompartirPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#05070A' }} />}>
      <ShareView />
    </Suspense>
  );
}
