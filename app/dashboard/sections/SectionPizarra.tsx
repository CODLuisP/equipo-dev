"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import {
  MousePointer2, Hand, Pencil, Type, Eraser, Trash2,
  Plus, ZoomIn, ZoomOut, Maximize, RefreshCw, Sparkles, Upload, Image as ImageIcon,
  Undo2, Redo2, Download, Layers, BringToFront, SendToBack, ArrowUp, ArrowDown
} from "lucide-react";
import { toast } from "sonner";
import type { Member, Note, DrawingPath, BoardImage, BoardShape, CustomShape } from "@/app/dashboard/types";
import AvatarImg from "@/app/dashboard/components/AvatarImg";

// ─── Pizarra Helpers ──────────────────────────────────────────────────────────

function ToolBtn({ active, onClick, icon, title }: any) {
  return <button onClick={onClick} title={title} className={`p-1.5 rounded-lg transition-all ${active?'bg-[#2563eb] text-white':'text-gray-500 hover:text-white hover:bg-white/5'}`}>{icon}</button>;
}

function RotateHandle({ onMouseDown, extraOffset = 0 }: { onMouseDown: (e: React.MouseEvent) => void; extraOffset?: number }) {
  // top = extraOffset - 46 so the bottom of the 30px line lands exactly at y=extraOffset
  return (
    <div style={{ position:'absolute', top: extraOffset - 30, left:'50%', transform:'translateX(-50%)', display:'flex', flexDirection:'column', alignItems:'center', pointerEvents:'auto', zIndex:51, cursor:'grab' }}
      onMouseDown={onMouseDown}>
      <div style={{ width:16, height:16, borderRadius:'50%', background:'#0A0C0F', border:'1.5px solid rgba(255,255,255,0.65)', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <svg viewBox="0 0 12 12" width={10} height={10} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 1.5A5 5 0 1 1 2 7"/><polyline points="9.5,1.5 9.5,4.5 6.5,4.5"/>
        </svg>
      </div>
      <div style={{ width:1, height:14, background:'rgba(255,255,255,0.35)' }}/>
    </div>
  );
}

function DraggableImage({ image, onDrag, onRotate, disabled, zoom, isSelected, isInMultiSelect, dragOffset, onMultiDragStart, onSelect, stackIndex = 1 }: any) {
  const [pos, setPos] = useState({ x:image.x, y:image.y, w:image.width, h:image.height });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir]   = useState<string|null>(null);
  const [localRotation, setLocalRotation] = useState<number>(image.rotation ?? 0);
  const rotationRef  = useRef<number>(image.rotation ?? 0);
  const isRotatingRef = useRef(false);
  const elemDivRef   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging && !resizeDir) setPos({ x:image.x, y:image.y, w:image.width, h:image.height });
  }, [image.x, image.y, image.width, image.height]);
  useEffect(() => {
    if (!isRotatingRef.current) { const r = image.rotation ?? 0; setLocalRotation(r); rotationRef.current = r; }
  }, [image.rotation]);
  useEffect(() => {
    const onMM=(e:MouseEvent)=>{
      if (isDragging) setPos(p=>({...p,x:p.x+e.movementX/zoom,y:p.y+e.movementY/zoom}));
      if (resizeDir) setPos(p=>{ let{x,y,w,h}=p; const dx=e.movementX/zoom,dy=e.movementY/zoom; if(resizeDir.includes('e'))w+=dx; if(resizeDir.includes('w')){x+=dx;w-=dx;} if(resizeDir.includes('s'))h+=dy; if(resizeDir.includes('n')){y+=dy;h-=dy;} if(resizeDir==='se'||resizeDir==='nw')h=w/(image.width/image.height); return{x,y,w:Math.max(20,w),h:Math.max(20,h)}; });
    };
    const onMU=()=>{ if(isDragging||resizeDir){setIsDragging(false);setResizeDir(null);onDrag(image.id,pos.x,pos.y,pos.w,pos.h);} };
    if(isDragging||resizeDir){window.addEventListener('mousemove',onMM);window.addEventListener('mouseup',onMU);}
    return()=>{window.removeEventListener('mousemove',onMM);window.removeEventListener('mouseup',onMU);};
  },[isDragging,resizeDir,pos,image.id,onDrag,zoom,image.width,image.height]);

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = elemDivRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const startRot = rotationRef.current;
    isRotatingRef.current = true;
    const onMove = (me: MouseEvent) => {
      const a = Math.atan2(me.clientY - cy, me.clientX - cx);
      const r = startRot + (a - startAngle) * 180 / Math.PI;
      setLocalRotation(r); rotationRef.current = r;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
      isRotatingRef.current = false; onRotate?.(image.id, rotationRef.current);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  const dx = isInMultiSelect && dragOffset ? dragOffset.x : 0;
  const dy = isInMultiSelect && dragOffset ? dragOffset.y : 0;
  const shadow = `0 10px 30px rgba(0,0,0,${isSelected ? 0.5 : 0.3})`;
  return (
    <div ref={elemDivRef} style={{ position:'absolute',left:pos.x+dx,top:pos.y+dy,width:pos.w,height:pos.h,zIndex:stackIndex,cursor:disabled?'inherit':(isInMultiSelect?'grab':(isDragging?'grabbing':'grab')),boxShadow:shadow,pointerEvents:'auto',transform:`rotate(${localRotation}deg)` }}
      onMouseDown={(e)=>{ if(disabled)return; e.stopPropagation(); if(isInMultiSelect){ onMultiDragStart(); return; } onSelect(); setIsDragging(true); }} className="group select-none">
      <img src={image.src} className={`w-full h-full object-cover border ${isSelected ? 'rounded-none border-dashed border-white/40' : 'rounded-xl border-white/10'}`} draggable="false"/>
      {isSelected&&!disabled&&(['nw','ne','sw','se'] as const).map(dir=>(
        <div key={dir} onMouseDown={e=>{e.stopPropagation();onSelect();setResizeDir(dir);}}
          className={`absolute w-2 h-2 bg-[#0A0C0F] border border-white/40 z-50 ${dir==='nw'?'-top-1 -left-1 cursor-nw-resize':dir==='ne'?'-top-1 -right-1 cursor-ne-resize':dir==='sw'?'-bottom-1 -left-1 cursor-sw-resize':'-bottom-1 -right-1 cursor-se-resize'}`}/>
      ))}
      {isSelected&&!disabled&&(['n','s','e','w'] as const).map(dir=>(
        <div key={`edge-${dir}`} onMouseDown={e=>{e.stopPropagation();onSelect();setResizeDir(dir);}}
          className={`absolute bg-transparent z-50 rounded-sm
            ${dir==='n'?'top-0 -translate-y-1/2 left-2 right-2 h-2 cursor-ns-resize':''}
            ${dir==='s'?'bottom-0 translate-y-1/2 left-2 right-2 h-2 cursor-ns-resize':''}
            ${dir==='e'?'right-0 translate-x-1/2 top-2 bottom-2 w-2 cursor-ew-resize':''}
            ${dir==='w'?'left-0 -translate-x-1/2 top-2 bottom-2 w-2 cursor-ew-resize':''}
          `}/>
      ))}
      {isSelected&&!disabled&&<RotateHandle onMouseDown={handleRotateStart}/>}
    </div>
  );
}

function DraggableNote({ note, members, onDrag, onRotate, disabled, zoom, isSelected, isInMultiSelect, dragOffset, onMultiDragStart, onSelect, onEditText, stackIndex = 1 }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<string|null>(null);
  const [pos, setPos] = useState({ x: note.x, y: note.y, fs: note.fontSize || 18, w: note.width || 0 });
  const posRef = useRef(pos);
  posRef.current = pos;
  const [tbSnap, setTbSnap] = useState({ t: 0, b: 0 });
  const author = members.find((m: any) => m.id === note.authorId);
  const isText = note.type === 'text';
  const defaultRot = isText ? 0 : ((note.createdAt % 10) - 5) / 2;
  const [localRotation, setLocalRotation] = useState<number>(note.rotation !== undefined ? note.rotation : defaultRot);
  const rotationRef  = useRef<number>(note.rotation !== undefined ? note.rotation : defaultRot);
  const isRotatingRef = useRef(false);

  useEffect(() => {
    if (!isDragging && !resizeDir) setPos({ x: note.x, y: note.y, fs: note.fontSize || 18, w: note.width || 0 });
  }, [note.x, note.y, note.fontSize, note.width]);

  useEffect(() => {
    const onMM = (e: MouseEvent) => {
      if (isDragging) {
        setPos(p => ({ ...p, x: p.x + e.movementX / zoom, y: p.y + e.movementY / zoom }));
      } else if (resizeDir) {
        const dx = e.movementX / zoom;
        const dy = e.movementY / zoom;
        setPos(p => {
          let { x, y, fs, w } = p;
          if (resizeDir.includes('e') && w > 0) w = Math.max(50, w + dx);
          if (resizeDir.includes('w') && w > 0) { x += dx; w = Math.max(50, w - dx); }
          if (resizeDir.includes('s')) fs = Math.max(8, fs + dy);
          if (resizeDir.includes('n')) { fs = Math.max(8, fs - dy); y += dy; }
          return { x, y, fs, w };
        });
      }
    };
    const onMU = () => {
      if (isDragging || resizeDir) {
        const p = posRef.current;
        onDrag(note.id, p.x, p.y, { fontSize: p.fs, width: p.w > 0 ? p.w : undefined });
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
  }, [isDragging, resizeDir, note.id, onDrag, zoom]);

  useEffect(() => {
    if (!isRotatingRef.current) { const r = note.rotation !== undefined ? note.rotation : defaultRot; setLocalRotation(r); rotationRef.current = r; }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note.rotation]);

  const handleNoteRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = containerRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const startRot = rotationRef.current;
    isRotatingRef.current = true;
    const onMove = (me: MouseEvent) => {
      const a = Math.atan2(me.clientY - cy, me.clientX - cx);
      const r = startRot + (a - startAngle) * 180 / Math.PI;
      setLocalRotation(r); rotationRef.current = r;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
      isRotatingRef.current = false; onRotate?.(note.id, rotationRef.current);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

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
    <div ref={containerRef} style={{
      position:'absolute',
      left:pos.x + ndx,
      top:pos.y + ndy,
      background: isText ? 'transparent' : "#1C1F26",
      border: isText ? '1px solid transparent' : `1px solid ${note.color}40`,
      boxShadow: undefined,
      width: isText ? (pos.w > 0 ? pos.w : 'max-content') : 220,
      zIndex: stackIndex,
      transform: `rotate(${localRotation}deg)`,
      pointerEvents:'auto'
    }}
      onMouseDown={e=>{ if(disabled||(e.target as HTMLElement).closest('button'))return; e.stopPropagation(); if(isInMultiSelect){ onMultiDragStart(); return; } onSelect(); setIsDragging(true); }}
      onDoubleClick={e=>{ if (disabled || !isText) return; e.stopPropagation(); onEditText?.(note); }}
      className={`${isText ? 'rounded-none p-0' : 'rounded-xl p-4'} select-none group`}>

      {isText && isSelected && (
        <div style={{
          position: 'absolute',
          top: tbSnap.t,
          bottom: tbSnap.b,
          left: 0,
          right: 0,
          border: '1px dashed rgba(255,255,255,0.4)',
          pointerEvents: 'none',
          borderRadius: 2,
        }}>
          {isSelected && !disabled && (['nw','ne','sw','se'] as const).map(dir => (
            <div key={dir}
              onMouseDown={e => {
                e.stopPropagation(); onSelect();
                const currentW = containerRef.current?.getBoundingClientRect().width ?? 200;
                setPos(p => ({ ...p, w: p.w > 0 ? p.w : currentW / zoom }));
                setResizeDir(dir);
              }}
              style={{ pointerEvents: 'all' }}
              className={`absolute w-2 h-2 bg-[#0A0C0F] border border-white/40 z-10 rounded-sm
                ${dir === 'nw' ? '-top-1 -left-1 cursor-nw-resize' : ''}
                ${dir === 'ne' ? '-top-1 -right-1 cursor-ne-resize' : ''}
                ${dir === 'sw' ? '-bottom-1 -left-1 cursor-sw-resize' : ''}
                ${dir === 'se' ? '-bottom-1 -right-1 cursor-se-resize' : ''}
              `}
            />
          ))}
          {isSelected && !disabled && (['n','s','e','w'] as const).map(dir => (
            <div key={`edge-${dir}`}
              onMouseDown={e => {
                e.stopPropagation();
                onSelect();
                if (dir === 'e' || dir === 'w') {
                  const currentW = containerRef.current?.getBoundingClientRect().width ?? 200;
                  setPos(p => ({ ...p, w: p.w > 0 ? p.w : currentW / zoom }));
                }
                setResizeDir(dir);
              }}
              style={{ pointerEvents: 'all' }}
              className={`absolute bg-transparent z-10 rounded-sm
                ${dir === 'n' ? 'top-0 -translate-y-1/2 left-2 right-2 h-2 cursor-ns-resize' : ''}
                ${dir === 's' ? 'bottom-0 translate-y-1/2 left-2 right-2 h-2 cursor-ns-resize' : ''}
                ${dir === 'e' ? 'right-0 translate-x-1/2 top-2 bottom-2 w-2 cursor-ew-resize' : ''}
                ${dir === 'w' ? 'left-0 -translate-x-1/2 top-2 bottom-2 w-2 cursor-ew-resize' : ''}
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

      <p className={isText ? 'font-bold' : 'text-xs text-gray-200 leading-relaxed'}
         style={{
           color: isText ? note.color : undefined,
           fontSize: isText ? pos.fs : undefined,
           lineHeight: isText ? 1 : undefined,
           margin: 0,
           padding: 0,
           whiteSpace: isText ? 'pre-wrap' : 'pre-wrap',
           wordBreak: isText ? 'break-word' : undefined,
           overflowWrap: isText ? 'anywhere' : undefined
         }}>
        {note.content}
      </p>
      {isSelected && !disabled && <RotateHandle onMouseDown={handleNoteRotateStart} extraOffset={isText ? tbSnap.t : 0}/>}
    </div>
  );
}

// ─── Dev Shapes ───────────────────────────────────────────────────────────────
// defaultW/H proporcionales al viewBox de cada forma (vb = "x y w h")
const DEV_SHAPES = [
  { type: 'database',     label: 'Base de Datos',  defaultW: 80,  defaultH: 70,  color: '#60a5fa' },
  { type: 'server',       label: 'Servidor',        defaultW: 80,  defaultH: 82,  color: '#93c5fd' },
  { type: 'cloud',        label: 'Cloud',           defaultW: 110, defaultH: 64,  color: '#60a5fa' },
  { type: 'monitor',      label: 'Computadora',     defaultW: 108, defaultH: 96,  color: '#93c5fd' },
  { type: 'mobile',       label: 'Móvil',           defaultW: 50,  defaultH: 95,  color: '#4ade80' },
  { type: 'browser',      label: 'Browser',         defaultW: 108, defaultH: 102, color: '#2563eb' },
  { type: 'terminal',     label: 'Terminal',        defaultW: 108, defaultH: 102, color: '#22d3ee' },
  { type: 'api',          label: 'API',             defaultW: 110, defaultH: 63,  color: '#2563eb' },
  { type: 'microservice', label: 'Microservicio',   defaultW: 80,  defaultH: 96,  color: '#60a5fa' },
  { type: 'router',       label: 'Router',          defaultW: 90,  defaultH: 90,  color: '#f87171' },
  { type: 'loadbalancer', label: 'Load Balancer',   defaultW: 96,  defaultH: 82,  color: '#2563eb' },
  { type: 'docker',       label: 'Docker',          defaultW: 100, defaultH: 82,  color: '#60a5fa' },
  { type: 'git',          label: 'Git',             defaultW: 88,  defaultH: 88,  color: '#f87171' },
  { type: 'user',         label: 'Usuario',         defaultW: 80,  defaultH: 91,  color: '#93c5fd' },
  { type: 'globe',        label: 'Internet',        defaultW: 88,  defaultH: 88,  color: '#60a5fa' },
  { type: 'lock',         label: 'Seguridad',       defaultW: 70,  defaultH: 90,  color: '#fbbf24' },
  { type: 'storage',      label: 'Almacenamiento',  defaultW: 96,  defaultH: 64,  color: '#93c5fd' },
  { type: 'queue',        label: 'Queue',           defaultW: 100, defaultH: 84,  color: '#2563eb' },
  { type: 'cache',        label: 'Caché',           defaultW: 88,  defaultH: 88,  color: '#22d3ee' },
  { type: 'firewall',     label: 'Firewall',        defaultW: 80,  defaultH: 93,  color: '#f87171' },
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

function DraggableShape({ shape, customTemplates, onSave, onRotate, disabled, zoom, isSelected, isInMultiSelect, dragOffset, onMultiDragStart, onSelect, stackIndex = 1 }: any) {
  const [pos, setPos] = useState({ x: shape.x, y: shape.y, w: shape.width, h: shape.height });
  const [isDragging, setIsDragging] = useState(false);
  const [resizeDir, setResizeDir] = useState<string|null>(null);
  const [localRotation, setLocalRotation] = useState<number>(shape.rotation ?? 0);
  const rotationRef   = useRef<number>(shape.rotation ?? 0);
  const isRotatingRef = useRef(false);
  const elemDivRef    = useRef<HTMLDivElement>(null);
  const info = DEV_SHAPES.find(s => s.type === shape.type);

  useEffect(() => {
    if (!isDragging && !resizeDir) setPos({ x: shape.x, y: shape.y, w: shape.width, h: shape.height });
  }, [shape.x, shape.y, shape.width, shape.height]);
  useEffect(() => {
    if (!isRotatingRef.current) { const r = shape.rotation ?? 0; setLocalRotation(r); rotationRef.current = r; }
  }, [shape.rotation]);

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

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const rect = elemDivRef.current?.getBoundingClientRect(); if (!rect) return;
    const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    const startAngle = Math.atan2(e.clientY - cy, e.clientX - cx);
    const startRot = rotationRef.current;
    isRotatingRef.current = true;
    const onMove = (me: MouseEvent) => {
      const a = Math.atan2(me.clientY - cy, me.clientX - cx);
      const r = startRot + (a - startAngle) * 180 / Math.PI;
      setLocalRotation(r); rotationRef.current = r;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp);
      isRotatingRef.current = false; onRotate?.(shape.id, rotationRef.current);
    };
    window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
  };

  const dx = isInMultiSelect && dragOffset ? dragOffset.x : 0;
  const dy = isInMultiSelect && dragOffset ? dragOffset.y : 0;
  const border = isSelected ? '1px dashed rgba(255,255,255,0.4)' : '1px solid transparent';

  return (
    <div ref={elemDivRef} style={{ position:'absolute', left: pos.x+dx, top: pos.y+dy, width: pos.w, display:'flex', flexDirection:'column', alignItems:'center', cursor: disabled?'inherit':(isInMultiSelect?'grab':(isDragging?'grabbing':'grab')), zIndex: stackIndex, userSelect:'none', pointerEvents:'auto', transform:`rotate(${localRotation}deg)` }}
      onMouseDown={e => { if (disabled) return; e.stopPropagation(); if (isInMultiSelect) { onMultiDragStart(); return; } onSelect(); setIsDragging(true); }}
      className="group select-none">
      {isSelected && !disabled && <RotateHandle onMouseDown={handleRotateStart}/>}
      <div style={{ position:'relative', width: pos.w, height: pos.h, border, borderRadius: 3 }}>
        <ShapeSvg type={shape.type} color={shape.color} width={pos.w} height={pos.h} customTemplates={customTemplates} />
        {isSelected && !disabled && (['nw','ne','sw','se'] as const).map(dir => (
          <div key={dir} onMouseDown={e => { e.stopPropagation(); onSelect(); setResizeDir(dir); }}
            className={`absolute w-2 h-2 bg-[#0A0C0F] border border-white/40 z-50 rounded-sm
              ${dir==='nw'?'-top-1 -left-1 cursor-nw-resize':dir==='ne'?'-top-1 -right-1 cursor-ne-resize':dir==='sw'?'-bottom-1 -left-1 cursor-sw-resize':'-bottom-1 -right-1 cursor-se-resize'}`}/>
        ))}
        {isSelected && !disabled && (['n','s','e','w'] as const).map(dir => (
          <div key={`edge-${dir}`} onMouseDown={e => { e.stopPropagation(); onSelect(); setResizeDir(dir); }}
            className={`absolute bg-transparent z-50 rounded-sm
              ${dir==='n'?'top-0 -translate-y-1/2 left-2 right-2 h-2 cursor-ns-resize':''}
              ${dir==='s'?'bottom-0 translate-y-1/2 left-2 right-2 h-2 cursor-ns-resize':''}
              ${dir==='e'?'right-0 translate-x-1/2 top-2 bottom-2 w-2 cursor-ew-resize':''}
              ${dir==='w'?'left-0 -translate-x-1/2 top-2 bottom-2 w-2 cursor-ew-resize':''}
            `}/>
        ))}
      </div>
      <span style={{ fontSize: 9, color: shape.color, fontWeight: 700, marginTop: 4, fontFamily: "'DM Sans', sans-serif", opacity: 0.85, pointerEvents:'none', letterSpacing:'0.02em' }}>
        {shape.label ?? info?.label}
      </span>
    </div>
  );
}

// ─── Shape Editor ─────────────────────────────────────────────────────────────
const EDITOR_COLORS = ['#F4F5F7','#2563eb','#60a5fa','#93c5fd','#22d3ee','#4ade80','#f87171','#fbbf24','#a3e635','#e879f9','#94a3b8','#000000'];

type DrawTool = 'pen' | 'rect' | 'ellipse' | 'line' | 'arrow' | 'tri' | 'curve' | 'polygon' | 'star' | 'roundrect' | 'polyline' | 'editnode' | 'select';
export type EStroke = { color: string; sw: number; fill: string } & (
  | { kind: 'path'; pts: {x:number;y:number}[] }
  | { kind: 'poly'; pts: {x:number;y:number}[] }
  | { kind: 'polyline'; pts: {x:number;y:number}[]; arcs?: ({cp:{x:number;y:number}}|null)[] }
  | { kind: 'rect'; x:number; y:number; rw:number; rh:number }
  | { kind: 'roundrect'; x:number; y:number; rw:number; rh:number; r:number }
  | { kind: 'ellipse'; cx:number; cy:number; rx:number; ry:number }
  | { kind: 'line'; x1:number; y1:number; x2:number; y2:number }
  | { kind: 'arrow'; x1:number; y1:number; x2:number; y2:number }
  | { kind: 'tri'; x1:number; y1:number; x2:number; y2:number }
  | { kind: 'curve'; x1:number; y1:number; cpX:number; cpY:number; x2:number; y2:number }
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
    if(s.kind==='path'||s.kind==='poly'||s.kind==='polyline') s.pts.forEach(p=>ex(p.x,p.y));
    else if(s.kind==='rect'){ex(s.x,s.y);ex(s.x+s.rw,s.y+s.rh);}
    else if(s.kind==='roundrect'){ex(s.x,s.y);ex(s.x+s.rw,s.y+s.rh);}
    else if(s.kind==='ellipse'){ex(s.cx-s.rx,s.cy-s.ry);ex(s.cx+s.rx,s.cy+s.ry);}
    else if(s.kind==='line'||s.kind==='arrow'){ex(s.x1,s.y1);ex(s.x2,s.y2);}
    else if(s.kind==='tri'){
      const mx=(s.x1+s.x2)/2;
      ex(s.x1,s.y2);ex(s.x2,s.y2);ex(mx,s.y1);
    }
    else if(s.kind==='curve'){
      ex(s.x1,s.y1);ex(s.x2,s.y2);ex(s.cpX,s.cpY);
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
  if (s.kind==='roundrect') { const x=Math.min(s.x,s.x+s.rw),y=Math.min(s.y,s.y+s.rh),w=Math.abs(s.rw),h=Math.abs(s.rh); return <rect key={i} {...common} x={x} y={y} width={w} height={h} rx={Math.min(s.r, w/2, h/2)}/>; }
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
  if (s.kind==='curve') {
    return <path key={i} {...common} fill="none" d={`M ${s.x1.toFixed(1)} ${s.y1.toFixed(1)} Q ${s.cpX.toFixed(1)} ${s.cpY.toFixed(1)} ${s.x2.toFixed(1)} ${s.y2.toFixed(1)}`}/>;
  }
  if (s.kind==='polyline') {
    let d=`M${s.pts[0].x.toFixed(1)},${s.pts[0].y.toFixed(1)}`;
    for(let j=0;j<s.pts.length-1;j++){
      const arc=s.arcs?.[j];
      if(arc) d+=` Q${arc.cp.x.toFixed(1)},${arc.cp.y.toFixed(1)} ${s.pts[j+1].x.toFixed(1)},${s.pts[j+1].y.toFixed(1)}`;
      else d+=` L${s.pts[j+1].x.toFixed(1)},${s.pts[j+1].y.toFixed(1)}`;
    }
    return <path key={i} {...common} fill="none" d={d}/>;
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
  if (s.kind==='roundrect') {
    const x=Math.min(nx(s.x),nx(s.x+s.rw)),y=Math.min(ny(s.y),ny(s.y+s.rh));
    const w=Math.abs(nx(s.x+s.rw)-nx(s.x)),h=Math.abs(ny(s.y+s.rh)-ny(s.y));
    const scaledR = s.r * (w / (Math.abs(s.rw) || 1));
    return `<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${w.toFixed(2)}" height="${h.toFixed(2)}" rx="${Math.min(scaledR, w/2, h/2).toFixed(2)}" ${strokeAttr}/>`;
  }
  if (s.kind==='polyline') {
    let d=`M${nx(s.pts[0].x).toFixed(2)},${ny(s.pts[0].y).toFixed(2)}`;
    for(let j=0;j<s.pts.length-1;j++){
      const arc=s.arcs?.[j];
      if(arc) d+=` Q${nx(arc.cp.x).toFixed(2)},${ny(arc.cp.y).toFixed(2)} ${nx(s.pts[j+1].x).toFixed(2)},${ny(s.pts[j+1].y).toFixed(2)}`;
      else d+=` L${nx(s.pts[j+1].x).toFixed(2)},${ny(s.pts[j+1].y).toFixed(2)}`;
    }
    return `<path d="${d}" ${strokeAttr} fill="none"/>`;
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
  if (s.kind==='curve') {
    return `<path d="M ${nx(s.x1).toFixed(2)} ${ny(s.y1).toFixed(2)} Q ${nx(s.cpX).toFixed(2)} ${ny(s.cpY).toFixed(2)} ${nx(s.x2).toFixed(2)} ${ny(s.y2).toFixed(2)}" ${strokeAttr} fill="none"/>`;
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

function computeNgon(cx:number, cy:number, r:number, n:number): {x:number;y:number}[] {
  return Array.from({length:n}, (_,i) => {
    const a = (i * 2 * Math.PI / n) - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  });
}
function computeStar(cx:number, cy:number, ro:number, ri:number, n:number): {x:number;y:number}[] {
  const pts: {x:number;y:number}[] = [];
  for (let i=0; i<n*2; i++) {
    const a = (i * Math.PI / n) - Math.PI / 2;
    pts.push({ x: cx + (i%2===0?ro:ri)*Math.cos(a), y: cy + (i%2===0?ro:ri)*Math.sin(a) });
  }
  return pts;
}

function translateStroke(s: EStroke, dx: number, dy: number): EStroke {
  const tp = (p: {x:number;y:number}) => ({x: p.x+dx, y: p.y+dy});
  switch(s.kind) {
    case 'path':     return {...s, pts: s.pts.map(tp)};
    case 'poly':     return {...s, pts: s.pts.map(tp)};
    case 'polyline': return {...s, pts: s.pts.map(tp), arcs: s.arcs?.map(a=>a?{cp:tp(a.cp)}:null)};
    case 'rect':     return {...s, x:s.x+dx, y:s.y+dy};
    case 'roundrect':return {...s, x:s.x+dx, y:s.y+dy};
    case 'ellipse':  return {...s, cx:s.cx+dx, cy:s.cy+dy};
    case 'line':     return {...s, x1:s.x1+dx,y1:s.y1+dy,x2:s.x2+dx,y2:s.y2+dy};
    case 'arrow':    return {...s, x1:s.x1+dx,y1:s.y1+dy,x2:s.x2+dx,y2:s.y2+dy};
    case 'tri':      return {...s, x1:s.x1+dx,y1:s.y1+dy,x2:s.x2+dx,y2:s.y2+dy};
    case 'curve':    return {...s, x1:s.x1+dx,y1:s.y1+dy,x2:s.x2+dx,y2:s.y2+dy,cpX:s.cpX+dx,cpY:s.cpY+dy};
    default:         return s;
  }
}

function scaleStroke(s: EStroke, ox: number, oy: number, sx: number, sy: number): EStroke {
  const tp = (p: {x:number;y:number}) => ({ x: (p.x-ox)*sx+ox, y: (p.y-oy)*sy+oy });
  switch(s.kind) {
    case 'path':     return {...s, pts: s.pts.map(tp)};
    case 'poly':     return {...s, pts: s.pts.map(tp)};
    case 'polyline': return {...s, pts: s.pts.map(tp), arcs: s.arcs?.map(a=>a?{cp:tp(a.cp)}:null)};
    case 'rect':     { const tl=tp({x:s.x,y:s.y}),br=tp({x:s.x+s.rw,y:s.y+s.rh}); return {...s,x:tl.x,y:tl.y,rw:br.x-tl.x,rh:br.y-tl.y}; }
    case 'roundrect':{ const tl=tp({x:s.x,y:s.y}),br=tp({x:s.x+s.rw,y:s.y+s.rh}); return {...s,x:tl.x,y:tl.y,rw:br.x-tl.x,rh:br.y-tl.y}; }
    case 'ellipse':  { const c=tp({x:s.cx,y:s.cy}); return {...s,cx:c.x,cy:c.y,rx:Math.abs(s.rx*sx),ry:Math.abs(s.ry*sy)}; }
    case 'line':     { const p1=tp({x:s.x1,y:s.y1}),p2=tp({x:s.x2,y:s.y2}); return {...s,x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y}; }
    case 'arrow':    { const p1=tp({x:s.x1,y:s.y1}),p2=tp({x:s.x2,y:s.y2}); return {...s,x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y}; }
    case 'tri':      { const p1=tp({x:s.x1,y:s.y1}),p2=tp({x:s.x2,y:s.y2}); return {...s,x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y}; }
    case 'curve':    { const p1=tp({x:s.x1,y:s.y1}),p2=tp({x:s.x2,y:s.y2}),cp=tp({x:s.cpX,y:s.cpY}); return {...s,x1:p1.x,y1:p1.y,x2:p2.x,y2:p2.y,cpX:cp.x,cpY:cp.y}; }
    default:         return s;
  }
}

// Row 1 (7): select, editnode, pen, polyline, curve, line, arrow  |  Row 2 (6): shapes
const TOOL_DEFS: {id: DrawTool; label: string; icon: React.ReactElement}[] = [
  { id:'select',   label:'Selección',        icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="currentColor" stroke="none"><path d="M3 2 L3 12.5 L6 9.5 L8.5 14.5 L10.2 13.7 L7.8 8.8 L12 8.8 Z"/></svg> },
  { id:'editnode', label:'Editar nodos',     icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13 Q5 7 9 7 Q13 7 13 4"/><circle cx="3" cy="13" r="2" fill="#0A0C0F" strokeWidth="1.7"/><circle cx="13" cy="4" r="2" fill="#0A0C0F" strokeWidth="1.7"/><rect x="7.5" y="5.5" width="3" height="3" transform="rotate(45 9 7)" fill="#0A0C0F" strokeWidth="1.4"/></svg> },
  { id:'pen',      label:'Lápiz libre',     icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 14 L5 11 L13 3 L13 6 L2 14Z"/><path d="M11 5l2 2"/></svg> },
  { id:'polyline', label:'Polilínea',        icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="2,13 6,5 10,9 14,3"/><circle cx="2" cy="13" r="1.5" fill="currentColor"/><circle cx="6" cy="5" r="1.5" fill="currentColor"/><circle cx="10" cy="9" r="1.5" fill="currentColor"/><circle cx="14" cy="3" r="1.5" fill="currentColor"/></svg> },
  { id:'curve',    label:'Curva Bézier',     icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 12 C 5 2, 11 2, 14 12"/></svg> },
  { id:'line',     label:'Línea',            icon:<svg viewBox="0 0 16 16" width={14} height={14} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="2" y1="14" x2="14" y2="2"/></svg> },
  { id:'arrow',    label:'Flecha',           icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><line x1="2" y1="14" x2="13" y2="3"/><polyline points="7,3 13,3 13,9"/></svg> },
  { id:'rect',     label:'Rectángulo',       icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="12" height="8" rx="1"/></svg> },
  { id:'roundrect',label:'Rect. redondeado', icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="4" width="12" height="8" rx="3.5"/></svg> },
  { id:'ellipse',  label:'Elipse / Círculo', icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="8" cy="8" rx="6" ry="4"/></svg> },
  { id:'tri',      label:'Triángulo',        icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 15,14 1,14"/></svg> },
  { id:'polygon',  label:'Polígono',         icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 13.5,5 13.5,11 8,14 2.5,11 2.5,5"/></svg> },
  { id:'star',     label:'Estrella',         icon:<svg viewBox="0 0 16 16" width={14} height={14} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="8,2 9.5,6.5 14,6.5 10.4,9.1 11.8,13.5 8,11 4.2,13.5 5.6,9.1 2,6.5 6.5,6.5"/></svg> },
];

function ShapeEditor({ onSave, onCancel }: { onSave: (s: CustomShape) => void; onCancel: () => void }) {
  const [strokes, setStrokes] = useState<EStroke[]>([]);
  const [tool, setTool] = useState<DrawTool>('pen');
  const [color, setColor] = useState('#2563eb');
  const [fillColor, setFillColor] = useState<string>('none');
  const [sw, setSw] = useState(2.5);
  const [label, setLabel] = useState('');
  const [sides, setSides] = useState(6);
  const [starPts, setStarPts] = useState(5);
  const [cornerR, setCornerR] = useState(14);
  const [curPts, setCurPts] = useState<{x:number;y:number}[]|null>(null);
  const [polylinePts, setPolylinePts] = useState<{x:number;y:number}[]>([]);
  const [polylineLive, setPolylineLive] = useState<{x:number;y:number}|null>(null);
  const [editingIdx, setEditingIdx] = useState<number>(-1);
  const [handleDrag, setHandleDrag] = useState<{kind:'arc'|'vertex'; segIdx:number}|null>(null);
  const [selectIdx, setSelectIdx] = useState<number>(-1);
  const [selDrag, setSelDrag] = useState<{sx:number;sy:number}|null>(null);
  const [selDelta, setSelDelta] = useState<{x:number;y:number}>({x:0,y:0});
  const [clipStroke, setClipStroke] = useState<EStroke|null>(null);
  const [resizeDrag, setResizeDrag] = useState<{corner:string; origStroke:EStroke; origBB:{minX:number;minY:number;maxX:number;maxY:number}}|null>(null);
  const [dragStart, setDragStart] = useState<{x:number;y:number}|null>(null);
  const [dragCur, setDragCur] = useState<{x:number;y:number}|null>(null);
  const [remastered, setRemastered] = useState(false);

  // --- Boceto desde Imagen (Vectorizador) ---
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [edgeThreshold, setEdgeThreshold] = useState(0.20);
  const [minPathLen, setMinPathLen] = useState(8);
  const [vectStrokeW, setVectStrokeW] = useState(2.0);
  const [vectorizing, setVectorizing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [vectFillMode, setVectFillMode] = useState<'none' | 'solid'>('solid');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleVectorize = (imgElement: HTMLImageElement, threshold: number, minLen: number, strokeW: number, fillMode: 'none' | 'solid') => {
    setVectorizing(true);
    setTimeout(() => {
      try {
        const PS = 512;
        const canvas = document.createElement("canvas");
        canvas.width = PS; canvas.height = PS;
        const ctx = canvas.getContext("2d");
        if (!ctx) { toast.error("Error al procesar la imagen"); setVectorizing(false); return; }

        const natW = imgElement.naturalWidth || imgElement.width;
        const natH = imgElement.naturalHeight || imgElement.height;
        const aspect = natW / (natH || 1);
        let dw = PS, dh = PS, dx = 0, dy = 0;
        if (aspect > 1) { dh = Math.round(PS / aspect); dy = Math.round((PS - dh) / 2); }
        else { dw = Math.round(PS * aspect); dx = Math.round((PS - dw) / 2); }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, PS, PS);
        ctx.drawImage(imgElement, dx, dy, dw, dh);

        const id = ctx.getImageData(0, 0, PS, PS);
        const px = id.data;
        const W = PS, H = PS;

        // ── 1. K-means color quantization ────────────────────────────────
        const K = 14;
        type RGB = [number, number, number];
        const sampleStep = 4;
        const samples: RGB[] = [];
        for (let y = 0; y < H; y += sampleStep)
          for (let x = 0; x < W; x += sampleStep) {
            const i = (y * W + x) * 4;
            samples.push([px[i], px[i + 1], px[i + 2]]);
          }

        let cents: RGB[] = Array.from({ length: K }, (_, k) =>
          [...samples[Math.floor(k * samples.length / K)]] as RGB
        );

        for (let iter = 0; iter < 20; iter++) {
          const sums: [number, number, number][] = Array.from({ length: K }, () => [0, 0, 0]);
          const cnts = new Array<number>(K).fill(0);
          for (const [r, g, b] of samples) {
            let bd = Infinity, bk = 0;
            for (let k = 0; k < K; k++) {
              const dr = r - cents[k][0], dg = g - cents[k][1], db = b - cents[k][2];
              const d = dr * dr + dg * dg + db * db;
              if (d < bd) { bd = d; bk = k; }
            }
            sums[bk][0] += r; sums[bk][1] += g; sums[bk][2] += b; cnts[bk]++;
          }
          for (let k = 0; k < K; k++)
            if (cnts[k] > 0)
              cents[k] = [sums[k][0] / cnts[k], sums[k][1] / cnts[k], sums[k][2] / cnts[k]];
        }

        // Assign each pixel to nearest centroid
        const labels = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) {
          const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
          let bd = Infinity, bk = 0;
          for (let k = 0; k < K; k++) {
            const dr = r - cents[k][0], dg = g - cents[k][1], db = b - cents[k][2];
            const d = dr * dr + dg * dg + db * db;
            if (d < bd) { bd = d; bk = k; }
          }
          labels[i] = bk;
        }

        // ── 2. Connected-component BFS ────────────────────────────────────
        const visited = new Uint8Array(W * H);
        // Scale minSize relative to canvas area; threshold controls coarseness
        const minSize = Math.max(10, Math.round(W * H * (0.00002 + threshold * 0.0003)));

        type Comp = { minIdx: number; colorLabel: number; size: number; mask: Uint8Array; isBg: boolean };
        const comps: Comp[] = [];

        for (let si = 0; si < W * H; si++) {
          if (visited[si]) continue;
          const cl = labels[si];
          const mask = new Uint8Array(W * H);
          const queue: number[] = [si];
          visited[si] = 1;
          let minIdx = si, size = 0, touchesBorder = false;

          while (queue.length) {
            const idx = queue.pop()!;
            mask[idx] = 1;
            if (idx < minIdx) minIdx = idx;
            size++;
            const qx = idx % W, qy = Math.floor(idx / W);
            if (qx === 0 || qx === W - 1 || qy === 0 || qy === H - 1) touchesBorder = true;
            if (qx + 1 < W) { const n = idx + 1; if (!visited[n] && labels[n] === cl) { visited[n] = 1; queue.push(n); } }
            if (qx - 1 >= 0) { const n = idx - 1; if (!visited[n] && labels[n] === cl) { visited[n] = 1; queue.push(n); } }
            if (qy + 1 < H) { const n = idx + W; if (!visited[n] && labels[n] === cl) { visited[n] = 1; queue.push(n); } }
            if (qy - 1 >= 0) { const n = idx - W; if (!visited[n] && labels[n] === cl) { visited[n] = 1; queue.push(n); } }
          }

          // Mark as background if it touches the canvas border AND is near-white (canvas fill)
          const cl_lum = 0.299 * cents[cl][0] + 0.587 * cents[cl][1] + 0.114 * cents[cl][2];
          const isBg = touchesBorder && cl_lum > 215;
          if (size >= minSize) comps.push({ minIdx, colorLabel: cl, size, mask, isBg });
        }

        comps.sort((a, b) => b.size - a.size); // largest first → renders as background

        // ── 3. Moore-neighbor contour tracing ────────────────────────────
        // Directions: E SE S SW W NW N NE (clockwise)
        const CDX = [1, 1, 0, -1, -1, -1, 0, 1];
        const CDY = [0, 1, 1, 1, 0, -1, -1, -1];

        const traceContour = (compMask: Uint8Array, sx: number, sy: number): { x: number; y: number }[] => {
          const pts: { x: number; y: number }[] = [];
          let cx = sx, cy = sy;
          // Entered scanning left→right so backtrack = West (dir 4); start looking from dir 5 (NW)
          let look = 5;
          const maxS = 60000;
          let steps = 0;
          while (steps++ < maxS) {
            pts.push({ x: cx, y: cy });
            let found = false;
            for (let i = 0; i < 8; i++) {
              const d = (look + i) % 8;
              const nx = cx + CDX[d], ny = cy + CDY[d];
              if (nx >= 0 && nx < W && ny >= 0 && ny < H && compMask[ny * W + nx]) {
                look = ((d + 4) % 8 + 1) % 8;
                cx = nx; cy = ny;
                found = true;
                break;
              }
            }
            if (!found || (steps > 4 && cx === sx && cy === sy)) break;
          }
          return pts;
        };

        // ── 4. Build SVG strokes ─────────────────────────────────────────
        const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0');
        const toSvg = (v: number) => v * SIZE / PS;
        const smooth1 = (pts: { x: number; y: number }[]) => {
          if (pts.length < 3) return pts;
          const r = [pts[0]];
          for (let i = 1; i < pts.length - 1; i++)
            r.push({ x: (pts[i - 1].x + pts[i].x + pts[i + 1].x) / 3, y: (pts[i - 1].y + pts[i].y + pts[i + 1].y) / 3 });
          r.push(pts[pts.length - 1]);
          return r;
        };

        const newStrokes: EStroke[] = [];

        for (const { minIdx, colorLabel, mask: compMask, isBg } of comps) {
          if (isBg) continue; // skip canvas background region

          const [cr, cg, cb] = cents[colorLabel];
          const lum = 0.299 * cr + 0.587 * cg + 0.114 * cb;
          // Brighten very-dark colors so they're visible on the dark pizarra (#0D0F14)
          const brighten = lum < 60 ? Math.min(1, (80 - lum) / 80) : 0;
          const fr = Math.round(cr + (255 - cr) * brighten * 0.85);
          const fg = Math.round(cg + (255 - cg) * brighten * 0.85);
          const fb = Math.round(cb + (255 - cb) * brighten * 0.85);
          const colorHex = `#${toHex(fr)}${toHex(fg)}${toHex(fb)}`;
          const sx = minIdx % W, sy = Math.floor(minIdx / W);

          const raw = traceContour(compMask, sx, sy);
          if (raw.length < 4) continue;

          // Deduplicate consecutive identical points
          const dedup: { x: number; y: number }[] = [raw[0]];
          for (let i = 1; i < raw.length; i++) {
            const c = raw[i], prev = dedup[dedup.length - 1];
            if (c.x !== prev.x || c.y !== prev.y) dedup.push(c);
          }

          // Downsample long contours to at most ~700 pts before smoothing
          const ds = dedup.filter((_, i) => i % Math.max(1, Math.floor(dedup.length / 700)) === 0);
          if (ds.length < 4) continue;

          // 2-pass smoothing
          const smoothed = smooth1(smooth1(ds));

          // Scale and simplify
          const scaled = smoothed.map(p => ({ x: toSvg(p.x), y: toSvg(p.y) }));
          const simplified = dougPeucker(scaled, Math.max(0.4, SIZE * 0.0035));
          if (simplified.length < 3) continue;

          if (fillMode === 'solid') {
            newStrokes.push({ kind: 'poly', color: colorHex, sw: 0.4, fill: colorHex, pts: simplified });
          } else {
            newStrokes.push({ kind: 'poly', color: colorHex, sw: strokeW, fill: 'none', pts: simplified });
          }
        }

        setStrokes(newStrokes);
        toast.success(`Vectorización completa: ${newStrokes.length} regiones`);
      } catch (err) {
        console.error(err);
        toast.error("Ocurrió un error al digitalizar el boceto");
      } finally {
        setVectorizing(false);
      }
    }, 50);
  };

  const loadImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona un archivo de imagen válido.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageSrc(dataUrl);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        handleVectorize(img, edgeThreshold, minPathLen, vectStrokeW, vectFillMode);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) loadImage(file);
  };

  useEffect(() => {
    if (imageRef.current) {
      handleVectorize(imageRef.current, edgeThreshold, minPathLen, vectStrokeW, vectFillMode);
    }
  }, [edgeThreshold, minPathLen, vectStrokeW, vectFillMode]);

  // Estados para curva interactiva de 3 puntos
  const [curvePhase, setCurvePhase] = useState<0 | 1 | 2>(0);
  const [curveStart, setCurveStart] = useState<{x:number;y:number}|null>(null);
  const [curveEnd, setCurveEnd] = useState<{x:number;y:number}|null>(null);
  const [curveCP, setCurveCP] = useState<{x:number;y:number}|null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const SIZE = 340;

  // Reset transient state on tool change
  useEffect(() => {
    setCurvePhase(0); setCurveStart(null); setCurveEnd(null); setCurveCP(null);
    setDragStart(null); setDragCur(null);
    setPolylinePts([]); setPolylineLive(null);
    setEditingIdx(-1); setHandleDrag(null);
    setSelectIdx(-1); setSelDrag(null); setSelDelta({x:0,y:0}); setResizeDrag(null);
  }, [tool]);

  // Window drag for selection move
  useEffect(() => {
    if (!selDrag || selectIdx < 0) return;
    const onWinMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      setSelDelta({ x: e.clientX - r.left - selDrag.sx, y: e.clientY - r.top - selDrag.sy });
    };
    const onWinUp = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      const dx = e.clientX - r.left - selDrag.sx;
      const dy = e.clientY - r.top - selDrag.sy;
      if (Math.hypot(dx, dy) > 3) {
        setStrokes(prev => prev.map((s, i) => i === selectIdx ? translateStroke(s, dx, dy) : s));
      }
      setSelDrag(null); setSelDelta({x:0,y:0});
    };
    window.addEventListener('mousemove', onWinMove);
    window.addEventListener('mouseup', onWinUp);
    return () => { window.removeEventListener('mousemove', onWinMove); window.removeEventListener('mouseup', onWinUp); };
  }, [selDrag, selectIdx]);

  // Window drag for resize handles
  useEffect(() => {
    if (!resizeDrag || selectIdx < 0) return;
    const { corner, origStroke, origBB } = resizeDrag;
    const { minX, minY, maxX, maxY } = origBB;
    const origW = maxX - minX || 1, origH = maxY - minY || 1;
    const onWinMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const r = svgRef.current.getBoundingClientRect();
      const cx = e.clientX - r.left, cy = e.clientY - r.top;
      let ox: number, oy: number, nw: number, nh: number;
      if (corner==='se'){ox=minX;oy=minY;nw=cx-minX;nh=cy-minY;}
      else if(corner==='sw'){ox=maxX;oy=minY;nw=maxX-cx;nh=cy-minY;}
      else if(corner==='ne'){ox=minX;oy=maxY;nw=cx-minX;nh=maxY-cy;}
      else{ox=maxX;oy=maxY;nw=maxX-cx;nh=maxY-cy;}
      const sx=nw/origW, sy=nh/origH;
      if(Math.abs(sx)>0.05&&Math.abs(sy)>0.05)
        setStrokes(prev=>prev.map((s,i)=>i===selectIdx?scaleStroke(origStroke,ox,oy,sx,sy):s));
    };
    const onWinUp = () => setResizeDrag(null);
    window.addEventListener('mousemove', onWinMove);
    window.addEventListener('mouseup', onWinUp);
    return () => { window.removeEventListener('mousemove', onWinMove); window.removeEventListener('mouseup', onWinUp); };
  }, [resizeDrag, selectIdx]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Polyline commit / exit edit
      if (e.key === 'Enter') {
        if (tool === 'polyline' && polylinePts.length >= 2) {
          e.preventDefault();
          const pts = [...polylinePts];
          setStrokes(prev => { setEditingIdx(prev.length); return [...prev, {kind:'polyline',color,sw,fill:'none',pts}]; });
          setPolylinePts([]); setPolylineLive(null);
        } else if (editingIdx >= 0) { setEditingIdx(-1); }
        return;
      }
      if (e.key === 'Escape') {
        setPolylinePts([]); setPolylineLive(null); setEditingIdx(-1); setHandleDrag(null); setSelectIdx(-1);
        return;
      }
      // Select tool shortcuts
      if (tool === 'select' && selectIdx >= 0) {
        // Arrow keys — 1px (Shift = 10px)
        const step = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowLeft')  { e.preventDefault(); setStrokes(prev=>prev.map((s,i)=>i===selectIdx?translateStroke(s,-step,0):s)); return; }
        if (e.key === 'ArrowRight') { e.preventDefault(); setStrokes(prev=>prev.map((s,i)=>i===selectIdx?translateStroke(s, step,0):s)); return; }
        if (e.key === 'ArrowUp')    { e.preventDefault(); setStrokes(prev=>prev.map((s,i)=>i===selectIdx?translateStroke(s,0,-step):s)); return; }
        if (e.key === 'ArrowDown')  { e.preventDefault(); setStrokes(prev=>prev.map((s,i)=>i===selectIdx?translateStroke(s,0, step):s)); return; }
        // Delete
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          setStrokes(prev=>prev.filter((_,i)=>i!==selectIdx)); setSelectIdx(-1); return;
        }
        // Copy
        if ((e.ctrlKey||e.metaKey) && e.key==='c') {
          e.preventDefault(); setClipStroke(strokes[selectIdx]); return;
        }
      }
      // Paste (any time there's a clip)
      if ((e.ctrlKey||e.metaKey) && e.key==='v' && clipStroke) {
        e.preventDefault();
        setStrokes(prev => {
          const copy = translateStroke(clipStroke, 16, 16);
          setClipStroke(copy); // offset for next paste
          setSelectIdx(prev.length);
          return [...prev, copy];
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [tool, polylinePts, color, sw, editingIdx, selectIdx, clipStroke, strokes]);

  // Global drag for edit handles (works even when cursor leaves SVG)
  useEffect(() => {
    if (!handleDrag || editingIdx < 0) return;
    const onWinMove = (e: MouseEvent) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const p = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      setStrokes(prev => prev.map((s, i) => {
        if (i !== editingIdx || s.kind !== 'polyline') return s;
        if (handleDrag.kind === 'arc') {
          const newArcs: ({cp:{x:number;y:number}}|null)[] =
            Array.isArray(s.arcs) ? [...s.arcs] : Array(s.pts.length - 1).fill(null);
          newArcs[handleDrag.segIdx] = { cp: p };
          return { ...s, arcs: newArcs };
        }
        if (handleDrag.kind === 'vertex') {
          const newPts = [...s.pts];
          newPts[handleDrag.segIdx] = p;
          return { ...s, pts: newPts };
        }
        return s;
      }));
    };
    const onWinUp = () => setHandleDrag(null);
    window.addEventListener('mousemove', onWinMove);
    window.addEventListener('mouseup', onWinUp);
    return () => { window.removeEventListener('mousemove', onWinMove); window.removeEventListener('mouseup', onWinUp); };
  }, [handleDrag, editingIdx]);

  const hasPenStrokes = strokes.some(s => s.kind === 'path');
  const closedTools: DrawTool[] = ['rect','roundrect','ellipse','tri','polygon','star'];
  const isClosed = closedTools.includes(tool);

  const handleRemaster = () => {
    setStrokes(prev => remasterStrokes(prev));
    setRemastered(true);
    setTimeout(() => setRemastered(false), 1400);
  };

  const getFill = () => isClosed ? fillColor : 'none';

  const getpt = (e: React.MouseEvent) => {
    const rect = svgRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const buildPreview = (): EStroke|null => {
    const f = getFill();
    if (tool==='curve') {
      if (curvePhase===1 && dragStart && dragCur)
        return {kind:'line',color,sw,fill:'none',x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
      if (curvePhase===2 && curveStart && curveEnd && curveCP)
        return {kind:'curve',color,sw,fill:'none',x1:curveStart.x,y1:curveStart.y,cpX:curveCP.x,cpY:curveCP.y,x2:curveEnd.x,y2:curveEnd.y};
      return null;
    }
    if (!dragStart || !dragCur) return null;
    const cx=(dragStart.x+dragCur.x)/2, cy=(dragStart.y+dragCur.y)/2;
    const r=Math.hypot(dragCur.x-cx,dragCur.y-cy);
    if (tool==='rect') return {kind:'rect',color,sw,fill:f,x:dragStart.x,y:dragStart.y,rw:dragCur.x-dragStart.x,rh:dragCur.y-dragStart.y};
    if (tool==='roundrect') return {kind:'roundrect',color,sw,fill:f,x:dragStart.x,y:dragStart.y,rw:dragCur.x-dragStart.x,rh:dragCur.y-dragStart.y,r:cornerR};
    if (tool==='ellipse') return {kind:'ellipse',color,sw,fill:f,cx,cy,rx:Math.abs(dragCur.x-dragStart.x)/2,ry:Math.abs(dragCur.y-dragStart.y)/2};
    if (tool==='line') return {kind:'line',color,sw,fill:'none',x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
    if (tool==='arrow') return {kind:'arrow',color,sw,fill:'none',x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
    if (tool==='tri') return {kind:'tri',color,sw,fill:f,x1:dragStart.x,y1:dragStart.y,x2:dragCur.x,y2:dragCur.y};
    if (tool==='polygon') return {kind:'poly',color,sw,fill:f,pts:computeNgon(cx,cy,r,sides)};
    if (tool==='star') return {kind:'poly',color,sw,fill:f,pts:computeStar(cx,cy,r,r*0.42,starPts)};
    return null;
  };

  const onDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const p = getpt(e);
    if (tool==='select')   { setSelectIdx(-1); return; }  // background click deselects
    if (tool==='editnode') { setEditingIdx(-1); return; } // background click deselects; hits stop propagation
    if (tool==='pen') { setCurPts([p]); return; }
    if (tool==='polyline') return; // handled by onClick/onDoubleClick
    if (tool==='curve') {
      if (curvePhase===0) { setCurvePhase(1); setDragStart(p); setDragCur(p); }
      else if (curvePhase===2 && curveStart && curveEnd && curveCP) {
        setStrokes(prev=>[...prev,{kind:'curve',color,sw,fill:'none',x1:curveStart.x,y1:curveStart.y,cpX:curveCP.x,cpY:curveCP.y,x2:curveEnd.x,y2:curveEnd.y}]);
        setCurvePhase(0); setCurveStart(null); setCurveEnd(null); setCurveCP(null);
      }
      return;
    }
    setDragStart(p); setDragCur(p);
  };

  const handlePolylineClick = (e: React.MouseEvent) => {
    if (tool !== 'polyline') return;
    e.preventDefault();
    if (editingIdx >= 0) { setEditingIdx(-1); return; } // click canvas → exit edit mode
    setPolylinePts(prev => [...prev, getpt(e)]);
  };

  const handlePolylineDblClick = (e: React.MouseEvent) => {
    if (tool !== 'polyline') return;
    e.preventDefault();
    const pts = polylinePts.slice(0, -2);
    if (pts.length >= 2) {
      setStrokes(prev => {
        setEditingIdx(prev.length);
        return [...prev, {kind:'polyline',color,sw,fill:'none',pts}];
      });
    }
    setPolylinePts([]); setPolylineLive(null);
  };

  const onMove = (e: React.MouseEvent) => {
    const p = getpt(e);
    if (tool==='pen') { if (!curPts) return; setCurPts(prev=>[...(prev||[]),p]); return; }
    if (tool==='polyline') { setPolylineLive(p); return; }
    if (tool==='curve') {
      if (curvePhase===1 && dragStart) setDragCur(p);
      else if (curvePhase===2 && curveStart && curveEnd) {
        const cpX=2*p.x-0.5*(curveStart.x+curveEnd.x);
        const cpY=2*p.y-0.5*(curveStart.y+curveEnd.y);
        setCurveCP({x:cpX,y:cpY});
      }
      return;
    }
    if (!dragStart) return;
    setDragCur(p);
  };

  const onUp = () => {
    if (handleDrag) return; // window listener handles this
    if (tool==='pen') {
      if (curPts && curPts.length>1) setStrokes(p=>[...p,{kind:'path',color,sw,fill:'none',pts:curPts}]);
      setCurPts(null); return;
    }
    if (tool==='polyline') return;
    if (tool==='curve') {
      if (curvePhase===1 && dragStart && dragCur) {
        setCurveStart(dragStart); setCurveEnd(dragCur);
        setCurveCP({x:(dragStart.x+dragCur.x)/2,y:(dragStart.y+dragCur.y)/2});
        setCurvePhase(2); setDragStart(null); setDragCur(null);
      }
      return;
    }
    const prev=buildPreview();
    if (prev) setStrokes(p=>[...p,prev]);
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

  const FILL_COLORS = ['none', '#F4F5F7', '#2563eb', '#60a5fa', '#93c5fd', '#22d3ee', '#4ade80', '#f87171', '#fbbf24', '#94a3b8', '#000000'];

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.82)',backdropFilter:'blur(10px)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center'}}
      onClick={e=>{if(e.target===e.currentTarget)onCancel();}}>
      <div style={{background:'rgba(12,15,22,0.99)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:22,padding:20,display:'flex',flexDirection:'column',gap:16,boxShadow:'0 32px 80px rgba(0,0,0,0.85)',width:660,maxWidth:'95vw'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div>
            <p style={{margin:0,fontWeight:800,fontSize:15,color:'#F4F5F7'}}>Editor de Formas</p>
            <p style={{margin:0,fontSize:11,color:'#5A6270',marginTop:2}}>
              {tool==='select' && selectIdx >= 0
                ? 'Arrastra para mover · Supr para eliminar · Ctrl+D para duplicar · Esc para deseleccionar'
                : tool==='select'
                  ? 'Haz clic en cualquier elemento para seleccionarlo'
                  : editingIdx >= 0
                    ? 'Arrastra ◆ para arquear · ○ para mover vértice · Esc o clic vacío para salir'
                    : tool==='editnode'
                      ? 'Haz clic en una polilínea para editar sus nodos'
                      : tool==='polyline'
                        ? 'Clic para puntos · Enter o doble clic para finalizar'
                        : 'Dibuja con herramientas o digitaliza una imagen'}
            </p>
          </div>
          <button onClick={onCancel} style={{width:28,height:28,borderRadius:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#8A9099',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg viewBox="0 0 12 12" width={11} height={11} stroke="currentColor" strokeWidth="2"><path d="M2 2l8 8M10 2l-8 8"/></svg>
          </button>
        </div>

        {/* Dos columnas: Editor manual y Digitalizador */}
        <div style={{display:'flex',gap:20,alignItems:'stretch'}}>

          {/* Columna Izquierda: Dibujo Manual */}
          <div style={{width:340,display:'flex',flexDirection:'column',gap:12}}>
            {/* Tool selector — 2 rows: drawing (5) + shapes (6) */}
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {[TOOL_DEFS.slice(0,7), TOOL_DEFS.slice(7)].map((row,ri)=>(
                <div key={ri} style={{display:'flex',gap:4}}>
                  {row.map(t=>(
                    <button key={t.id} onClick={()=>setTool(t.id)} title={t.label}
                      style={{flex:1,height:30,borderRadius:8,background:tool===t.id?'rgba(37,99,235,0.25)':'rgba(255,255,255,0.05)',border:`1px solid ${tool===t.id?'rgba(37,99,235,0.7)':'rgba(255,255,255,0.08)'}`,color:tool===t.id?'#2563eb':'#8A9099',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all 0.15s',flexShrink:0}}>
                      {t.icon}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Stroke color + width + undo/clear */}
            <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
              <div style={{display:'flex',gap:3,flexWrap:'wrap',flex:1,alignItems:'center'}}>
                <span style={{fontSize:9,color:'#5A6270',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',marginRight:2}}>Trazo</span>
                {EDITOR_COLORS.map(c=>(
                  <button key={c} onClick={()=>setColor(c)}
                    style={{width:16,height:16,borderRadius:'50%',background:c,border:color===c?'2px solid #fff':'2px solid transparent',cursor:'pointer',flexShrink:0,transition:'transform 0.1s',boxShadow:c==='#000000'?'0 0 0 1px rgba(255,255,255,0.2)':'none'}}
                    onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.3)';}}
                    onMouseLeave={e=>{e.currentTarget.style.transform='scale(1)';}}/>
                ))}
              </div>
              <div style={{display:'flex',gap:3}}>
                {[1.5,2.5,4,7].map(w=>(
                  <button key={w} onClick={()=>setSw(w)} title={`Grosor ${w}`}
                    style={{width:24,height:24,borderRadius:7,background:sw===w?'rgba(37,99,235,0.3)':'rgba(255,255,255,0.05)',border:`1px solid ${sw===w?'rgba(37,99,235,0.6)':'rgba(255,255,255,0.08)'}`,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <div style={{borderRadius:'50%',background:sw===w?'#2563eb':'#8A9099',width:Math.min(w*2,13),height:Math.min(w*2,13)}}/>
                  </button>
                ))}
                <button onClick={()=>setStrokes(s=>s.slice(0,-1))} title="Deshacer último" disabled={strokes.length===0}
                  style={{width:24,height:24,borderRadius:7,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:strokes.length===0?'#3A3F4A':'#8A9099',cursor:strokes.length===0?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13}}>↩</button>
                <button onClick={()=>{setStrokes([]); setPolylinePts([]); setPolylineLive(null); setImageSrc(null); imageRef.current = null;}} title="Limpiar todo" disabled={strokes.length===0}
                  style={{width:24,height:24,borderRadius:7,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',color:strokes.length===0?'#3A3F4A':'#E74C3C',cursor:strokes.length===0?'default':'pointer',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12}}>✕</button>
              </div>
            </div>

            {/* Fill color — only for closed shapes */}
            {isClosed && (
              <div style={{display:'flex',alignItems:'center',gap:6}}>
                <span style={{fontSize:9,color:'#5A6270',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.06em',flexShrink:0}}>Relleno</span>
                {FILL_COLORS.map(c=>(
                  <button key={c} onClick={()=>setFillColor(c)} title={c==='none'?'Sin relleno':c}
                    style={{width:16,height:16,borderRadius:'50%',flexShrink:0,cursor:'pointer',transition:'transform 0.1s',
                      background:c==='none'?'transparent':c,
                      border:fillColor===c?'2px solid #fff':'2px solid rgba(255,255,255,0.2)',
                      boxShadow:c==='#000000'?'0 0 0 1px rgba(255,255,255,0.2)':undefined,
                      position:'relative',
                    }}>
                    {c==='none' && <svg viewBox="0 0 12 12" width={8} height={8} style={{position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)'}} stroke="rgba(255,255,255,0.5)" strokeWidth="2"><line x1="2" y1="2" x2="10" y2="10"/><line x1="10" y1="2" x2="2" y2="10"/></svg>}
                  </button>
                ))}
                {fillColor!=='none' && (
                  <div style={{width:18,height:18,borderRadius:5,border:`1px solid ${fillColor}`,background:fillColor,flexShrink:0}}/>
                )}
              </div>
            )}

            {/* Polygon/star config */}
            {(tool==='polygon'||tool==='star') && (
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                {tool==='polygon' && <>
                  <span style={{fontSize:11,color:'#5A6270',flexShrink:0}}>Lados:</span>
                  {[3,4,5,6,8,10,12].map(n=>(
                    <button key={n} onClick={()=>setSides(n)}
                      style={{width:26,height:22,borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',
                        background:sides===n?'rgba(37,99,235,0.25)':'rgba(255,255,255,0.05)',
                        border:`1px solid ${sides===n?'rgba(37,99,235,0.7)':'rgba(255,255,255,0.08)'}`,
                        color:sides===n?'#2563eb':'#8A9099'}}>
                      {n}
                    </button>
                  ))}
                </>}
                {tool==='star' && <>
                  <span style={{fontSize:11,color:'#5A6270',flexShrink:0}}>Puntas:</span>
                  {[3,4,5,6,7,8].map(n=>(
                    <button key={n} onClick={()=>setStarPts(n)}
                      style={{width:26,height:22,borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',
                        background:starPts===n?'rgba(241,196,15,0.25)':'rgba(255,255,255,0.05)',
                        border:`1px solid ${starPts===n?'rgba(241,196,15,0.7)':'rgba(255,255,255,0.08)'}`,
                        color:starPts===n?'#F1C40F':'#8A9099'}}>
                      {n}
                    </button>
                  ))}
                </>}
              </div>
            )}

            {/* Rounded rect corner radius */}
            {tool==='roundrect' && (
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:11,color:'#5A6270',flexShrink:0}}>Radio esquina:</span>
                {[4,8,14,20,32].map(r=>(
                  <button key={r} onClick={()=>setCornerR(r)}
                    style={{width:30,height:22,borderRadius:6,fontSize:11,fontWeight:700,cursor:'pointer',
                      background:cornerR===r?'rgba(52,152,219,0.25)':'rgba(255,255,255,0.05)',
                      border:`1px solid ${cornerR===r?'rgba(52,152,219,0.7)':'rgba(255,255,255,0.08)'}`,
                      color:cornerR===r?'#3498DB':'#8A9099'}}>
                    {r}
                  </button>
                ))}
              </div>
            )}

            {/* Remaster button */}
            {hasPenStrokes && (
              <button onClick={handleRemaster}
                style={{display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:'6px 0',borderRadius:10,
                  background:remastered?'rgba(46,204,113,0.18)':'rgba(52,152,219,0.14)',
                  border:`1px solid ${remastered?'rgba(46,204,113,0.5)':'rgba(52,152,219,0.45)'}`,
                  color:remastered?'#2ECC71':'#5DADE2',fontSize:11,fontWeight:700,cursor:'pointer',transition:'all 0.25s',width:'100%'}}>
                {remastered
                  ? <><svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="2,9 6,13 14,4"/></svg> ¡Remasterizado!</>
                  : <><svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 13 Q1 8 5 5 Q8 2 11 5 Q14 8 12 12"/><path d="M10 14l2-2-2-2"/></svg> Remasterizar trazos del lápiz</>
                }
              </button>
            )}

            {/* Canvas SVG */}
            <svg ref={svgRef} width={SIZE} height={SIZE}
              style={{borderRadius:14,
                cursor: tool==='polyline' ? 'crosshair' : tool==='pen' ? 'crosshair' : 'crosshair',
                background:'#0D0F14',border:'1px solid rgba(255,255,255,0.07)',touchAction:'none',userSelect:'none',display:'block'}}
              onMouseDown={onDown} onMouseMove={onMove} onMouseUp={onUp} onMouseLeave={onUp}
              onClick={handlePolylineClick} onDoubleClick={handlePolylineDblClick}>
              <defs>
                <pattern id="eg" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="0.7" fill="rgba(255,255,255,0.07)"/>
                </pattern>
              </defs>
              <rect width={SIZE} height={SIZE} fill="url(#eg)"/>
              {strokes.map((s,i) => {
                if (i===selectIdx && selDrag && (selDelta.x!==0||selDelta.y!==0)) {
                  return <g key={`drag${i}`} transform={`translate(${selDelta.x},${selDelta.y})`} opacity={0.75}>{renderEStroke(s,i)}</g>;
                }
                return renderEStroke(s,i);
              })}
              {/* Select tool — bbox hit areas */}
              {tool==='select' && strokes.map((s,i) => {
                const bb=calcBBox([s]);
                if(!isFinite(bb.minX)) return null;
                const pd=8, x=bb.minX-pd, y=bb.minY-pd, w=bb.maxX-bb.minX+pd*2, h=bb.maxY-bb.minY+pd*2;
                const isSel=selectIdx===i;
                return <rect key={`sh${i}`} x={x} y={y} width={w} height={h}
                  fill="rgba(0,0,0,0)" stroke={isSel?'rgba(37,99,235,0.5)':'transparent'} strokeWidth={isSel?1.5:0}
                  strokeDasharray={isSel?'5,3':undefined} rx={3}
                  style={{cursor:isSel?'grab':'pointer'}}
                  onMouseDown={e=>{
                    e.preventDefault(); e.stopPropagation();
                    setSelectIdx(i);
                    if(!svgRef.current) return;
                    const r=svgRef.current.getBoundingClientRect();
                    setSelDrag({sx:e.clientX-r.left, sy:e.clientY-r.top});
                  }}/>;
              })}
              {/* Select tool — resize corner handles */}
              {tool==='select' && selectIdx>=0 && (()=>{
                const s=strokes[selectIdx]; if(!s) return null;
                const bb=calcBBox([s]); if(!isFinite(bb.minX)) return null;
                const pd=8, x=bb.minX-pd, y=bb.minY-pd, w=bb.maxX-bb.minX+pd*2, h=bb.maxY-bb.minY+pd*2;
                const corners: {id:string;cx:number;cy:number;cur:string}[] = [
                  {id:'nw',cx:x,   cy:y,   cur:'nw-resize'},
                  {id:'ne',cx:x+w, cy:y,   cur:'ne-resize'},
                  {id:'sw',cx:x,   cy:y+h, cur:'sw-resize'},
                  {id:'se',cx:x+w, cy:y+h, cur:'se-resize'},
                ];
                return <>{corners.map(({id,cx,cy,cur})=>(
                  <rect key={id} x={cx-5} y={cy-5} width={10} height={10} rx={2}
                    fill="#0A0C0F" stroke="#2563eb" strokeWidth={1.8}
                    style={{cursor:cur}}
                    onMouseDown={e=>{
                      e.preventDefault(); e.stopPropagation();
                      const rawBB = calcBBox([s]);
                      setResizeDrag({corner:id, origStroke:s, origBB:rawBB});
                    }}/>
                ))}</>;
              })()}
              {/* Clickable hit areas for polylines when in editnode tool */}
              {tool==='editnode' && strokes.map((s,i) => {
                if (s.kind !== 'polyline') return null;
                let d=`M${s.pts[0].x.toFixed(1)},${s.pts[0].y.toFixed(1)}`;
                for(let j=0;j<s.pts.length-1;j++){
                  const arc=s.arcs?.[j];
                  if(arc) d+=` Q${arc.cp.x.toFixed(1)},${arc.cp.y.toFixed(1)} ${s.pts[j+1].x.toFixed(1)},${s.pts[j+1].y.toFixed(1)}`;
                  else d+=` L${s.pts[j+1].x.toFixed(1)},${s.pts[j+1].y.toFixed(1)}`;
                }
                const isSelected = editingIdx === i;
                return <path key={`hit${i}`} d={d} stroke={isSelected ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.18)'} strokeWidth={isSelected ? 10 : 10} fill="none" strokeLinecap="round" style={{cursor:'pointer'}}
                  onMouseDown={e=>{e.preventDefault();e.stopPropagation();setEditingIdx(i);}}/>;
              })}
              {tool==='pen' && curPts && curPts.length>1 && (
                <path d={ptPath(curPts)} stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              )}
              {/* Polyline in-progress */}
              {tool==='polyline' && polylinePts.length>0 && (<>
                {polylinePts.length>1 && (
                  <path d={polylinePts.map((p,j)=>`${j===0?'M':'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}
                    stroke={color} strokeWidth={sw} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                )}
                {polylineLive && (
                  <line x1={polylinePts[polylinePts.length-1].x} y1={polylinePts[polylinePts.length-1].y}
                    x2={polylineLive.x} y2={polylineLive.y}
                    stroke={color} strokeWidth={sw} strokeOpacity={0.45} strokeDasharray="5,4"/>
                )}
                {polylinePts.map((p,j)=>(
                  <circle key={j} cx={p.x} cy={p.y} r={3.5} fill={color} opacity={0.85}/>
                ))}
              </>)}
              {preview && renderEStroke(preview, -1)}
              {/* Curve phase hints */}
              {tool==='curve' && curvePhase===2 && curveStart && curveEnd && (
                <><circle cx={curveStart.x} cy={curveStart.y} r={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.6}/>
                <circle cx={curveEnd.x} cy={curveEnd.y} r={4} fill="none" stroke={color} strokeWidth={1.5} strokeDasharray="3,2" opacity={0.6}/></>
              )}
              {/* Edit handles for selected polyline */}
              {editingIdx >= 0 && (() => {
                const es = strokes[editingIdx];
                if (!es || es.kind !== 'polyline') return null;
                const pts = es.pts;
                return <>
                  {/* Segment arc handles */}
                  {pts.slice(0, -1).map((_, si) => {
                    const a = pts[si], b = pts[si+1];
                    const arc = es.arcs?.[si];
                    if (arc) {
                      return <g key={`arc${si}`}>
                        <line x1={a.x} y1={a.y} x2={arc.cp.x} y2={arc.cp.y} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="3,3" style={{pointerEvents:'none'}}/>
                        <line x1={b.x} y1={b.y} x2={arc.cp.x} y2={arc.cp.y} stroke="rgba(255,255,255,0.18)" strokeWidth={1} strokeDasharray="3,3" style={{pointerEvents:'none'}}/>
                        <circle cx={arc.cp.x} cy={arc.cp.y} r={5.5} fill="#2563eb" stroke="#fff" strokeWidth={1.5} style={{cursor:'move'}}
                          onMouseDown={e=>{e.preventDefault();e.stopPropagation();setHandleDrag({kind:'arc',segIdx:si});}}/>
                      </g>;
                    }
                    const mx=(a.x+b.x)/2, my=(a.y+b.y)/2;
                    return <g key={`mid${si}`} transform={`translate(${mx},${my}) rotate(45)`}>
                      <rect x={-5} y={-5} width={10} height={10} fill="#0D0F14" stroke="rgba(255,255,255,0.5)" strokeWidth={1.5} style={{cursor:'crosshair'}}
                        onMouseDown={e=>{e.preventDefault();e.stopPropagation();setHandleDrag({kind:'arc',segIdx:si});}}/>
                    </g>;
                  })}
                  {/* Vertex handles */}
                  {pts.map((p, pi) => (
                    <circle key={`vert${pi}`} cx={p.x} cy={p.y} r={5.5} fill="#0A0C0F" stroke="#2563eb" strokeWidth={2} style={{cursor:'grab'}}
                      onMouseDown={e=>{e.preventDefault();e.stopPropagation();setHandleDrag({kind:'vertex',segIdx:pi});}}/>
                  ))}
                </>;
              })()}
              {strokes.length===0 && !curPts && !preview && polylinePts.length===0 && (
                <text x={SIZE/2} y={SIZE/2} textAnchor="middle" dominantBaseline="middle" fill="rgba(255,255,255,0.1)" fontSize={12} fontFamily="'DM Sans',sans-serif">
                  Selecciona una herramienta y dibuja
                </text>
              )}
            </svg>
          </div>

          {/* Divisor vertical */}
          <div style={{width:1,background:'rgba(255,255,255,0.08)'}}/>

          {/* Columna Derecha: Digitalizador de Bocetos (Boceto desde Imagen) */}
          <div style={{flex:1,minWidth:260,display:'flex',flexDirection:'column',gap:14,fontFamily:"'DM Sans',sans-serif"}}>
            <div>
              <p style={{margin:0,fontWeight:800,fontSize:13,color:'#2ECC71',display:'flex',alignItems:'center',gap:6}}>
                <Sparkles size={14}/> Boceto desde Imagen
              </p>
              <p style={{margin:'4px 0 0',fontSize:11,color:'#5A6270',lineHeight:1.3}}>
                Sube una imagen y conviértela en líneas vectoriales con sus colores originales.
              </p>
            </div>

            {/* Drag & Drop zone */}
            <div
              onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) loadImage(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              onMouseEnter={e => {
                setIsHovered(true);
                e.currentTarget.style.borderColor = '#2ECC71';
                e.currentTarget.style.background = 'rgba(46,204,113,0.05)';
              }}
              onMouseLeave={e => {
                setIsHovered(false);
                e.currentTarget.style.borderColor = isDragOver ? '#2ECC71' : 'rgba(255,255,255,0.15)';
                e.currentTarget.style.background = isDragOver ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.02)';
              }}
              style={{
                height: 100,
                borderRadius: 12,
                border: isDragOver ? '2px dashed #2ECC71' : '1.5px dashed rgba(255,255,255,0.15)',
                background: isDragOver ? 'rgba(46,204,113,0.1)' : 'rgba(255,255,255,0.02)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                cursor: 'pointer',
                transition: 'all 0.15s',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <input type="file" ref={fileInputRef} onChange={onFileChange} accept="image/*" style={{ display: 'none' }} />
              {imageSrc ? (
                <>
                  <img src={imageSrc} style={{ width: '100%', height: '100%', objectFit: 'contain', opacity: 0.8 }} />
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: isHovered ? 1 : 0, transition: 'opacity 0.2s', color: '#fff', fontSize: 11, fontWeight: 700,
                    pointerEvents: 'none'
                  }}
                  >
                    <Upload size={14} style={{ marginRight: 5 }} /> Cambiar imagen
                  </div>
                </>
              ) : (
                <>
                  <Upload size={20} color="rgba(255,255,255,0.3)" />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, textAlign: 'center', padding: '0 10px' }}>
                    Arrastra una imagen o haz clic aquí
                  </span>
                </>
              )}
            </div>

            {/* Sliders (Only if image is loaded) */}
            {imageSrc && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Threshold Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#8A9099' }}>
                    <span>UMBRAL DE DETALLE</span>
                    <span style={{ color: '#2ECC71' }}>{edgeThreshold.toFixed(2)}</span>
                  </div>
                  <input
                    type="range" min="0.05" max="0.60" step="0.01"
                    value={edgeThreshold}
                    onChange={e => setEdgeThreshold(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#2ECC71', cursor: 'pointer', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#5A6270' }}>
                    <span>Más líneas</span>
                    <span>Menos líneas</span>
                  </div>
                </div>

                {/* Noise Filter Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#8A9099' }}>
                    <span>FILTRO DE RUIDO (px)</span>
                    <span style={{ color: '#2ECC71' }}>{minPathLen}px</span>
                  </div>
                  <input
                    type="range" min="3" max="25" step="1"
                    value={minPathLen}
                    onChange={e => setMinPathLen(parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#2ECC71', cursor: 'pointer', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#5A6270' }}>
                    <span>Detalle fino</span>
                    <span>Trazos limpios</span>
                  </div>
                </div>

                {/* Stroke Width Slider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 700, color: '#8A9099' }}>
                    <span>GROSOR DE LÍNEA</span>
                    <span style={{ color: '#2ECC71' }}>{vectStrokeW.toFixed(1)}px</span>
                  </div>
                  <input
                    type="range" min="1.0" max="5.0" step="0.1"
                    value={vectStrokeW}
                    onChange={e => setVectStrokeW(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#2ECC71', cursor: 'pointer', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}
                  />
                </div>

                {/* Estilo de Boceto Selector (Contorno vs Relleno) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#8A9099' }}>ESTILO DE BOCETO</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button
                      onClick={() => setVectFillMode('none')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: vectFillMode === 'none' ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${vectFillMode === 'none' ? '#2ECC71' : 'rgba(255,255,255,0.08)'}`,
                        color: vectFillMode === 'none' ? '#2ECC71' : '#8A9099',
                        transition: 'all 0.15s'
                      }}
                    >
                      Solo Contorno
                    </button>
                    <button
                      onClick={() => setVectFillMode('solid')}
                      style={{
                        flex: 1,
                        padding: '6px 12px',
                        borderRadius: 8,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: vectFillMode === 'solid' ? 'rgba(46,204,113,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${vectFillMode === 'solid' ? '#2ECC71' : 'rgba(255,255,255,0.08)'}`,
                        color: vectFillMode === 'solid' ? '#2ECC71' : '#8A9099',
                        transition: 'all 0.15s'
                      }}
                    >
                      Forma Rellena
                    </button>
                  </div>
                </div>

                {/* Processing status */}
                {vectorizing && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '8px', borderRadius: 8, background: 'rgba(46,204,113,0.06)', border: '1px solid rgba(46,204,113,0.15)' }}>
                    <div className="animate-spin" style={{ width: 12, height: 12, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#2ECC71', borderRadius: '50%' }} />
                    <span style={{ fontSize: 10, color: '#2ECC71', fontWeight: 700 }}>Procesando boceto...</span>
                  </div>
                )}
              </div>
            )}

            {!imageSrc && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.05)', borderRadius: 12, padding: 14, textAlign: 'center', background: 'rgba(0,0,0,0.15)' }}>
                <ImageIcon size={24} color="rgba(255,255,255,0.1)" />
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', margin: '8px 0 0', fontWeight: 600, lineHeight: 1.4 }}>
                  Sube una imagen para ver la magia del boceto vectorial en la pizarra.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <input value={label} onChange={e=>setLabel(e.target.value)} placeholder="Nombre de la forma"
            style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'7px 12px',color:'#F4F5F7',fontSize:13,outline:'none',fontFamily:"'DM Sans',sans-serif"}}
            onFocus={e=>{e.target.style.borderColor='rgba(37,99,235,0.6)';}}
            onBlur={e=>{e.target.style.borderColor='rgba(255,255,255,0.1)';}}/>
          <button onClick={onCancel} style={{padding:'7px 14px',borderRadius:9,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',color:'#8A9099',fontSize:13,fontWeight:600,cursor:'pointer'}}>Cancelar</button>
          <button onClick={handleSave} disabled={strokes.length===0}
            style={{padding:'7px 16px',borderRadius:9,background:strokes.length===0?'rgba(37,99,235,0.2)':'#2563eb',border:'none',color:strokes.length===0?'#1e3a8a':'#fff',fontSize:13,fontWeight:700,cursor:strokes.length===0?'default':'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>{if(strokes.length>0)e.currentTarget.style.background='#1d4ed8';}}
            onMouseLeave={e=>{if(strokes.length>0)e.currentTarget.style.background='#2563eb';}}>
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
        style={{ width:42, height:42, borderRadius:13, background: isVisible ? '#2563eb' : 'rgba(28,31,38,0.85)', backdropFilter:'blur(20px)', border:`1px solid ${isVisible?'#2563eb':'rgba(255,255,255,0.12)'}`, color: isVisible?'#fff':'#8A9099', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all 0.2s', boxShadow:'0 8px 24px rgba(0,0,0,0.4)' }}
        onMouseEnter={e=>{ if (!isVisible) { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(37,99,235,0.5)'; } }}
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
              style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:5, padding:'7px 10px', background:'rgba(37,99,235,0.12)', border:'1px solid rgba(37,99,235,0.3)', borderRadius:9, cursor:'pointer', color:'#2563eb', fontSize:10, fontWeight:700 }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(37,99,235,0.22)';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(37,99,235,0.12)';}}>
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

function getNoteDims(n: any) {
  if (n.type === 'text') {
    const fs = n.fontSize || 18;
    const w = n.width > 0 ? n.width : Math.max(60, (n.content?.length || 4) * fs * 0.55);
    const charsPerLine = Math.max(1, w / (fs * 0.55));
    const lines = Math.max(1, Math.ceil((n.content?.length || 1) / charsPerLine));
    return { w, h: lines * fs };
  }
  return { w: 220, h: 120 };
}

function getPathD(points: { x: number; y: number }[]) {
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
}

// ─── Sección: Pizarra ─────────────────────────────────────────────────────────

export default function SectionPizarra({ notes, drawings, images, shapes, customShapes, members, onAddNote, onDeleteNote, onDeleteImage, onSaveDrawings, onSaveImages, onSaveNotes, onSaveShapes, onSaveCustomShapes, onDragNote, onDragImage, onClearAll, pushToHistory, undo, redo, clipboard, setClipboard }: {
  notes: Note[]; drawings: DrawingPath[]; images: BoardImage[]; shapes: BoardShape[]; customShapes: CustomShape[]; members: Member[];
  onAddNote: () => void; onDeleteNote: (n: Note) => void; onDeleteImage: (img: BoardImage) => void;
  onSaveDrawings: (d: DrawingPath[]) => void; onSaveImages: (i: BoardImage[]) => void; onSaveNotes: (n: Note[]) => void; onSaveShapes: (s: BoardShape[]) => void; onSaveCustomShapes: (s: CustomShape[]) => void;
  onDragNote: (id: string, x: number, y: number, extra?: Partial<Note>) => void; onDragImage: (id: string, x: number, y: number, w?: number, h?: number) => void;
  onClearAll: () => void; pushToHistory: () => void; undo: () => void; redo: () => void; clipboard: any; setClipboard: (v: any) => void;
}) {
  const [tool, setTool]         = useState<'select'|'pencil'|'eraser'|'hand'|'text'|'rect'|'rhombus'|'ellipse'|'line'|'laser'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapeStart, setShapeStart]     = useState<{x:number;y:number}|null>(null);
  const [shapeCurrent, setShapeCurrent] = useState<{x:number;y:number}|null>(null);
  const [laserPos, setLaserPos]         = useState<{x:number;y:number}|null>(null);
  const laserCanvasRef    = useRef<HTMLCanvasElement>(null);
  const laserTrailRef     = useRef<{x:number;y:number;t:number}[]>([]);
  const laserRafRef       = useRef<number>(0);
  const laserIsDrawingRef = useRef(false);
  const offsetRef         = useRef({ x:0, y:0 });
  const [isPanning, setIsPanning] = useState(false);
  const [offset, setOffset]     = useState({ x:0, y:0 });
  const [zoom, setZoom]         = useState(1);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [currentColor, setCurrentColor] = useState('#F4F5F7');
  const [editingText, setEditingText] = useState<{ x: number, y: number, content: string, id?: string } | null>(null);
  const [isMarqueeing, setIsMarqueeing]           = useState(false);
  const [marqueeStart, setMarqueeStart]           = useState<{x:number,y:number}|null>(null);
  const [marqueeEnd, setMarqueeEnd]               = useState<{x:number,y:number}|null>(null);
  const [selectedIds, setSelectedIds]             = useState<Set<string>>(new Set());
  const [selectedPathIndices, setSelectedPathIndices] = useState<Set<number>>(new Set());
  const [multiDragActive, setMultiDragActive]     = useState(false);
  const [multiDragDelta, setMultiDragDelta]       = useState({x:0, y:0});
  const [multiResizeDir, setMultiResizeDir]       = useState<string|null>(null);
  const [multiResizeBBox, setMultiResizeBBox]     = useState<{x:number,y:number,w:number,h:number}|null>(null);
  const multiResizeOriginRef = useRef<{bbox:{x:number,y:number,w:number,h:number};noteMap:Map<string,any>;imageMap:Map<string,any>;shapeMap:Map<string,any>;pathMap:Map<number,any>}|null>(null);
  const multiResizeBBoxRef   = useRef<{x:number,y:number,w:number,h:number}|null>(null);
  const notesRef             = useRef(notes);
  const imagesRef            = useRef(images);
  const shapesRef            = useRef(shapes);
  const drawingsRef          = useRef(drawings);
  const selectedIdsRef       = useRef(selectedIds);
  const selectedPathIdxRef   = useRef(selectedPathIndices);
  const zoomRef              = useRef(zoom);
  const [showShapesPanel, setShowShapesPanel]     = useState(false);
  const [panelDrag, setPanelDrag] = useState<{ type: string; startX: number; startY: number; clientX: number; clientY: number } | null>(null);
  const [pathLiveRot, setPathLiveRot] = useState<{angle:number;cx:number;cy:number}|null>(null);
  const pathLiveRotRef = useRef<{angle:number;cx:number;cy:number}|null>(null);

  const colors = ['#F4F5F7', '#2563eb', '#60a5fa', '#93c5fd', '#22d3ee', '#4ade80', '#f87171'];
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const saveText = () => {
    if (!editingText) return;
    const content = editingText.content.trim();
    if (content) {
      pushToHistory();
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const worldX = (editingText.x - rect.left - offset.x) / zoom;
        const worldY = (editingText.y - rect.top - offset.y) / zoom;
        if (editingText.id) {
          onSaveNotes(notes.map(n => n.id === editingText.id ? { ...n, content: editingText.content, x: worldX, y: worldY, color: currentColor, type: 'text' } : n));
          setSelectedId(editingText.id);
        } else {
          const id = crypto.randomUUID();
          onSaveNotes([...notes, {
            id,
            content: editingText.content,
            authorId: members[0]?.id || '',
            createdAt: Date.now(),
            x: worldX,
            y: worldY,
            color: currentColor,
            type: 'text'
          }]);
          setSelectedId(id);
        }
        setTool('select');
      }
    } else if (editingText.id) {
      pushToHistory();
      onSaveNotes(notes.filter(n => n.id !== editingText.id));
    }
    setEditingText(null);
  };

  const zoomIn  = () => setZoom(p => Math.min(p+0.1, 3));
  const zoomOut = () => setZoom(p => Math.max(p-0.1, 0.3));
  const resetZoom = () => { setZoom(1); setOffset({x:0,y:0}); };

  const getViewportCenter = () => {
    const rect = containerRef.current?.getBoundingClientRect();
    return rect
      ? { x: (rect.width / 2 - offset.x) / zoom, y: (rect.height / 2 - offset.y) / zoom }
      : { x: 160, y: 120 };
  };

  const getLayerOrders = () => [
    ...images.map((img, i) => img.zOrder ?? i),
    ...drawings.map((p, i) => p.zOrder ?? i),
    ...shapes.map((s, i) => s.zOrder ?? images.length + i),
    ...notes.map((n, i) => n.createdAt ?? images.length + shapes.length + i),
  ];

  const openTextEditorForNote = (note: Note) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setCurrentColor(note.color || currentColor);
    setEditingText({
      id: note.id,
      content: note.content,
      x: note.x * zoom + offset.x + rect.left,
      y: note.y * zoom + offset.y + rect.top,
    });
    setSelectedId(note.id);
  };

  const importImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = ev => {
      const src = ev.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const center = getViewportCenter();
        const width = Math.min(img.width, 420);
        const height = img.width ? (img.height * width) / img.width : 240;
        pushToHistory();
        onSaveImages([...images, {
          id: crypto.randomUUID(),
          src,
          x: center.x - width / 2,
          y: center.y - height / 2,
          width,
          height,
          zOrder: Date.now(),
        }]);
        toast.success("Imagen importada");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) importImageFile(file);
    e.target.value = '';
  };

  const reorderSelectedImage = (mode: 'front' | 'back' | 'up' | 'down') => {
    if (!selectedId) return;
    const index = images.findIndex(img => img.id === selectedId);
    if (index < 0) return;
    const current = images[index];
    const orders = getLayerOrders().sort((a, b) => a - b);
    const currentOrder = current.zOrder ?? index;
    let zOrder = currentOrder;
    if (mode === 'front') zOrder = (orders.at(-1) ?? currentOrder) + 1;
    if (mode === 'back') zOrder = (orders[0] ?? currentOrder) - 1;
    if (mode === 'up') zOrder = (orders.find(order => order > currentOrder) ?? currentOrder) + 1;
    if (mode === 'down') {
      const lower = [...orders].reverse().find(order => order < currentOrder);
      zOrder = (lower ?? currentOrder) - 1;
    }
    if (zOrder === currentOrder) return;
    pushToHistory();
    onSaveImages(images.map(img => img.id === selectedId ? { ...img, zOrder } : img));
  };

  const exportBoardPng = async () => {
    const allX: number[] = [], allY: number[] = [];
    drawings.forEach(d => d.points.forEach(p => { allX.push(p.x); allY.push(p.y); }));
    images.forEach(img => { allX.push(img.x, img.x + img.width); allY.push(img.y, img.y + img.height); });
    notes.forEach(n => { const dim = getNoteDims(n); allX.push(n.x, n.x + dim.w); allY.push(n.y, n.y + dim.h); });
    shapes.forEach(s => { allX.push(s.x, s.x + s.width); allY.push(s.y, s.y + s.height); });
    if (!allX.length) { toast.error("No hay contenido para exportar"); return; }
    const pad = 80;
    const minX = Math.min(...allX) - pad, minY = Math.min(...allY) - pad;
    const maxX = Math.max(...allX) + pad, maxY = Math.max(...allY) + pad;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(Math.max(maxX - minX, 640), 4096);
    canvas.height = Math.min(Math.max(maxY - minY, 420), 4096);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = '#0A0C0F';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.translate(-minX, -minY);
    const exportItems = [
      ...images.map((img, i) => ({ kind: 'image' as const, data: img, zOrder: img.zOrder ?? i })),
      ...drawings.map((p, i) => ({ kind: 'path' as const, data: p, zOrder: p.zOrder ?? i })),
      ...shapes.map((s, i) => ({ kind: 'shape' as const, data: s, zOrder: s.zOrder ?? images.length + i })),
      ...notes.map((n, i) => ({ kind: 'note' as const, data: n, zOrder: n.createdAt ?? images.length + shapes.length + i })),
    ].sort((a, b) => a.zOrder - b.zOrder);
    for (const item of exportItems) {
      if (item.kind === 'path') {
        const d = item.data;
        if (d.points.length < 2) continue;
        ctx.beginPath(); ctx.strokeStyle = d.color; ctx.lineWidth = d.width; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        ctx.moveTo(d.points[0].x, d.points[0].y);
        d.points.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
        ctx.stroke();
      }
      if (item.kind === 'shape') {
        const s = item.data;
        ctx.save();
        ctx.strokeStyle = s.color; ctx.fillStyle = `${s.color}22`; ctx.lineWidth = 2;
        ctx.fillRect(s.x, s.y, s.width, s.height);
        ctx.strokeRect(s.x, s.y, s.width, s.height);
        if (s.label) { ctx.fillStyle = '#E8ECF4'; ctx.font = '12px sans-serif'; ctx.fillText(s.label, s.x, s.y + s.height + 16); }
        ctx.restore();
      }
      if (item.kind === 'image') {
        const img = item.data;
        await new Promise<void>(resolve => {
          const el = new window.Image();
          el.onload = () => { ctx.drawImage(el, img.x, img.y, img.width, img.height); resolve(); };
          el.onerror = () => resolve();
          el.src = img.src;
        });
      }
      if (item.kind === 'note') {
        const n = item.data;
        ctx.save();
        ctx.fillStyle = n.color || '#F4F5F7';
        ctx.font = `bold ${n.fontSize || (n.type === 'text' ? 18 : 13)}px sans-serif`;
        n.content.split('\n').forEach((line, idx) => ctx.fillText(line, n.x, n.y + (idx + 1) * (n.fontSize || 18)));
        ctx.restore();
      }
    }
    const link = document.createElement('a');
    link.download = `pizarra-${new Date().toISOString().slice(0,10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    toast.success("Pizarra exportada");
  };

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
    onSaveShapes([...shapes, { id: crypto.randomUUID(), type, x: cx - info.defaultW / 2, y: cy - info.defaultH / 2, width: info.defaultW, height: info.defaultH, color: info.color, label: info.label, zOrder: Date.now() }]);
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
          onSaveShapes([...shapes, { id: crypto.randomUUID(), type: panelDrag.type, x: cx - info.defaultW / 2, y: cy - info.defaultH / 2, width: info.defaultW, height: info.defaultH, color: info.color, label: info.label, zOrder: Date.now() }]);
        } else if (rect && e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
          const wx = (e.clientX - rect.left - offset.x) / zoom - info.defaultW / 2;
          const wy = (e.clientY - rect.top - offset.y) / zoom - info.defaultH / 2;
          onSaveShapes([...shapes, { id: crypto.randomUUID(), type: panelDrag.type, x: wx, y: wy, width: info.defaultW, height: info.defaultH, color: info.color, label: info.label, zOrder: Date.now() }]);
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
    const hasInternalClipboard = (v: any) =>
      v?.kind === 'board-selection' || (v && 'content' in v);

    const getSelection = () => {
      const ids = new Set(selectedIds);
      if (selectedId) ids.add(selectedId);
      const noteItems = notes.filter(n => ids.has(n.id));
      const imageItems = images.filter(i => ids.has(i.id));
      const shapeItems = shapes.filter(s => ids.has(s.id));
      const pathItems = [...selectedPathIndices]
        .map(idx => ({ idx, path: drawings[idx] }))
        .filter((item): item is { idx: number; path: DrawingPath } => Boolean(item.path));
      return { noteItems, imageItems, shapeItems, pathItems };
    };

    const clearSelection = () => {
      setSelectedId(null);
      setSelectedIds(new Set());
      setSelectedPathIndices(new Set());
    };

    const deleteSelection = () => {
      const { noteItems, imageItems, shapeItems, pathItems } = getSelection();
      const hasSelection = noteItems.length || imageItems.length || shapeItems.length || pathItems.length;
      if (!hasSelection) return false;
      pushToHistory();
      const idsToDelete = new Set([
        ...noteItems.map(n => n.id),
        ...imageItems.map(i => i.id),
        ...shapeItems.map(s => s.id),
      ]);
      onSaveNotes(notes.filter(n => !idsToDelete.has(n.id)));
      onSaveImages(images.filter(i => !idsToDelete.has(i.id)));
      onSaveShapes(shapes.filter(s => !idsToDelete.has(s.id)));
      if (pathItems.length > 0) {
        const pathIdxs = new Set(pathItems.map(p => p.idx));
        onSaveDrawings(drawings.filter((_: any, idx: number) => !pathIdxs.has(idx)));
      }
      clearSelection();
      return true;
    };

    const copySelection = () => {
      const { noteItems, imageItems, shapeItems, pathItems } = getSelection();
      const hasSelection = noteItems.length || imageItems.length || shapeItems.length || pathItems.length;
      if (!hasSelection) return false;
      setClipboard({
        kind: 'board-selection',
        notes: noteItems,
        images: imageItems,
        shapes: shapeItems,
        drawings: pathItems.map(item => item.path),
      });
      toast.success("Copiado");
      return true;
    };

    const pasteInternalClipboard = () => {
      if (!clipboard) return false;
      pushToHistory();
      if (clipboard.kind === 'board-selection') {
        const newIds: string[] = [];
        const newNotes = (clipboard.notes || []).map((n: Note) => {
          const id = crypto.randomUUID(); newIds.push(id);
          return { ...n, id, x: n.x + 20, y: n.y + 20, createdAt: Date.now() };
        });
        const newImages = (clipboard.images || []).map((img: BoardImage) => {
          const id = crypto.randomUUID(); newIds.push(id);
          return { ...img, id, x: img.x + 20, y: img.y + 20, zOrder: Date.now() };
        });
        const newShapes = (clipboard.shapes || []).map((s: BoardShape) => {
          const id = crypto.randomUUID(); newIds.push(id);
          return { ...s, id, x: s.x + 20, y: s.y + 20, zOrder: Date.now() };
        });
        const newDrawings = (clipboard.drawings || []).map((d: DrawingPath) => ({
          ...d,
          zOrder: Date.now(),
          points: d.points.map(pt => ({ x: pt.x + 20, y: pt.y + 20 })),
        }));
        const newPathStart = drawings.length;
        onSaveNotes([...notes, ...newNotes]);
        onSaveImages([...images, ...newImages]);
        onSaveShapes([...shapes, ...newShapes]);
        onSaveDrawings([...drawings, ...newDrawings]);
        setSelectedId(null);
        setSelectedIds(new Set(newIds));
        setSelectedPathIndices(new Set(newDrawings.map((_: DrawingPath, idx: number) => newPathStart + idx)));
        setClipboard({
          ...clipboard,
          notes: newNotes,
          images: newImages,
          shapes: newShapes,
          drawings: newDrawings,
        });
        toast.success("Pegado");
        return true;
      }
      if ('content' in clipboard) {
        const newId = crypto.randomUUID();
        onSaveNotes([...notes, { ...clipboard, id: newId, x: clipboard.x + 20, y: clipboard.y + 20, createdAt: Date.now() }]);
        setSelectedId(newId);
        setSelectedIds(new Set());
        setSelectedPathIndices(new Set());
        setClipboard({ ...clipboard, id: newId, x: clipboard.x + 20, y: clipboard.y + 20, createdAt: Date.now() });
        toast.success("Pegado");
        return true;
      }
      return false;
    };

    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName==='INPUT'||document.activeElement?.tagName==='TEXTAREA') return;
      if ((e.key==='Delete'||e.key==='Backspace') && (selectedId || selectedIds.size > 0 || selectedPathIndices.size > 0)) {
        e.preventDefault();
        deleteSelection();
      }
      if (e.ctrlKey||e.metaKey) {
        const key = e.key.toLowerCase();
        if (key==='z' && e.shiftKey) { e.preventDefault(); redo(); }
        else if (key==='z') { e.preventDefault(); undo(); }
        if (key==='y') { e.preventDefault(); redo(); }
        if (key==='c') { e.preventDefault(); copySelection(); }
        if (key==='x') {
          e.preventDefault();
          if (copySelection()) deleteSelection();
        }
        if (key==='v' && hasInternalClipboard(clipboard)) {
          e.preventDefault();
          pasteInternalClipboard();
        }
        if (e.key==='='||e.key==='+') { e.preventDefault(); zoomIn(); }
        else if (e.key==='-') { e.preventDefault(); zoomOut(); }
        else if (e.key==='0') { e.preventDefault(); resetZoom(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, selectedIds, selectedPathIndices, notes, images, shapes, drawings, clipboard, pushToHistory, undo, redo, onSaveNotes, onSaveImages, onSaveShapes, onSaveDrawings, setClipboard]);

  // Al cambiar de herramienta: cerrar editor de texto + resetear todo estado de interacción
  const editingTextRef = useRef(editingText);
  useEffect(() => { editingTextRef.current = editingText; }, [editingText]);
  useEffect(() => {
    // Guardar texto pendiente si existía
    if (tool !== 'text' && editingTextRef.current) {
      const et = editingTextRef.current;
      if (et.content.trim()) {
        pushToHistory();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) onSaveNotes([...notesRef.current, { id: crypto.randomUUID(), content: et.content, authorId: members[0]?.id||'', createdAt: Date.now(), x:(et.x-rect.left-offset.x)/zoom, y:(et.y-rect.top-offset.y)/zoom, color:currentColor, type:'text' }]);
      }
      setEditingText(null);
    }
    // Resetear estado de interacción para que el primer click siempre funcione
    setIsMarqueeing(false);
    setMarqueeStart(null);
    setMarqueeEnd(null);
    setIsDrawing(false);
    setIsPanning(false);
    setMultiDragActive(false);
    setMultiDragDelta({ x: 0, y: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tool]);

  // Auto-resize textarea when editingText content changes
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = ta.scrollHeight + 'px';
  }, [editingText?.content]);

  // Keep refs fresh so resize effect has no stale closures
  useEffect(() => { notesRef.current = notes; }, [notes]);
  useEffect(() => { imagesRef.current = images; }, [images]);
  useEffect(() => { shapesRef.current = shapes; }, [shapes]);
  useEffect(() => { drawingsRef.current = drawings; }, [drawings]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => { selectedPathIdxRef.current = selectedPathIndices; }, [selectedPathIndices]);
  useEffect(() => { zoomRef.current = zoom; }, [zoom]);
  useEffect(() => { offsetRef.current = offset; }, [offset]);

  const runLaserAnim = useCallback(() => {
    const canvas = laserCanvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const now = Date.now();
    const LIFE = 1400;
    laserTrailRef.current = laserTrailRef.current.filter(p => now - p.t < LIFE);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pts = laserTrailRef.current;
    if (pts.length > 1) {
      const ox=offsetRef.current.x, oy=offsetRef.current.y, z=zoomRef.current;
      for (let i=1; i<pts.length; i++) {
        const age = (now - pts[i].t) / LIFE;
        const alpha = Math.max(0, (1 - age) * 0.95 + 0.05);
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255,45,45,${alpha})`;
        ctx.lineWidth = 4 * (1 - age * 0.65);
        ctx.lineCap = 'round';
        ctx.moveTo(pts[i-1].x*z+ox, pts[i-1].y*z+oy);
        ctx.lineTo(pts[i].x*z+ox, pts[i].y*z+oy);
        ctx.stroke();
      }
    }
    if (pts.length > 0 || laserIsDrawingRef.current)
      laserRafRef.current = requestAnimationFrame(runLaserAnim);
  }, []);

  useEffect(() => {
    const resize = () => {
      const c = laserCanvasRef.current;
      if (c && containerRef.current) { c.width=containerRef.current.clientWidth; c.height=containerRef.current.clientHeight; }
    };
    window.addEventListener('resize', resize); resize();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(laserRafRef.current); };
  }, []);

  // Multi-select resize effect
  useEffect(() => {
    if (!multiResizeDir) return;
    const onMM = (e: MouseEvent) => {
      const dx = e.movementX / zoomRef.current;
      const dy = e.movementY / zoomRef.current;
      const prev = multiResizeBBoxRef.current;
      const origin = multiResizeOriginRef.current;
      if (!prev || !origin) return;
      let { x, y, w, h } = prev;
      if (multiResizeDir.includes('e')) w += dx;
      if (multiResizeDir.includes('w')) { x += dx; w -= dx; }
      if (multiResizeDir.includes('s')) h += dy;
      if (multiResizeDir.includes('n')) { y += dy; h -= dy; }
      const nb = { x, y, w: Math.max(20, w), h: Math.max(20, h) };
      multiResizeBBoxRef.current = nb;
      setMultiResizeBBox({ ...nb });
      // Aplicar scale en tiempo real usando posiciones originales
      const ob = origin.bbox;
      const sx = ob.w > 1 ? nb.w / ob.w : 1;
      const sy = ob.h > 1 ? nb.h / ob.h : 1;
      const scx = (v: number) => nb.x + (v - ob.x) * sx;
      const scy = (v: number) => nb.y + (v - ob.y) * sy;
      onSaveNotes(notesRef.current.map((n: any) => {
        const orig = origin.noteMap.get(n.id);
        if (!orig) return n;
        const updated: any = { ...n, x: scx(orig.x), y: scy(orig.y) };
        if (n.type === 'text') {
          const scale = Math.min(sx, sy);
          updated.fontSize = Math.max(8, (orig.fontSize || 18) * scale);
          if ((orig.width || 0) > 0) updated.width = Math.max(50, orig.width * sx);
        }
        return updated;
      }));
      onSaveImages(imagesRef.current.map((img: any) => {
        const orig = origin.imageMap.get(img.id); return orig ? { ...img, x: scx(orig.x), y: scy(orig.y), width: Math.max(20, orig.width * sx), height: Math.max(20, orig.height * sy) } : img;
      }));
      onSaveShapes(shapesRef.current.map((s: any) => {
        const orig = origin.shapeMap.get(s.id); return orig ? { ...s, x: scx(orig.x), y: scy(orig.y), width: Math.max(20, orig.width * sx), height: Math.max(20, orig.height * sy) } : s;
      }));
      if (origin.pathMap.size > 0) {
        onSaveDrawings(drawingsRef.current.map((p: any, idx: number) => {
          const orig = origin.pathMap.get(idx); return orig ? { ...p, points: orig.points.map((pt: any) => ({ x: scx(pt.x), y: scy(pt.y) })) } : p;
        }));
      }
    };
    const onMU = () => {
      setMultiResizeDir(null);
      setMultiResizeBBox(null);
      multiResizeOriginRef.current = null;
      multiResizeBBoxRef.current = null;
    };
    window.addEventListener('mousemove', onMM);
    window.addEventListener('mouseup', onMU);
    return () => { window.removeEventListener('mousemove', onMM); window.removeEventListener('mouseup', onMU); };
  }, [multiResizeDir, onSaveNotes, onSaveImages, onSaveShapes, onSaveDrawings]);

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
            img.onload = () => {
              const width = Math.min(img.width, 300);
              const height = img.width ? (img.height * width) / img.width : 180;
              const center = getViewportCenter();
              pushToHistory();
              onSaveImages([...images, { id:crypto.randomUUID(), src, x:center.x - width / 2 + Math.random()*30, y:center.y - height / 2 + Math.random()*30, width, height, zOrder: Date.now() }]);
              toast.success("Imagen pegada");
            };
            img.src=src;
          };
          reader.readAsDataURL(file); return;
        }
      }
      if (clipboard?.kind === 'board-selection') {
        e.preventDefault(); pushToHistory();
        const newIds: string[] = [];
        const newNotes = (clipboard.notes || []).map((n: Note) => {
          const id = crypto.randomUUID(); newIds.push(id);
          return { ...n, id, x:n.x+20, y:n.y+20, createdAt:Date.now() };
        });
        const newImages = (clipboard.images || []).map((img: BoardImage) => {
          const id = crypto.randomUUID(); newIds.push(id);
          return { ...img, id, x:img.x+20, y:img.y+20, zOrder: Date.now() };
        });
        const newShapes = (clipboard.shapes || []).map((s: BoardShape) => {
          const id = crypto.randomUUID(); newIds.push(id);
          return { ...s, id, x:s.x+20, y:s.y+20, zOrder: Date.now() };
        });
        const newDrawings = (clipboard.drawings || []).map((d: DrawingPath) => ({
          ...d,
          zOrder: Date.now(),
          points: d.points.map(pt => ({ x:pt.x+20, y:pt.y+20 })),
        }));
        const newPathStart = drawings.length;
        onSaveNotes([...notes, ...newNotes]);
        onSaveImages([...images, ...newImages]);
        onSaveShapes([...shapes, ...newShapes]);
        onSaveDrawings([...drawings, ...newDrawings]);
        setSelectedId(null);
        setSelectedIds(new Set(newIds));
        setSelectedPathIndices(new Set(newDrawings.map((_: DrawingPath, idx: number) => newPathStart + idx)));
        setClipboard({ ...clipboard, notes:newNotes, images:newImages, shapes:newShapes, drawings:newDrawings });
        toast.success("Pegado");
      } else if (clipboard && 'content' in clipboard) {
        e.preventDefault(); pushToHistory();
        const newId=crypto.randomUUID();
        onSaveNotes([...notes, { ...clipboard, id:newId, x:clipboard.x+20, y:clipboard.y+20, createdAt:Date.now() }]);
        setSelectedId(newId); setClipboard({ ...clipboard, id:newId, x:clipboard.x+20, y:clipboard.y+20, createdAt:Date.now() }); toast.success("Pegado");
      }
    };
    window.addEventListener('paste', onPaste);
    return () => window.removeEventListener('paste', onPaste);
  }, [images, notes, shapes, drawings, clipboard, onSaveImages, onSaveNotes, onSaveShapes, onSaveDrawings, offset, zoom, pushToHistory, setClipboard, members]);

  useEffect(() => {
    const canvas=canvasRef.current; if (!canvas) return;
    const resize = () => {
      if (containerRef.current) {
        canvas.width=containerRef.current.clientWidth;
        canvas.height=containerRef.current.clientHeight;
      }
    };
    window.addEventListener('resize', resize); resize();
    return () => window.removeEventListener('resize', resize);
  }, []);

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
              const { w: nw, h: nh } = getNoteDims(n);
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
          const distToSeg = (px:number,py:number,ax:number,ay:number,bx:number,by:number) => {
            const dx=bx-ax, dy=by-ay, lenSq=dx*dx+dy*dy;
            if (lenSq===0) return Math.hypot(px-ax,py-ay);
            const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/lenSq));
            return Math.hypot(px-(ax+t*dx), py-(ay+t*dy));
          };
          for (let idx = drawings.length - 1; idx >= 0; idx--) {
            const p = drawings[idx];
            const hitDist = Math.max(p.width / 2 + 10, 14 / zoom);
            const isHit = p.points.some((pt, i) => {
              if (i === 0) return Math.hypot(pt.x - wx, pt.y - wy) <= hitDist;
              const prev = p.points[i - 1];
              return distToSeg(wx, wy, prev.x, prev.y, pt.x, pt.y) <= hitDist;
            });
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
    if (tool==='pencil') {
      pushToHistory(); setIsDrawing(true);
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      onSaveDrawings([...drawings, { points:[{x,y}], color:currentColor, width:3/zoom, zOrder: Date.now() }]);
    }
    if (tool==='eraser') {
      pushToHistory(); setIsDrawing(true);
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const ex=(e.clientX-rect.left-offset.x)/zoom, ey=(e.clientY-rect.top-offset.y)/zoom;
      const r=15/zoom;
      const _dS=(px:number,py:number,ax:number,ay:number,bx:number,by:number)=>{const ddx=bx-ax,ddy=by-ay,lSq=ddx*ddx+ddy*ddy;if(lSq===0)return Math.hypot(px-ax,py-ay);const t=Math.max(0,Math.min(1,((px-ax)*ddx+(py-ay)*ddy)/lSq));return Math.hypot(px-(ax+t*ddx),py-(ay+t*ddy));};
      const hitP=(p:DrawingPath)=>p.points.some((pt,i)=>{if(i===0)return Math.hypot(pt.x-ex,pt.y-ey)<=r+p.width/2;const prev=p.points[i-1];return _dS(ex,ey,prev.x,prev.y,pt.x,pt.y)<=r+p.width/2;});
      const nd=drawingsRef.current.filter(p=>!hitP(p));
      const ni=imagesRef.current.filter(img=>!(ex>=img.x&&ex<=img.x+img.width&&ey>=img.y&&ey<=img.y+img.height));
      const nn=notesRef.current.filter(n=>{const{w,h}=getNoteDims(n);return!(ex>=n.x&&ex<=n.x+w&&ey>=n.y&&ey<=n.y+h);});
      const ns=shapesRef.current.filter(s=>!(ex>=s.x&&ex<=s.x+s.width&&ey>=s.y&&ey<=s.y+s.height));
      if(nd.length!==drawingsRef.current.length){drawingsRef.current=nd;onSaveDrawings(nd);}
      if(ni.length!==imagesRef.current.length){imagesRef.current=ni;onSaveImages(ni);}
      if(nn.length!==notesRef.current.length){notesRef.current=nn;onSaveNotes(nn);}
      if(ns.length!==shapesRef.current.length){shapesRef.current=ns;onSaveShapes(ns);}
    }
    if (['rect','rhombus','ellipse','line'].includes(tool)) {
      pushToHistory(); setIsDrawing(true);
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      setShapeStart({x,y}); setShapeCurrent({x,y});
    }
    if (tool==='laser') {
      setIsDrawing(true); laserIsDrawingRef.current=true;
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      setLaserPos({x,y});
      laserTrailRef.current=[{x,y,t:Date.now()}];
      cancelAnimationFrame(laserRafRef.current);
      laserRafRef.current=requestAnimationFrame(runLaserAnim);
    }
  };
  const onMultiDragStart = () => { setMultiDragActive(true); setMultiDragDelta({x:0, y:0}); };

  const getMultiSelectBBox = useCallback(() => {
    if (selectedIds.size === 0 && selectedPathIndices.size === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    drawings.forEach((p: any, idx: number) => {
      if (!selectedPathIndices.has(idx)) return;
      p.points.forEach((pt: any) => { minX=Math.min(minX,pt.x); minY=Math.min(minY,pt.y); maxX=Math.max(maxX,pt.x); maxY=Math.max(maxY,pt.y); });
    });
    notes.forEach((n: any) => {
      if (!selectedIds.has(n.id)) return;
      const { w: nw, h: nh } = getNoteDims(n);
      minX=Math.min(minX,n.x); minY=Math.min(minY,n.y); maxX=Math.max(maxX,n.x+nw); maxY=Math.max(maxY,n.y+nh);
    });
    images.forEach((img: any) => {
      if (!selectedIds.has(img.id)) return;
      minX=Math.min(minX,img.x); minY=Math.min(minY,img.y); maxX=Math.max(maxX,img.x+img.width); maxY=Math.max(maxY,img.y+img.height);
    });
    shapes.forEach((s: any) => {
      if (!selectedIds.has(s.id)) return;
      minX=Math.min(minX,s.x); minY=Math.min(minY,s.y); maxX=Math.max(maxX,s.x+s.width); maxY=Math.max(maxY,s.y+s.height);
    });
    if (minX === Infinity) return null;
    return { x: minX, y: minY, w: maxX-minX, h: maxY-minY };
  }, [selectedIds, selectedPathIndices, notes, images, shapes, drawings]);

  const onMultiResizeStart = useCallback((dir: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const bbox = getMultiSelectBBox();
    if (!bbox) return;
    pushToHistory();
    const noteMap  = new Map(notes.filter((n: any) => selectedIds.has(n.id)).map((n: any) => [n.id, { ...n }]));
    const imageMap = new Map(images.filter((i: any) => selectedIds.has(i.id)).map((i: any) => [i.id, { ...i }]));
    const shapeMap = new Map(shapes.filter((s: any) => selectedIds.has(s.id)).map((s: any) => [s.id, { ...s }]));
    const pathMap  = new Map<number, any>();
    drawings.forEach((p: any, idx: number) => { if (selectedPathIndices.has(idx)) pathMap.set(idx, { ...p, points: p.points.map((pt: any) => ({ ...pt })) }); });
    multiResizeOriginRef.current = { bbox, noteMap, imageMap, shapeMap, pathMap };
    multiResizeBBoxRef.current = { ...bbox };
    setMultiResizeDir(dir);
    setMultiResizeBBox({ ...bbox });
  }, [getMultiSelectBBox, notes, images, shapes, drawings, selectedIds, selectedPathIndices, pushToHistory]);

  const onMM=(e:React.MouseEvent)=>{
    if (multiResizeDir) return;
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
      if (tool==='pencil') {
        const d=[...drawings]; d[d.length-1].points.push({x,y}); onSaveDrawings(d);
      } else if (tool==='eraser') {
        const r=15/zoom;
        const _dS=(px:number,py:number,ax:number,ay:number,bx:number,by:number)=>{const ddx=bx-ax,ddy=by-ay,lSq=ddx*ddx+ddy*ddy;if(lSq===0)return Math.hypot(px-ax,py-ay);const t=Math.max(0,Math.min(1,((px-ax)*ddx+(py-ay)*ddy)/lSq));return Math.hypot(px-(ax+t*ddx),py-(ay+t*ddy));};
        const hitP=(p:DrawingPath)=>p.points.some((pt,i)=>{if(i===0)return Math.hypot(pt.x-x,pt.y-y)<=r+p.width/2;const prev=p.points[i-1];return _dS(x,y,prev.x,prev.y,pt.x,pt.y)<=r+p.width/2;});
        const nd=drawingsRef.current.filter(p=>!hitP(p));
        const ni=imagesRef.current.filter(img=>!(x>=img.x&&x<=img.x+img.width&&y>=img.y&&y<=img.y+img.height));
        const nn=notesRef.current.filter(n=>{const{w,h}=getNoteDims(n);return!(x>=n.x&&x<=n.x+w&&y>=n.y&&y<=n.y+h);});
        const ns=shapesRef.current.filter(s=>!(x>=s.x&&x<=s.x+s.width&&y>=s.y&&y<=s.y+s.height));
        if(nd.length!==drawingsRef.current.length){drawingsRef.current=nd;onSaveDrawings(nd);}
        if(ni.length!==imagesRef.current.length){imagesRef.current=ni;onSaveImages(ni);}
        if(nn.length!==notesRef.current.length){notesRef.current=nn;onSaveNotes(nn);}
        if(ns.length!==shapesRef.current.length){shapesRef.current=ns;onSaveShapes(ns);}
      }
    }
    if (isDrawing && ['rect','rhombus','ellipse','line'].includes(tool)) {
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      let x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      if (e.shiftKey && shapeStart) {
        if (tool==='line') {
          const ddx=Math.abs(x-shapeStart.x), ddy=Math.abs(y-shapeStart.y);
          if (ddx>ddy) y=shapeStart.y; else x=shapeStart.x;
        } else if (tool==='rect'||tool==='ellipse') {
          const ddx=x-shapeStart.x, ddy=y-shapeStart.y, s=Math.min(Math.abs(ddx),Math.abs(ddy));
          x=shapeStart.x+(ddx>=0?s:-s); y=shapeStart.y+(ddy>=0?s:-s);
        }
      }
      setShapeCurrent({x,y});
    }
    if (tool==='laser') {
      const rect=canvasRef.current?.getBoundingClientRect(); if (!rect) return;
      const x=(e.clientX-rect.left-offset.x)/zoom, y=(e.clientY-rect.top-offset.y)/zoom;
      setLaserPos({x,y});
      if (isDrawing) laserTrailRef.current.push({x,y,t:Date.now()});
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
          const { w: nw, h: nh } = getNoteDims(n);
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
        // Si solo se seleccionó 1 elemento, convertir a selección directa (handles de resize blancos)
        if (newIds.size === 1 && newPaths.size === 0) {
          setSelectedId([...newIds][0]);
          setSelectedIds(new Set());
          setSelectedPathIndices(new Set());
        } else {
          setSelectedIds(newIds);
          setSelectedPathIndices(newPaths);
          setSelectedId(null);
        }
      }
      setIsMarqueeing(false);
      setMarqueeStart(null);
      setMarqueeEnd(null);
    }
    if (isDrawing && shapeStart && shapeCurrent && ['rect','rhombus','ellipse','line'].includes(tool)) {
      const sx=shapeStart.x,sy=shapeStart.y,ex=shapeCurrent.x,ey=shapeCurrent.y;
      let pts:{x:number;y:number}[]=[];
      if (tool==='line') {
        pts=[{x:sx,y:sy},{x:ex,y:ey}];
      } else if (tool==='rect') {
        pts=[{x:sx,y:sy},{x:ex,y:sy},{x:ex,y:ey},{x:sx,y:ey},{x:sx,y:sy}];
      } else if (tool==='rhombus') {
        const cx=(sx+ex)/2,cy=(sy+ey)/2;
        pts=[{x:cx,y:sy},{x:ex,y:cy},{x:cx,y:ey},{x:sx,y:cy},{x:cx,y:sy}];
      } else if (tool==='ellipse') {
        const cx=(sx+ex)/2,cy=(sy+ey)/2,rx=Math.abs(ex-sx)/2,ry=Math.abs(ey-sy)/2;
        pts=Array.from({length:65},(_,i)=>{const a=(i/64)*Math.PI*2;return{x:cx+rx*Math.cos(a),y:cy+ry*Math.sin(a)};});
      }
      if (pts.length>=2) onSaveDrawings([...drawings,{points:pts,color:currentColor,width:2/zoom,zOrder:Date.now()}]);
      setShapeStart(null); setShapeCurrent(null);
    }
    if (tool==='laser') laserIsDrawingRef.current=false;
    setIsDrawing(false);
    setIsPanning(false);
  };
  const getCursor=()=>tool==='hand'?(isPanning?'grabbing':'grab'):tool==='pencil'?'crosshair':tool==='eraser'?'cell':tool==='text'?'text':tool==='laser'?'none':['rect','rhombus','ellipse','line'].includes(tool)?'crosshair':multiDragActive?'grabbing':(isMarqueeing?'crosshair':'default');
  const selectedImageIndex = selectedId ? images.findIndex(img => img.id === selectedId) : -1;
  const hasSelectedImage = selectedImageIndex >= 0;

  const handlePathRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const idx = [...selectedPathIndices][0]; if (idx === undefined) return;
    const p = drawings[idx]; if (!p || p.points.length < 2) return;
    let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    p.points.forEach(pt=>{ minX=Math.min(minX,pt.x); minY=Math.min(minY,pt.y); maxX=Math.max(maxX,pt.x); maxY=Math.max(maxY,pt.y); });
    const cx=(minX+maxX)/2, cy=(minY+maxY)/2;
    const rect=containerRef.current?.getBoundingClientRect(); if(!rect) return;
    const screenCX=cx*zoom+offset.x+rect.left, screenCY=cy*zoom+offset.y+rect.top;
    const startAngle=Math.atan2(e.clientY-screenCY, e.clientX-screenCX);
    let currentAngleDeg=0;
    const init={angle:0,cx,cy}; setPathLiveRot(init); pathLiveRotRef.current=init;
    const onMove=(me:MouseEvent)=>{
      const a=Math.atan2(me.clientY-screenCY,me.clientX-screenCX);
      currentAngleDeg=(a-startAngle)*180/Math.PI;
      const r={angle:currentAngleDeg,cx,cy}; setPathLiveRot(r); pathLiveRotRef.current=r;
    };
    const onUp=()=>{
      window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp);
      setPathLiveRot(null); pathLiveRotRef.current=null;
      const rad=currentAngleDeg*Math.PI/180;
      const cos=Math.cos(rad),sin=Math.sin(rad);
      const rotPt=(pt:{x:number;y:number})=>({x:cos*(pt.x-cx)-sin*(pt.y-cy)+cx, y:sin*(pt.x-cx)+cos*(pt.y-cy)+cy});
      pushToHistory();
      onSaveDrawings(drawings.map((d,i)=>i===idx?{...d,points:d.points.map(rotPt)}:d));
    };
    window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
  };

  return (
    <div className="h-full relative overflow-hidden">
      {/* Shapes Panel (Right Center) */}
      <ShapesPanel isVisible={showShapesPanel} onToggle={() => setShowShapesPanel(v => !v)} onAddShape={handleAddShape} onDragStart={(type, e) => { setPanelDrag({ type, startX: e.clientX, startY: e.clientY, clientX: e.clientX, clientY: e.clientY }); }} defaultColor={currentColor} customTemplates={customShapes} onDeleteCustom={id => onSaveCustomShapes(customShapes.filter(s=>s.id!==id))} onOpenEditor={() => { setShowShapesPanel(false); setShowShapeEditor(true); }} selectedPathCount={selectedPathIndices.size} onSaveSelectionAsShape={handleSaveSelectionAsShape} />
      {showShapeEditor && <ShapeEditor onSave={shape => { onSaveCustomShapes([...customShapes, shape]); setShowShapeEditor(false); toast.success(`"${shape.label}" guardada en Mis Formas`); }} onCancel={() => setShowShapeEditor(false)} />}
      <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display:'none' }} />

      {/* Ghost mientras arrastra desde el panel */}
      {panelDrag && (
        <div style={{ position:'fixed', left: panelDrag.clientX - 22, top: panelDrag.clientY - 22, pointerEvents:'none', opacity: 0.75, zIndex: 9999, filter:'drop-shadow(0 4px 12px rgba(37,99,235,0.4))' }}>
          <ShapeSvg type={panelDrag.type} color={resolveShapeInfo(panelDrag.type)?.color ?? currentColor} width={44} height={44} customTemplates={customShapes}/>
        </div>
      )}

      {/* Floating Color Palette (Left Center) */}
      {(tool === 'pencil' || tool === 'text' || ['rect','rhombus','ellipse','line'].includes(tool)) && (
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
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3" onMouseDown={e => e.stopPropagation()} onMouseUp={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 bg-[#1C1F26]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <ToolBtn active={tool==='select'} onClick={()=>setTool('select')} icon={<MousePointer2 size={18}/>} title="Seleccionar"/>
            <ToolBtn active={tool==='hand'}   onClick={()=>setTool('hand')}   icon={<Hand size={18}/>} title="Mover vista"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={false} onClick={undo} icon={<Undo2 size={18}/>} title="Deshacer"/>
            <ToolBtn active={false} onClick={redo} icon={<Redo2 size={18}/>} title="Rehacer"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={false} onClick={zoomIn}    icon={<ZoomIn size={18}/>}  title="Zoom +"/>
            <ToolBtn active={false} onClick={zoomOut}   icon={<ZoomOut size={18}/>} title="Zoom -"/>
            <ToolBtn active={false} onClick={resetZoom} icon={<Maximize size={18}/>} title="Restablecer vista"/>
            <span className="text-[11px] text-gray-400 font-bold px-2 min-w-[45px] text-center">{Math.round(zoom*100)}%</span>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={false} onClick={() => imageInputRef.current?.click()} icon={<Upload size={18}/>} title="Importar imagen"/>
            <ToolBtn active={false} onClick={exportBoardPng} icon={<Download size={18}/>} title="Exportar PNG"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={tool==='pencil'} onClick={()=>setTool('pencil')} icon={<div className="relative"><Pencil size={18}/><div className="absolute -bottom-1 -right-1 w-2 h-2 rounded-full border border-white" style={{ background: currentColor }}/></div>} title="Lápiz"/>
            <ToolBtn active={tool==='text'}   onClick={()=>setTool('text')}   icon={<Type size={18}/>} title="Texto"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={tool==='line'}    onClick={()=>setTool('line')}    title="Línea" icon={<svg viewBox="0 0 18 18" width={18} height={18} stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="15" x2="15" y2="3"/></svg>}/>
            <ToolBtn active={tool==='rect'}    onClick={()=>setTool('rect')}    title="Rectángulo" icon={<svg viewBox="0 0 18 18" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2.5" y="4" width="13" height="10" rx="1.5"/></svg>}/>
            <ToolBtn active={tool==='rhombus'} onClick={()=>setTool('rhombus')} title="Rombo" icon={<svg viewBox="0 0 18 18" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polygon points="9,2 16,9 9,16 2,9"/></svg>}/>
            <ToolBtn active={tool==='ellipse'} onClick={()=>setTool('ellipse')} title="Círculo / Elipse" icon={<svg viewBox="0 0 18 18" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="1.8"><ellipse cx="9" cy="9" rx="6.5" ry="5"/></svg>}/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <ToolBtn active={tool==='laser'}  onClick={()=>setTool('laser')}  title="Puntero láser" icon={<svg viewBox="0 0 18 18" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="9" r="2.5" fill="currentColor" opacity="0.9"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="9" y1="14" x2="9" y2="17"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="14" y1="9" x2="17" y2="9"/></svg>}/>
            <ToolBtn active={tool==='eraser'} onClick={()=>setTool('eraser')} icon={<Eraser size={18}/>} title="Borrador"/>
            <div className="w-px h-6 bg-white/10 mx-1"/>
            <button onClick={onClearAll} className="p-2 text-red-500/60 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all" title="Limpiar todo"><Trash2 size={17}/></button>
          </div>
          <button onClick={onAddNote} className="bg-[#2563eb] hover:bg-[#1d4ed8] text-white p-3 rounded-2xl shadow-lg transition-all transform hover:scale-105">
            <Plus size={22}/>
          </button>
        </div>

      {hasSelectedImage && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col gap-2 bg-[#1C1F26]/80 backdrop-blur-xl p-2 rounded-2xl border border-white/10 shadow-2xl" onMouseDown={e => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-2 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
            <Layers size={13}/> Capa
          </div>
          <ToolBtn active={false} onClick={() => reorderSelectedImage('front')} icon={<BringToFront size={17}/>} title="Traer al frente"/>
          <ToolBtn active={false} onClick={() => reorderSelectedImage('up')} icon={<ArrowUp size={17}/>} title="Subir capa"/>
          <ToolBtn active={false} onClick={() => reorderSelectedImage('down')} icon={<ArrowDown size={17}/>} title="Bajar capa"/>
          <ToolBtn active={false} onClick={() => reorderSelectedImage('back')} icon={<SendToBack size={17}/>} title="Enviar al fondo"/>
        </div>
      )}

      <div ref={containerRef}
        style={{ width: '100%', height: '100%', background:"#0A0C0F", cursor:getCursor(), position:'relative', overflow:'hidden' }}
        onMouseDown={onMD} onMouseMove={onMM} onMouseUp={onMU} onMouseLeave={onMU}
        onClick={(e) => { if (tool==='text') { if (editingText) { saveText(); return; } setEditingText({ x: e.clientX, y: e.clientY, content: '' }); } }}>

        {/* Imágenes + Formas + Notas — una sola capa ordenada por zOrder (más reciente = encima) */}
        <div style={{ position:'absolute', inset:0, transform:`translate(${offset.x}px,${offset.y}px) scale(${zoom})`, transformOrigin:'0 0', pointerEvents: tool==='select'?'auto':'none', zIndex: 10 }}>
          {[
            ...images.map((img, i) => ({ kind: 'image' as const, data: img, zOrder: img.zOrder ?? i })),
            ...drawings.map((p, i) => ({ kind: 'path' as const, data: p, index: i, zOrder: p.zOrder ?? i })),
            ...shapes.map((s,  i) => ({ kind: 'shape' as const, data: s,   zOrder: s.zOrder   ?? images.length + i })),
            ...notes.map((n,   i) => ({ kind: 'note'  as const, data: n,   zOrder: n.createdAt ?? images.length + shapes.length + i })),
          ]
            .sort((a, b) => a.zOrder - b.zOrder)
            .map((el, stackIdx) => {
              if (el.kind === 'image') {
                const img = el.data;
                return <DraggableImage key={img.id} image={img} stackIndex={stackIdx + 1} onDrag={onDragImage} onRotate={(id:string,rotation:number)=>onSaveImages(images.map(im=>im.id===id?{...im,rotation}:im))} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===img.id} isInMultiSelect={selectedIds.has(img.id)} dragOffset={multiDragActive?multiDragDelta:null} onMultiDragStart={onMultiDragStart} onSelect={()=>{ setSelectedId(img.id); setSelectedIds(new Set()); setSelectedPathIndices(new Set()); }}/>;
              }
              if (el.kind === 'shape') {
                const s = el.data;
                return <DraggableShape key={s.id} shape={s} customTemplates={customShapes} stackIndex={stackIdx + 1} onSave={(id:string,x:number,y:number,w:number,h:number)=>onSaveShapes(shapes.map(sh=>sh.id===id?{...sh,x,y,width:w,height:h}:sh))} onRotate={(id:string,rotation:number)=>onSaveShapes(shapes.map(sh=>sh.id===id?{...sh,rotation}:sh))} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===s.id} isInMultiSelect={selectedIds.has(s.id)} dragOffset={multiDragActive?multiDragDelta:null} onMultiDragStart={onMultiDragStart} onSelect={()=>{ setSelectedId(s.id); setSelectedIds(new Set()); setSelectedPathIndices(new Set()); }}/>;
              }
              if (el.kind === 'path') {
                const p = el.data;
                const idx = el.index;
                if (p.points.length < 2) return null;
                const isSel = selectedPathIndices.has(idx);
                const pdx = isSel && multiDragActive ? multiDragDelta.x : 0;
                const pdy = isSel && multiDragActive ? multiDragDelta.y : 0;
                const rot = isSel && pathLiveRotRef.current ? pathLiveRotRef.current : null;
                const transforms = [
                  rot ? `rotate(${rot.angle} ${rot.cx} ${rot.cy})` : '',
                  pdx || pdy ? `translate(${pdx} ${pdy})` : '',
                ].filter(Boolean).join(' ');
                const d = getPathD(p.points);
                return (
                  <svg key={`path-${idx}`} style={{ position:'absolute', inset:0, width:'100%', height:'100%', overflow:'visible', pointerEvents:'none', zIndex:stackIdx + 1 }} xmlns="http://www.w3.org/2000/svg">
                    <g transform={transforms || undefined}>
                      <path d={d} stroke={p.color} strokeWidth={p.width} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      {isSel && (
                        <path d={d} stroke="rgba(255,255,255,0.7)" strokeWidth={1.5/zoom} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={`${7/zoom} ${4/zoom}`}/>
                      )}
                    </g>
                  </svg>
                );
              }
              const note = el.data;
              return <DraggableNote key={note.id} note={note} members={members} stackIndex={stackIdx + 1} onDrag={onDragNote} onRotate={(id:string,rotation:number)=>onSaveNotes(notes.map(n=>n.id===id?{...n,rotation}:n))} disabled={tool!=='select'} zoom={zoom} isSelected={selectedId===note.id} isInMultiSelect={selectedIds.has(note.id)} dragOffset={multiDragActive?multiDragDelta:null} onMultiDragStart={onMultiDragStart} onEditText={openTextEditorForNote} onSelect={()=>{ setSelectedId(note.id); setSelectedIds(new Set()); setSelectedPathIndices(new Set()); }}/>;
            })
          }
        </div>

        {/* Text Editor */}
        {editingText && (
          <textarea
            ref={textareaRef}
            autoFocus
            className="bg-transparent border-none outline-none text-white font-bold resize-none overflow-hidden"
            style={{ position:'fixed', left: editingText.x, top: editingText.y, color: currentColor, fontSize: 22, width: 400, minHeight: 40, height: 'auto', outline: 'none', zIndex: 2000, pointerEvents: 'auto' }}
            value={editingText.content}
            onMouseDown={e => e.stopPropagation()}
            onClick={e => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                saveText();
              }
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                saveText();
              }
            }}
            onBlur={saveText}
            onChange={(e) => setEditingText({ ...editingText, content: e.target.value })}
          />
        )}

        {isMarqueeing && marqueeStart && marqueeEnd && (
          <div style={{
            position: 'absolute',
            left: Math.min(marqueeStart.x, marqueeEnd.x) * zoom + offset.x,
            top:  Math.min(marqueeStart.y, marqueeEnd.y) * zoom + offset.y,
            width:  Math.abs(marqueeEnd.x - marqueeStart.x) * zoom,
            height: Math.abs(marqueeEnd.y - marqueeStart.y) * zoom,
            background: 'rgba(37,99,235,0.08)',
            border: '1.5px dashed rgba(37,99,235,0.7)',
            borderRadius: 3,
            pointerEvents: 'none',
            zIndex: 30,
          }}/>
        )}

        {/* Bounding box + handles + rotación para un solo trazo seleccionado */}
        {selectedPathIndices.size === 1 && selectedIds.size === 0 && tool === 'select' && !isMarqueeing && !multiDragActive && !pathLiveRot && (() => {
          const idx = [...selectedPathIndices][0];
          const p = drawings[idx]; if (!p || p.points.length < 2) return null;
          const bbox = multiResizeBBox ?? getMultiSelectBBox(); if (!bbox) return null;
          const pad = 6;
          const left   = (bbox.x - pad) * zoom + offset.x;
          const top    = (bbox.y - pad) * zoom + offset.y;
          const width  = (bbox.w + pad * 2) * zoom;
          const height = (bbox.h + pad * 2) * zoom;
          const corner = (extra: React.CSSProperties): React.CSSProperties => ({
            position:'absolute', width:8, height:8, background:'#0A0C0F',
            border:'1.5px solid rgba(255,255,255,0.75)', borderRadius:3,
            pointerEvents:'auto', zIndex:35, ...extra,
          });
          const edge = (extra: React.CSSProperties): React.CSSProperties => ({
            position:'absolute', background:'transparent',
            pointerEvents:'auto', zIndex:35, ...extra,
          });
          return (
            <div style={{ position:'absolute', left, top, width, height, border:'1px dashed rgba(255,255,255,0.4)', borderRadius:3, pointerEvents:'none', zIndex:30 }}>
              {/* Esquinas redondeadas */}
              <div style={corner({ top:-4, left:-4, cursor:'nw-resize' })} onMouseDown={e=>onMultiResizeStart('nw',e)}/>
              <div style={corner({ top:-4, right:-4, cursor:'ne-resize' })} onMouseDown={e=>onMultiResizeStart('ne',e)}/>
              <div style={corner({ bottom:-4, left:-4, cursor:'sw-resize' })} onMouseDown={e=>onMultiResizeStart('sw',e)}/>
              <div style={corner({ bottom:-4, right:-4, cursor:'se-resize' })} onMouseDown={e=>onMultiResizeStart('se',e)}/>
              {/* Tiras transparentes de ancho completo para los lados */}
              <div style={edge({ top:0, left:8, right:8, height:8, transform:'translateY(-50%)', cursor:'n-resize' })} onMouseDown={e=>onMultiResizeStart('n',e)}/>
              <div style={edge({ bottom:0, left:8, right:8, height:8, transform:'translateY(50%)', cursor:'s-resize' })} onMouseDown={e=>onMultiResizeStart('s',e)}/>
              <div style={edge({ right:0, top:8, bottom:8, width:8, transform:'translateX(50%)', cursor:'e-resize' })} onMouseDown={e=>onMultiResizeStart('e',e)}/>
              <div style={edge({ left:0, top:8, bottom:8, width:8, transform:'translateX(-50%)', cursor:'w-resize' })} onMouseDown={e=>onMultiResizeStart('w',e)}/>
              {/* Handle de rotación */}
              <div style={{ position:'absolute', left:'50%', top:0, transform:'translateX(-50%)', pointerEvents:'auto' }}>
                <RotateHandle onMouseDown={handlePathRotateStart}/>
              </div>
            </div>
          );
        })()}

        {/* Multi-select bounding box con handles de resize */}
        {(selectedIds.size > 0 || selectedPathIndices.size > 1 || (selectedPathIndices.size > 0 && selectedIds.size > 0)) && tool === 'select' && !isMarqueeing && !multiDragActive && (() => {
          const bbox = multiResizeBBox ?? getMultiSelectBBox();
          if (!bbox) return null;
          const pad = 6;
          const left   = (bbox.x - pad) * zoom + offset.x;
          const top    = (bbox.y - pad) * zoom + offset.y;
          const width  = (bbox.w + pad * 2) * zoom;
          const height = (bbox.h + pad * 2) * zoom;
          const handleStyle = (extra: React.CSSProperties): React.CSSProperties => ({
            position: 'absolute', width: 9, height: 9,
            background: '#0A0C0F', border: '1.5px solid rgba(37,99,235,0.95)',
            borderRadius: 2, pointerEvents: 'auto', zIndex: 35, ...extra,
          });
          return (
            <div style={{ position:'absolute', left, top, width, height, border:'1.5px dashed rgba(37,99,235,0.6)', borderRadius:4, pointerEvents:'none', zIndex:30 }}>
              {/* Esquinas */}
              <div style={handleStyle({ top:-4, left:-4, cursor:'nw-resize' })} onMouseDown={e=>onMultiResizeStart('nw',e)}/>
              <div style={handleStyle({ top:-4, right:-4, cursor:'ne-resize' })} onMouseDown={e=>onMultiResizeStart('ne',e)}/>
              <div style={handleStyle({ bottom:-4, left:-4, cursor:'sw-resize' })} onMouseDown={e=>onMultiResizeStart('sw',e)}/>
              <div style={handleStyle({ bottom:-4, right:-4, cursor:'se-resize' })} onMouseDown={e=>onMultiResizeStart('se',e)}/>
              {/* Lados */}
              <div style={handleStyle({ top:-4, left:'50%', transform:'translateX(-50%)', cursor:'n-resize' })} onMouseDown={e=>onMultiResizeStart('n',e)}/>
              <div style={handleStyle({ bottom:-4, left:'50%', transform:'translateX(-50%)', cursor:'s-resize' })} onMouseDown={e=>onMultiResizeStart('s',e)}/>
              <div style={handleStyle({ top:'50%', right:-4, transform:'translateY(-50%)', cursor:'e-resize' })} onMouseDown={e=>onMultiResizeStart('e',e)}/>
              <div style={handleStyle({ top:'50%', left:-4, transform:'translateY(-50%)', cursor:'w-resize' })} onMouseDown={e=>onMultiResizeStart('w',e)}/>
            </div>
          );
        })()}

        <canvas ref={canvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex: 0 }}/>
        <canvas ref={laserCanvasRef} style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex: 62 }}/>


        {/* Shape preview while dragging */}
        {shapeStart && shapeCurrent && (() => {
          const sx=shapeStart.x,sy=shapeStart.y,ex=shapeCurrent.x,ey=shapeCurrent.y;
          const common={stroke:currentColor,strokeWidth:2/zoom,fill:'none',strokeDasharray:`${6/zoom},${4/zoom}`,strokeLinecap:'round' as const,strokeLinejoin:'round' as const};
          let shape: React.ReactElement|null=null;
          if (tool==='line') {
            shape=<line {...common} x1={sx} y1={sy} x2={ex} y2={ey}/>;
          } else if (tool==='rect') {
            const rx=Math.min(sx,ex),ry=Math.min(sy,ey),rw=Math.abs(ex-sx),rh=Math.abs(ey-sy);
            shape=<rect {...common} x={rx} y={ry} width={rw} height={rh} rx={2/zoom}/>;
          } else if (tool==='rhombus') {
            const cx=(sx+ex)/2,cy=(sy+ey)/2;
            shape=<polygon {...common} points={`${cx},${sy} ${ex},${cy} ${cx},${ey} ${sx},${cy}`}/>;
          } else if (tool==='ellipse') {
            const cx=(sx+ex)/2,cy=(sy+ey)/2,rx2=Math.abs(ex-sx)/2,ry2=Math.abs(ey-sy)/2;
            shape=<ellipse {...common} cx={cx} cy={cy} rx={rx2} ry={ry2}/>;
          }
          return shape ? (
            <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',pointerEvents:'none',zIndex:25}} xmlns="http://www.w3.org/2000/svg">
              <g transform={`translate(${offset.x},${offset.y}) scale(${zoom})`}>{shape}</g>
            </svg>
          ) : null;
        })()}

        {/* Laser pointer */}
        {tool==='laser' && laserPos && (
          <div style={{
            position:'absolute',
            left: laserPos.x*zoom+offset.x,
            top:  laserPos.y*zoom+offset.y,
            transform:'translate(-50%,-50%)',
            width:14, height:14, borderRadius:'50%',
            background:'radial-gradient(circle, #ff4444 0%, #ff0000 40%, transparent 70%)',
            boxShadow:'0 0 6px 3px rgba(255,50,50,0.85), 0 0 18px 6px rgba(255,0,0,0.4)',
            pointerEvents:'none', zIndex:200,
          }}/>
        )}
      </div>
    </div>
  );
}
