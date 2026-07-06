"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Shield, Plus, Lock, Archive, Settings, Trash2, Maximize, Copy, X, Filter
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import ButtonBase from "@/components/ui/ButtonBase";
import InputBase1 from "@/components/ui/InputBase1";
import BovedaBackground from "@/components/BovedaBackground";

export interface VaultProject { 
  id: string; 
  name: string; 
  description: string; 
  color: string; 
  content: string; 
  createdAt: number; 
}

// ─── Componente: Bóveda ──────────────────────────────────────────────────────────
interface SectionBovedaProps {
  projects: VaultProject[];
  isUnlocked: boolean;
  onUnlock: (v: boolean) => void;
  onSaveVault: (d: VaultProject[]) => void;
  onAddProject: () => void;
  onEditProject: (p: VaultProject) => void;
  onDeleteProject: (p: VaultProject) => void;
}

export function SectionBoveda({ 
  projects, isUnlocked, onUnlock, onSaveVault, onAddProject, onEditProject, onDeleteProject 
}: SectionBovedaProps) {
  const [pass, setPass] = useState('');
  const [error, setError] = useState(false);
  const [fullViewProject, setFullViewProject] = useState<VaultProject | null>(null);
  const [vaultSearchTerm, setVaultSearchTerm] = useState('');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<{ id: string; content: string } | null>(null);

  const vaultTextareaRef = useRef<HTMLTextAreaElement>(null);
  const vaultHighlightRef = useRef<HTMLDivElement>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.verifyVault(pass);
      onUnlock(true); setError(false); setPass(''); toast.success("Bóveda desbloqueada");
    } catch {
      setError(true); toast.error("Contraseña incorrecta");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-full flex items-center justify-center relative overflow-hidden rounded-2xl">
        <BovedaBackground />
        <div className="relative z-10 max-w-md w-full bg-[#0d1117]/80 border border-(--blue)/15 rounded-3xl p-10 text-center backdrop-blur-sm">
          <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-(--blue) to-transparent opacity-60" />
          <div className="w-20 h-20 bg-(--blue)/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-(--blue)/25">
            <Shield size={40} className="text-(--blue)" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2 tracking-tight">Bóveda de Credenciales</h2>
          <p className="text-gray-500 text-sm mb-8">Esta sección está cifrada. Ingresa la contraseña del equipo para continuar.</p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <div className="relative">
              <input type="password" placeholder="Contraseña de acceso" value={pass} onChange={e => { setPass(e.target.value); setError(false); }}
                className={`w-full bg-black/40 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-2 px-5 text-white outline-none text-center font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans transition-all focus:border-(--blue)/60`} autoFocus />
            </div>
            <ButtonBase type="submit" className="py-4 text-sm uppercase tracking-widest font-bold">Desbloquear Acceso</ButtonBase>
          </form>
          <p className="mt-6 text-[10px] text-gray-700 font-bold uppercase tracking-widest">Protección de Grado Militar · Equipo Dev</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6 relative">
      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none"><BovedaBackground /></div>
      <div className="flex items-center justify-between relative z-10">
        <div className="flex flex-col">
           <h2 className="text-white font-bold text-sm tracking-tight">Gestor de <span className="text-gray-500">Credenciales</span></h2>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => onUnlock(false)} className="p-2 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl transition-all border border-white/5 flex items-center" title="Bloquear">
             <Lock size={14} />
           </button>
           <ButtonBase onClick={onAddProject} className="flex items-center gap-2"><Plus size={16}/> Nuevo Proyecto</ButtonBase>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 overflow-y-auto custom-scrollbar pr-1 pb-6 relative z-10">
        {projects.map(p => (
          <VaultCard key={p.id} project={p} onEdit={() => onEditProject(p)} onDelete={() => onDeleteProject(p)} onFullscreen={() => setFullViewProject(p)} />
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-4xl">
            <Shield size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No hay proyectos en la bóveda</p>
          </div>
        )}
      </div>

      {fullViewProject && (
        <div className="fixed inset-0 z-100 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-8">
          <div style={{ background:'#0C0E13', border:'1px solid rgba(255,255,255,0.08)' }} className="max-w-5xl w-full h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* Header compacto — una sola barra */}
            <div style={{ borderBottom:'1px solid rgba(255,255,255,0.06)' }} className="flex flex-col px-4 py-2 shrink-0 gap-1">
              {/* Fila título + acciones */}
              <div className="flex items-center gap-3">
                <span className="text-white font-semibold text-sm shrink-0">{fullViewProject.name}</span>
                {/* Buscador inline */}
                <div className="relative ml-auto shrink-0">
                  <Filter size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-600"/>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    value={vaultSearchTerm}
                    onChange={e => setVaultSearchTerm(e.target.value)}
                    style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:7, padding:'4px 10px 4px 26px', fontSize:12, color:'#d1d5db', outline:'none', width:160 }}
                  />
                </div>
                <button onClick={() => { navigator.clipboard.writeText(fullViewProject.content); toast.success("Copiado"); }}
                  className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors shrink-0"
                  style={{ fontSize:11, padding:'4px 8px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:7 }}>
                  <Copy size={11}/> Copiar
                </button>
                <button onClick={() => { setFullViewProject(null); setVaultSearchTerm(''); }}
                  className="text-gray-600 hover:text-red-400 transition-colors shrink-0 p-1 rounded">
                  <X size={16}/>
                </button>
              </div>
              {/* Descripción en línea aparte */}
              {fullViewProject.description && (
                <span className="text-gray-300 text-xs">{fullViewProject.description}</span>
              )}
            </div>

            {/* Editor */}
            <div className="flex-1 overflow-hidden relative">
              {/* Capa highlight */}
              <div
                ref={vaultHighlightRef}
                className="absolute inset-0 pointer-events-none overflow-y-auto"
                style={{ padding:'8px 12px', fontSize:13, lineHeight:'1.7', fontFamily:"'JetBrains Mono','Fira Mono',monospace", whiteSpace:'pre-wrap', wordBreak:'break-all', color:'transparent' }}
                dangerouslySetInnerHTML={{ __html: highlightMatches(fullViewProject.content + '\n', vaultSearchTerm) }}
              />
              {/* Textarea editable — no controlado para evitar lag */}
              <textarea
                key={fullViewProject.id}
                ref={vaultTextareaRef}
                defaultValue={fullViewProject.content}
                onInput={e => {
                  const v = (e.target as HTMLTextAreaElement).value;
                  // Actualizar highlight sin tocar el estado principal
                  if (vaultHighlightRef.current) {
                    vaultHighlightRef.current.innerHTML = highlightMatches(v + '\n', vaultSearchTerm);
                  }
                  pendingSaveRef.current = { id: fullViewProject.id, content: v };
                  if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
                  saveTimerRef.current = setTimeout(() => {
                    const pending = pendingSaveRef.current;
                    if (!pending) return;
                    setFullViewProject(prev => prev ? { ...prev, content: pending.content } : null);
                    onSaveVault(projects.map(p => p.id === pending.id ? { ...p, content: pending.content } : p));
                  }, 600);
                }}
                onScroll={e => { if (vaultHighlightRef.current) vaultHighlightRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop; }}
                spellCheck={false}
                placeholder="Escribe tus credenciales aquí..."
                className="absolute inset-0 w-full h-full bg-transparent outline-none resize-none overflow-y-auto custom-scrollbar-lg"
                style={{ padding:'8px 12px', fontSize:13, lineHeight:'1.7', fontFamily:"'JetBrains Mono','Fira Mono',monospace", color:'#d1d5db', whiteSpace:'pre-wrap', wordBreak:'break-all', caretColor:'var(--blue)' }}
              />
            </div>

            {/* Footer mínimo */}
            <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)' }} className="flex items-center justify-between px-4 py-1.5 shrink-0">
              <span className="text-[10px] text-gray-300 font-mono">cifrado · codexa</span>
              <div className="flex items-center gap-3 text-[10px] text-gray-300 font-mono">
                <span>{fullViewProject.content.length} chars</span>
                <span>{fullViewProject.content.split('\n').length} líneas</span>
              </div>
            </div>
          </div>
        </div>
      )}


      
    </div>
  );
}

// ─── Vault Card ───────────────────────────────────────────────────────────────
const LINE_H = 22; // px — line-height del editor

function VaultCard({ project, onEdit, onDelete, onFullscreen }: {
  project: VaultProject; onEdit: () => void; onDelete: () => void; onFullscreen: () => void;
}) {
  return (
    <div
      onClick={onFullscreen}
      style={{ background:"#0F1116", border:"1px solid rgba(255,255,255,0.07)", cursor:'pointer' }}
      className="rounded-xl overflow-hidden flex flex-col group transition-all hover:border-white/14 shadow-lg"
    >
      {/* Header compacto */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-white font-semibold text-xs">{project.name}</span>
        </div>
        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-all shrink-0" onClick={e=>e.stopPropagation()}>
          <button onClick={onEdit}   className="p-1 text-gray-600 hover:text-white transition-colors rounded"><Settings size={12}/></button>
          <button onClick={onDelete} className="p-1 text-gray-600 hover:text-red-500 transition-colors rounded"><Trash2 size={12}/></button>
          <button onClick={(e)=>{e.stopPropagation(); navigator.clipboard.writeText(project.content); toast.success("Copiado");}} className="p-1 text-gray-600 hover:text-white transition-colors rounded"><Copy size={12}/></button>
        </div>
      </div>

      {/* Cuerpo */}
      <div className="px-3 pt-2 pb-2 min-h-27.5 max-h-38.5 overflow-hidden relative">
        <pre style={{ fontSize:11, lineHeight:'1.6', color:'var(--text-3)', fontFamily:"'JetBrains Mono','Fira Mono','Courier New',monospace", whiteSpace:'pre-wrap', wordBreak:'break-all', margin:0 }}>
          {project.content || <span style={{color:'#374151', fontStyle:'italic', fontFamily:'sans-serif', fontSize:10}}>Sin contenido…</span>}
        </pre>
        <div className="absolute bottom-0 inset-x-0 h-8 pointer-events-none" style={{background:'linear-gradient(transparent,#0F1116)'}}/>
      </div>

      {/* Footer mínimo */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-white/4">
        <span className="text-[9px] text-gray-700 font-mono">{project.content.split('\n').length} líneas</span>
        <Maximize size={10} className="text-gray-700 group-hover:text-gray-500 transition-colors"/>
      </div>
    </div>
  );
}

// ─── Vault Project Form ────────────────────────────────────────────────────────
interface VaultProjectFormProps {
  initialData?: VaultProject;
  onSave: (d: Partial<VaultProject>) => void;
  onCancel: () => void;
}

export function VaultProjectForm({ initialData, onSave, onCancel }: VaultProjectFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <InputBase1 label="Nombre del Proyecto" placeholder="Ej: Velsat eCommerce" value={name} onChange={e => setName(e.target.value)} />
        <InputBase1 label="Descripción Corta" placeholder="Ej: Credenciales de servidor y DB" value={description} onChange={e => setDescription(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-6 border-t border-white/5">
        <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
        <ButtonBase onClick={() => onSave({ name, description })} className="px-8">
          {initialData ? 'Actualizar Datos' : 'Crear Proyecto'}
        </ButtonBase>
      </div>
    </div>
  );
}

// ─── Helper ────────────────────────────────────────────────────────────────────
function highlightMatches(text: string, term: string) {
  if (!term || term.length < 2) return text;
  try {
    const regex = new RegExp(`(${term})`, 'gi');
    const escaped = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    return escaped.replace(new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi'), '<mark style="background:rgba(var(--blue-rgb),0.45);color:inherit;border-radius:2px;">$1</mark>');
  } catch { return text; }
}
