"use client";

import { useState, useEffect, useRef, RefObject, memo } from "react";
import {
  FolderOpen, UploadCloud, X, LinkIcon, ExternalLink, Download,
  FileText, Image as ImageIcon, FileCode, Archive, Film, Music,
  Globe, Copy, Check, RefreshCw, Trash2
} from "lucide-react";
import { toast } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import ArchivosBackground from "@/app/dashboard/sections/ArchivosBackground";
import type { Member, SharedFile } from "@/app/dashboard/types";
import { getToken } from "@/lib/api";

// ─── Floating File Card ───────────────────────────────────────────────────────

function FloatingFileCard({ file, onDelete, onDrop, containerRef }: { file: SharedFile; onDelete: () => void; onDrop: (id: string, x: number, y: number) => void; containerRef: RefObject<HTMLDivElement | null>; }) {
  const [pos, setPos] = useState({ x:file.x, y:file.y });
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [showShare, setShowShare] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [publicLink, setPublicLink] = useState('');
  const [copied, setCopied] = useState(false);

  const getTypeInfo = (): { icon: React.ReactNode; accent: string; label: string } => {
    const t = file.type;
    if (t==='link')   return { icon:<LinkIcon size={20}/>,   accent:'#3498DB', label:'Enlace' };
    if (t.includes('pdf'))   return { icon:<FileText size={20}/>,  accent:'#E74C3C', label:'PDF' };
    if (t.includes('image')) return { icon:<ImageIcon size={20}/>, accent:'#9B59B6', label:'Imagen' };
    if (t.includes('zip')||t.includes('rar')) return { icon:<Archive size={20}/>,  accent:'#F39C12', label:'ZIP' };
    if (t.includes('word')||t.includes('document')) return { icon:<FileText size={20}/>, accent:'#2980B9', label:'Word' };
    if (t.includes('sheet')||t.includes('excel'))   return { icon:<FileText size={20}/>, accent:'#27AE60', label:'Excel' };
    if (t.includes('video')) return { icon:<Film size={20}/>,      accent:'#E85D2F', label:'Video' };
    if (t.includes('audio')) return { icon:<Music size={20}/>,     accent:'#1ABC9C', label:'Audio' };
    if (t.includes('javascript')||t.includes('typescript')||t.includes('html')||t.includes('css')) return { icon:<FileCode size={20}/>, accent:'#F1C40F', label:'Código' };
    return { icon:<FileText size={20}/>, accent:'#8A9099', label:'Archivo' };
  };

  const formatSize = (b:number) => { if (!b) return ''; if (b<1024) return `${b} B`; if (b<1048576) return `${(b/1024).toFixed(1)} KB`; return `${(b/1048576).toFixed(1)} MB`; };
  const handleAction = () => { if (file.type==='link') window.open(file.dataUrl,'_blank'); else { const a=document.createElement('a');a.href=file.dataUrl;a.download=file.name;a.click(); } };

  const handleShare = () => {
    if (showShare) { setShowShare(false); return; }
    if (showCodeInput) { setShowCodeInput(false); return; }
    setCustomCode('');
    setCodeError('');
    setShowCodeInput(true);
  };

  const handleGenerate = async () => {
    setIsSharing(true);
    setCodeError('');
    try {
      let finalDataUrl = file.dataUrl;
      const isPhysicalFile = file.type !== 'link' && file.dataUrl.startsWith('data:');
      if (isPhysicalFile) {
        const formData = new FormData();
        const resBlob = await fetch(file.dataUrl);
        const blob = await resBlob.blob();
        formData.append('file', blob, file.name);
        const response = await fetch('/api/share', {
          method: 'POST',
          headers: { Authorization: `Bearer ${getToken()}` },
          body: formData,
        });
        if (!response.ok) {
          const text = await response.text();
          let msg = 'Error en el servidor';
          try { const d = JSON.parse(text); msg = d.error || msg; } catch(e) {}
          throw new Error(msg);
        }
        const data = await response.json();
        finalDataUrl = window.location.origin + data.link;
      }
      const payload = {
        name: file.name, type: file.type, size: file.size,
        authorName: file.authorName, createdAt: file.createdAt,
        expiresAt: Date.now() + 15 * 60 * 1000,
        dataUrl: finalDataUrl,
        customCode: customCode.trim() || undefined,
      };
      const res = await fetch('/api/shortlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setCodeError(json.error || 'Error'); setIsSharing(false); return; }
      setPublicLink(`${window.location.origin}/compartir/${json.code}`);
      setShowCodeInput(false);
      setShowShare(true);
    } catch (err: any) {
      toast.error(err.message || "No se pudo generar el link");
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(publicLink);
    setCopied(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopied(false), 2500);
  };

  useEffect(() => {
    const onMM=(e:MouseEvent)=>{
      if (!isDragging) return;
      setPos(p=>{
        const container = containerRef.current;
        const card = cardRef.current;
        const maxX = container ? container.clientWidth  - (card?.offsetWidth  ?? 215) : Infinity;
        const maxY = container ? container.clientHeight - (card?.offsetHeight ?? 180) : Infinity;
        return {
          x: Math.max(0, Math.min(p.x + e.movementX, maxX)),
          y: Math.max(0, Math.min(p.y + e.movementY, maxY)),
        };
      });
    };
    const onMU=()=>{ if (isDragging) { setIsDragging(false); onDrop(file.id,pos.x,pos.y); } };
    if (isDragging) { window.addEventListener('mousemove',onMM); window.addEventListener('mouseup',onMU); }
    return ()=>{ window.removeEventListener('mousemove',onMM); window.removeEventListener('mouseup',onMU); };
  }, [isDragging, pos, file.id, onDrop, containerRef]);

  const { icon, accent, label } = getTypeInfo();

  return (
    <div ref={cardRef} style={{ position:'absolute', left:pos.x, top:pos.y, width:215, zIndex:isDragging?100:10, cursor:isDragging?'grabbing':'grab', borderRadius:16, overflow:'hidden', background:'#1A1D24', border:isDragging?`2px solid ${accent}50`:`1px solid ${accent}25`, transition:isDragging?'none':'border-color 0.2s', userSelect:'none' }}
      onMouseDown={e=>{ if ((e.target as HTMLElement).closest('button')) return; setIsDragging(true); }}>
      <div style={{ background:`linear-gradient(135deg,${accent}20 0%,${accent}07 100%)`, borderBottom:`1px solid ${accent}18`, padding:'14px 14px 10px' }}>
        <div className="flex items-start justify-between mb-2">
          <div style={{ color:accent, background:`${accent}18`, borderRadius:9, padding:'7px 8px', display:'flex' }}>{icon}</div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              disabled={isSharing}
              title="Generar link público"
              style={{ color:showShare?'#3498DB':(isSharing?'#5A6270':'#3A3F4A'), background:'none', border:'none', cursor:isSharing?'wait':'pointer', padding:'2px', display:'flex', transition:'color 0.15s' }}
              onMouseEnter={e=>{ if(!isSharing) e.currentTarget.style.color='#3498DB'; }}
              onMouseLeave={e=>{ if(!isSharing) e.currentTarget.style.color=showShare?'#3498DB':'#3A3F4A'; }}>
              {isSharing ? <RefreshCw size={13} className="animate-spin text-blue-400" /> : <Globe size={13}/>}
            </button>
            <button onClick={onDelete} style={{ color:'#3A3F4A', background:'none', border:'none', cursor:'pointer', padding:'2px', display:'flex', transition:'color 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.color='#E74C3C';}} onMouseLeave={e=>{e.currentTarget.style.color='#3A3F4A';}}><X size={14}/></button>
          </div>
        </div>
        <p className="text-white font-bold text-xs leading-tight truncate" title={file.name}>{file.name}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span style={{ color:accent, background:`${accent}18`, borderRadius:4, padding:'1px 6px', fontSize:9, fontWeight:700, letterSpacing:'0.06em', textTransform:'uppercase' }}>{label}</span>
          {file.size>0&&<span className="text-[10px] text-gray-600">{formatSize(file.size)}</span>}
        </div>
      </div>
      <div style={{ padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div><p className="text-[10px] text-gray-500 font-medium">{file.authorName}</p><p className="text-[9px] text-gray-700">{new Date(file.createdAt).toLocaleDateString()}</p></div>
        <button onClick={handleAction} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', background:`${accent}15`, border:`1px solid ${accent}28`, borderRadius:8, color:accent, fontSize:11, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }} onMouseEnter={e=>{e.currentTarget.style.background=`${accent}28`;}} onMouseLeave={e=>{e.currentTarget.style.background=`${accent}15`;}}>
          {file.type==='link'?<ExternalLink size={11}/>:<Download size={11}/>}
          {file.type==='link'?'Abrir':'Bajar'}
        </button>
      </div>
      {showCodeInput && (
        <div style={{ borderTop:'1px solid rgba(52,152,219,0.15)', background:'rgba(52,152,219,0.04)', padding:'9px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:7 }}>
            <Globe size={9} color="#3498DB"/>
            <span style={{ fontSize:9, fontWeight:800, color:'#3498DB', textTransform:'uppercase', letterSpacing:'0.07em' }}>Código personalizado</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <input
              autoFocus
              value={customCode}
              onChange={e => { setCustomCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g,'')); setCodeError(''); }}
              onKeyDown={e => { if (e.key === 'Enter') handleGenerate(); }}
              placeholder="ej: miarchivo"
              maxLength={20}
              style={{ flex:1, background:'rgba(0,0,0,0.35)', border:`1px solid ${codeError?'rgba(231,76,60,0.5)':'rgba(52,152,219,0.25)'}`, borderRadius:7, padding:'5px 8px', fontSize:11, color:'#e2e8f0', outline:'none', fontFamily:'JetBrains Mono, monospace', letterSpacing:'0.05em' }}
            />
            <button onClick={handleGenerate} disabled={isSharing}
              style={{ flexShrink:0, padding:'5px 9px', background:'rgba(52,152,219,0.18)', border:'1px solid rgba(52,152,219,0.3)', borderRadius:7, color:'#3498DB', fontSize:11, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:4, transition:'all 0.15s' }}>
              {isSharing ? <RefreshCw size={11} className="animate-spin"/> : 'Crear'}
            </button>
          </div>
          {codeError && <p style={{ fontSize:9, color:'#E74C3C', marginTop:4 }}>{codeError}</p>}
          <p style={{ fontSize:8, color:'#3A3F4A', marginTop:5 }}>Vacío = código automático · Solo letras y números</p>
        </div>
      )}
      {showShare && (
        <div style={{ borderTop:'1px solid rgba(52,152,219,0.15)', background:'rgba(52,152,219,0.04)', padding:'9px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:6 }}>
            <Globe size={9} color="#3498DB"/>
            <span style={{ fontSize:9, fontWeight:800, color:'#3498DB', textTransform:'uppercase', letterSpacing:'0.07em' }}>Link público · 15 min</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5 }}>
            <div style={{ flex:1, background:'rgba(0,0,0,0.3)', border:'1px solid rgba(52,152,219,0.18)', borderRadius:7, padding:'4px 7px', fontSize:9, color:'#5A6270', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis' }}>{publicLink}</div>
            <button onClick={handleCopy} title={copied?'Copiado':'Copiar link'} style={{ flexShrink:0, padding:'5px 7px', background:copied?'rgba(46,204,113,0.12)':'rgba(52,152,219,0.12)', border:`1px solid ${copied?'rgba(46,204,113,0.35)':'rgba(52,152,219,0.25)'}`, borderRadius:7, color:copied?'#2ECC71':'#3498DB', cursor:'pointer', display:'flex', transition:'all 0.2s' }}>
              {copied?<Check size={11}/>:<Copy size={11}/>}
            </button>
          </div>
          <p style={{ fontSize:8, color:'#3A3F4A', marginTop:5, letterSpacing:'0.03em' }}>Código: <span style={{color:'#3498DB', fontFamily:'JetBrains Mono, monospace'}}>{publicLink.split('/').pop()}</span></p>
        </div>
      )}
    </div>
  );
}

// ─── Sección: Archivos ────────────────────────────────────────────────────────

function SectionArchivos({ archivos, members, currentUser, onSave }: { archivos: SharedFile[]; members: Member[]; currentUser: Member | null; onSave: (d: SharedFile[]) => void; }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver]       = useState(false);
  const [linkInput, setLinkInput]         = useState('');
  const [showLink, setShowLink]           = useState(false);
  const [showConfirmClear, setShowConfirmClear] = useState(false);
  const authorName = currentUser?.name || members[0]?.name || 'Equipo';

  const processFile = (file: File) => {
    if (file.size > 100*1024*1024) { toast.error(`"${file.name}" supera 100MB. Usa un enlace.`); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      onSave([...archivos, { id:crypto.randomUUID(), name:file.name, type:file.type||'application/octet-stream', size:file.size, dataUrl:ev.target?.result as string, x:60+Math.random()*500, y:60+Math.random()*280, createdAt:Date.now(), authorName }]);
      toast.success(`"${file.name}" compartido`);
    };
    reader.readAsDataURL(file);
  };

  const addLink = () => {
    const url = linkInput.trim(); if (!url) return;
    let name = url; try { name = new URL(url).hostname; } catch {}
    onSave([...archivos, { id:crypto.randomUUID(), name, type:'link', size:0, dataUrl:url, x:60+Math.random()*500, y:60+Math.random()*280, createdAt:Date.now(), authorName }]);
    setLinkInput(''); setShowLink(false); toast.success("Enlace agregado");
  };

  return (
    <div className="flex flex-col gap-3 h-full relative">
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"><ArchivosBackground /></div>
      <div className="flex items-center justify-between flex-shrink-0 relative z-10">
        <p className="text-xs text-gray-500"><span className="text-white font-semibold">{archivos.length}</span> {archivos.length===1?'archivo':'archivos'} compartidos</p>
        <div className="flex items-center gap-2">
          {showLink ? (
            <div className="flex items-center gap-2">
              <input autoFocus type="url" placeholder="https://..." value={linkInput} onChange={e=>setLinkInput(e.target.value)}
                onKeyDown={e=>{ if (e.key==='Enter') addLink(); if (e.key==='Escape') setShowLink(false); }}
                style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.1)", borderRadius:8, padding:"7px 12px", fontSize:13, color:"#F4F5F7", outline:"none", width:240 }}
                onFocus={e=>{e.currentTarget.style.borderColor="rgba(232,93,47,0.5)";}} onBlur={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.1)";}}/>
              <ButtonBase onClick={addLink} className="flex items-center gap-1.5"><LinkIcon size={13}/> Agregar</ButtonBase>
              <button onClick={()=>setShowLink(false)} style={{ color:"#5A6270", background:"none", border:"none", cursor:"pointer", display:"flex" }}><X size={17}/></button>
            </div>
          ) : (
            <>
              <button onClick={()=>setShowLink(true)}
                style={{ padding:"7px 12px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8, color:"#8A9099", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.color="#F4F5F7";}} onMouseLeave={e=>{e.currentTarget.style.color="#8A9099";}}>
                <LinkIcon size={13}/> Pegar enlace
              </button>
              <input ref={fileInputRef} type="file" multiple className="hidden" onChange={e=>{Array.from(e.target.files||[]).forEach(processFile);e.target.value='';}}/>
              {archivos.length > 0 && (
                <button onClick={()=>setShowConfirmClear(true)}
                  style={{ padding:"7px 10px", background:"rgba(239,68,68,0.07)", border:"1px solid rgba(239,68,68,0.18)", borderRadius:8, color:"#f87171", fontSize:12, fontWeight:600, cursor:"pointer", display:"flex", alignItems:"center", gap:5, transition:"all 0.15s" }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,0.14)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.35)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,0.07)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.18)";}}>
                  <Trash2 size={13}/> Limpiar todo
                </button>
              )}
              <ButtonBase onClick={()=>fileInputRef.current?.click()} className="flex items-center gap-2"><UploadCloud size={15}/> Subir archivo</ButtonBase>
            </>
          )}
        </div>
      </div>
      <div ref={containerRef} style={{ flex:1, position:'relative', overflow:'hidden', borderRadius:18, background:"transparent", border:isDragOver?"2px dashed #E85D2F":"none", transition:"border-color 0.15s", zIndex:10 }}
        onDragOver={e=>{e.preventDefault();setIsDragOver(true);}} onDragLeave={()=>setIsDragOver(false)}
        onDrop={e=>{e.preventDefault();setIsDragOver(false);Array.from(e.dataTransfer.files).forEach(processFile);}}>

        {isDragOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm rounded-[16px] pointer-events-none">
            <UploadCloud size={52} className="text-[#E85D2F]"/>
            <p className="text-white text-lg font-bold">Suelta para compartir</p>
            <p className="text-gray-400 text-xs">PDF, imágenes, ZIP, Word y más · máx 100 MB</p>
          </div>
        )}
        {archivos.length===0&&!isDragOver&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none opacity-15">
            <FolderOpen size={64}/><p className="text-xs font-bold uppercase tracking-widest">Espacio de archivos</p>
            <p className="text-[10px] uppercase tracking-widest">Arrastra archivos o usa el botón de arriba</p>
          </div>
        )}
        {archivos.map(a=><FloatingFileCard key={a.id} file={a} containerRef={containerRef} onDelete={()=>onSave(archivos.filter(f=>f.id!==a.id))} onDrop={(id,x,y)=>onSave(archivos.map(f=>f.id===id?{...f,x,y}:f))}/>)}
        <div className="absolute bottom-4 right-4 text-[10px] text-gray-800 font-bold uppercase tracking-widest pointer-events-none flex items-center gap-1.5"><FolderOpen size={10}/> Espacio compartido</div>
      </div>

      {/* Modal confirmación limpiar todo */}
      {showConfirmClear && (
        <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(0,0,0,0.65)', backdropFilter:'blur(6px)' }}
          onMouseDown={e=>{ if (e.target===e.currentTarget) setShowConfirmClear(false); }}>
          <div style={{ background:'rgba(14,17,24,0.98)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:18, padding:'28px 32px', width:360, display:'flex', flexDirection:'column', gap:20, fontFamily:"'DM Sans',sans-serif" }}>
            {/* Icono */}
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <div style={{ width:40, height:40, borderRadius:12, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <Trash2 size={18} color="#f87171"/>
              </div>
              <div>
                <p style={{ margin:0, fontWeight:800, fontSize:15, color:'#F4F5F7', letterSpacing:'-0.3px' }}>¿Eliminar todo?</p>
                <p style={{ margin:0, fontSize:12, color:'#5A6270', marginTop:3 }}>
                  Se borrarán <span style={{ color:'#f87171', fontWeight:700 }}>{archivos.length} {archivos.length===1?'archivo':'archivos'}</span> del espacio compartido.
                </p>
              </div>
            </div>
            <p style={{ margin:0, fontSize:12, color:'#4A5060', lineHeight:1.6, borderTop:'1px solid rgba(255,255,255,0.05)', paddingTop:16 }}>
              Esta acción no se puede deshacer. Los archivos subidos y enlaces agregados se eliminarán para todos.
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={()=>setShowConfirmClear(false)}
                style={{ flex:1, padding:'9px 0', borderRadius:10, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', color:'#8A9099', fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)'; e.currentTarget.style.color='#F4F5F7';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#8A9099';}}>
                Cancelar
              </button>
              <button onClick={()=>{ onSave([]); setShowConfirmClear(false); toast.success('Espacio limpiado'); }}
                style={{ flex:1, padding:'9px 0', borderRadius:10, background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', color:'#f87171', fontSize:13, fontWeight:700, cursor:'pointer', transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.5)';}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,0.12)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.3)';}}>
                Sí, eliminar todo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default memo(SectionArchivos);
