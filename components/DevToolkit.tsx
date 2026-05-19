"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Terminal, Globe, Plus, Zap, Copy, ExternalLink, Activity, X } from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StagingLink {
  id: string; name: string; url: string; type: 'staging' | 'api' | 'branch' | 'prod';
}

interface RadarEntry {
  userId: string; name: string; color: string; avatarSeed?: string;
  icon: string; statusText: string; isAFK: boolean; timestamp: number;
}

interface PendingAlert extends RadarEntry { alertId: string; }

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'velsat_radar_v2';
const CHANNEL_NAME = 'velsat_radar';

const AFK_PRESETS = [
  { icon: '🚽', text: 'En el baño',       color: '#E74C3C', bg: 'rgba(231,76,60,0.12)',   border: 'rgba(231,76,60,0.28)'  },
  { icon: '🍔', text: 'Comiendo',         color: '#F39C12', bg: 'rgba(243,156,18,0.12)',  border: 'rgba(243,156,18,0.28)' },
  { icon: '📞', text: 'En llamada',       color: '#9B59B6', bg: 'rgba(155,89,182,0.12)', border: 'rgba(155,89,182,0.28)'  },
  { icon: '☕', text: 'Tomando café',     color: '#E67E22', bg: 'rgba(230,126,34,0.12)',  border: 'rgba(230,126,34,0.28)' },
  { icon: '🏃', text: 'Salí un momento', color: '#3498DB', bg: 'rgba(52,152,219,0.12)',  border: 'rgba(52,152,219,0.28)' },
  { icon: '🛌', text: 'Descansando',      color: '#8E44AD', bg: 'rgba(142,68,173,0.12)', border: 'rgba(142,68,173,0.28)'  },
];

const AFK_MSG: Record<string, string> = {
  'En el baño':       'fue al baño',
  'Comiendo':         'fue a comer',
  'En llamada':       'está en llamada',
  'Tomando café':     'fue por un café',
  'Salí un momento':  'salió un momento',
  'Descansando':      'está descansando',
};

// ─── Timer hook ───────────────────────────────────────────────────────────────

function useElapsed(startTs: number): string {
  const [secs, setSecs] = useState(() => Math.max(0, Math.floor((Date.now() - startTs) / 1000)));
  useEffect(() => {
    if (!startTs) return;
    const iv = setInterval(() => setSecs(Math.max(0, Math.floor((Date.now() - startTs) / 1000))), 1000);
    return () => clearInterval(iv);
  }, [startTs]);
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

// ─── My AFK Overlay ───────────────────────────────────────────────────────────

function MyAFKOverlay({ status, onReturn }: { status: RadarEntry; onReturn: () => void }) {
  const time = useElapsed(status.timestamp);
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(8,10,14,0.95)',
      backdropFilter: 'blur(28px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      {/* Radial glow */}
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(232,93,47,0.07) 0%, transparent 65%)', pointerEvents:'none' }} />
      {/* Grid */}
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize:'32px 32px', pointerEvents:'none' }} />

      {/* Emoji */}
      <div style={{ fontSize: 100, lineHeight:1, marginBottom: 24, filter:'drop-shadow(0 0 40px rgba(232,93,47,0.25))' }}>
        {status.icon}
      </div>

      {/* Status text */}
      <h1 style={{ color:'#F4F5F7', fontSize:44, fontWeight:900, margin:'0 0 10px', letterSpacing:'-1.5px', textAlign:'center' }}>
        {status.statusText}
      </h1>
      <p style={{ color:'rgba(255,255,255,0.3)', fontSize:13, margin:0, fontWeight:500 }}>
        El equipo sabe que no estás disponible
      </p>

      {/* Timer */}
      <div style={{
        margin:'40px 0',
        background:'rgba(255,255,255,0.03)',
        border:'1px solid rgba(255,255,255,0.07)',
        borderRadius:28, padding:'28px 64px', textAlign:'center',
      }}>
        <p style={{ color:'rgba(255,255,255,0.22)', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.18em', margin:'0 0 12px' }}>
          Tiempo fuera
        </p>
        <div style={{ fontSize:76, fontWeight:900, color:'#E85D2F', fontFamily:'monospace', letterSpacing:4, lineHeight:1 }}>
          {time}
        </div>
      </div>

      {/* Return button */}
      <button
        onClick={onReturn}
        style={{
          background:'#E85D2F', color:'#fff', border:'none', borderRadius:20,
          padding:'20px 56px', fontSize:18, fontWeight:800, cursor:'pointer',
          boxShadow:'0 20px 60px rgba(232,93,47,0.35), 0 0 0 1px rgba(232,93,47,0.4)',
          letterSpacing:'-0.3px', transition:'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 28px 70px rgba(232,93,47,0.45)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 20px 60px rgba(232,93,47,0.35)'; }}
      >
        ¡Ya regresé! 👋
      </button>

      <style>{`@keyframes afk-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}`}</style>
    </div>
  );
}

// ─── Team Alert Overlay ───────────────────────────────────────────────────────

function TeamAlertOverlay({ alerts, onDismiss }: { alerts: PendingAlert[]; onDismiss: () => void }) {
  const first = alerts[0];
  const time = useElapsed(first.timestamp);
  return (
    <div style={{
      position:'fixed', inset:0, zIndex:9998,
      background:'rgba(8,10,14,0.91)',
      backdropFilter:'blur(24px)',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      fontFamily:"'DM Sans', system-ui, sans-serif",
    }}>
      {/* Glow */}
      <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:`radial-gradient(circle, ${first.color}12 0%, transparent 70%)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize:'32px 32px', pointerEvents:'none' }} />

      {/* X button */}
      <button
        onClick={onDismiss}
        style={{
          position:'absolute', top:28, right:28, width:46, height:46,
          borderRadius:13, background:'rgba(255,255,255,0.05)',
          border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.45)',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
          transition:'all 0.15s', zIndex:10,
        }}
        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.12)'; e.currentTarget.style.color='#fff'; }}
        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.45)'; }}
      >
        <X size={18}/>
      </button>

      {/* More AFK badge */}
      {alerts.length > 1 && (
        <div style={{ position:'absolute', top:28, left:28, background:'rgba(232,93,47,0.12)', border:'1px solid rgba(232,93,47,0.25)', borderRadius:10, padding:'6px 14px', fontSize:11, fontWeight:800, color:'#E85D2F' }}>
          {alerts.length - 1} más ausente{alerts.length > 2 ? 's' : ''}
        </div>
      )}

      {/* Content */}
      <div style={{ position:'relative', zIndex:10, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}>
        {/* Avatar circle */}
        <div style={{
          width:76, height:76, borderRadius:22,
          background:`${first.color}18`, border:`2px solid ${first.color}45`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:28, fontWeight:900, color:first.color,
          boxShadow:`0 0 40px ${first.color}25`, marginBottom:20,
        }}>
          {first.name.charAt(0).toUpperCase()}
        </div>

        {/* Big emoji */}
        <div style={{ fontSize:72, marginBottom:16, lineHeight:1 }}>{first.icon}</div>

        {/* Message */}
        <h2 style={{ color:'#F4F5F7', fontSize:36, fontWeight:900, margin:'0 0 10px', letterSpacing:'-1px' }}>
          <span style={{ color:first.color }}>{first.name}</span>
          {' '}{AFK_MSG[first.statusText] ?? `está: ${first.statusText}`}
        </h2>
        <p style={{ color:'rgba(255,255,255,0.28)', fontSize:13, margin:'0 0 32px', fontWeight:500 }}>
          Será notificado cuando regrese
        </p>

        {/* Timer */}
        <div style={{ marginBottom:36, textAlign:'center' }}>
          <p style={{ color:'rgba(255,255,255,0.2)', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.16em', margin:'0 0 8px' }}>
            Tiempo fuera
          </p>
          <div style={{ fontSize:52, fontWeight:900, color:'rgba(255,255,255,0.45)', fontFamily:'monospace' }}>
            {time}
          </div>
        </div>

        {/* Other AFK pills */}
        {alerts.length > 1 && (
          <div style={{ display:'flex', gap:8, marginBottom:32, flexWrap:'wrap', justifyContent:'center' }}>
            {alerts.slice(1).map(a => (
              <div key={a.alertId} style={{ background:`${a.color}12`, border:`1px solid ${a.color}30`, borderRadius:10, padding:'7px 14px', display:'flex', alignItems:'center', gap:8 }}>
                <span style={{ fontSize:15 }}>{a.icon}</span>
                <span style={{ fontSize:12, fontWeight:700, color:a.color }}>{a.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          style={{
            background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)',
            color:'rgba(255,255,255,0.55)', borderRadius:14, padding:'13px 36px',
            fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.55)'; }}
        >
          Entendido, volver al trabajo →
        </button>
      </div>
    </div>
  );
}

// ─── Radar Team Row ───────────────────────────────────────────────────────────

function RadarRow({ entry, isMe }: { entry: RadarEntry; isMe: boolean }) {
  const time = useElapsed(entry.timestamp);
  const preset = AFK_PRESETS.find(p => p.text === entry.statusText);
  const afkColor = preset?.color ?? '#E74C3C';
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'12px 14px', borderRadius:14,
      background: entry.isAFK ? `${afkColor}08` : 'rgba(255,255,255,0.025)',
      border:`1px solid ${entry.isAFK ? `${afkColor}22` : 'rgba(255,255,255,0.05)'}`,
      transition:'all 0.3s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        {/* Avatar */}
        <div style={{
          width:38, height:38, borderRadius:11,
          background:`${entry.color}20`, border:`1.5px solid ${entry.color}40`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:14, fontWeight:900, color:entry.color, flexShrink:0,
          boxShadow: entry.isAFK ? `0 0 14px ${afkColor}25` : 'none',
        }}>
          {entry.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize:13, fontWeight:800, color:'#F4F5F7', display:'flex', alignItems:'center', gap:6 }}>
            {entry.name}
            {isMe && <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.06)', padding:'2px 6px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.06em' }}>tú</span>}
          </div>
          <div style={{ fontSize:11, marginTop:2, color: entry.isAFK ? afkColor : 'rgba(255,255,255,0.4)', fontWeight: entry.isAFK ? 700 : 500 }}>
            {entry.icon} {entry.statusText}
          </div>
        </div>
      </div>
      {entry.isAFK && entry.timestamp > 0 && (
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Hace</div>
          <div style={{ fontSize:17, fontWeight:900, color:afkColor, fontFamily:'monospace' }}>{time}</div>
        </div>
      )}
      {!entry.isAFK && (
        <div style={{ width:7, height:7, borderRadius:'50%', background:'#27AE60', boxShadow:'0 0 8px #27AE6080' }} />
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DevToolkit({ members = [], currentUser = null }: { members?: any[], currentUser?: any }) {
  const [activeTab, setActiveTab] = useState<'radar' | 'tools' | 'staging'>('radar');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // DevTools
  const [toolInput, setToolInput]   = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [toolType, setToolType]     = useState<'json' | 'sql' | 'unit'>('json');

  // Staging
  const [links, setLinks] = useState<StagingLink[]>([
    { id: '1', name: 'Pruebas Cliente', url: 'https://staging.example.com', type: 'staging' },
    { id: '2', name: 'API Desarrollo',  url: 'https://api-dev.example.com', type: 'api'     },
  ]);

  // Radar
  const [radarMap, setRadarMap]         = useState<Record<string, RadarEntry>>({});
  const [myStatus, setMyStatus]         = useState<RadarEntry | null>(null);
  const [pendingAlerts, setPendingAlerts] = useState<PendingAlert[]>([]);
  const channelRef  = useRef<BroadcastChannel | null>(null);

  // ── Load persisted radar ──
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data: Record<string, RadarEntry> = JSON.parse(saved);
      setRadarMap(data);
      if (currentUser?.id && data[currentUser.id]?.isAFK) {
        setMyStatus(data[currentUser.id]);
      }
    } catch {}
  }, []);

  // ── Register current user as Online on mount ──
  useEffect(() => {
    if (!currentUser?.id) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, RadarEntry> = saved ? JSON.parse(saved) : {};
    // Only register if not already AFK
    if (!data[currentUser.id]?.isAFK) {
      const entry: RadarEntry = {
        userId: currentUser.id, name: currentUser.name, color: currentUser.color,
        avatarSeed: currentUser.avatarSeed, icon: '💻', statusText: 'Trabajando',
        isAFK: false, timestamp: Date.now(),
      };
      const updated = { ...data, [currentUser.id]: entry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRadarMap(updated);
    }
  }, [currentUser]);

  // ── BroadcastChannel ──
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;

    ch.onmessage = (ev: MessageEvent<{ type: 'AFK' | 'BACK'; entry: RadarEntry }>) => {
      const { type, entry } = ev.data;

      setRadarMap(prev => {
        const updated = { ...prev, [entry.userId]: entry };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      if (type === 'AFK') {
        if (currentUser && entry.userId !== currentUser.id) {
          setPendingAlerts(prev => [
            ...prev.filter(a => a.userId !== entry.userId),
            { ...entry, alertId: crypto.randomUUID() },
          ]);
        }
      } else {
        setPendingAlerts(prev => prev.filter(a => a.userId !== entry.userId));
        if (currentUser && entry.userId !== currentUser.id) {
          toast.success(`${entry.name} regresó 👋`, {
            duration: 4000,
            style: { background:'#1C1F26', color:'#F4F5F7', border:'1px solid rgba(255,255,255,0.08)', fontFamily:"'DM Sans', system-ui, sans-serif" },
          });
        }
      }
    };

    return () => ch.close();
  }, [currentUser]);

  // ── Change status ──
  const goAFK = (preset: typeof AFK_PRESETS[0]) => {
    if (!currentUser?.id) return;
    const entry: RadarEntry = {
      userId: currentUser.id, name: currentUser.name, color: currentUser.color,
      avatarSeed: currentUser.avatarSeed, icon: preset.icon, statusText: preset.text,
      isAFK: true, timestamp: Date.now(),
    };
    setRadarMap(prev => {
      const updated = { ...prev, [currentUser.id]: entry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setMyStatus(entry);
    channelRef.current?.postMessage({ type: 'AFK', entry });
  };

  const goOnline = () => {
    if (!currentUser?.id) return;
    const entry: RadarEntry = {
      userId: currentUser.id, name: currentUser.name, color: currentUser.color,
      avatarSeed: currentUser.avatarSeed, icon: '💻', statusText: 'Trabajando',
      isAFK: false, timestamp: Date.now(),
    };
    setRadarMap(prev => {
      const updated = { ...prev, [currentUser.id]: entry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setMyStatus(null);
    channelRef.current?.postMessage({ type: 'BACK', entry });
  };

  // ── DevTools ──
  const handleFormatJSON = () => {
    try { setToolOutput(JSON.stringify(JSON.parse(toolInput), null, 2)); toast.success("JSON Formateado"); }
    catch { toast.error("JSON Inválido"); }
  };
  const handleFormatSQL = () => {
    setToolOutput(toolInput.replace(/\s+/g,' ').replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|ON|GROUP BY|ORDER BY|AND|OR|LIMIT|VALUES|SET|IN|AS)\b/gi,'\n$1').trim());
    toast.success("SQL Organizado");
  };
  const handleUnitConvert = () => {
    if (toolInput.includes('px')) setToolOutput(`${parseFloat(toolInput)/16}rem`);
    else if (toolInput.includes('rem')) setToolOutput(`${parseFloat(toolInput)*16}px`);
    else toast.error("Usa 'px' o 'rem'");
  };
  const copyOutput = () => { navigator.clipboard.writeText(toolOutput); toast.success("Copiado"); };

  // ── Team list: solo miembros con estado registrado, excluyendo al usuario actual ──
  const teamList: RadarEntry[] = members
    .filter((m: any) => m.id !== currentUser?.id && radarMap[m.id])
    .map((m: any) => radarMap[m.id]);

  const isAFK          = myStatus !== null;
  const hasPending     = pendingAlerts.length > 0;

  // ─── Tab Button ──────────────────────────────────────────────────────────────
  const TabBtn = ({ id, icon: Icon, label }: { id: any; icon: any; label: string }) => (
    <button onClick={() => setActiveTab(id)} style={{
      flex:1, padding:'12px', display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      background: activeTab===id ? 'rgba(255,255,255,0.05)' : 'transparent',
      border:'none', borderBottom: activeTab===id ? '2px solid #3498DB' : '2px solid transparent',
      color: activeTab===id ? '#fff' : 'rgba(255,255,255,0.3)',
      fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.2s',
    }}>
      <Icon size={14}/><span>{label}</span>
    </button>
  );

  return (
    <>
      {/* ── Overlays (fixed, full-screen) ── */}
      {isAFK && mounted && createPortal(<MyAFKOverlay status={myStatus!} onReturn={goOnline} />, document.body)}
      {!isAFK && hasPending && mounted && createPortal(<TeamAlertOverlay alerts={pendingAlerts} onDismiss={() => setPendingAlerts([])} />, document.body)}

      {/* ── Panel ── */}
      <div style={{ background:'rgba(15,18,25,0.85)', backdropFilter:'blur(16px)', borderRadius:24, border:'1px solid rgba(255,255,255,0.1)', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', boxShadow:'0 20px 50px rgba(0,0,0,0.5)' }}>

        {/* Tabs header */}
        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.3)' }}>
          <TabBtn id="radar"   icon={Activity} label="Live Radar" />
          <TabBtn id="tools"   icon={Terminal} label="DevTools"   />
          <TabBtn id="staging" icon={Globe}    label="Entornos"   />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16 }} className="custom-scrollbar">

          {/* ── RADAR TAB ── */}
          {activeTab === 'radar' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* My status card */}
              {currentUser && (
                <div style={{
                  background:`${currentUser.color}10`,
                  border:`1px solid ${currentUser.color}30`,
                  borderRadius:18, padding:'14px 16px',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:38, height:38, borderRadius:11, background:`${currentUser.color}25`, border:`1.5px solid ${currentUser.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:currentUser.color }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:'#F4F5F7' }}>{currentUser.name}</div>
                      <div style={{ fontSize:11, color: isAFK ? '#E74C3C' : '#27AE60', fontWeight:700, marginTop:1 }}>
                        {isAFK ? `${myStatus!.icon} ${myStatus!.statusText}` : '💻 Trabajando'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background: isAFK ? '#E74C3C' : '#27AE60', boxShadow:`0 0 8px ${isAFK?'#E74C3C':'#27AE60'}80` }} />
                    <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>
                      {isAFK ? 'ausente' : 'online'}
                    </span>
                  </div>
                </div>
              )}

              {/* AFK preset buttons */}
              <div>
                <p style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', margin:'0 0 10px' }}>
                  Avisar que me voy a…
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
                  {AFK_PRESETS.map(p => (
                    <button
                      key={p.text}
                      onClick={() => goAFK(p)}
                      style={{
                        padding:'12px 6px', borderRadius:14,
                        background:p.bg, border:`1px solid ${p.border}`,
                        color:p.color, display:'flex', flexDirection:'column',
                        alignItems:'center', gap:5, cursor:'pointer',
                        transition:'all 0.15s', fontSize:'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 20px ${p.color}25`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                    >
                      <span style={{ fontSize:22 }}>{p.icon}</span>
                      <span style={{ fontSize:10, fontWeight:800, textAlign:'center', lineHeight:1.2 }}>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />

              {/* Team status list */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <p style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', margin:0 }}>
                    Estado del equipo
                  </p>
                  <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
                    {teamList.filter(t => t.isAFK).length} ausente{teamList.filter(t=>t.isAFK).length!==1?'s':''}
                  </span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {teamList.length === 0 && (
                    <div style={{ textAlign:'center', padding:'24px 16px', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:14 }}>
                      <p style={{ fontSize:22, margin:'0 0 6px' }}>👥</p>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', margin:0, fontWeight:600 }}>
                        Nadie más conectado aún
                      </p>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.15)', margin:'4px 0 0', fontWeight:500 }}>
                        Aparecerán aquí cuando abran la app
                      </p>
                    </div>
                  )}
                  {teamList.map(entry => (
                    <RadarRow key={entry.userId} entry={entry} isMe={currentUser?.id === entry.userId} />
                  ))}
                </div>
              </div>

              {/* AFK marquee banner */}
              {teamList.some(t => t.isAFK) && (
                <div style={{ background:'rgba(231,76,60,0.1)', border:'1px solid rgba(231,76,60,0.25)', borderRadius:10, padding:'8px 12px', overflow:'hidden', whiteSpace:'nowrap' }}>
                  <div className="marquee-scroll" style={{ fontSize:12, fontWeight:700, color:'#E74C3C', display:'inline-block' }}>
                    ⚠️ {teamList.filter(t=>t.isAFK).map(t=>`${t.name} — ${t.statusText}`).join('  ·  ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DEV TOOLS TAB ── */}
          {activeTab === 'tools' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', gap:8 }}>
                {(['json','sql','unit'] as const).map(t => {
                  const colors = { json:'#3498DB', sql:'#27AE60', unit:'#E67E22' };
                  return (
                    <button key={t} onClick={() => setToolType(t)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid', borderColor: toolType===t ? colors[t] : 'rgba(255,255,255,0.1)', background: toolType===t ? `${colors[t]}18` : 'transparent', color: toolType===t ? colors[t] : '#fff', fontSize:10, cursor:'pointer' }}>
                      {t.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              <textarea placeholder="Pega aquí tu código…" value={toolInput} onChange={e => setToolInput(e.target.value)}
                style={{ width:'100%', height:100, background:'rgba(0,0,0,0.3)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:12, color:'#fff', fontSize:11, fontFamily:'monospace', resize:'none', outline:'none', boxSizing:'border-box' }} />
              <button onClick={toolType==='json'?handleFormatJSON:toolType==='sql'?handleFormatSQL:handleUnitConvert}
                style={{ padding:10, borderRadius:12, background:'#3498DB', border:'none', color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                <Zap size={14}/> Procesar {toolType.toUpperCase()}
              </button>
              {toolOutput && (
                <div style={{ position:'relative' }}>
                  <pre style={{ margin:0, padding:12, background:'rgba(0,0,0,0.5)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, color:'#27AE60', fontSize:10, overflowX:'auto', maxHeight:150 }}>{toolOutput}</pre>
                  <button onClick={copyOutput} style={{ position:'absolute', top:8, right:8, padding:5, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:6, color:'#fff', cursor:'pointer' }}><Copy size={12}/></button>
                </div>
              )}
            </div>
          )}

          {/* ── STAGING TAB ── */}
          {activeTab === 'staging' && (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <h4 style={{ margin:0, fontSize:13, color:'#fff' }}>Entornos</h4>
                <button style={{ padding:'4px 8px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#fff', fontSize:10, cursor:'pointer' }}><Plus size={10}/></button>
              </div>
              {links.map(link => (
                <div key={link.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 14px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:6, height:6, borderRadius:'50%', background: link.type==='prod'?'#27AE60':'#3498DB', boxShadow:`0 0 8px ${link.type==='prod'?'#27AE60':'#3498DB'}` }} />
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{link.name}</div>
                      <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>{link.url.replace('https://','')}</div>
                    </div>
                  </div>
                  <a href={link.url} target="_blank" rel="noreferrer" style={{ color:'rgba(255,255,255,0.5)' } as any}><ExternalLink size={14}/></a>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .marquee-scroll {
          animation: marquee 18s linear infinite;
        }
        @keyframes marquee {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
    </>
  );
}
