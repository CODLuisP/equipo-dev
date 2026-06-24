"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Terminal, Globe, Plus, Zap, Copy, ExternalLink, Activity, X, Trash2, Link,
  Monitor, Utensils, PhoneCall, Coffee, DoorOpen, Moon, LogOut, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import { api } from '@/lib/api';
import AvatarImg from '@/app/dashboard/components/AvatarImg';
import ThreeAFKIcon from '@/components/ThreeAFKIcon';

// ─── Types ────────────────────────────────────────────────────────────────────

interface EnvLink {
  id: string; name: string; url: string; createdAt: number; authorId?: string;
}

interface RadarEntry {
  userId: string; name: string; color: string; avatarSeed?: string;
  iconKey: string; statusText: string; isAFK: boolean; timestamp: number;
}

interface PendingAlert extends RadarEntry { alertId: string; }

interface PresenceEntry {
  userId: string; name: string; color: string; avatarSeed?: string;
  lastSeen: number | null;
}

// ─── Status Icons ─────────────────────────────────────────────────────────────

// Custom toilet SVG (lucide doesn't have one)
function ToiletSVG({ size = 20, color = 'currentColor', strokeWidth = 1.75 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="2" width="10" height="5" rx="1.5"/>
      <path d="M5 7h14"/>
      <path d="M6 7c0 5.5 12 5.5 12 0"/>
      <path d="M9 12.5l-1.5 7h9l-1.5-7"/>
      <path d="M8 19.5h8"/>
    </svg>
  );
}

type IconKey = 'bathroom' | 'food' | 'call' | 'coffee' | 'out' | 'rest' | 'online';

function StatusIcon({ iconKey, size = 18, color = 'currentColor', strokeWidth = 1.75 }: {
  iconKey: string; size?: number; color?: string; strokeWidth?: number;
}) {
  const p = { size, color, strokeWidth };
  switch (iconKey) {
    case 'bathroom': return <ToiletSVG size={size} color={color} strokeWidth={strokeWidth} />;
    case 'food':     return <Utensils {...p} />;
    case 'call':     return <PhoneCall {...p} />;
    case 'coffee':   return <Coffee {...p} />;
    case 'out':      return <DoorOpen {...p} />;
    case 'rest':     return <Moon {...p} />;
    default:         return <Monitor {...p} />;
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'velsat_radar_v3';
const CHANNEL_NAME = 'velsat_radar';

const AFK_PRESETS: { iconKey: IconKey; text: string; color: string; bg: string; border: string }[] = [
  { iconKey: 'bathroom', text: 'En el baño',       color: '#E74C3C', bg: 'rgba(231,76,60,0.12)',   border: 'rgba(231,76,60,0.28)'  },
  { iconKey: 'food',     text: 'Comiendo',         color: '#F39C12', bg: 'rgba(243,156,18,0.12)',  border: 'rgba(243,156,18,0.28)' },
  { iconKey: 'call',     text: 'En llamada',       color: '#9B59B6', bg: 'rgba(155,89,182,0.12)',  border: 'rgba(155,89,182,0.28)' },
  { iconKey: 'coffee',   text: 'Tomando café',     color: '#E67E22', bg: 'rgba(230,126,34,0.12)',  border: 'rgba(230,126,34,0.28)' },
  { iconKey: 'out',      text: 'Salí un momento',  color: '#3498DB', bg: 'rgba(52,152,219,0.12)',  border: 'rgba(52,152,219,0.28)' },
  { iconKey: 'rest',     text: 'Descansando',      color: '#8E44AD', bg: 'rgba(142,68,173,0.12)',  border: 'rgba(142,68,173,0.28)' },
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
  const preset = AFK_PRESETS.find(p => p.iconKey === status.iconKey);
  const accentColor = preset?.color ?? '#E85D2F';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(8,10,14,0.96)',
      backdropFilter: 'blur(28px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans', system-ui, sans-serif",
    }}>
      <div style={{ position:'absolute', width:700, height:700, borderRadius:'50%', background:`radial-gradient(circle, ${accentColor}10 0%, transparent 65%)`, pointerEvents:'none' }} />
      <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 0)', backgroundSize:'32px 32px', pointerEvents:'none' }} />

      {/* Big icon */}
      <div style={{
        width:120, height:120, borderRadius:32,
        background:`${accentColor}15`, border:`1.5px solid ${accentColor}35`,
        display:'flex', alignItems:'center', justifyContent:'center',
        marginBottom:28,
      }}>
        <StatusIcon iconKey={status.iconKey} size={56} color={accentColor} strokeWidth={1.5} />
      </div>

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
        <div style={{ fontSize:76, fontWeight:900, color: accentColor, fontFamily:'monospace', letterSpacing:4, lineHeight:1 }}>
          {time}
        </div>
      </div>

      <button
        onClick={onReturn}
        style={{
          background: accentColor, color:'#fff', border:'none', borderRadius:20,
          padding:'20px 56px', fontSize:18, fontWeight:800, cursor:'pointer',
          letterSpacing:'-0.3px', transition:'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity='0.9'; }}
        onMouseLeave={e => { e.currentTarget.style.opacity='1'; }}
      >
        Ya regresé
      </button>
    </div>
  );
}

// ─── Team Alert Notification (compacta, no interrumpe) ───────────────────────

function TeamAlertNotification({ alert, onDismiss }: { alert: PendingAlert; onDismiss: (id: string) => void }) {
  const time   = useElapsed(alert.timestamp);
  const preset = AFK_PRESETS.find(p => p.iconKey === alert.iconKey);
  const color  = preset?.color ?? alert.color;
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => onDismiss(alert.alertId), 280);
  };

  return (
    <div style={{
      width: 320,
      background: '#161b22',
      borderRadius: 16,
      border: '1px solid rgba(255,255,255,0.08)',
      boxShadow: '0 12px 24px -8px rgba(0,0,0,0.6)',
      transform: visible ? 'translateX(0)' : 'translateX(115%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.3s cubic-bezier(0.2,0.9,0.3,1.1), opacity 0.2s',
      pointerEvents: 'auto',
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: `${color}15`, border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <StatusIcon iconKey={alert.iconKey} size={18} color={color} strokeWidth={2} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
          {alert.name}
          <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.4)' }}>
            {time}
          </span>
        </div>
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {AFK_MSG[alert.statusText] ?? alert.statusText}
        </div>
      </div>

      <button
        onClick={dismiss}
        style={{
          width: 26, height: 26, borderRadius: 8, border: 'none',
          background: 'transparent', color: 'rgba(255,255,255,0.3)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

// Stack de notificaciones AFK (una sobre otra, esquina inferior izquierda)
function TeamAlertStack({ alerts, onDismiss }: { alerts: PendingAlert[]; onDismiss: (id: string) => void }) {
  return (
    <div style={{
      position:'fixed', bottom:24, left:24, zIndex:9998,
      display:'flex', flexDirection:'column-reverse', gap:10,
      pointerEvents:'none',
    }}>
      {alerts.map(a => (
        <TeamAlertNotification key={a.alertId} alert={a} onDismiss={onDismiss} />
      ))}
    </div>
  );
}


const ONLINE_WINDOW = 5 * 60 * 1000; // 5 minutos

function useNow(interval = 15000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

function TeamMemberRow({
  member, radarEntry, presenceEntry, isMe, now,
}: {
  member: any; radarEntry?: RadarEntry; presenceEntry?: PresenceEntry;
  isMe: boolean; now: number;
}) {
  const isOnline = presenceEntry != null && presenceEntry.lastSeen != null && (now - presenceEntry.lastSeen) < ONLINE_WINDOW;
  const isAFK    = radarEntry?.isAFK ?? false;

  const afkPreset  = AFK_PRESETS.find(p => p.iconKey === radarEntry?.iconKey);
  const afkColor   = afkPreset?.color ?? '#E74C3C';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '8px 12px', borderRadius: 12,
      background: 'transparent',
      transition: 'background 0.2s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <AvatarImg seed={member.avatarSeed || member.name} name={member.name} color={member.color} size={32} borderRadius={10} />
          <div style={{
            position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%',
            background: isAFK ? afkColor : isOnline ? '#22c55e' : '#4b5563',
            border: '2px solid #161b22',
          }}/>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: 6 }}>
            {member.name}
            {isMe && <span style={{ fontSize: 8.5, fontWeight: 800, color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Tú</span>}
          </div>
          <div style={{ fontSize: 11, marginTop: 2, fontWeight: 500, color: isAFK ? afkColor : isOnline ? '#22c55e' : 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {isAFK ? (
              <>
                <StatusIcon iconKey={radarEntry!.iconKey} size={11} color={afkColor} strokeWidth={2.4}/>
                {radarEntry!.statusText}
              </>
            ) : isOnline ? 'Trabajando' : 'Desconectado'}
          </div>
        </div>
      </div>

      {isAFK && radarEntry!.timestamp > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ausente</span>
          <span style={{ fontSize: 11.5, fontWeight: 700, color: afkColor, fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            <AFKTimer timestamp={radarEntry!.timestamp} color={afkColor}/>
          </span>
        </div>
      )}
    </div>
  );
}

function AFKTimer({ timestamp, color }: { timestamp: number; color: string }) {
  const now = useNow(1000);
  const secs = Math.floor((now - timestamp) / 1000);
  const m = Math.floor(secs / 60), s = secs % 60;
  const display = m > 0 ? `${m}m ${s}s` : `${s}s`;
  return <>{display}</>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DevToolkit({ members = [], currentUser = null, borderRadius }: { members?: any[], currentUser?: any, borderRadius?: string | number }) {
  const [activeTab, setActiveTab] = useState<'radar' | 'tools' | 'staging'>('radar');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // DevTools
  const [toolInput, setToolInput]   = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [toolType, setToolType]     = useState<'json' | 'sql' | 'unit' | 'ts'>('ts');

  // Timestamp converter
  const [tsInput, setTsInput]   = useState('');
  const [tsResult, setTsResult] = useState<{ local: string; iso: string; rfc: string } | null>(null);

  const handleConvertTs = () => {
    const raw = tsInput.trim();
    if (!raw) { toast.error("Ingresa un timestamp"); return; }
    const num = Number(raw);
    if (isNaN(num)) { toast.error("Timestamp inválido"); return; }
    // Detectar si es segundos (10 dígitos) o milisegundos (13 dígitos)
    const ms = raw.length <= 10 ? num * 1000 : num;
    const d  = new Date(ms);
    if (isNaN(d.getTime())) { toast.error("Timestamp inválido"); return; }
    const local = d.toLocaleString('en-US', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true,
      month: '2-digit', day: '2-digit', year: 'numeric',
    });
    setTsResult({ local, iso: d.toISOString(), rfc: d.toUTCString() });
  };

  // Entornos – links compartidos del equipo
  const [envLinks, setEnvLinks]       = useState<EnvLink[]>([]);
  const [linkUrl, setLinkUrl]         = useState('');
  const [linkName, setLinkName]       = useState('');
  const [linkSaving, setLinkSaving]   = useState(false);

  // Radar
  const [radarMap, setRadarMap]           = useState<Record<string, RadarEntry>>({});
  const [myStatus, setMyStatus]           = useState<RadarEntry | null>(null);
  const [pendingAlerts, setPendingAlerts] = useState<PendingAlert[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Presencia en tiempo real
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceEntry>>({});
  const now = useNow(15000);

  // Load links from backend
  useEffect(() => {
    api.getLinks().then(setEnvLinks).catch(() => {});
  }, []);

  // Socket: sync links in real time
  useEffect(() => {
    const socket = getSocket();
    const onAdded   = (link: EnvLink) => setEnvLinks(prev => [...prev.filter(l => l.id !== link.id), link]);
    const onDeleted = ({ id }: { id: string }) => setEnvLinks(prev => prev.filter(l => l.id !== id));
    socket.on('link:added',   onAdded);
    socket.on('link:deleted', onDeleted);
    return () => {
      socket.off('link:added',   onAdded);
      socket.off('link:deleted', onDeleted);
    };
  }, []);

  const handleAddLink = async () => {
    const url = linkUrl.trim();
    if (!url) { toast.error('Ingresa una URL'); return; }
    setLinkSaving(true);
    try {
      await api.addLink({ url, name: linkName.trim() || url, authorId: currentUser?.id || '' });
      setLinkUrl('');
      setLinkName('');
    } catch {
      toast.error('No se pudo guardar el link');
    } finally {
      setLinkSaving(false);
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await api.deleteLink(id);
    } catch {
      toast.error('No se pudo eliminar el link');
    }
  };

  // Load persisted radar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    try {
      const data: Record<string, RadarEntry> = JSON.parse(saved);
      setRadarMap(data);
      if (currentUser?.id && data[currentUser.id]?.isAFK) setMyStatus(data[currentUser.id]);
    } catch {}
  }, []);

  // Register current user as Online on mount
  useEffect(() => {
    if (!currentUser?.id) return;
    const saved = localStorage.getItem(STORAGE_KEY);
    const data: Record<string, RadarEntry> = saved ? JSON.parse(saved) : {};
    if (!data[currentUser.id]?.isAFK) {
      const entry: RadarEntry = {
        userId: currentUser.id, name: currentUser.name, color: currentUser.color,
        avatarSeed: currentUser.avatarSeed, iconKey: 'online', statusText: 'Trabajando',
        isAFK: false, timestamp: Date.now(),
      };
      const updated = { ...data, [currentUser.id]: entry };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setRadarMap(updated);
    }
  }, [currentUser]);

  // BroadcastChannel (mismo navegador) + Socket.io (red)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Función común para procesar eventos AFK/BACK sin importar el origen
    const handleAFK = (entry: RadarEntry) => {
      setRadarMap(prev => {
        const updated = { ...prev, [entry.userId]: entry };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      if (currentUser && entry.userId !== currentUser.id) {
        setPendingAlerts(prev => [
          ...prev.filter(a => a.userId !== entry.userId),
          { ...entry, alertId: crypto.randomUUID() },
        ]);
        try {
          new Audio('/assets/iPhoneSonido.mp3').play();
        } catch {}
      }
    };

    const handleBack = (entry: RadarEntry) => {
      setRadarMap(prev => {
        const updated = { ...prev, [entry.userId]: entry };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
      setPendingAlerts(prev => prev.filter(a => a.userId !== entry.userId));
      if (currentUser && entry.userId !== currentUser.id) {
        toast.success(`${entry.name} regresó 👋`, {
          duration: 4000,
          style: { background:'#1C1F26', color:'#F4F5F7', border:'1px solid rgba(255,255,255,0.08)', fontFamily:"'DM Sans', system-ui, sans-serif" },
        });
      }
    };

    // ── BroadcastChannel (pestañas del mismo navegador) ──
    const ch = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = ch;
    ch.onmessage = (ev: MessageEvent<{ type: 'AFK' | 'BACK'; entry: RadarEntry }>) => {
      const { type, entry } = ev.data;
      if (type === 'AFK') handleAFK(entry);
      else handleBack(entry);
    };

    // ── Socket.io (otras máquinas en red) ──
    const socket = getSocket();
    socket.on('radar:afk',  handleAFK);
    socket.on('radar:back', handleBack);

    // Sincronización: recibir todos los AFK activos
    const handleSync = (entries: RadarEntry[]) => {
      entries.forEach(entry => {
        setRadarMap(prev => {
          const updated = { ...prev, [entry.userId]: entry };
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
          return updated;
        });
        if (currentUser && entry.userId !== currentUser.id) {
          setPendingAlerts(prev =>
            prev.find(a => a.userId === entry.userId)
              ? prev
              : [...prev, { ...entry, alertId: crypto.randomUUID() }]
          );
        }
      });
    };
    socket.on('radar:sync', handleSync);

    // Pedir el estado actual explícitamente (evita race condition)
    const reqTimer = setTimeout(() => {
      socket.emit('radar:request');
      // Identificarse para presencia y pedir estado actual
      if (currentUser?.id) {
        socket.emit('presence:identify', {
          userId: currentUser.id, name: currentUser.name,
          color: currentUser.color, avatarSeed: currentUser.avatarSeed,
        });
      }
      socket.emit('presence:request');
    }, 300);

    // ── Presencia en tiempo real ────────────────────────────────────────────
    const handlePresenceSync = (entries: PresenceEntry[]) => {
      setPresenceMap(prev => {
        const updated = { ...prev };
        entries.forEach(e => { updated[e.userId] = e; });
        return updated;
      });
    };

    const handlePresenceUpdate = (data: Partial<PresenceEntry> & { userId: string; lastSeen: number | null }) => {
      const { userId, lastSeen } = data;
      setPresenceMap(prev => {
        if (lastSeen === null) {
          const updated = { ...prev };
          if (updated[userId]) updated[userId] = { ...updated[userId], lastSeen: null };
          return updated;
        }
        // Merge: si vienen campos extra (name, color, etc.) los incorporamos
        return { ...prev, [userId]: { ...prev[userId], ...data, userId, lastSeen } };
      });
    };

    socket.on('presence:sync',   handlePresenceSync);
    socket.on('presence:update', handlePresenceUpdate);

    // Heartbeat: ping cada 60s para mantenerse como "online"
    const heartbeat = setInterval(() => {
      if (currentUser?.id) socket.emit('presence:ping', currentUser.id);
    }, 60_000);

    return () => {
      clearTimeout(reqTimer);
      clearInterval(heartbeat);
      ch.close();
      socket.off('radar:afk',       handleAFK);
      socket.off('radar:back',       handleBack);
      socket.off('radar:sync',       handleSync);
      socket.off('presence:sync',    handlePresenceSync);
      socket.off('presence:update',  handlePresenceUpdate);
    };
  }, [currentUser]);

  // Change status
  const goAFK = (preset: typeof AFK_PRESETS[0]) => {
    if (!currentUser?.id) return;
    const entry: RadarEntry = {
      userId: currentUser.id, name: currentUser.name, color: currentUser.color,
      avatarSeed: currentUser.avatarSeed, iconKey: preset.iconKey, statusText: preset.text,
      isAFK: true, timestamp: Date.now(),
    };
    setRadarMap(prev => { const u = { ...prev, [currentUser.id]: entry }; localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); return u; });
    setMyStatus(entry);
    // Broadcast: pestañas del mismo navegador + otras máquinas en red
    channelRef.current?.postMessage({ type: 'AFK', entry });
    getSocket().emit('radar:afk', entry);
  };

  const goOnline = () => {
    if (!currentUser?.id) return;
    const entry: RadarEntry = {
      userId: currentUser.id, name: currentUser.name, color: currentUser.color,
      avatarSeed: currentUser.avatarSeed, iconKey: 'online', statusText: 'Trabajando',
      isAFK: false, timestamp: Date.now(),
    };
    setRadarMap(prev => { const u = { ...prev, [currentUser.id]: entry }; localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); return u; });
    setMyStatus(null);
    // Broadcast: pestañas del mismo navegador + otras máquinas en red
    channelRef.current?.postMessage({ type: 'BACK', entry });
    getSocket().emit('radar:back', entry);
  };

  // DevTools
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

  // Team list: ALL members except current user
  const teamMembers = members.filter((m: any) => m.id !== currentUser?.id);
  // Legacy: for AFK marquee
  const teamList: RadarEntry[] = teamMembers
    .filter((m: any) => radarMap[m.id])
    .map((m: any) => radarMap[m.id]);

  const onlineCount = teamMembers.filter((m: any) => {
    const p = presenceMap[m.id];
    return p && p.lastSeen != null && (now - p.lastSeen) < ONLINE_WINDOW;
  }).length;

  const isAFK      = myStatus !== null;
  const hasPending = pendingAlerts.length > 0;
  const myPreset   = AFK_PRESETS.find(p => p.iconKey === myStatus?.iconKey);

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
      {/* Overlays */}
      {isAFK   && mounted && createPortal(<MyAFKOverlay status={myStatus!} onReturn={goOnline} />, document.body)}
      {hasPending && mounted && createPortal(
        <TeamAlertStack
          alerts={pendingAlerts}
          onDismiss={id => setPendingAlerts(prev => prev.filter(a => a.alertId !== id))}
        />, document.body
      )}

      {/* Panel */}
      <div style={{ background:'rgba(var(--surface-rgb),0.92)', backdropFilter:'blur(16px)', borderRadius: borderRadius ?? 24, height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>


        <div style={{ display:'flex', background:'rgba(0,0,0,0.3)' }}>
          <TabBtn id="radar"   icon={Activity} label="Live Radar" />
          <TabBtn id="tools"   icon={Terminal} label="DevTools"   />
          <TabBtn id="staging" icon={Globe}    label="Entornos"   />
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:16 }} className="custom-scrollbar">

          {/* ── RADAR ── */}
          {activeTab === 'radar' && (
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* My status card */}
              {currentUser && (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: 16, overflow: 'hidden',
                  display: 'flex', alignItems: 'stretch', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    {isAFK ? (
                      <div style={{ padding: '13px 0 13px 15px', flexShrink: 0 }}>
                        <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={36} borderRadius={10} />
                      </div>
                    ) : (
                      <img src="/assets/trabajando.png" alt="Trabajando"
                        style={{ width: 56, alignSelf: 'stretch', objectFit: 'cover', flexShrink: 0 }} />
                    )}
                    <div style={{ padding: '13px 15px' }}>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#f0f6fc' }}>{currentUser.name}</div>
                      <div style={{ fontSize: 11, color: isAFK ? (myPreset?.color ?? '#E74C3C') : '#22c55e', fontWeight: 700, marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <StatusIcon iconKey={isAFK ? (myStatus!.iconKey) : 'online'} size={11} color={isAFK ? (myPreset?.color ?? '#E74C3C') : '#22c55e'} strokeWidth={2.2} />
                        {isAFK ? myStatus!.statusText : 'Trabajando'}
                      </div>
                    </div>
                  </div>
                  {isAFK && (
                    <div style={{ padding: '13px 15px', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: myPreset?.color ?? '#E74C3C' }} />
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>ausente</span>
                    </div>
                  )}
                </div>
              )}

              {/* AFK preset buttons */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 8px' }}>
                  Avisar que me voy a…
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
                  {AFK_PRESETS.map(p => (
                    <button
                      key={p.text}
                      onClick={() => goAFK(p)}
                      style={{
                        padding: '12px 6px', borderRadius: 14,
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.06)',
                        color: 'rgba(255, 255, 255, 0.65)',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 6, cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                        e.currentTarget.style.color = '#fff';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        e.currentTarget.style.color = 'rgba(255, 255, 255, 0.65)';
                      }}
                    >
                      <StatusIcon iconKey={p.iconKey} size={18} color={p.color} strokeWidth={2.0} />
                      <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', lineHeight: 1.2 }}>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(255,255,255,0.05)' }} />

              {/* Team list */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0' }}>Estado del equipo</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e' }}>
                      {onlineCount} en línea
                    </span>
                    {teamList.filter(t=>t.isAFK).length > 0 && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>
                        · {teamList.filter(t=>t.isAFK).length} ausente{teamList.filter(t=>t.isAFK).length!==1?'s':''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {teamMembers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '24px 16px', border: '1px dashed rgba(255,255,255,0.07)', borderRadius: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8, color: 'rgba(255,255,255,0.15)' }}>
                        <Users size={24} />
                      </div>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', margin: 0, fontWeight: 600 }}>Eres el único en el equipo</p>
                      <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', margin: '4px 0 0', fontWeight: 500 }}>Invita a más miembros en Ajustes</p>
                    </div>
                  )}
                  {teamMembers.map((member: any) => (
                    <TeamMemberRow
                      key={member.id}
                      member={member}
                      radarEntry={radarMap[member.id]}
                      presenceEntry={presenceMap[member.id]}
                      isMe={false}
                      now={now}
                    />
                  ))}
                </div>
              </div>

              {/* AFK Members Badges */}
              {teamList.some(t=>t.isAFK) && (
                <div style={{ position: 'relative', marginTop: 4, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ position: 'relative', zIndex: 10 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', margin: '0 0 10px 0' }}>Actualmente ausentes</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {teamList.filter(t=>t.isAFK).map(t => {
                        const afkPreset = AFK_PRESETS.find(p => p.iconKey === t.iconKey);
                        const afkColor = afkPreset?.color ?? '#E74C3C';
                        return (
                          <div key={t.userId} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.06)',
                            borderRadius: 14,
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, background: 'rgba(0,0,0,0.15)', borderRadius: 10 }}>
                              <ThreeAFKIcon iconKey={t.iconKey} colorHex={afkColor} size={54} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <span style={{ fontSize: 14, fontWeight: 800, color: '#f0f6fc', letterSpacing: '-0.2px' }}>{t.name}</span>
                              <span style={{ fontSize: 12, fontWeight: 600, color: afkColor, display: 'flex', alignItems: 'center', gap: 4 }}>
                                <StatusIcon iconKey={t.iconKey} size={11} color={afkColor} strokeWidth={2.4}/>
                                {t.statusText}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DEV TOOLS ── */}
          {activeTab === 'tools' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(['ts', 'json', 'sql', 'unit'] as const).map(t => {
                  const tabLabels: Record<string,string> = { ts:'Timestamp', json:'JSON', sql:'SQL', unit:'px↔rem' };
                  const isSelected = toolType === t;
                  return (
                    <button
                      key={t}
                      onClick={() => setToolType(t)}
                      style={{
                        padding: '6px 10px', borderRadius: 8,
                        border: '1px solid',
                        borderColor: isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                        background: isSelected ? 'rgba(255,255,255,0.08)' : 'transparent',
                        color: isSelected ? '#ffffff' : 'rgba(255,255,255,0.5)',
                        fontSize: 10, fontWeight: 700, cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                        }
                      }}
                    >
                      {tabLabels[t]}
                    </button>
                  );
                })}
              </div>

              {/* Timestamp converter */}
              {toolType === 'ts' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <p style={{ margin:0, fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>
                    UNIX Timestamp → Fecha
                  </p>
                  <div style={{ display:'flex', gap:8 }}>
                    <input
                      type="text"
                      placeholder="ej: 1749369838"
                      value={tsInput}
                      onChange={e => { setTsInput(e.target.value); setTsResult(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleConvertTs()}
                      style={{
                        flex: 1,
                        background: 'rgba(0,0,0,0.25)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10,
                        padding: '9px 12px',
                        color: '#fff',
                        fontSize: 12,
                        fontFamily: 'monospace',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                    <button onClick={handleConvertTs} style={{
                      padding: '9px 14px', borderRadius: 10,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0,
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                    }}
                    >
                      <Zap size={13}/> Convertir
                    </button>
                  </div>

                  {/* Botón "Ahora" */}
                  <button
                    onClick={() => { const now = String(Math.floor(Date.now()/1000)); setTsInput(now); setTsResult(null); }}
                    style={{
                      alignSelf: 'flex-start',
                      padding: '5px 10px',
                      borderRadius: 8,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.65)',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
                    }}
                  >
                    Usar timestamp actual
                  </button>

                  {tsResult && (
                    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                      {[
                        { label:'Local', value: tsResult.local },
                        { label:'ISO 8601', value: tsResult.iso },
                        { label:'RFC 2822', value: tsResult.rfc },
                      ].map(({ label, value }) => (
                        <div key={label} style={{
                          padding: '10px 12px',
                          background: 'rgba(0,0,0,0.2)',
                          borderRadius: 10,
                          border: '1px solid rgba(255,255,255,0.05)',
                        }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                            <span style={{ fontSize:10.5, fontWeight:700, color:'var(--blue-light)', fontFamily:'var(--font-mono)' }}>{label}</span>
                            <button onClick={() => { navigator.clipboard.writeText(value); toast.success("Copiado"); }}
                              style={{
                                padding: 4,
                                background: 'transparent',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                borderRadius: 6,
                                transition: 'all 0.15s ease',
                                display: 'flex'
                              }}
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.5)'; }}>
                              <Copy size={10}/>
                            </button>
                          </div>
                          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#ffffff', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.4 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Otras herramientas */}
              {toolType !== 'ts' && (
                <>
                  <textarea placeholder="Pega aquí tu código…" value={toolInput} onChange={e => setToolInput(e.target.value)}
                    style={{ width:'100%', height:100, background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:12, padding:12, color:'#fff', fontSize:11, fontFamily:'monospace', resize:'none', outline:'none', boxSizing:'border-box' }} />
                  <button onClick={toolType==='json'?handleFormatJSON:toolType==='sql'?handleFormatSQL:handleUnitConvert}
                    style={{
                      padding: 10,
                      borderRadius: 12,
                      background: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.15)',
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.08)'}
                  >
                    <Zap size={14}/> Procesar {toolType.toUpperCase()}
                  </button>
                  {toolOutput && (
                    <div style={{ position:'relative' }}>
                      <pre style={{ margin:0, padding:12, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(255,255,255,0.05)', borderRadius:12, color:'#10b981', fontSize:10, overflowX:'auto', maxHeight:150 }}>{toolOutput}</pre>
                      <button onClick={copyOutput} style={{ position:'absolute', top:8, right:8, padding:5, background:'rgba(255,255,255,0.05)', border:'none', borderRadius:6, color:'#fff', cursor:'pointer' }}><Copy size={12}/></button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── ENTORNOS ── */}
          {activeTab === 'staging' && (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <p style={{ margin:0, fontSize:11, fontWeight:600, color:'rgba(255,255,255,0.6)' }}>
                Links compartidos del equipo
              </p>

              {/* Formulario para agregar link */}
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <input
                  type="text"
                  placeholder="Nombre (opcional)"
                  value={linkName}
                  onChange={e => setLinkName(e.target.value)}
                  style={{
                    background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.08)',
                    borderRadius:10, padding:'9px 12px', color:'#fff', fontSize:12,
                    outline:'none', fontFamily:'inherit', boxSizing:'border-box' as const,
                  }}
                  onFocus={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}
                  onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
                />
                <div style={{ display:'flex', gap:8 }}>
                  <input
                    type="text"
                    placeholder="https://ejemplo.com"
                    value={linkUrl}
                    onChange={e => setLinkUrl(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                    style={{
                      flex:1, background:'rgba(0,0,0,0.25)', border:'1px solid rgba(255,255,255,0.08)',
                      borderRadius:10, padding:'9px 12px', color:'#fff', fontSize:12,
                      outline:'none', fontFamily:'monospace', boxSizing:'border-box' as const,
                    }}
                    onFocus={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}
                    onBlur={e => e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}
                  />
                  <button
                    onClick={handleAddLink}
                    disabled={linkSaving}
                    style={{
                      padding:'9px 14px', borderRadius:10, background:'rgba(52,152,219,0.2)',
                      border:'1px solid rgba(52,152,219,0.4)', color:'#3498DB',
                      fontWeight:700, fontSize:11, cursor:'pointer', flexShrink:0,
                      display:'flex', alignItems:'center', gap:6, transition:'all 0.15s ease',
                      opacity: linkSaving ? 0.5 : 1,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background='rgba(52,152,219,0.3)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background='rgba(52,152,219,0.2)'; }}
                  >
                    <Plus size={13}/> Agregar
                  </button>
                </div>
              </div>

              <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />

              {/* Lista de links */}
              {envLinks.length === 0 ? (
                <div style={{ textAlign:'center', padding:'24px 16px', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:14 }}>
                  <div style={{ display:'flex', justifyContent:'center', marginBottom:8, color:'rgba(255,255,255,0.15)' }}>
                    <Link size={24}/>
                  </div>
                  <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', margin:0, fontWeight:600 }}>
                    Sin links guardados
                  </p>
                  <p style={{ fontSize:10, color:'rgba(255,255,255,0.15)', margin:'4px 0 0', fontWeight:500 }}>
                    Agrega URLs para compartirlas con el equipo
                  </p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {envLinks.sort((a,b) => a.createdAt - b.createdAt).map(link => (
                    <div key={link.id} style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'10px 14px', background:'rgba(255,255,255,0.03)',
                      border:'1px solid rgba(255,255,255,0.05)', borderRadius:12,
                      gap:10,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flex:1, minWidth:0 }}>
                        <div style={{
                          width:30, height:30, borderRadius:8, flexShrink:0,
                          background:'rgba(52,152,219,0.12)', border:'1px solid rgba(52,152,219,0.2)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                        }}>
                          <Globe size={14} color="#3498DB"/>
                        </div>
                        <div style={{ minWidth:0 }}>
                          <div style={{ fontSize:12, fontWeight:700, color:'#fff', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {link.name}
                          </div>
                          <div style={{ fontSize:9, color:'rgba(255,255,255,0.3)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {link.url.replace(/^https?:\/\//, '')}
                          </div>
                        </div>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, flexShrink:0 }}>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          style={{
                            width:28, height:28, borderRadius:8, border:'1px solid rgba(255,255,255,0.08)',
                            background:'transparent', color:'rgba(255,255,255,0.4)',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all 0.15s ease', textDecoration:'none',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.background='rgba(255,255,255,0.07)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.4)'; e.currentTarget.style.background='transparent'; }}
                        >
                          <ExternalLink size={13}/>
                        </a>
                        <button
                          onClick={() => handleDeleteLink(link.id)}
                          style={{
                            width:28, height:28, borderRadius:8, border:'1px solid rgba(255,255,255,0.08)',
                            background:'transparent', color:'rgba(255,255,255,0.3)', cursor:'pointer',
                            display:'flex', alignItems:'center', justifyContent:'center',
                            transition:'all 0.15s ease',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.color='#e74c3c'; e.currentTarget.style.background='rgba(231,76,60,0.1)'; e.currentTarget.style.borderColor='rgba(231,76,60,0.3)'; }}
                          onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.3)'; e.currentTarget.style.background='transparent'; e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'; }}
                        >
                          <Trash2 size={13}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .marquee-scroll { animation: marquee 18s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </>
  );
}
