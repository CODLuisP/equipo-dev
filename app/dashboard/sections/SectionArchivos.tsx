"use client";

import { useState, useEffect, useRef } from "react";
import {
  FolderOpen, UploadCloud, X, LinkIcon, ExternalLink, Download,
  FileText, Image as ImageIcon, FileCode, Archive, Film, Music,
  Globe, Copy, Check, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import type { Member, SharedFile } from "@/app/dashboard/types";

// ─── Floating File Card ───────────────────────────────────────────────────────

function FloatingFileCard({ file, onDelete, onDrop }: { file: SharedFile; onDelete: () => void; onDrop: (id: string, x: number, y: number) => void; }) {
  const [pos, setPos] = useState({ x:file.x, y:file.y });
  const [isDragging, setIsDragging] = useState(false);
  const [showShare, setShowShare] = useState(false);
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

  const handleShare = async () => {
    if (showShare) { setShowShare(false); return; }
    setIsSharing(true);

    try {
      let finalDataUrl = file.dataUrl;
      const isPhysicalFile = file.type !== 'link' && file.dataUrl.startsWith('data:');

      // Si es un archivo físico, lo subimos a través de nuestra API local (Proxy)
      // para evitar errores de CORS y URLs demasiado largas (Error 431)
      if (isPhysicalFile) {
        const formData = new FormData();
        const resBlob = await fetch(file.dataUrl);
        const blob = await resBlob.blob();
        formData.append('file', blob, file.name);

        const response = await fetch('/api/share', {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const text = await response.text();
          let msg = 'Error en el servidor';
          try { const d = JSON.parse(text); msg = d.error || msg; } catch(e) {}
          throw new Error(msg);
        }

        const data = await response.json();
        // Importante: Convertir ruta relativa (/shares/...) en absoluta para el payload
        finalDataUrl = window.location.origin + data.link;
      }

      const payload = {
        name: file.name,
        type: file.type,
        size: file.size,
        authorName: file.authorName,
        createdAt: file.createdAt,
        expiresAt: Date.now() + 15 * 60 * 1000,
        dataUrl: finalDataUrl
      };

      const json = JSON.stringify(payload);
      const b64 = btoa(encodeURIComponent(json).replace(/%([0-9A-F]{2})/gi, (_, p) => String.fromCharCode(parseInt(p, 16))));
      const safe = b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=/g,'');

      setPublicLink(`${window.location.origin}/compartir?d=${safe}`);
      setShowShare(true);
    } catch (err: any) {
      toast.error(err.message || "No se pudo generar el link");
      console.error("Share error:", err);
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
    const onMM=(e:MouseEvent)=>{ if (!isDragging) return; setPos(p=>({x:p.x+e.movementX,y:p.y+e.movementY})); };
    const onMU=()=>{ if (isDragging) { setIsDragging(false); onDrop(file.id,pos.x,pos.y); } };
    if (isDragging) { window.addEventListener('mousemove',onMM); window.addEventListener('mouseup',onMU); }
    return ()=>{ window.removeEventListener('mousemove',onMM); window.removeEventListener('mouseup',onMU); };
  }, [isDragging, pos, file.id, onDrop]);

  const { icon, accent, label } = getTypeInfo();

  return (
    <div style={{ position:'absolute', left:pos.x, top:pos.y, width:215, zIndex:isDragging?100:10, cursor:isDragging?'grabbing':'grab', borderRadius:16, overflow:'hidden', background:'#1A1D24', border:`1px solid ${accent}25`, boxShadow:isDragging?`0 20px 60px rgba(0,0,0,0.7),0 0 0 2px ${accent}50`:`0 8px 28px rgba(0,0,0,0.5),0 0 0 1px ${accent}15`, transition:isDragging?'none':'box-shadow 0.2s', userSelect:'none' }}
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
          <p style={{ fontSize:8, color:'#3A3F4A', marginTop:5, letterSpacing:'0.03em' }}>Cualquiera con el link puede descargar</p>
        </div>
      )}
    </div>
  );
}

// ─── Sección: Archivos ────────────────────────────────────────────────────────

export default function SectionArchivos({ archivos, members, currentUser, onSave }: { archivos: SharedFile[]; members: Member[]; currentUser: Member | null; onSave: (d: SharedFile[]) => void; }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [linkInput, setLinkInput]   = useState('');
  const [showLink, setShowLink]     = useState(false);
  const authorName = currentUser?.name || members[0]?.name || 'Equipo';

  const processFile = (file: File) => {
    if (file.size > 5*1024*1024) { toast.error(`"${file.name}" supera 5MB. Usa un enlace.`); return; }
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
    <div className="flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between flex-shrink-0">
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
              <ButtonBase onClick={()=>fileInputRef.current?.click()} className="flex items-center gap-2"><UploadCloud size={15}/> Subir archivo</ButtonBase>
            </>
          )}
        </div>
      </div>
      <div style={{ flex:1, position:'relative', overflow:'hidden', borderRadius:18, background:"#0D1017", backgroundImage:"radial-gradient(rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize:"32px 32px", border:isDragOver?"2px dashed #E85D2F":"1px solid rgba(255,255,255,0.06)", transition:"border-color 0.15s" }}
        onDragOver={e=>{e.preventDefault();setIsDragOver(true);}} onDragLeave={()=>setIsDragOver(false)}
        onDrop={e=>{e.preventDefault();setIsDragOver(false);Array.from(e.dataTransfer.files).forEach(processFile);}}>
        {isDragOver && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/60 backdrop-blur-sm rounded-[16px] pointer-events-none">
            <UploadCloud size={52} className="text-[#E85D2F]"/>
            <p className="text-white text-lg font-bold">Suelta para compartir</p>
            <p className="text-gray-400 text-xs">PDF, imágenes, ZIP, Word y más · máx 5 MB</p>
          </div>
        )}
        {archivos.length===0&&!isDragOver&&(
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none opacity-15">
            <FolderOpen size={64}/><p className="text-lg font-bold uppercase tracking-widest">Espacio de archivos</p>
            <p className="text-xs uppercase tracking-widest">Arrastra archivos o usa el botón de arriba</p>
          </div>
        )}
        {archivos.map(a=><FloatingFileCard key={a.id} file={a} onDelete={()=>onSave(archivos.filter(f=>f.id!==a.id))} onDrop={(id,x,y)=>onSave(archivos.map(f=>f.id===id?{...f,x,y}:f))}/>)}
        <div className="absolute bottom-4 right-4 text-[10px] text-gray-800 font-bold uppercase tracking-widest pointer-events-none flex items-center gap-1.5"><FolderOpen size={10}/> Espacio compartido</div>
      </div>
    </div>
  );
}
