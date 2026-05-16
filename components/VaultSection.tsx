"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Shield, Plus, LogOut, Archive, Settings, Trash2, Maximize, Copy, X, Filter 
} from "lucide-react";
import { toast } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import InputBase1 from "@/components/ui/InputBase1";

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

  // Sincronizar fullViewProject con los cambios en projects
  useEffect(() => {
    if (fullViewProject) {
      const updated = projects.find(p => p.id === fullViewProject.id);
      if (updated && updated.content !== fullViewProject.content) {
        setFullViewProject(updated);
      }
    }
  }, [projects]);

  const vaultTextareaRef = useRef<HTMLTextAreaElement>(null);
  const vaultHighlightRef = useRef<HTMLDivElement>(null);
  const SHARED_PASS = "dev123"; // Contraseña compartida inicial

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pass === SHARED_PASS) {
      onUnlock(true); setError(false); setPass(''); toast.success("Bóveda desbloqueada");
    } else {
      setError(true); toast.error("Contraseña incorrecta");
    }
  };

  if (!isUnlocked) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="max-w-md w-full bg-[#1C1F26] border border-white/5 rounded-3xl p-10 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#E85D2F] to-transparent opacity-50" />
          <div className="w-20 h-20 bg-[#E85D2F]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#E85D2F]/20">
            <Shield size={40} className="text-[#E85D2F]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Bóveda de Credenciales</h2>
          <p className="text-gray-500 text-sm mb-8">Esta sección está cifrada. Ingresa la contraseña del equipo para continuar.</p>
          <form onSubmit={handleUnlock} className="flex flex-col gap-4">
            <div className="relative">
              <input type="password" placeholder="Contraseña de acceso" value={pass} onChange={e => { setPass(e.target.value); setError(false); }}
                className={`w-full bg-black/40 border ${error ? 'border-red-500/50' : 'border-white/10'} rounded-xl py-4 px-5 text-white outline-none text-center font-mono tracking-widest placeholder:tracking-normal placeholder:font-sans transition-all focus:border-[#E85D2F]/50`} autoFocus />
            </div>
            <ButtonBase type="submit" className="py-4 text-sm uppercase tracking-widest font-bold">Desbloquear Acceso</ButtonBase>
          </form>
          <p className="mt-6 text-[10px] text-gray-700 font-bold uppercase tracking-widest">Protección de Grado Militar · Equipo Dev</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
           <span className="text-[10px] font-bold text-[#E85D2F] uppercase tracking-widest">Almacén Seguro</span>
           <h2 className="text-white font-bold text-2xl tracking-tight">Gestor de <span className="text-gray-500">Credenciales</span></h2>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => onUnlock(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white rounded-xl text-xs font-bold transition-all border border-white/5 flex items-center gap-2">
             <LogOut size={14} /> Bloquear
           </button>
           <ButtonBase onClick={onAddProject} className="flex items-center gap-2"><Plus size={16}/> Nuevo Proyecto</ButtonBase>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2 pb-10">
        {projects.map(p => (
          <VaultCard key={p.id} project={p} onEdit={() => onEditProject(p)} onDelete={() => onDeleteProject(p)} onFullscreen={() => setFullViewProject(p)} />
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
            <Shield size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No hay proyectos en la bóveda</p>
          </div>
        )}
      </div>

      {fullViewProject && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="max-w-6xl w-full h-full bg-[#1C1F26] border border-white/10 rounded-[40px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between bg-white/[0.02] gap-6">
              <div className="flex items-center gap-4">
                <div style={{ background: `${fullViewProject.color}20`, color: fullViewProject.color }} className="w-14 h-14 rounded-2xl flex items-center justify-center border border-white/5">
                  <Archive size={28} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-2xl tracking-tight">{fullViewProject.name}</h2>
                  <p className="text-gray-500 text-sm">Modo de búsqueda y lectura</p>
                </div>
              </div>
              
              <div className="flex-1 max-w-md relative group">
                <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#E85D2F] transition-colors" />
                <input 
                  type="text" 
                  placeholder="Buscar palabra o IP..." 
                  value={vaultSearchTerm}
                  onChange={e => setVaultSearchTerm(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-5 text-white outline-none focus:border-[#E85D2F]/50 transition-all font-medium placeholder:text-gray-700"
                />
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => { navigator.clipboard.writeText(fullViewProject.content); toast.success("Todo copiado"); }} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl text-gray-400 hover:text-white transition-all flex items-center gap-2 font-bold text-xs">
                  <Copy size={18} /> COPIAR
                </button>
                <button onClick={() => { setFullViewProject(null); setVaultSearchTerm(''); }} className="p-4 bg-red-500/10 hover:bg-red-500/20 rounded-2xl text-red-500 transition-all">
                  <X size={24} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 p-8 overflow-hidden bg-black/20 relative">
              <div className="w-full h-full bg-black/40 border border-white/5 rounded-3xl relative overflow-hidden shadow-inner">
                {/* Highlight Layer (Behind) */}
                <div 
                  ref={vaultHighlightRef}
                  className="absolute inset-0 p-8 text-sm md:text-lg font-mono whitespace-pre-wrap break-all leading-relaxed text-transparent pointer-events-none overflow-y-auto custom-scrollbar-none"
                  dangerouslySetInnerHTML={{ __html: highlightMatches(fullViewProject.content + '\n', vaultSearchTerm) }}
                />
                {/* Editing Layer (Front) */}
                <textarea
                  ref={vaultTextareaRef}
                  value={fullViewProject.content}
                  onChange={e => {
                    const newContent = e.target.value;
                    setFullViewProject({ ...fullViewProject, content: newContent });
                    onSaveVault(projects.map(p => p.id === fullViewProject.id ? { ...p, content: newContent } : p));
                  }}
                  onScroll={e => {
                    if (vaultHighlightRef.current) {
                      vaultHighlightRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop;
                    }
                  }}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full bg-transparent p-8 text-sm md:text-[12px] text-gray-300 font-mono outline-none resize-none whitespace-pre-wrap break-all leading-relaxed overflow-y-auto custom-scrollbar-lg"
                  placeholder="Escribe tus credenciales aquí..."
                />
              </div>
            </div>

            <div className="p-6 flex items-center justify-between px-10 bg-black/20 border-t border-white/5">
               <span className="text-[10px] text-gray-700 font-bold uppercase tracking-[0.2em]">Cifrado de Punto a Punto</span>
               <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                 <span>{fullViewProject.content.length} Caracteres</span>
                 <span className="w-1 h-1 bg-gray-800 rounded-full" />
                 <span>{fullViewProject.content.split('\n').length} Líneas</span>
               </div>
            </div>
          </div>
        </div>
      )}


      
    </div>
  );
}

// ─── Vault Card ───────────────────────────────────────────────────────────────
function VaultCard({ project, onEdit, onDelete, onFullscreen }: { 
  project: VaultProject; onEdit: () => void; onDelete: () => void; onFullscreen: () => void; 
}) {
  return (
    <div style={{ background:"#1C1F26", border:"1px solid rgba(255,255,255,0.06)" }} className="rounded-[28px] overflow-hidden flex flex-col group transition-all hover:border-white/10 shadow-xl">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div style={{ background: `${project.color}20`, color: project.color }} className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/5">
            <Archive size={20} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm leading-tight">{project.name}</h3>
            <p className="text-[10px] text-gray-500 mt-0.5">{project.description || 'Credenciales de proyecto'}</p>
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
          <button onClick={onEdit} className="p-1.5 text-gray-600 hover:text-white"><Settings size={14}/></button>
          <button onClick={onDelete} className="p-1.5 text-gray-600 hover:text-red-500"><Trash2 size={14}/></button>
        </div>
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <div 
          onClick={onFullscreen}
          className="p-4 bg-black/20 rounded-2xl border border-white/5 relative group/content cursor-pointer hover:bg-black/40 transition-colors"
        >
          <pre className="text-[11px] text-gray-300 font-mono whitespace-pre-wrap break-all leading-relaxed min-h-[60px] max-h-[150px] overflow-hidden">
            {project.content || 'Sin contenido...'}
          </pre>
          <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover/content:opacity-100 transition-all">
            <button 
              onClick={(e) => { e.stopPropagation(); onFullscreen(); }}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white"
              title="Pantalla completa"
            >
              <Maximize size={12} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(project.content); toast.success("Contenido copiado"); }}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white"
              title="Copiar todo"
            >
              <Copy size={12} />
            </button>
          </div>
        </div>
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
    return text.replace(regex, '<mark style="background: #E85D2F; color: white; border-radius: 4px; padding: 0 2px;">$1</mark>');
  } catch { return text; }
}
