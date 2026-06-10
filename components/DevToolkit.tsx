"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Terminal, Globe, Plus, Zap, Copy, ExternalLink, Activity, X,
  Monitor, Utensils, PhoneCall, Coffee, DoorOpen, Moon, LogOut, Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/lib/socket';
import AvatarImg from '@/app/dashboard/components/AvatarImg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface StagingLink {
  id: string; name: string; url: string; type: 'staging' | 'api' | 'branch' | 'prod';
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
        boxShadow:`0 0 60px ${accentColor}20`,
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
          boxShadow:`0 20px 60px ${accentColor}35, 0 0 0 1px ${accentColor}40`,
          letterSpacing:'-0.3px', transition:'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 28px 70px ${accentColor}45`; }}
        onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow=`0 20px 60px ${accentColor}35`; }}
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
      width: 300,
      background: 'rgba(10,12,22,0.98)',
      borderRadius: 14,
      border: `1px solid rgba(255,255,255,0.07)`,
      borderTop: `1px solid ${color}55`,
      boxShadow: `0 24px 60px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.03), 0 0 32px ${color}12`,
      transform: visible ? 'translateX(0)' : 'translateX(115%)',
      opacity: visible ? 1 : 0,
      transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1), opacity 0.22s ease',
      pointerEvents: 'auto',
      overflow: 'hidden',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Color bar top */}
      <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: 0.7 }} />

      <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11 }}>

        {/* Avatar con badge de estado */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <AvatarImg
            seed={alert.avatarSeed || alert.name}
            name={alert.name}
            color={color}
            size={44}
            borderRadius={11}
          />
          <div style={{
            position: 'absolute', bottom: -4, right: -4,
            width: 22, height: 22, borderRadius: 7,
            background: `${color}22`,
            border: `1.5px solid ${color}60`,
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <StatusIcon iconKey={alert.iconKey} size={11} color={color} strokeWidth={2.2} />
          </div>
        </div>

        {/* Contenido */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 3 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#f0f4ff', flexShrink: 0 }}>
              {alert.name}
            </span>
            <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.38)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {AFK_MSG[alert.statusText] ?? alert.statusText}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }} />
            <span style={{ fontSize: 10, fontWeight: 700, color: color, opacity: 0.8, fontVariantNumeric: 'tabular-nums', letterSpacing: '0.03em' }}>
              {time}
            </span>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.22)', fontWeight: 500 }}>fuera</span>
          </div>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          style={{
            flexShrink: 0, width: 24, height: 24, borderRadius: 7,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.25)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.14)'; e.currentTarget.style.color='#f87171'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color='rgba(255,255,255,0.25)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; }}
        >
          <X size={11} />
        </button>
      </div>
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

  // Tiempo relativo de última conexión

  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'10px 13px', borderRadius:13,
      background: isAFK ? `${afkColor}08` : isOnline ? 'rgba(39,174,96,0.04)' : 'rgba(255,255,255,0.02)',
      border: `1px solid ${isAFK ? `${afkColor}22` : isOnline ? 'rgba(39,174,96,0.15)' : 'rgba(255,255,255,0.05)'}`,
      transition:'all 0.3s',
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {/* Avatar con dot de presencia */}
        <div style={{ position:'relative', flexShrink:0 }}>
          <div style={{
            width:34, height:34, borderRadius:10,
            background:`${member.color}20`, border:`1.5px solid ${member.color}40`,
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:13, fontWeight:900, color:member.color,
            boxShadow: isAFK ? `0 0 10px ${afkColor}25` : 'none',
          }}>
            {member.name.charAt(0).toUpperCase()}
          </div>
          {/* Dot de estado */}
          <div style={{
            position:'absolute', bottom:-2, right:-2,
            width:9, height:9, borderRadius:'50%',
            background: isAFK ? afkColor : isOnline ? '#27AE60' : '#4B5563',
            border:'1.5px solid rgba(12,15,22,0.99)',
            boxShadow: isOnline && !isAFK ? '0 0 6px #27AE6080' : 'none',
          }}/>
        </div>

        <div>
          <div style={{ fontSize:12, fontWeight:800, color:'#F4F5F7', display:'flex', alignItems:'center', gap:5 }}>
            {member.name}
            {isMe && <span style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.3)', background:'rgba(255,255,255,0.06)', padding:'2px 5px', borderRadius:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>tú</span>}
          </div>
          <div style={{ fontSize:10, marginTop:2, fontWeight:600, display:'flex', alignItems:'center', gap:4,
            color: isAFK ? afkColor : isOnline ? '#27AE60' : 'rgba(255,255,255,0.25)' }}>
            {isAFK ? (
              <>
                <StatusIcon iconKey={radarEntry!.iconKey} size={10} color={afkColor} strokeWidth={2}/>
                {radarEntry!.statusText}
              </>
            ) : isOnline ? (
              'En línea'
            ) : (
              'Desconectado'
            )}
          </div>
        </div>
      </div>

      {/* Lado derecho */}
      {isAFK && radarEntry!.timestamp > 0 && (
        <div style={{ textAlign:'right' }}>
          <div style={{ fontSize:9, color:'rgba(255,255,255,0.25)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Hace</div>
          <AFKTimer timestamp={radarEntry!.timestamp} color={afkColor}/>
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
  return <div style={{ fontSize:15, fontWeight:900, color, fontFamily:'monospace' }}>{display}</div>;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DevToolkit({ members = [], currentUser = null }: { members?: any[], currentUser?: any }) {
  const [activeTab, setActiveTab] = useState<'radar' | 'tools' | 'staging'>('radar');
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // DevTools
  const [toolInput, setToolInput]   = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [toolType, setToolType]     = useState<'json' | 'sql' | 'unit' | 'ts'>('json');

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

  // Staging
  const [links] = useState<StagingLink[]>([
    { id: '1', name: 'Pruebas Cliente', url: 'https://staging.example.com', type: 'staging' },
    { id: '2', name: 'API Desarrollo',  url: 'https://api-dev.example.com', type: 'api'     },
  ]);

  // Radar
  const [radarMap, setRadarMap]           = useState<Record<string, RadarEntry>>({});
  const [myStatus, setMyStatus]           = useState<RadarEntry | null>(null);
  const [pendingAlerts, setPendingAlerts] = useState<PendingAlert[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);

  // Presencia en tiempo real
  const [presenceMap, setPresenceMap] = useState<Record<string, PresenceEntry>>({});
  const now = useNow(15000);

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
      <div style={{ background:'rgba(15,18,25,0.85)', backdropFilter:'blur(16px)', borderRadius:24, border:'1px solid rgba(255,255,255,0.1)', height:'100%', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.05)', background:'rgba(0,0,0,0.3)' }}>
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
                  background:`${currentUser.color}10`, border:`1px solid ${currentUser.color}30`,
                  borderRadius:16, padding:'13px 15px',
                  display:'flex', alignItems:'center', justifyContent:'space-between',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:11 }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:`${currentUser.color}25`, border:`1.5px solid ${currentUser.color}50`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:900, color:currentUser.color }}>
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize:12, fontWeight:800, color:'#F4F5F7' }}>{currentUser.name}</div>
                      <div style={{ fontSize:11, color: isAFK ? (myPreset?.color ?? '#E74C3C') : '#27AE60', fontWeight:700, marginTop:2, display:'flex', alignItems:'center', gap:5 }}>
                        <StatusIcon iconKey={isAFK ? (myStatus!.iconKey) : 'online'} size={11} color={isAFK ? (myPreset?.color ?? '#E74C3C') : '#27AE60'} strokeWidth={2.2} />
                        {isAFK ? myStatus!.statusText : 'Trabajando'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:7, height:7, borderRadius:'50%', background: isAFK ? (myPreset?.color ?? '#E74C3C') : '#27AE60', boxShadow:`0 0 8px ${isAFK ? (myPreset?.color ?? '#E74C3C') : '#27AE60'}80` }} />
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
                        padding:'14px 6px', borderRadius:14,
                        background:p.bg, border:`1px solid ${p.border}`,
                        color:p.color, display:'flex', flexDirection:'column',
                        alignItems:'center', gap:8, cursor:'pointer',
                        transition:'all 0.15s', fontFamily:'inherit',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow=`0 8px 20px ${p.color}25`; }}
                      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
                    >
                      <StatusIcon iconKey={p.iconKey} size={22} color={p.color} strokeWidth={1.75} />
                      <span style={{ fontSize:10, fontWeight:800, textAlign:'center', lineHeight:1.2 }}>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ height:1, background:'rgba(255,255,255,0.05)' }} />

              {/* Team list */}
              <div>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                  <p style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.12em', margin:0 }}>Estado del equipo</p>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:10, fontWeight:700, color:'#27AE60', fontFamily:'monospace' }}>
                      {onlineCount} en línea
                    </span>
                    {teamList.filter(t=>t.isAFK).length > 0 && (
                      <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.2)', fontFamily:'monospace' }}>
                        · {teamList.filter(t=>t.isAFK).length} ausente{teamList.filter(t=>t.isAFK).length!==1?'s':''}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:7 }}>
                  {teamMembers.length === 0 && (
                    <div style={{ textAlign:'center', padding:'24px 16px', border:'1px dashed rgba(255,255,255,0.07)', borderRadius:14 }}>
                      <div style={{ display:'flex', justifyContent:'center', marginBottom:8, color:'rgba(255,255,255,0.15)' }}>
                        <Users size={24} />
                      </div>
                      <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', margin:0, fontWeight:600 }}>Eres el único en el equipo</p>
                      <p style={{ fontSize:10, color:'rgba(255,255,255,0.15)', margin:'4px 0 0', fontWeight:500 }}>Invita a más miembros en Ajustes</p>
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

              {/* AFK marquee */}
              {teamList.some(t=>t.isAFK) && (
                <div style={{ background:'rgba(231,76,60,0.08)', border:'1px solid rgba(231,76,60,0.2)', borderRadius:10, padding:'7px 12px', overflow:'hidden', whiteSpace:'nowrap' }}>
                  <div className="marquee-scroll" style={{ fontSize:11, fontWeight:700, color:'#E74C3C', display:'inline-block' }}>
                    {teamList.filter(t=>t.isAFK).map(t=>`${t.name} — ${t.statusText}`).join('   ·   ')}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── DEV TOOLS ── */}
          {activeTab === 'tools' && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {(['json','sql','unit','ts'] as const).map(t => {
                  const tabColors: Record<string,string> = { json:'#3498DB', sql:'#27AE60', unit:'#E67E22', ts:'#2563eb' };
                  const tabLabels: Record<string,string> = { json:'JSON', sql:'SQL', unit:'px↔rem', ts:'Timestamp' };
                  const c = tabColors[t];
                  return (
                    <button key={t} onClick={() => setToolType(t)} style={{
                      padding:'6px 10px', borderRadius:8, border:'1px solid',
                      borderColor: toolType===t ? c : 'rgba(255,255,255,0.1)',
                      background: toolType===t ? `${c}18` : 'transparent',
                      color: toolType===t ? c : 'rgba(255,255,255,0.45)',
                      fontSize:10, fontWeight:700, cursor:'pointer', transition:'all 0.15s',
                    }}>{tabLabels[t]}</button>
                  );
                })}
              </div>

              {/* Timestamp converter */}
              {toolType === 'ts' && (
                <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                  <p style={{ margin:0, fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.1em' }}>
                    UNIX Timestamp → Fecha
                  </p>
                  <div style={{ display:'flex', gap:8 }}>
                    <input
                      type="text"
                      placeholder="ej: 1749369838"
                      value={tsInput}
                      onChange={e => { setTsInput(e.target.value); setTsResult(null); }}
                      onKeyDown={e => e.key === 'Enter' && handleConvertTs()}
                      style={{ flex:1, background:'rgba(0,0,0,0.35)', border:'1px solid rgba(37,99,235,0.25)', borderRadius:10, padding:'9px 12px', color:'#fff', fontSize:12, fontFamily:'monospace', outline:'none', boxSizing:'border-box' }}
                    />
                    <button onClick={handleConvertTs} style={{
                      padding:'9px 14px', borderRadius:10, background:'#2563eb', border:'none',
                      color:'#fff', fontWeight:700, fontSize:11, cursor:'pointer',
                      display:'flex', alignItems:'center', gap:6, flexShrink:0,
                    }}>
                      <Zap size={13}/> Convertir
                    </button>
                  </div>

                  {/* Botón "Ahora" */}
                  <button onClick={() => { const now = String(Math.floor(Date.now()/1000)); setTsInput(now); setTsResult(null); }}
                    style={{ alignSelf:'flex-start', padding:'4px 10px', borderRadius:7, background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.25)', color:'#60a5fa', fontSize:10, fontWeight:700, cursor:'pointer' }}>
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
                          padding:'10px 12px',
                          background:'rgba(15,18,28,0.8)', borderRadius:10,
                          border:'1px solid rgba(255,255,255,0.06)',
                          borderLeft:'3px solid #2563eb',
                        }}>
                          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:5 }}>
                            <span style={{ fontSize:9, fontWeight:900, color:'#ffffff', textTransform:'uppercase', letterSpacing:'0.1em' }}>{label}</span>
                            <button onClick={() => { navigator.clipboard.writeText(value); toast.success("Copiado"); }}
                              style={{ padding:4, background:'rgba(37,99,235,0.1)', border:'1px solid rgba(37,99,235,0.2)', color:'#60a5fa', cursor:'pointer', borderRadius:6, transition:'all 0.15s', display:'flex' }}
                              onMouseEnter={e => { e.currentTarget.style.background='rgba(37,99,235,0.25)'; e.currentTarget.style.borderColor='rgba(37,99,235,0.5)'; }}
                              onMouseLeave={e => { e.currentTarget.style.background='rgba(37,99,235,0.1)'; e.currentTarget.style.borderColor='rgba(37,99,235,0.2)'; }}>
                              <Copy size={10}/>
                            </button>
                          </div>
                          <span style={{ fontSize:13, fontWeight:600, color:'#e2e8f0', fontFamily:'monospace', wordBreak:'break-all', lineHeight:1.4 }}>{value}</span>
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
                </>
              )}
            </div>
          )}

          {/* ── STAGING ── */}
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
        .marquee-scroll { animation: marquee 18s linear infinite; }
        @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
      `}</style>
    </>
  );
}
