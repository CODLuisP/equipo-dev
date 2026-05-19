"use client";

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import {
  Users, Code, Plus, Trash2, ZoomIn, ZoomOut, Maximize,
  ChevronRight, FileText, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import type { Member, Note, DrawingPath, BoardImage, BoardShape, CustomShape } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";

// ─── Pizarra Helpers ──────────────────────────────────────────────────────────

function ToolBtn({ active, onClick, icon, title }: any) {
  return <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-all ${active?'bg-[#E85D2F] text-white':'text-gray-500 hover:text-white hover:bg-white/5'}`}>{icon}</button>;
}

function DraggableImage({ image, onDrag, disabled, zoom, isSelected, isInMultiSelect, dragOffset, onMultiDragStart, onSelect }: any) {
  const [pos, setPos] = useState({ x:image.x, y:image.y, w:image.width, h:image.height });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir]   = useState<string|null>(null);
  useEffect(() => {
    if (!isDragging && !resizeDir) setPos({ x:image.x, y:image.y, w:image.width, h:image.height });
  }, [image.x, image.y, image.width, image.height]);
  useEffect(() => {
    const onMM=(e:MouseEvent)=>{
      if (isDragging) setPos(p=>({...p,x:p.x+e.movementX/zoom,y:p.y+e.movementY/zoom}));
      if (resizeDir) setPos(p=>{ let{x,y,w,h}=p; const dx=e.movementX/zoom,dy=e.movementY/zoom; if(resizeDir.includes('e'))w+=dx; if(resizeDir.includes('w')){x+=dx;w-=dx;} if(resizeDir.includes('s'))h+=dy; if(resizeDir.includes('n')){y+=dy;h-=dy;} if(resizeDir==='se'||resizeDir==='nw')h=w/(image.width/image.height); return{x,y,w:Math.max(20,w),h:Math.max(20,h)}; });
    };
    const onMU=()=>{ if(isDragging||resizeDir){setIsDragging(false);setResizeDir(null);onDrag(image.id,pos.x,pos.y,pos.w,pos.h);} };
    if(isDragging||resizeDir){window.addEventListener('mousemove',onMM);window.addEventListener('mouseup',onMU);}
    return()=>{window.removeEventListener('mousemove',onMM);window.removeEventListener('mouseup',onMU);};
  },[isDragging,resizeDir,pos,image.id,onDrag,zoom,image.width,image.height]);
  const dx = isInMultiSelect && dragOffset ? dragOffset.x : 0;
  const dy = isInMultiSelect && dragOffset ? dragOffset.y : 0;
  const shadow = isSelected
    ? `0 0 0 2px #E85D2F,0 10px 30px rgba(0,0,0,0.5)`
    : isInMultiSelect
    ? `0 0 0 2px rgba(232,93,47,0.55),0 0 24px rgba(232,93,47,0.25)`
    : `0 10px 30px rgba(0,0,0,0.3)`;
  return (
    <div style={{ position:'absolute',left:pos.x+dx,top:pos.y+dy,width:pos.w,height:pos.h,zIndex:(isDragging||resizeDir)?49:9,cursor:disabled?'inherit':(isInMultiSelect?'grab':(isDragging?'grabbing':'grab')),boxShadow:shadow,pointerEvents:'auto' }}
      onMouseDown={(e)=>{ if(disabled)return; e.stopPropagation(); if(isInMultiSelect){ onMultiDragStart(); return; } onSelect(); setIsDragging(true); }} className="group select-none">
      <img src={image.src} className={`w-full h-full object-cover border ${isSelected ? 'rounded-none border-dashed border-white/40' : isInMultiSelect ? 'rounded-xl border-dashed border-orange-400/60' : 'rounded-xl border-white/10'}`} draggable="false"/>
      {isSelected&&!disabled&&(['nw','ne','sw','se'] as const).map(dir=>(
        <div key={dir} onMouseDown={e=>{e.stopPropagation();onSelect();setResizeDir(dir);}}
          className={`absolute w-2 h-2 bg-[#0A0C0F] border border-white/40 z-50 ${dir==='nw'?'-top-1 -left-1 cursor-nw-resize':dir==='ne'?'-top-1 -right-1 cursor-ne-resize':dir==='sw'?'-bottom-1 -left-1 cursor-sw-resize':'-bottom-1 -right-1 cursor-se-resize'}`}/>
      ))}
    </div>
  );
}

function DraggableNote({ note, members, onDrag, disabled, zoom, isSelected, isInMultiSelect, dragOffset, onMultiDragStart, onSelect }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<string|null>(null);
  const [pos, setPos] = useState({ x: note.x, y: note.y, fs: note.fontSize || 18 });
  const [tbSnap, setTbSnap] = useState({ t: 0, b: 0 });
  const author = members.find((m: any) => m.id === note.authorId);
  const isText = note.type === 'text';

  useEffect(() => {
    if (!isDragging && !resizeDir) setPos({ x: note.x, y: note.y, fs: note.fontSize || 18 });
  }, [note.x, note.y, note.fontSize]);

  useEffect(() => {
    const onMM = (e: MouseEvent) => {
      if (isDragging) {
        setPos(p => ({ ...p, x: p.x + e.movementX / zoom, y: p.y + e.movementY / zoom }));
      } else if (resizeDir) {
        const dx = e.movementX / zoom;
        const dy = e.movementY / zoom;
        const factor = (resizeDir.includes('e') ? dx : -dx) + (resizeDir.includes('s') ? dy : -dy);
        setPos(p => ({
          ...p,
          x: resizeDir.includes('w') ? p.x + dx : p.x,
          y: resizeDir.includes('n') ? p.y + dy : p.y,
          fs: Math.max(8, Math.min(1000, p.fs + factor * 0.5))
        }));
      }
    };
    const onMU = () => {
      if (isDragging || resizeDir) {
        onDrag(note.id, pos.x, pos.y, { fontSize: pos.fs });
        setIsDragging(false);
        setResizeDir(null);
      }
    };
    if (isDragging || resizeDir) {
      window.addEventListener('mousemove', onMM);
      window.addEventListener('mouseup', onMU);
    }
    return () => {
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('mouseup', onMU);
    };
  }, [isDragging, resizeDir, pos, note.id, onDrag, zoom]);

  useLayoutEffect(() => {
    if (!isText) return;
    // Measure where the CSS alphabetic baseline actually sits within a line-height:1 box
    const probe = document.createElement('div');
    probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;` +
      `font:bold ${pos.fs}px "DM Sans",system-ui,sans-serif;line-height:1;padding:0;border:0;margin:0;`;
    const sTop = document.createElement('span');
    sTop.style.cssText = 'vertical-align:top;display:inline-block;height:0;width:0;';
    const sBl = document.createElement('span');
    sBl.style.cssText = 'vertical-align:baseline;display:inline-block;height:0;width:0;';
    probe.appendChild(sTop);
    probe.appendChild(sBl);
    document.body.appendChild(probe);
    const baselineY = sBl.getBoundingClientRect().top - sTop.getBoundingClientRect().top;
    document.body.removeChild(probe);
    // actualBoundingBoxAscent/Descent are always relative to the alphabetic baseline
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = `bold ${pos.fs}px "DM Sans", system-ui, sans-serif`;
    const sample = note.content.trim() || 'Ay';
    const m = ctx.measureText(sample);
    const aba = m.actualBoundingBoxAscent ?? pos.fs * 0.56;
    const abd = m.actualBoundingBoxDescent ?? 0;
    const t = Math.max(0, baselineY - aba);
    const b = Math.max(0, pos.fs - baselineY - abd);
    setTbSnap(prev => (Math.abs(prev.t - t) > 0.4 || Math.abs(prev.b - b) > 0.4) ? { t, b } : prev);
  }, [pos.fs, note.content, isText]);

  const ndx = isInMultiSelect && dragOffset ? dragOffset.x : 0;
  const ndy = isInMultiSelect && dragOffset ? dragOffset.y : 0;

  return (
    <div style={{
      position:'absolute',
      left:pos.x + ndx,
      top:pos.y + ndy,
      background: isText ? 'transparent' : "#1C1F26",
      border: isText
        ? '1px solid transparent'
        : (isInMultiSelect ? `1px dashed rgba(232,93,47,0.7)` : `1px solid ${note.color}40`),
      boxShadow: isInMultiSelect && !isSelected ? '0 0 0 1.5px rgba(232,93,47,0.4), 0 0 18px rgba(232,93,47,0.15)' : undefined,
      width: isText ? 'auto' : 220,
      transform: isText ? 'none' : `rotate(${((note.createdAt%10)-5)/2}deg)`,
      pointerEvents:'auto'
    }}
      onMouseDown={e=>{ if(disabled||(e.target as HTMLElement).closest('button'))return; e.stopPropagation(); if(isInMultiSelect){ onMultiDragStart(); return; } onSelect(); setIsDragging(true); }}
      className={`${isText ? 'rounded-none p-0' : 'rounded-xl p-4'} select-none group`}>

      {isText && (isSelected || isInMultiSelect) && (
        <div style={{
          position: 'absolute',
          top: tbSnap.t,
          bottom: tbSnap.b,
          left: 0,
          right: 0,
          border: isSelected ? '1px dashed rgba(255,255,255,0.4)' : '1px dashed rgba(232,93,47,0.6)',
          pointerEvents: 'none',
          borderRadius: 2,
        }}>
          {isSelected && !disabled && (['nw','ne','sw','se'] as const).map(dir => (
            <div key={dir}
              onMouseDown={e => { e.stopPropagation(); onSelect(); setResizeDir(dir); }}
              style={{ pointerEvents: 'all' }}
              className={`absolute w-2 h-2 bg-[#0A0C0F] border border-white/40 z-10 rounded-sm
                ${dir === 'nw' ? '-top-1 -left-1 cursor-nw-resize' : ''}
                ${dir === 'ne' ? '-top-1 -right-1 cursor-ne-resize' : ''}
                ${dir === 'sw' ? '-bottom-1 -left-1 cursor-sw-resize' : ''}
                ${dir === 'se' ? '-bottom-1 -right-1 cursor-se-resize' : ''}
              `}
            />
          ))}
        </div>
      )}

      {!isText && (
        <div className="flex items-center gap-2 mb-3">
          {author
            ? <AvatarImg seed={author.avatarSeed || author.name} name={author.name} color={author.color} size={20} borderRadius={6} />
            : <div style={{ width:20, height:20, borderRadius:6, background: note.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:800, color:'#fff' }}>?</div>
          }
          <span className="text-[10px] text-gray-400 font-bold">{author?.name}</span>
        </div>
      )}

      <p className={`whitespace-pre-wrap ${isText ? 'font-bold' : 'text-xs text-gray-200 leading-relaxed'}`}
         style={{ color: isText ? note.color : undefined, fontSize: isText ? pos.fs : undefined, lineHeight: isText ? 1 : undefined, margin: 0, padding: 0 }}>
        {note.content}
      </p>
    </div>
  );
}

// ─── Dev Shapes ───────────────────────────────────────────────────────────────
// defaultW/H proporcionales al viewBox de cada forma (vb = "x y w h")
const DEV_SHAPES = [
  { type: 'database',     label: 'Base de Datos',  defaultW: 80,  defaultH: 70,  color: '#F39C12' },
  { type: 'server',       label: 'Servidor',        defaultW: 80,  defaultH: 82,  color: '#95A5A6' },
  { type: 'cloud',        label: 'Cloud',           defaultW: 110, defaultH: 64,  color: '#5DADE2' },
  { type: 'monitor',      label: 'Computadora',     defaultW: 108, defaultH: 96,  color: '#85C1E9' },
  { type: 'mobile',       label: 'Móvil',           defaultW: 50,  defaultH: 95,  color: '#2ECC71' },
  { type: 'browser',      label: 'Browser',         defaultW: 108, defaultH: 102, color: '#3498DB' },
  { type: 'terminal',     label: 'Terminal',        defaultW: 108, defaultH: 102, color: '#1ABC9C' },
  { type: 'api',          label: 'API',             defaultW: 110, defaultH: 63,  color: '#E67E22' },
  { type: 'microservice', label: 'Microservicio',   defaultW: 80,  defaultH: 96,  color: '#9B59B6' },
  { type: 'router',       label: 'Router',          defaultW: 90,  defaultH: 90,  color: '#E74C3C' },
  { type: 'loadbalancer', label: 'Load Balancer',   defaultW: 96,  defaultH: 82,  color: '#E85D2F' },
  { type: 'docker',       label: 'Docker',          defaultW: 100, defaultH: 82,  color: '#2980B9' },
  { type: 'git',          label: 'Git',             defaultW: 88,  defaultH: 88,  color: '#E74C3C' },
  { type: 'user',         label: 'Usuario',         defaultW: 80,  defaultH: 91,  color: '#85C1E9' },
  { type: 'globe',        label: 'Internet',        defaultW: 88,  defaultH: 88,  color: '#5DADE2' },
  { type: 'lock',         label: 'Seguridad',       defaultW: 70,  defaultH: 90,  color: '#F1C40F' },
  { type: 'storage',      label: 'Almacenamiento',  defaultW: 96,  defaultH: 64,  color: '#95A5A6' },
  { type: 'queue',        label: 'Queue',           defaultW: 100, defaultH: 84,  color: '#E67E22' },
  { type: 'cache',        label: 'Caché',           defaultW: 88,  defaultH: 88,  color: '#1ABC9C' },
  { type: 'firewall',     label: 'Firewall',        defaultW: 80,  defaultH: 93,  color: '#E74C3C' },
];

// viewBox ajustado al contenido real de cada forma (sin márgenes sobrantes)
const SHAPE_VB: Record<string, string> = {
  database:     '4 2 32 28',
  server:       '3 2 34 35',
  cloud:        '8 11 35 23',
  monitor:      '2 2 36 32',
  mobile:       '10 1 20 38',
  browser:      '2 3 36 34',
  terminal:     '2 3 36 34',
  api:          '0 8 40 23',
  microservice: '5 2 30 36',
  router:       '1 1 38 38',
  loadbalancer: '3 3 34 29',
  docker:       '2 5 38 31',
  git:          '2 2 36 36',
  user:         '5 4 30 34',
  globe:        '3 3 34 34',
  lock:         '8 5 24 31',
  storage:      '4 5 32 24',
  queue:        '2 4 38 32',
  cache:        '3 3 34 34',
  firewall:     '4 2 32 37',
};

function ShapeSvg({ type, color, width, height, customTemplates }: { type: string; color: string; width: number; height: number; customTemplates?: CustomShape[] }) {
  const custom = customTemplates?.find(t => t.id === type);
  if (custom) {
    return (
      <svg viewBox={custom.viewBox} width={width} height={height}
        xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet"
        dangerouslySetInnerHTML={{ __html: custom.svgContent }}
      />
    );
  }
  const s = color, f = color + '22', sw = 2;
  const el: Record<string, React.ReactNode> = {
    database: <><ellipse cx="20" cy="8" rx="15" ry="5" stroke={s} strokeWidth={sw} fill={f}/><rect x="5" y="8" width="30" height="20" fill={f} stroke="none"/><line x1="5" y1="8" x2="5" y2="28" stroke={s} strokeWidth={sw}/><line x1="35" y1="8" x2="35" y2="28" stroke={s} strokeWidth={sw}/><ellipse cx="20" cy="18" rx="15" ry="5" stroke={s} strokeWidth={sw} fill={f}/><ellipse cx="20" cy="28" rx="15" ry="5" stroke={s} strokeWidth={sw} fill={f}/></>,
    server: <><rect x="4" y="3" width="32" height="9" rx="2" stroke={s} strokeWidth={sw} fill={f}/><circle cx="30" cy="7.5" r="1.5" fill={s}/><rect x="4" y="15" width="32" height="9" rx="2" stroke={s} strokeWidth={sw} fill={f}/><circle cx="30" cy="19.5" r="1.5" fill={s}/><rect x="4" y="27" width="32" height="9" rx="2" stroke={s} strokeWidth={sw} fill={f}/><circle cx="30" cy="31.5" r="1.5" fill={s}/></>,
    cloud: <path d="M9 29 Q9 21 17 21 Q18 12 26 12 Q35 12 36 21 Q42 21 42 27 Q42 33 36 33 H14 Q9 33 9 29 Z" stroke={s} strokeWidth={sw} fill={f}/>,
    monitor: <><rect x="3" y="3" width="34" height="24" rx="2" stroke={s} strokeWidth={sw} fill={f}/><line x1="3" y1="22" x2="37" y2="22" stroke={s} strokeWidth={sw}/><line x1="20" y1="27" x2="20" y2="33" stroke={s} strokeWidth={sw}/><line x1="13" y1="33" x2="27" y2="33" stroke={s} strokeWidth={sw}/></>,
    mobile: <><rect x="11" y="2" width="18" height="36" rx="4" stroke={s} strokeWidth={sw} fill={f}/><circle cx="20" cy="33" r="2" stroke={s} strokeWidth={sw} fill="none"/><line x1="16" y1="6" x2="24" y2="6" stroke={s} strokeWidth={sw} strokeLinecap="round"/></>,
    browser: <><rect x="3" y="4" width="34" height="32" rx="3" stroke={s} strokeWidth={sw} fill={f}/><line x1="3" y1="13" x2="37" y2="13" stroke={s} strokeWidth={sw}/><circle cx="8" cy="8.5" r="1.5" fill={s} opacity="0.7"/><circle cx="13" cy="8.5" r="1.5" fill={s} opacity="0.7"/><rect x="18" y="6" width="15" height="5" rx="2" stroke={s} strokeWidth="1" fill="none" opacity="0.5"/></>,
    terminal: <><rect x="3" y="4" width="34" height="32" rx="3" stroke={s} strokeWidth={sw} fill={f}/><line x1="3" y1="13" x2="37" y2="13" stroke={s} strokeWidth={sw}/><circle cx="8" cy="8.5" r="1.5" fill="#E74C3C"/><circle cx="13" cy="8.5" r="1.5" fill="#F1C40F"/><circle cx="18" cy="8.5" r="1.5" fill="#2ECC71"/><text x="7" y="25" fill={s} fontSize="9" fontFamily="monospace" opacity="0.9">$ _</text></>,
    api: <><rect x="5" y="9" width="30" height="22" rx="4" stroke={s} strokeWidth={sw} fill={f}/><text x="20" y="23" textAnchor="middle" fill={s} fontSize="9" fontWeight="bold" fontFamily="monospace" dominantBaseline="middle">API</text><path d="M1 15 L5 20 L1 25" stroke={s} strokeWidth={sw} fill="none"/><path d="M39 15 L35 20 L39 25" stroke={s} strokeWidth={sw} fill="none"/></>,
    microservice: <polygon points="20,3 34,11 34,29 20,37 6,29 6,11" stroke={s} strokeWidth={sw} fill={f}/>,
    router: <><circle cx="20" cy="20" r="10" stroke={s} strokeWidth={sw} fill={f}/><line x1="20" y1="4" x2="20" y2="10" stroke={s} strokeWidth={sw}/><line x1="20" y1="30" x2="20" y2="36" stroke={s} strokeWidth={sw}/><line x1="4" y1="20" x2="10" y2="20" stroke={s} strokeWidth={sw}/><line x1="30" y1="20" x2="36" y2="20" stroke={s} strokeWidth={sw}/><circle cx="20" cy="3" r="2" fill={s}/><circle cx="20" cy="37" r="2" fill={s}/><circle cx="3" cy="20" r="2" fill={s}/><circle cx="37" cy="20" r="2" fill={s}/></>,
    loadbalancer: <><path d="M20 4 L36 16 H4 Z" stroke={s} strokeWidth={sw} fill={f}/><line x1="20" y1="16" x2="10" y2="26" stroke={s} strokeWidth={sw}/><line x1="20" y1="16" x2="20" y2="26" stroke={s} strokeWidth={sw}/><line x1="20" y1="16" x2="30" y2="26" stroke={s} strokeWidth={sw}/><circle cx="10" cy="30" r="4" stroke={s} strokeWidth={sw} fill={f}/><circle cx="20" cy="30" r="4" stroke={s} strokeWidth={sw} fill={f}/><circle cx="30" cy="30" r="4" stroke={s} strokeWidth={sw} fill={f}/></>,
    docker: <><rect x="3" y="16" width="30" height="18" rx="3" stroke={s} strokeWidth={sw} fill={f}/><rect x="7" y="20" width="5" height="5" rx="1" stroke={s} strokeWidth={sw} fill="none"/><rect x="14" y="20" width="5" height="5" rx="1" stroke={s} strokeWidth={sw} fill="none"/><rect x="21" y="20" width="5" height="5" rx="1" stroke={s} strokeWidth={sw} fill="none"/><rect x="14" y="12" width="5" height="5" rx="1" stroke={s} strokeWidth={sw} fill="none"/><rect x="21" y="12" width="5" height="5" rx="1" stroke={s} strokeWidth={sw} fill="none"/><path d="M33 18 Q39 14 35 8" stroke={s} strokeWidth={sw} fill="none"/><circle cx="35" cy="6" r="2" fill={s}/></>,
    git: <><circle cx="8" cy="32" r="5" stroke={s} strokeWidth={sw} fill={f}/><circle cx="8" cy="8" r="5" stroke={s} strokeWidth={sw} fill={f}/><circle cx="32" cy="18" r="5" stroke={s} strokeWidth={sw} fill={f}/><line x1="8" y1="13" x2="8" y2="27" stroke={s} strokeWidth={sw}/><path d="M8 13 Q10 4 16 5 L27 14" stroke={s} strokeWidth={sw} fill="none"/></>,
    user: <><circle cx="20" cy="13" r="8" stroke={s} strokeWidth={sw} fill={f}/><path d="M6 37 Q6 25 20 25 Q34 25 34 37" stroke={s} strokeWidth={sw} fill={f}/></>,
    globe: <><circle cx="20" cy="20" r="16" stroke={s} strokeWidth={sw} fill={f}/><ellipse cx="20" cy="20" rx="7" ry="16" stroke={s} strokeWidth={sw} fill="none"/><line x1="4" y1="20" x2="36" y2="20" stroke={s} strokeWidth={sw}/><path d="M6 13 Q20 17 34 13" stroke={s} strokeWidth={sw} fill="none"/><path d="M6 27 Q20 23 34 27" stroke={s} strokeWidth={sw} fill="none"/></>,
    lock: <><rect x="9" y="18" width="22" height="17" rx="3" stroke={s} strokeWidth={sw} fill={f}/><path d="M13 18 V13 Q13 6 20 6 Q27 6 27 13 V18" stroke={s} strokeWidth={sw} fill="none"/><circle cx="20" cy="26" r="2.5" fill={s}/><line x1="20" y1="26" x2="20" y2="31" stroke={s} strokeWidth={sw}/></>,
    storage: <><ellipse cx="20" cy="12" rx="15" ry="6" stroke={s} strokeWidth={sw} fill={f}/><rect x="5" y="12" width="30" height="15" fill={f} stroke="none"/><line x1="5" y1="12" x2="5" y2="27" stroke={s} strokeWidth={sw}/><line x1="35" y1="12" x2="35" y2="27" stroke={s} strokeWidth={sw}/><ellipse cx="20" cy="27" rx="15" ry="6" stroke={s} strokeWidth={sw} fill={f}/><line x1="9" y1="17" x2="20" y2="17" stroke={s} strokeWidth="1.5" opacity="0.5"/></>,
    queue: <><rect x="3" y="5" width="30" height="8" rx="2" stroke={s} strokeWidth={sw} fill={f}/><rect x="3" y="16" width="30" height="8" rx="2" stroke={s} strokeWidth={sw} fill={f}/><rect x="3" y="27" width="30" height="8" rx="2" stroke={s} strokeWidth={sw} fill={f}/><path d="M35 9 L39 20 L35 31" stroke={s} strokeWidth={sw} fill="none" strokeLinecap="round"/></>,
    cache: <><circle cx="20" cy="20" r="16" stroke={s} strokeWidth={sw} fill={f}/><path d="M16 9 L12 20 H18 L14 31 L28 17 H22 L26 9 Z" stroke={s} strokeWidth="1.5" fill={s} opacity="0.45"/></>,
    firewall: <><path d="M20 3 L35 11 L35 27 Q35 35 20 38 Q5 35 5 27 L5 11 Z" stroke={s} strokeWidth={sw} fill={f}/><line x1="5" y1="18" x2="35" y2="18" stroke={s} strokeWidth="1.5" opacity="0.55"/><line x1="5" y1="24" x2="35" y2="24" stroke={s} strokeWidth="1.5" opacity="0.55"/><line x1="12" y1="11" x2="12" y2="35" stroke={s} strokeWidth="1.5" opacity="0.4"/><line x1="20" y1="11" x2="20" y2="38" stroke={s} strokeWidth="1.5" opacity="0.4"/><line x1="28" y1="11" x2="28" y2="35" stroke={s} strokeWidth="1.5" opacity="0.4"/></>,
  };
  return (
    <svg viewBox={SHAPE_VB[type] ?? '0 0 40 40'} width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
      {el[type] ?? null}
    </svg>
  );
}

function DraggableShape({ shape, customTemplates, onSave, disabled, zoom, isSelected, isInMultiSelect, dragOffset, onMultiDragStart, onSelect }: any) {
  const [pos, setPos] = useState({ x: shape.x, y: shape.y, w: shape.width, h: shape.height });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<string|null>(null);
  const info = DEV_SHAPES.find(s => s.type === shape.type);

  useEffect(() => {
    if (!isDragging && !resizeDir) setPos({ x: shape.x, y: shape.y, w: shape.width, h: shape.height });
  }, [shape.x, shape.y, shape.width, shape.height]);

  useEffect(() => {
    const onMM = (e: MouseEvent) => {
      if (isDragging) setPos(p => ({ ...p, x: p.x + e.movementX/zoom, y: p.y + e.movementY/zoom }));
      if (resizeDir) setPos(p => {
        let { x, y, w, h } = p;
        const dx = e.movementX/zoom, dy = e.movementY/zoom;
        if (resizeDir.includes('e')) w += dx; if (resizeDir.includes('w')) { x += dx; w -= dx; }
        if (resizeDir.includes('s')) h += dy; if (resizeDir.includes('n')) { y += dy; h -= dy; }
        return { x, y, w: Math.max(40, w), h: Math.max(40, h) };
      });
    };
    const onMU = () => { if (isDragging || resizeDir) { setIsDragging(false); setResizeDir(null); onSave(shape.id, pos.x, pos.y, pos.w, pos.h); } };
    if (isDragging || resizeDir) { window.addEventListener('mousemove', onMM); window.addEventListener('mouseup', onMU); }
    return () => { window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU); };
  }, [isDragging, resizeDir, pos, shape.id, onSave, zoom]);

  const dx = isInMultiSelect && dragOffset ? dragOffset.x : 0;
  const dy = isInMultiSelect && dragOffset ? dragOffset.y : 0;
  const border = isSelected
    ? '1px dashed rgba(255,255,255,0.4)'
    : isInMultiSelect
    ? '1px dashed rgba(232,93,47,0.6)'
    : '1px solid transparent';

  return (
    <div style={{ position:'absolute', left: pos.x+dx, top: pos.y+dy, width: pos.w, display:'flex', flexDirection:'column', alignItems:'center', cursor: disabled?'inherit':(isInMultiSelect?'grab':(isDragging?'grabbing':'grab')), zIndex: isDragging?49:9, userSelect:'none', pointerEvents:'auto' }}
      onMouseDown={e => { if (disabled) return; e.stopPropagation(); if (isInMultiSelect) { onMultiDragStart(); return; } onSelect(); setIsDragging(true); }}
      className="group select-none">
      <div style={{ position:'relative', width: pos.w, height: pos.h, border, borderRadius: 3 }}>
        <ShapeSvg type={shape.type} color={shape.color} width={pos.w} height={pos.h} customTemplates={customTemplates} />
        {isSelected && !disabled && (['nw','ne','sw','se'] as const).map(dir => (
          <div key={dir} onMouseDown={e => { e.stopPropagation(); onSelect(); setResizeDir(dir); }}
            className={`absolute w-2 h-2 bg-[#0A0C0F] border border-white/40 z-50 rounded-sm
              ${dir==='nw'?'-top-1 -left-1 cursor-nw-resize':dir==='ne'?'-top-1 -right-1 cursor-ne-resize':dir==='sw'?'-bottom-1 -left-1 cursor-sw-resize':'-bottom-1 -right-1 cursor-se-resize'}`}/>
        ))}
      </div>
      <span style={{ fontSize: 9, color: shape.color, fontWeight: 700, marginTop: 4, fontFamily: "'DM Sans', sans-serif", opacity: 0.85, pointerEvents:'none', letterSpacing:'0.02em' }}>
        {shape.label ?? info?.label}
      </span>
    </div>
  );
}

// ─── Shape Editor ─────────────────────────────────────────────────────────────
const EDITOR_COLORS = ['#F4F5F7','#E85D2F','#E74C3C','#F39C12','#2ECC71','#3498DB','#1ABC9C','#5DADE2','#9B59B6','#E67E22','#95A5A6','#000000'];

type DrawTool = 'pen' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'tri';
type FillMode = 'none' | 'light' | 'solid';
export type EStroke = { color: string; sw: number; fill: string } & (
  | { kind: 'path'; pts: {x:number;y:number}[] }
  | { kind: 'poly'; pts: {x:number;y:number}[] }
  | { kind: 'rect'; x:number; y:number; rw:number; rh:number }
  | { kind: 'ellipse'; cx:number; cy:number; rx:number; ry:number }
  | { kind: 'line'; x1:number; y1:number; x2:number; y2:number }
  | { kind: 'arrow'; x1:number; y1:number; x2:number; y2:number }
  | { kind: 'tri'; x1:number; y1:number; x2:number; y2:number }
);

function ptPath(pts: {x:number;y:number}[]): string {
  if (pts.length < 2) return '';
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i].x + pts[i+1].x) / 2).toFixed(1);
    const my = ((pts[i].y + pts[i+1].y) / 2).toFixed(1);
    d += ` Q${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)} ${mx},${my}`;
  }
  d += ` L${pts[pts.length-1].x.toFixed(1)},${pts[pts.length-1].y.toFixed(1)}`;
  return d;
}

function calcBBox(strokes: EStroke[]): {minX:number;minY:number;maxX:number;maxY:number} {
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  const ex=(x:number,y:number)=>{minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);};
  strokes.forEach(s=>{
    if(s.kind==='path'||s.kind==='poly') s.pts.forEach(p=>ex(p.x,p.y));
    else if(s.kind==='rect'){ex(s.x,s.y);ex(s.x+s.rw,s.y+s.rh);}
    else if(s.kind==='ellipse'){ex(s.cx-s.rx,s.cy-s.ry);ex(s.cx+s.rx,s.cy+s.ry);}
    else if(s.kind==='line'||s.kind==='arrow'){ex(s.x1,s.y1);ex(s.x2,s.y2);}
    else if(s.kind==='tri'){
      const mx=(s.x1+s.x2)/2;
      ex(s.x1,s.y2);ex(s.x2,s.y2);ex(mx,s.y1);
    }
  });
  return {minX,minY,maxX,maxY};
}

function renderEStroke(s: EStroke, i: number): React.ReactElement {
  const common = { stroke: s.color, strokeWidth: s.sw, fill: s.fill, strokeLinecap:'round' as const, strokeLinejoin:'round' as const };
  if (s.kind==='path') return <path key={i} {...common} d={ptPath(s.pts)}/>;
  if (s.kind==='poly') {
    const pts = s.pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    return <polygon key={i} {...common} points={pts}/>;
  }
  if (s.kind==='rect') return <rect key={i} {...common} x={Math.min(s.x,s.x+s.rw)} y={Math.min(s.y,s.y+s.rh)} width={Math.abs(s.rw)} height={Math.abs(s.rh)} rx={3}/>;
  if (s.kind==='ellipse') return <ellipse key={i} {...common} cx={s.cx} cy={s.cy} rx={Math.abs(s.rx)} ry={Math.abs(s.ry)}/>;
  if (s.kind==='line') return <line key={i} {...common} fill="none" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}/>;
  if (s.kind==='arrow') {
    const dx=s.x2-s.x1,dy=s.y2-s.y1,len=Math.sqrt(dx*dx+dy*dy)||1;
    const ux=dx/len,uy=dy/len,hw=Math.max(s.sw*3.5,10);
    const lx=s.x2-ux*hw-uy*hw*0.4,ly=s.y2-uy*hw+ux*hw*0.4;
    const rx2=s.x2-ux*hw+uy*hw*0.4,ry2=s.y2-uy*hw-ux*hw*0.4;
    return <g key={i}>
      <line {...common} fill="none" x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2}/>
      <polygon {...common} fill={s.color} points={`${s.x2},${s.y2} ${lx},${ly} ${rx2},${ry2}`}/>
    </g>;
  }
  if (s.kind==='tri') {
    const mx=(s.x1+s.x2)/2;
    return <polygon key={i} {...common} points={`${mx},${s.y1} ${s.x2},${s.y2} ${s.x1},${s.y2}`}/>;
  }
  return <g key={i}/>;
}

function strokeToSvgStr(s: EStroke, nx:(x:number)=>number, ny:(y:number)=>number): string {
  const strokeAttr = `stroke="${s.color}" stroke-width="${s.sw}" fill="${s.fill}" stroke-linecap="round" stroke-linejoin="round"`;
  if (s.kind==='path') {
    const pts2 = s.pts.map(p=>({x:nx(p.x),y:ny(p.y)}));
    return `<path d="${ptPath(pts2)}" ${strokeAttr}/>`;
  }
  if (s.kind==='poly') {
    const pts2 = s.pts.map(p=>`${nx(p.x).toFixed(2)},${ny(p.y).toFixed(2)}`).join(' ');
    return `<polygon points="${pts2}" ${strokeAttr}/>`;
  }
  if (s.kind==='rect') {
    const x=Math.min(nx(s.x),nx(s.x+s.rw)),y=Math.min(ny(s.y),ny(s.y+s.rh));
    const w=Math.abs(nx(s.x+s.rw)-nx(s.x)),h=Math.abs(ny(s.y+s.rh)-ny(s.y));
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="2" ${strokeAttr}/>`;
  }
  if (s.kind==='ellipse') {
    const cx=nx(s.cx),cy=ny(s.cy),rx=Math.abs(nx(s.cx+s.rx)-nx(s.cx)),ry=Math.abs(ny(s.cy+s.ry)-ny(s.cy));
    return `<ellipse cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" rx="${rx.toFixed(2)}" ry="${ry.toFixed(2)}" ${strokeAttr}/>`;
  }
  if (s.kind==='line') return `<line x1="${nx(s.x1).toFixed(2)}" y1="${ny(s.y1).toFixed(2)}" x2="${nx(s.x2).toFixed(2)}" y2="${ny(s.y2).toFixed(2)}" ${strokeAttr} fill="none"/>`;
  if (s.kind==='arrow') {
    const dx=s.x2-s.x1,dy=s.y2-s.y1,len=Math.sqrt(dx*dx+dy*dy)||1;
    const ux=dx/len,uy=dy/len,hw=Math.max(s.sw*3.5,10);
    const lx=nx(s.x2-ux*hw-uy*hw*0.4),ly=ny(s.y2-uy*hw+ux*hw*0.4);
    const rx2=nx(s.x2-ux*hw+uy*hw*0.4),ry2=ny(s.y2-uy*hw-ux*hw*0.4);
    return `<line x1="${nx(s.x1).toFixed(2)}" y1="${ny(s.y1).toFixed(2)}" x2="${nx(s.x2).toFixed(2)}" y2="${ny(s.y2).toFixed(2)}" ${strokeAttr} fill="none"/>` +
      `<polygon points="${nx(s.x2).toFixed(2)},${ny(s.y2).toFixed(2)} ${lx.toFixed(2)},${ly.toFixed(2)} ${rx2.toFixed(2)},${ry2.toFixed(2)}" stroke="${s.color}" stroke-width="${s.sw}" fill="${s.color}"/>`;
  }
  if (s.kind==='tri') {
    const mx=(s.x1+s.x2)/2;
    return `<polygon points="${nx(mx).toFixed(2)},${ny(s.y1).toFixed(2)} ${nx(s.x2).toFixed(2)},${ny(s.y2).toFixed(2)} ${nx(s.x1).toFixed(2)},${ny(s.y2).toFixed(2)}" ${strokeAttr}/>`;
  }
  return '';
}

function ptDist(a:{x:number;y:number}, b:{x:number;y:number}) {
  const dx=a.x-b.x, dy=a.y-b.y; return Math.sqrt(dx*dx+dy*dy);
}

function dougPeucker(pts:{x:number;y:number}[], eps:number): {x:number;y:number}[] {
  if (pts.length < 3) return pts;
  const p1=pts[0], pN=pts[pts.length-1];
  const dx=pN.x-p1.x, dy=pN.y-p1.y, len=Math.sqrt(dx*dx+dy*dy)||1;
  let maxD=0, idx=1;
  for (let i=1; i<pts.length-1; i++) {
    const d = Math.abs(dy*pts[i].x - dx*pts[i].y + pN.x*p1.y - pN.y*p1.x) / len;
    if (d > maxD) { maxD=d; idx=i; }
  }
  if (maxD > eps) {
    return [...dougPeucker(pts.slice(0,idx+1),eps).slice(0,-1), ...dougPeucker(pts.slice(idx),eps)];
  }
  return [p1, pN];
}

function remasterStrokes(strokes: EStroke[]): EStroke[] {
  return strokes.map(s => {
    if (s.kind !== 'path') return s;
    const pts = s.pts;
    if (pts.length < 4) return s;
    let totalLen = 0;
    for (let i=1; i<pts.length; i++) totalLen += ptDist(pts[i-1], pts[i]);
    if (totalLen < 8) return s;
    // Remove jitter while keeping the shape — the bezier in ptPath then curves through the control points
    const smoothed = dougPeucker(pts, totalLen * 0.025);
    return { ...s, pts: smoothed };
  });
}

const TOOL_DEFS: {id: DrawTool; label: string; icon: React.ReactElement}[] = [
  { id:'pen',    label:'Lápiz',     icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 14 L5 11 L13 3 L13 6 L2 14Z"/><path d="M11 5l2 2"/></svg> },
  { id:'rect',   label:'Rectángulo',icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="12" height="8" rx="1.5"/></svg> },
  { id:'ellipse',label:'Elipse',    icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="8" cy="8" rx="6" ry="4"/></svg> },
  { id:'line',   label:'Línea',     icon:<svg viewBox="0 0 16 16" width={14} height={14} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="14" x2="14" y2="2"/></svg> },
  { id:'arrow',  label:'Flecha',    icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="14" x2="13" y2="3"/><polyline points="7,3 13,3 13,9"/></svg> },
  { id:'tri',    label:'Triángulo', icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 15,14 1,14"/></svg> },
];

function ShapeEditor({ onSave, onCancel }: { onSave: (s: CustomShape) => void; onCancel: () => void }) {
  const [strokes, setStrokes] = useState<EStroke[]>([]);
  const [tool, setTool] = useState<DrawTool>('pen');
  const [fillMode, setFillMode] = useState<FillMode>('none');
  const [color, setColor] = useState('#E85D2F');
  const [sw, setSw] = useState(2.5);
  const [label, setLabel] = useState('');
  const [curPts, setCurPts] = useState<{x:number;y:number}[]|null>(null);
  const [dragStart, setDragStart] = useState<{x:number;y:number}|null>(null);
  const [dragCur, setDragCur] = useState<{x:number;y:number}|null>(null);
  const [remastered, setRemastered] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const SIZE = 340;

  const hasPenStrokes = strokes.some(s => s.kind === 'path');

  const handleRemaster = () => {
    setStrokes(prev => remasterStrokes(prev));
    setRemastered(true);
    setTimeout(() => setRemastered(false), 1400);
  };

  const getFill = () => {
    if (fillMode==='none') return 'none';
    if (fillMode==='light') return color+'33';
    return color;
  };

  const getpt = (e: React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const buildPreview = (): EStroke|null => {
    if (!dragStart || !dragCur) return null;
    const f = getFill();
    if (tool==='rect') return {kind:'rect',color,sw,fill:f,x:dragStart.x,y:dragStart.y,rw:dragCur.x-dragStart.x,rh:dragCur.y-dragStart.y};
    if (tool==='ellipse') return {kind:'ellipse',color,sw,fill:f,cx:(dragStart.x+dragCur.x)/2,cy:(dragStart.y+dragCur.y)/2,rx:Math.abs(dragCur.x-dragStart.x)/2,ry:Math.abs(dragCur.y-dragStart.y)/2};
    if (tool==='line') return {kind:'line',color,sw,fill:'none',x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
    if (tool==='arrow') return {kind:'arrow',color,sw,fill:'none',x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
    if (tool==='tri') return {kind:'tri',color,sw,fill:f,x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
    return null;
  };

  const onDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const p = getpt(e);
    if (tool==='pen') { setCurPts([p]); return; }
    setDragStart(p); setDragCur(p);
  };
  const onMove = (e: React.MouseEvent) => {
    if (tool==='pen') { if (!curPts) return; setCurPts(prev => [...(prev||[]), getpt(e)]); return; }
    if (!dragStart) return;
    setDragCur(getpt(e));
  };
  const onUp = () => {
    if (tool==='pen') {
      if (curPts && curPts.length > 1) setStrokes(p => [...p, {kind:'path',color,sw,fill:'none',pts:curPts}]);
      setCurPts(null); return;
    }
    const prev = buildPreview();
    if (prev) setStrokes(p => [...p, prev]);
    setDragStart(null); setDragCur(null);
  };

  const handleSave = () => {
    if (strokes.length === 0) return;
    const bb = calcBBox(strokes);
    const bw=Math.max(bb.maxX-bb.minX,1),bh=Math.max(bb.maxY-bb.minY,1);
    const nx=(x:number)=>(x-bb.minX)/bw*100;
    const ny=(y:number)=>(y-bb.minY)/bh*100;
    const svgContent = strokes.map(s=>strokeToSvgStr(s,nx,ny)).join('');
    const aspect=bw/bh;
    const dw=Math.min(Math.round(aspect>=1?100:100*aspect),120);
    const dh=Math.min(Math.round(aspect>=1?100/aspect:100),120);
    onSave({id:crypto.randomUUID(),label:label.trim()||'Mi Forma',svgContent,viewBox:'0 0 100 100',defaultW:dw,defaultH:dh});
  };

  const preview = buildPreview();
  const closedTools: DrawTool[] = ['rect','ellipse','tri'];
  const isClosed = closedTools.includes(tool);

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.8)',backdropFilter:'blur(8px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={e=>{if(e.target===e.currentTarget)onCancel();}}>
      <div style={{background:'rgba(14,17,24,0.99)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:22,padding:22,display:'flex',flexDirection:'column',gap:14,boxShadow:'0 32px 80px rgba(0,0,0,0.8)',width:SIZE+56}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{margin:0,fontWeight:800,fontSize:15,color:'#F4F5F7'}}>Crear Forma</p>
            <p style={{margin:0,fontSize:11,color:'#5A6270',marginTop:2}}>Dibuja con herramientas — se guarda en el panel</p>
          </div>
          <button onClick={onCancel} style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#8A9099',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 12 12" width={11} height={11} stroke="currentColor" strokeWidth="2"><path d="M2 2l8 8M10 2l-8 8"/></svg>
          </button>
        </div>

        {/* Tool selector */}
        <div style={{display:'flex',gap:5}}>
          {TOOL_DEFS.map(t=>(
            <button key={t.id} onClick={()=>setTool(t.id)} title={t.label}
              style={{flex:1,height:32,borderRadius:8,background:tool===t.id?'rgba(232,93,47,0.25)':'rgba(255,255,255,0.05)',border:`1px solid ${tool===t.id?'rgba(232,93,47,0.7)':'rgba(255,255,255,0.08)'}`,color:tool===t.id?'#E85D2F':'#8A9099',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s'}}>
              {t.icon}
            </button>
          ))}
        </div>

        {/* Colors + stroke + fill */}
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:4,flexWrap:'wrap',flex:1}}>
            {EDITOR_COLORS.map(c=>(
              <button key={c} onClick={()=>setColor(c)}
                style={{width:17,height:17,borderRadius:'50%',background:c,border:color===c?'2px solid #fff':'2px solid transparent',cursor:'pointer',flexShrink:0,transition:'transform 0.1s',boxShadow:c==='#000000'?'0 0 0 1px rgba(255,255,255,0.2)':'none'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.25)';}}
                onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}/>
            ))}
          </div>
          <div style={{display:'flex',gap:4}}>
            {[1.5,2.5,4,7].map(w=>(
              <button key={w} onClick={()=>setSw(w)} title={`Grosor ${w}`}
                style={{width:26,height:26,borderRadius:7,background:sw===w?'rgba(155,89,182,0.3)':'rgba(255,255,255,0.05)',border:`1px solid ${sw===w?'rgba(155,89,182,0.6)':'rgba(255,255,255,0.08)'}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                <div style={{borderRadius:'50%',background:sw===w?'#9B59B6':'#8A9099',width:Math.min(w*2,14),height:Math.min(w*2,14)}}/>
              </button>
            ))}
            <button onClick={()=>setStrokes(s=>s.slice(0,-1))} title="Deshacer" disabled={strokes.length===0}
              style={{width:26,height:26,borderRadius:7,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:strokes.length===0?'#3A3F4A':'#8A9099',cursor:strokes.length===0?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:14}}>↩</button>
            <button onClick={()=>setStrokes([])} title="Limpiar" disabled={strokes.length===0}
              style={{width:26,height:26,borderRadius:7,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:strokes.length===0?'#3A3F4A':'#E74C3C',cursor:strokes.length===0?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>✕</button>
          </div>
        </div>

        {/* Remaster button */}
        {hasPenStrokes && (
          <button onClick={handleRemaster}
            style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'7px 0',borderRadius:10,
              background: remastered ? 'rgba(46,204,113,0.18)' : 'rgba(52,152,219,0.14)',
              border: `1px solid ${remastered ? 'rgba(46,204,113,0.5)' : 'rgba(52,152,219,0.45)'}`,
              color: remastered ? '#2ECC71' : '#5DADE2',
              fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.25s', width:'100%'}}>
            {remastered
              ? <><svg viewBox="0 0 16 16" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="2,9 6,13 14,4"/></svg> ¡Remasterizado!</>
              : <><svg viewBox="0 0 16 16" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13 Q1 8 5 5 Q8 2 11 5 Q14 8 12 12"/><path d="M10 14l2-2-2-2"/></svg> Remasterizar trazos</>
            }
          </button>
        )}

        {/* Fill mode (only for closed shapes) */}
        {isClosed && (
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <span style={{fontSize:11,color:'#5A6270',flexShrink:0}}>Relleno:</span>
            {([['none','Sin relleno'],['light','Suave'],['solid','Sólido']] as [FillMode,string][]).map(([fm,lbl])=>(
              <button key={fm} onClick={()=>setFillMode(fm)}
                style={{padding:'3px 10px',borderRadius:7,fontSize:11,fontWeight:600,border:`1px solid ${fillMode===fm?'rgba(232,93,47,0.7)':'rgba(255,255,255,0.08)'}`,background:fillMode===fm?'rgba(232,93,47,0.2)':'rgba(255,255,255,0.04)',color:fillMode===fm?'#E85D2F':'#8A9099',cursor:'pointer'}}>
                {lbl}
              </button>
            ))}
            <div style={{marginLeft:4,width:22,height:22,borderRadius:6,border:`1px solid ${color}`,background:fillMode==='none'?'transparent':fillMode==='light'?color+'33':color}}/>
          </div>
        )}

        {/* Canvas SVG */}
        <svg ref={svgRef} width={SIZE} height={SIZE}
          style={{borderRadius:14,cursor:tool==='pen'?'crosshair':'default',background:'#0D0F14',border:'1px solid rgba(255,255,255,0.07)',touchAction:'none',userSelect:'none',display:'block'}}
          onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}>
          <defs><pattern id="eg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.07)"/></pattern></defs>
          <rect width={SIZE} height={SIZE} fill="url(#eg)"/>
          {strokes.map((s,i)=>renderEStroke(s,i))}
          {tool==='pen' && curPts && curPts.length>1 && (
            <path d={ptPath(curPts)} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          )}
          {preview && renderEStroke(preview, -1)}
          {strokes.length===0 && !curPts && !preview && (
            <text x={SIZE/2} y={SIZE/2} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.12)" fontSize={13} fontFamily="'DM Sans',sans-serif">
              Selecciona una herramienta y dibuja
            </text>
          )}
        </svg>

        {/* Footer */}
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Nombre de la forma"
            style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'8px 12px',color:'#F4F5F7',fontSize:13,outline:'none',fontFamily:"'DM Sans',sans-serif"}}
            onFocus={e=>{e.target.style.borderColor='rgba(155,89,182,0.6)';}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';}}/>
          <button onClick={onCancel} style={{padding:'8px 14px',borderRadius:9,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#8A9099',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button onClick={handleSave} disabled={strokes.length===0}
            style={{padding:'8px 16px',borderRadius:9,background:strokes.length===0?'rgba(155,89,182,0.2)':'#9B59B6',border:'none',color:strokes.length===0?'#5A3070':'#fff',fontSize:13,fontWeight:700,cursor:strokes.length===0?'default':'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>{if(strokes.length>0)e.currentTarget.style.background='#8E44AD';}}
            onMouseLeave={e=>{if(strokes.length>0)e.currentTarget.style.background='#9B59B6';}}>
            Guardar Forma
          </button>
        </div>
      </div>
    </div>
  );
}

function ShapesPanel({ isVisible, onToggle, onAddShape, onDragStart, defaultColor, customTemplates, onDeleteCustom, onOpenEditor, selectedPathCount, onSaveSelectionAsShape }: {
  isVisible: boolean; onToggle: () => void; onAddShape: (t:string)=>void; onDragStart: (t:string, e:React.MouseEvent)=>void; defaultColor: string;
  customTemplates: CustomShape[]; onDeleteCustom: (id:string)=>void; onOpenEditor: ()=>void;
  selectedPathCount: number; onSaveSelectionAsShape: ()=>void;
}) {
  return (
    <div style={{ position:'fixed', right: 24, top:'50%', transform:'translateY(-50%)', zIndex:1000, display:'flex', flexDirection:'column', alignItems:'flex-end', gap: 8 }}>
      <button onClick={onToggle} title="Formas de desarrollo"
        style={{ width:42, height:42, borderRadius:13, background: isVisible ? '#E85D2F' : 'rgba(28,31,38,0.85)', backdropFilter:'blur(20px)', border:`1px solid ${isVisible?'#E85D2F':'rgba(255,255,255,0.12)'}`, color: isVisible?'#fff':'#8A9099', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}
        onMouseEnter={e=>{ if (!isVisible) { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(232,93,47,0.5)'; } }}
        onMouseLeave={e=>{ if (!isVisible) { e.currentTarget.style.color='#8A9099'; e.currentTarget.style.borderColor='rgba(255,255,255,0.12)'; } }}>
        <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
      </button>
      {isVisible && (
        <div style={{ position:'absolute', right:'calc(100% + 12px)', top:'50%', transform:'translateY(-50%)', background:'rgba(20,23,30,0.95)', backdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:18, padding:14, width:226, maxHeight:'80vh', overflowY:'auto', boxShadow:'0 24px 60px rgba(0,0,0,0.6)', display:'flex', flexDirection:'column', gap:12 }}>

          {/* Acciones */}
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={onOpenEditor}
              title="Abrir editor de formas"
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'7px 10px', background:'rgba(155,89,182,0.12)', border:'1px solid rgba(155,89,182,0.3)', borderRadius:9, cursor:'pointer', color:'#9B59B6', fontSize:10, fontWeight:700 }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(155,89,182,0.22)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(155,89,182,0.12)';}}>
              <svg viewBox="0 0 16 16" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M2 14 L6 10 L14 2 L14 6 L2 14Z"/><path d="M10 4l2 2"/></svg>
              Crear Forma
            </button>
            {selectedPathCount > 0 && (
              <button onClick={onSaveSelectionAsShape}
                title="Guardar selección de lapiz como forma"
                style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'7px 10px', background:'rgba(46,204,113,0.12)', border:'1px solid rgba(46,204,113,0.3)', borderRadius:9, cursor:'pointer', color:'#2ECC71', fontSize:10, fontWeight:700 }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(46,204,113,0.22)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(46,204,113,0.12)';}}>
                <svg viewBox="0 0 16 16" width={13} height={13} fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 13 Q3 3 8 3 Q13 3 13 8 Q13 13 8 13 Q3 13 3 8"/><path d="M8 6v4M6 8h4"/></svg>
                Guardar trazo
              </button>
            )}
          </div>

          {/* Formas custom */}
          {customTemplates.length > 0 && (
            <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
              <p style={{ fontSize:10, fontWeight:800, color:'#2ECC71', textTransform:'uppercase', letterSpacing:'0.1em', margin:0, padding:'0 2px' }}>Mis Formas</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                {customTemplates.map(sh => (
                  <div key={sh.id} style={{ position:'relative' }}>
                    <button
                      title={sh.label}
                      onMouseDown={e => { e.preventDefault(); onDragStart(sh.id, e); }}
                      style={{ width:'100%', display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px 6px 8px', background:'rgba(46,204,113,0.05)', border:'1px solid rgba(46,204,113,0.15)', borderRadius:11, cursor:'grab', transition:'all 0.15s', userSelect:'none' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(46,204,113,0.14)'; e.currentTarget.style.borderColor='rgba(46,204,113,0.4)'; }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(46,204,113,0.05)'; e.currentTarget.style.borderColor='rgba(46,204,113,0.15)'; }}>
                      <ShapeSvg type={sh.id} color={defaultColor} width={34} height={34} customTemplates={customTemplates}/>
                      <span style={{ fontSize:9, color:'#8A9099', fontFamily:"'DM Sans',sans-serif", textAlign:'center', lineHeight:1.25, pointerEvents:'none' }}>{sh.label}</span>
                    </button>
                    <button onClick={()=>onDeleteCustom(sh.id)} title="Eliminar forma"
                      style={{ position:'absolute', top:2, right:2, width:14, height:14, borderRadius:'50%', background:'rgba(231,76,60,0.8)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', opacity:0, transition:'opacity 0.15s' }}
                      onMouseEnter={e=>{e.currentTarget.style.opacity='1';}}
                      onMouseLeave={e=>{e.currentTarget.style.opacity='0';}}
                      onFocus={e=>{e.currentTarget.style.opacity='1';}}
                      onBlur={e=>{e.currentTarget.style.opacity='0';}}>
                      <svg viewBox="0 0 8 8" width={8} height={8} fill="none" stroke="#fff" strokeWidth="2"><path d="M2 2l4 4M6 2l-4 4"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formas built-in */}
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <p style={{ fontSize:10, fontWeight:800, color:'#5A6270', textTransform:'uppercase', letterSpacing:'0.1em', margin:0, padding:'0 2px' }}>Formas Dev — clic o arrastra</p>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              {DEV_SHAPES.map(sh => (
                <button key={sh.type} title={sh.label}
                  onMouseDown={e => { e.preventDefault(); onDragStart(sh.type, e); }}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px 6px 8px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:11, cursor:'grab', transition:'all 0.15s', userSelect:'none' }}
                  onMouseEnter={e=>{ e.currentTarget.style.background=`${sh.color}18`; e.currentTarget.style.borderColor=`${sh.color}55`; e.currentTarget.style.transform='scale(1.04)'; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.07)'; e.currentTarget.style.transform='scale(1)'; }}>
                  <ShapeSvg type={sh.type} color={sh.color} width={34} height={34}/>
                  <span style={{ fontSize:9, color:'#8A9099', fontFamily:"'DM Sans',sans-serif", textAlign:'center', lineHeight:1.25, pointerEvents:'none' }}>{sh.label}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

// ─── Sección: Pizarra ─────────────────────────────────────────────────────────

export default function SectionPizarra({ notes, drawings, images, shapes, customShapes, members, onAddNote, onDeleteNote, onDeleteImage, onSaveDrawings, onSaveImages, onSaveNotes, onSaveShapes, onSaveCustomShapes, onDragNote, onDragImage, onClearAll, pushToHistory, undo, clipboard, setClipboard }: {
  notes: Note[]; drawings: DrawingPath[]; images: BoardImage[]; shapes: BoardShape[]; customShapes: CustomShape[]; members: Member[];
  onAddNote: () => void; onDeleteNote: (n: Note) => void; onDeleteImage: (img: BoardImage) => void;
  onSaveDrawings: (d: DrawingPath[]) => void; onSaveImages: (i: BoardImage[]) => void; onSaveNotes: (n: Note[]) => void; onSaveShapes: (s: BoardShape[]) => void; onSaveCustomShapes: (s: CustomShape[]) => void;
  onDragNote: (id: string, x: number, y: number, extra?: Partial<Note>) => void; onDragImage: (id: string, x: number, y: number, w?: number, h?: number) => void;
  onClearAll: () => void; pushToHistory: () => void; undo: () => void; clipboard: any; setClipboard: (v: any) => void;
}) {
  const [tool, setTool]         = useState<'select'|'pencil'|'eraser'|'hand'|'text'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [offset, setOffset]     = useState({ x:0, y:0 });
  const [zoom, setZoom]         = useState(1);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [currentColor, setCurrentColor] = useState('#F4F5F7');
  const [editingText, setEditingText] = useState<{ x: number, y: number, content: string } | null>(null);
  const [isMarqueeing, setIsMarqueeing]           = useState(false);
  const [marqueeStart, setMarqueeStart]           = useState<{x:number,y:number}|null>(null);
  const [marqueeEnd, setMarqueeEnd]               = useState<{x:number,y:number}|null>(null);
  const [selectedIds, setSelectedIds]             = useState<Set<string>>(new Set());
  const [selectedPathIndices, setSelectedPathIndices] = useState<Set<number>>(new Set());
  const [multiDragActive, setMultiDragActive]     = useState(false);
  const [multiDragDelta, setMultiDragDelta]       = useState({x:0, y:0});
  const [showShapesPanel, setShowShapesPanel]     = useState(false);
  const [panelDrag, setPanelDrag] = useState<{ type: string; startX: number; startY: number; clientX: number; clientY: number } | null>(null);

  const colors = ['#F4F5F7', '#E85D2F', '#E74C3C', '#2ECC71', '#3498DB', '#F1C40F', '#9B59B6'];
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const saveText = () => {
    if (!editingText) return;
    if (editingText.content.trim()) {
      pushToHistory();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const worldX = (editingText.x - rect.left - offset.x) / zoom;
        const worldY = (editingText.y - rect.top - offset.y) / zoom;
        onSaveNotes([...notes, {
          id: crypto.randomUUID(),
          content: editingText.content,
          authorId: members[0]?.id || '',
          createdAt: Date.now(),
          x: worldX,
          y: worldY,
          color: currentColor,
          type: 'text'
        }]);
      }
    }
    setEditingText(null);
  };

  const zoomIn  = () => setZoom(p => Math.min(p+0.1, 3));
  const zoomOut = () => setZoom(p => Math.max(p-0.1, 0.3));
  const resetZoom = () => { setZoom(1); setOffset({x:0,y:0}); };

  const resolveShapeInfo = (type: string) => {
    const builtin = DEV_SHAPES.find(s => s.type === type);
    if (builtin) return { defaultW: builtin.defaultW, defaultH: builtin.defaultH, color: builtin.color, label: builtin.label };
    const custom = customShapes.find(s => s.id === type);
    if (custom) return { defaultW: custom.defaultW, defaultH: custom.defaultH, color: currentColor, label: custom.label };
    return null;
  };

  const handleAddShape = (type: string) => {
    const info = resolveShapeInfo(type);
    if (!info) return;
    const rect = containerRef.current?.getBoundingClientRect();
    const cx = rect ? (rect.width / 2 - offset.x) / zoom : 200;
    const cy = rect ? (rect.height / 2 - offset.y) / zoom : 200;
    onSaveShapes([...shapes, { id: crypto.randomUUID(), type, x: cx - info.defaultW / 2, y: cy - info.defaultH / 2, width: info.defaultW, height: info.defaultH, color: info.color, label: info.label }]);
    setShowShapesPanel(false);
  };

  const handleSaveSelectionAsShape = () => {
    if (selectedPathIndices.size === 0) return;
    const label = prompt('Nombre de la forma:', 'Mi Forma') || 'Mi Forma';
    const paths = [...selectedPathIndices].map(i => drawings[i]).filter(Boolean);
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    paths.forEach(p => p.points.forEach((pt: {x:number;y:number}) => { minX=Math.min(minX,pt.x); minY=Math.min(minY,pt.y); maxX=Math.max(maxX,pt.x); maxY=Math.max(maxY,pt.y); }));
    const bw = maxX - minX || 1, bh = maxY - minY || 1;
    const norm = (x: number, y: number) => ({ x: ((x-minX)/bw*100).toFixed(2), y: ((y-minY)/bh*100).toFixed(2) });
    const svgContent = paths.map((p: DrawingPath) => {
      const d = p.points.map((pt: {x:number;y:number}, i: number) => { const n = norm(pt.x, pt.y); return `${i===0?'M':'L'}${n.x},${n.y}`; }).join(' ');
      return `<path d="${d}" stroke="${p.color}" stroke-width="${p.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    }).join('');
    const aspect = bw / bh;
    const dw = Math.min(Math.round(aspect >= 1 ? 100 : 100*aspect), 120);
    const dh = Math.min(Math.round(aspect >= 1 ? 100/aspect : 100), 120);
    onSaveCustomShapes([...customShapes, { id: crypto.randomUUID(), label, svgContent, viewBox: '0 0 100 100', defaultW: dw, defaultH: dh }]);
    toast.success(`"${label}" guardada en el panel de formas`);
  };

  const [showShapeEditor, setShowShapeEditor] = useState(false);

  useEffect(() => {
    if (!panelDrag) return;
    const onMove = (e: MouseEvent) => setPanelDrag(d => d ? { ...d, clientX: e.clientX, clientY: e.clientY } : null);
    const onUp = (e: MouseEvent) => {
      if (!panelDrag) return;
      const moved = Math.hypot(e.clientX - panelDrag.startX, e.clientY - panelDrag.startY);
      const info = resolveShapeInfo(panelDrag.type);
      if (info) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (moved < 8) {
          const cx = rect ? (rect.width / 2 - offset.x) / zoom : 200;
          const cy = rect ? (rect.height / 2 - offset.y) / zoom : 200;
          onSaveShapes([...shapes, { id: crypto.randomUUID(), type: panelDrag.type, x: cx - info.defaultW / 2, y: cy - info.defaultH / 2, width: info.defaultW, height: info.defaultH, color: info.color, label: info.label }]);
        } else if (rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const wx = (e.clientX - rect.left - offset.x) / zoom - info.defaultW / 2;
          const wy = (e.clientY - rect.top - offset.y) / zoom - info.defaultH / 2;
          onSaveShapes([...shapes, { id: crypto.randomUUID(), type: panelDrag.type, x: wx, y: wy, width: info.defaultW, height: info.defaultH, color: info.color, label: info.label }]);
        }
      }
      setPanelDrag(null);
      setShowShapesPanel(false);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [panelDrag, offset, zoom, shapes, onSaveShapes, currentColor, customShapes]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName==='INPUT'||document.activeElement?.tagName==='TEXTAREA') return;
      if ((e.key==='Delete'||e.key==='Backspace') && (selectedId || selectedIds.size > 0 || selectedPathIndices.size > 0)) {
        pushToHistory();
        if (selectedIds.size > 0 || selectedPathIndices.size > 0) {
          onSaveNotes(notes.filter(n => !selectedIds.has(n.id)));
          onSaveImages(images.filter(i => !selectedIds.has(i.id)));
          onSaveShapes(shapes.filter(s => !selectedIds.has(s.id)));
          if (selectedPathIndices.size > 0) onSaveDrawings(drawings.filter((_: any, idx: number) => !selectedPathIndices.has(idx)));
          setSelectedIds(new Set()); setSelectedPathIndices(new Set());
        } else {
          const n = notes.find(n => n.id===selectedId); if (n) onDeleteNote(n);
          const i = images.find(i => i.id===selectedId); if (i) onDeleteImage(i);
          setSelectedId(null);
        }
      }
      if (e.ctrlKey||e.metaKey) {
        if (e.key==='z') { e.preventDefault(); undo(); }
        if (e.key==='c') { e.preventDefault(); const el=notes.find(n => n.id===selectedId); if (el) { setClipboard(el); toast.success("Copiado"); } }
        if (e.key==='='||e.key==='+') { e.preventDefault(); zoomIn(); }
        else if (e.key==='-') { e.preventDefault(); zoomOut(); }
        else if (e.key==='0') { e.preventDefault(); resetZoom(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, selectedIds, selectedPathIndices, notes, images, drawings, clipboard, pushToHistory, undo, onSaveNotes, onSaveImages, onSaveDrawings, onDeleteNote, onDeleteImage]);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (document.activeElement?.tagName==='INPUT'||document.activeElement?.tagName==='TEXTAREA') return;
      const items = e.clipboardData?.items; if (!items) return;
      for (let i=0; i<items.length; i++) {
        if (items[i].type.indexOf("image")!==-1) {
          e.preventDefault(); const file=items[i].getAsFile(); if (!file) continue;
          const reader=new FileReader();
          reader.onload = ev => {
            const src=ev.target?.result as string;
            const img=new window.Image();
            img.onload = () => { pushToHistory(); onSaveImages([...images, { id:crypto.randomUUID(), src, x:100-offset.x+Math.random()*50, y:100-offset.y+Math.random()*50, width:Math.min(img.width,300), height:(img.height*Math.min(img.width,300))/img.width }]); toast.success("Imagen pegada"); };
            img.src=src;
          };
          reader.readAsDataURL(file); return;
        }
      }
      if (clipboard && 'content' in clipboard) {
        e.preventDefault(); pushToHistory();
        const newId=crypto.randomUUID();
        onSaveNotes([...notes, { ...clipboard, id:newId, x:clipboard.x+20, y:clipboard.y+20, createdAt:Date.now() }]);
        setSelectedId(newId); toast.success("Nota duplicada");
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [images, notes, clipboard, onSaveImages, onSaveNotes, offset, pushToHistory]);

  useEffect(() => {
    const canvas=canvasRef.current; if (!canvas) return;
    const ctx=canvas.getContext('2d'); if (!ctx) return;
    const redraw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height); ctx.save(); ctx.translate(offset.x,offset.y); ctx.scale(zoom,zoom);
      drawings.forEach((p, idx) => {
        if (p.points.length<2) return;
        const isSel = selectedPathIndices.has(idx);
        const pdx = isSel && multiDragActive ? multiDragDelta.x : 0;
        const pdy = isSel && multiDragActive ? multiDragDelta.y : 0;
        ctx.beginPath(); ctx.strokeStyle=p.color; ctx.lineWidth=p.width; ctx.lineJoin='round'; ctx.lineCap='round';
        ctx.moveTo(p.points[0].x+pdx, p.points[0].y+pdy);
        for (let i=1;i<p.points.length;i++) ctx.lineTo(p.points[i].x+pdx, p.points[i].y+pdy);
        if (isSel) { ctx.shadowColor='#E85D2F'; ctx.shadowBlur=14/zoom; }
        ctx.stroke();
        ctx.shadowColor='transparent'; ctx.shadowBlur=0;
      });
      ctx.restore();
    };
    const resize = () => { if (containerRef.current) { canvas.width=containerRef.current.clientWidth; canvas.height=containerRef.current.clientHeight; redraw(); } };
    window.addEventListener('resize', resize); resize();
    return () => window.removeEventListener('resize', resize);
  }, [drawings, offset, zoom, selectedPathIndices, multiDragActive, multiDragDelta]);

  // Infinite Scroll & Zoom listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        // Zoom centrado en el mouse
        const factor = Math.pow(1.1, -e.deltaY / 100);
        const newZoom = Math.min(Math.max(zoom * factor, 0.3), 3);

        const rect = container.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = (mouseX - offset.x) / zoom;
        const worldY = (mouseY - offset.y) / zoom;

        setZoom(newZoom);
        setOffset({
          x: mouseX - worldX * newZoom,
          y: mouseY - worldY * newZoom
        });
      } else {
        // Pan (Infinite Scroll)
        setOffset(prev => ({
          x: prev.x - e.deltaX,
          y: prev.y - e.deltaY
        }));
      }
    };

    container.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', handleWheelNative);
  }, [zoom, offset]);

  const onMD=(e:React.MouseEvent)=>{
    if (tool==='select') {
      const t = e.target as HTMLElement;
      if (t === canvasRef.current || t === containerRef.current || (t.parentElement === containerRef.current)) {
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
          const wx = (e.clientX - rect.left - offset.x) / zoom;
          const wy = (e.clientY - rect.top - offset.y) / zoom;

          // Si hay selección activa, verificar si el clic está dentro del bounding box → iniciar multi-drag
          if (selectedPathIndices.size > 0 || selectedIds.size > 0) {
            let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
            drawings.forEach((p, idx) => {
              if (!selectedPathIndices.has(idx)) return;
              const pad = (p.width / 2 + 6) / zoom;
              p.points.forEach(pt => {
                minX = Math.min(minX, pt.x - pad); minY = Math.min(minY, pt.y - pad);
                maxX = Math.max(maxX, pt.x + pad); maxY = Math.max(maxY, pt.y + pad);
              });
            });
            notes.forEach(n => {
              if (!selectedIds.has(n.id)) return;
              const nw = n.type === 'text' ? 200 : 220;
              const nh = n.type === 'text' ? 50 : 120;
              minX = Math.min(minX, n.x); minY = Math.min(minY, n.y);
              maxX = Math.max(maxX, n.x + nw); maxY = Math.max(maxY, n.y + nh);
            });
            images.forEach(img => {
              if (!selectedIds.has(img.id)) return;
              minX = Math.min(minX, img.x); minY = Math.min(minY, img.y);
              maxX = Math.max(maxX, img.x + img.width); maxY = Math.max(maxY, img.y + img.height);
            });
            shapes.forEach(s => {
              if (!selectedIds.has(s.id)) return;
              minX = Math.min(minX, s.x); minY = Math.min(minY, s.y);
              maxX = Math.max(maxX, s.x + s.width); maxY = Math.max(maxY, s.y + s.height + 20);
            });
            if (minX !== Infinity && wx >= minX && wx <= maxX && wy >= minY && wy <= maxY) {
              onMultiDragStart();
              return;
            }
          }

          // Hit test: clic cerca de un trazo de lápiz → seleccionarlo directamente
          for (let idx = drawings.length - 1; idx >= 0; idx--) {
            const p = drawings[idx];
            const hitDist = Math.max(p.width / 2 + 5, 8 / zoom);
            const isHit = p.points.some(pt => Math.hypot(pt.x - wx, pt.y - wy) <= hitDist);
            if (isHit) {
              setSelectedPathIndices(new Set([idx]));
              setSelectedIds(new Set());
              setSelectedId(null);
              return;
            }
          }

          setMarqueeStart({x: wx, y: wy});
          setMarqueeEnd({x: wx, y: wy});
          setIsMarqueeing(true);
        }
        setSelectedId(null);
        setSelectedIds(new Set());
        setSelectedPathIndices(new Set());
      }
    }
    if (tool==='hand') { setIsPanning(true); return; }
    if (tool==='pencil'||tool==='eraser') {
      pushToHistory(); setIsDrawing(true);
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      onSaveDrawings([...drawings, { points:[{x,y}], color:tool==='eraser'?'#0A0C0F':currentColor, width:(tool==='eraser'?30:3)/zoom }]);
    }
    if (tool==='text') {
      if (editingText) return;
      setEditingText({ x: e.clientX, y: e.clientY, content: '' });
    }
  };
  const onMultiDragStart = () => { setMultiDragActive(true); setMultiDragDelta({x:0, y:0}); };

  const onMM=(e:React.MouseEvent)=>{
    if (isPanning) { setOffset(p=>({x:p.x+e.movementX,y:p.y+e.movementY})); return; }
    if (multiDragActive) {
      setMultiDragDelta(d => ({x: d.x + e.movementX/zoom, y: d.y + e.movementY/zoom}));
      return;
    }
    if (isMarqueeing) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const wx = (e.clientX - rect.left - offset.x) / zoom;
        const wy = (e.clientY - rect.top - offset.y) / zoom;
        setMarqueeEnd({x: wx, y: wy});
      }
      return;
    }
    if (isDrawing) {
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      const d=[...drawings]; d[d.length-1].points.push({x,y}); onSaveDrawings(d);
    }
  };
  const onMU=()=>{
    if (multiDragActive) {
      if (multiDragDelta.x !== 0 || multiDragDelta.y !== 0) {
        pushToHistory();
        const {x: ddx, y: ddy} = multiDragDelta;
        onSaveNotes(notes.map(n => selectedIds.has(n.id) ? {...n, x: n.x+ddx, y: n.y+ddy} : n));
        onSaveImages(images.map(img => selectedIds.has(img.id) ? {...img, x: img.x+ddx, y: img.y+ddy} : img));
        onSaveShapes(shapes.map(s => selectedIds.has(s.id) ? {...s, x: s.x+ddx, y: s.y+ddy} : s));
        if (selectedPathIndices.size > 0) {
          onSaveDrawings(drawings.map((p, idx) => selectedPathIndices.has(idx)
            ? {...p, points: p.points.map(pt => ({x: pt.x+ddx, y: pt.y+ddy}))}
            : p));
        }
      }
      setMultiDragActive(false);
      setMultiDragDelta({x:0, y:0});
      return;
    }
    if (isMarqueeing && marqueeStart && marqueeEnd) {
      const mx = Math.min(marqueeStart.x, marqueeEnd.x);
      const my = Math.min(marqueeStart.y, marqueeEnd.y);
      const mw = Math.abs(marqueeEnd.x - marqueeStart.x);
      const mh = Math.abs(marqueeEnd.y - marqueeStart.y);
      if (mw > 5 || mh > 5) {
        const newIds = new Set<string>();
        notes.forEach(n => {
          const nw = n.type==='text' ? 200 : 220;
          const nh = n.type==='text' ? 50 : 120;
          if (n.x < mx+mw && n.x+nw > mx && n.y < my+mh && n.y+nh > my) newIds.add(n.id);
        });
        images.forEach(img => {
          if (img.x < mx+mw && img.x+img.width > mx && img.y < my+mh && img.y+img.height > my) newIds.add(img.id);
        });
        shapes.forEach(s => {
          if (s.x < mx+mw && s.x+s.width > mx && s.y < my+mh && s.y+s.height > my) newIds.add(s.id);
        });
        const newPaths = new Set<number>();
        drawings.forEach((p, idx) => {
          if (p.points.some(pt => pt.x >= mx && pt.x <= mx+mw && pt.y >= my && pt.y <= my+mh)) newPaths.add(idx);
        });
        setSelectedIds(newIds);
        setSelectedPathIndices(newPaths);
      }
      setIsMarqueeing(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
    }
    setIsDrawing(false);
    setIsPanning(false);
  };
  const getCursor=()=>tool==='hand'?(isPanning?'grabbing':'grab'):tool==='pencil'?'crosshair':tool==='eraser'?'cell':multiDragActive?'grabbing':(isMarqueeing?'crosshair':'default');

  return (
    <div className="h-full relative overflow-hidden">
      {/* Shapes Panel (Right Center) */}
      <ShapesPanel isVisible={showShapesPanel} onToggle={() => setShowShapesPanel(v => !v)} onAddShape={handleAddShape} onDragStart={(type, e) => { setPanelDrag({ type, startX: e.clientX, startY: e.clientY, clientX: e.clientX, clientY: e.clientY }); }} defaultColor={currentColor} customTemplates={customShapes} onDeleteCustom={id => onSaveCustomShapes(customShapes.filter(s=>s.id!==id))} onOpenEditor={() => { setShowShapesPanel(false); setShowShapeEditor(true); }} selectedPathCount={selectedPathIndices.size} onSaveSelectionAsShape={handleSaveSelectionAsShape} />
      {showShapeEditor && <ShapeEditor onSave={shape => { onSaveCustomShapes([...customShapes, shape]); setShowShapeEditor(false); toast.success(`"${shape.label}" guardada en Mis Formas`); }} onCancel={() => setShowShapeEditor(false)} />}

      {/* Ghost mientras arrastra desde el panel */}
      {panelDrag && (
        <div style={{ position:'fixed', left: panelDrag.clientX - 22, top: panelDrag.clientY - 22, pointerEvents:'none', opacity: 0.75, zIndex: 9999, filter:'drop-shadow(0 4px 12px rgba(232,93,47,0.4))' }}>
          <ShapeSvg type={panelDrag.type} color={resolveShapeInfo(panelDrag.type)?.color ?? currentColor} width={44} height={44} customTemplates={customShapes}/>
        </div>
      )}

      {/* Floating Color Palette (Left Center) */}
      {(tool === 'pencil' || tool === 'text') && (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-[1000] flex flex-col items-center gap-3 bg-[#1C1F26]/60 backdrop-blur-xl p-3 rounded-2xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 rotate-180 [writing-mode:vertical-lr]">Colores</div>
          {colors.map(c => (
            <button key={c} onClick={() => setCurrentColor(c)}
              className={`w-7 h-7 rounded-full border-2 transition-all ${currentColor === c ? 'border-white scale-125 shadow-[0_0_15px_rgba(255,255,255,0.4)]' : 'border-transparent hover:scale-110'}`}
              style={{ background: c }} />
          ))}
        </div>
      )}

      {/* Floating Toolbar (Bottom Center) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#1C1F26]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <ToolBtn active={tool==='select'} onClick={()=>setTool('select')} icon={<ChevronRight size={18} className="-rotate-45"/>} title="Seleccionar"/>
            <ToolBtn active={tool==='hand'}   onClick={()=>setTool('hand')}   icon={<Users size={18}/>} title="Mano"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={false} onClick={zoomIn}    icon={<ZoomIn size={18}/>}  title="Zoom +"/>
            <ToolBtn active={false} onClick={zoomOut}   icon={<ZoomOut size={18}/>} title="Zoom -"/>
            <ToolBtn active={false} onClick={resetZoom} icon={<Maximize size={18}/>} title="Reset view"/>
            <span className="text-[11px] text-gray-400 font-bold px-2 min-w-[45px] text-center">{Math.round(zoom*100)}%</span>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={tool==='pencil'} onClick={()=>setTool('pencil')} icon={<div className="relative"><Code size={18}/><div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white" style={{ background: currentColor }}/></div>}   title="Lápiz"/>
            <ToolBtn active={tool==='text'} onClick={()=>setTool('text')} icon={<FileText size={18}/>} title="Texto (Teclado)"/>
            <ToolBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} icon={<Trash2 size={18}/>} title="Borrador"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <button onClick={onClearAll} className="p-2 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all" title="Limpiar todo"><RefreshCw size={17}/></button>
          </div>
          <button onClick={onAddNote} className="bg-[#E85D2F] hover:bg-[#FF6B3D] text-white p-3 rounded-2xl shadow-lg transition-all transform hover:scale-105">
            <Plus size={22}/>
          </button>
        </div>

      <div ref={containerRef}
        style={{ width: '100%', height: '100%', background:"#0A0C0F", backgroundImage:`radial-gradient(rgba(255,255,255,0.05) 1px, transparent 0)`, backgroundSize:`${24*zoom}px ${24*zoom}px`, backgroundPosition:`${offset.x}px ${offset.y}px`, cursor:getCursor(), position:'relative', overflow:'hidden' }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}>

        <div style={{ position:'absolute', inset:0, transform:`translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin:'0 0', pointerEvents: tool==='select'?'auto':'none', zIndex: 10 }}>
          {shapes.map(s => <DraggableShape key={s.id} shape={s} customTemplates={customShapes} onSave={(id:string,x:number,y:number,w:number,h:number)=>onSaveShapes(shapes.map(sh=>sh.id===id?{...sh,x,y,width:w,height:h}:sh))} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===s.id} isInMultiSelect={selectedIds.has(s.id)} dragOffset={multiDragActive?multiDragDelta:null} onMultiDragStart={onMultiDragStart} onSelect={()=>{ setSelectedId(s.id); setSelectedIds(new Set()); setSelectedPathIndices(new Set()); }}/>)}
          {images.map(img => <DraggableImage key={img.id} image={img} onDrag={onDragImage} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===img.id} isInMultiSelect={selectedIds.has(img.id)} dragOffset={multiDragActive ? multiDragDelta : null} onMultiDragStart={onMultiDragStart} onSelect={()=>{ setSelectedId(img.id); setSelectedIds(new Set()); setSelectedPathIndices(new Set()); }}/>)}
          {notes.map(note => <DraggableNote key={note.id} note={note} members={members} onDrag={onDragNote} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===note.id} isInMultiSelect={selectedIds.has(note.id)} dragOffset={multiDragActive ? multiDragDelta : null} onMultiDragStart={onMultiDragStart} onSelect={()=>{ setSelectedId(note.id); setSelectedIds(new Set()); setSelectedPathIndices(new Set()); }}/>)}
        </div>

        {/* Text Editor (Fixed for reliability) */}
        {editingText && (
          <div
            className="fixed inset-0 z-[2000] cursor-default"
            onMouseDown={(e) => {
               // Si clica fuera del textarea, guardar y cerrar
               if (e.target === e.currentTarget) {
                 saveText();
               }
            }}>
            <textarea
              autoFocus
              className="absolute bg-transparent border-none outline-none text-white font-bold resize-none overflow-hidden"
              style={{ left: editingText.x, top: editingText.y, color: currentColor, fontSize: 22, width: 400, minHeight: 40, outline: 'none' }}
              value={editingText.content}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveText();
                }
                if (e.key === 'Escape') setEditingText(null);
              }}
              onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
            />
          </div>
        )}

        {isMarqueeing && marqueeStart && marqueeEnd && (
          <div style={{
            position: 'absolute',
            left: Math.min(marqueeStart.x, marqueeEnd.x) * zoom + offset.x,
            top:  Math.min(marqueeStart.y, marqueeEnd.y) * zoom + offset.y,
            width:  Math.abs(marqueeEnd.x - marqueeStart.x) * zoom,
            height: Math.abs(marqueeEnd.y - marqueeStart.y) * zoom,
            background: 'rgba(232,93,47,0.08)',
            border: '1.5px dashed rgba(232,93,47,0.7)',
            borderRadius: 3,
            pointerEvents: 'none',
            zIndex: 30,
          }}/>
        )}
        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex: 20 }}/>
      </div>
    </div>
  );
}
