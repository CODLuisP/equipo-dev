"use client";

import { useState, useRef } from "react";
import { Trash2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import InputBase1 from "@/components/ui/InputBase1";
import MemberPicker from "@/app/dashboard/forms/MemberPicker";
import type { Member, Task } from "@/app/dashboard/types";

// ─── Task Form ────────────────────────────────────────────────────────────────

export default function TaskForm({ members, initialData, currentUser, onSave, onCancel }: { members: Member[]; initialData?: Task; currentUser: Member|null; onSave: (payload: string[] | Partial<Task>)=>void; onCancel:()=>void; }) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [list, setList] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState('');
  const recogRef = useRef<any>(null);

  const addToList = (val?: string) => {
    const t = (val ?? input).trim();
    if (!t) return;
    setList(prev => [...prev, t]);
    setInput('');
  };

  const removeFromList = (i: number) => setList(prev => prev.filter((_, idx) => idx !== i));

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Tu navegador no soporta reconocimiento de voz"); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const recog = new SR();
    recog.lang = 'es-ES';
    recog.interimResults = true;
    recog.continuous = true;
    recog.onstart = () => setListening(true);
    recog.onend = () => { setListening(false); setInput(''); };
    recog.onerror = () => { setListening(false); setInput(''); };
    recog.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          const clean = t.trim();
          if (clean) setList(prev => [...prev, clean]);
          setInput('');
        } else {
          interim += t;
        }
      }
      if (interim) setInput(interim);
    };
    recogRef.current = recog;
    recog.start();
  };

  if (initialData) {
    return (
      <div className="flex flex-col gap-4">
        <InputBase1 label="Nombre de la tarea" value={title} onChange={e => setTitle(e.target.value)}/>
        <MemberPicker members={members} value={assignedTo} currentUser={currentUser} onChange={setAssignedTo}/>
        <div className="flex justify-end gap-3 mt-2">
          <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
          <ButtonBase onClick={() => onSave({ title, assignedTo })}>Actualizar</ButtonBase>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          className="flex-1 bg-[#0A0C0F] border border-white/10 rounded-lg text-white px-3 py-2 text-sm outline-none focus:border-[#E85D2F]/50"
          placeholder={listening ? 'Escuchando...' : 'Nombre de la tarea...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList(); } }}
        />
        <button
          type="button"
          onClick={toggleMic}
          title={listening ? 'Detener micrófono' : 'Hablar'}
          className="relative px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center justify-center"
          style={{
            background: listening ? 'rgba(232,93,47,0.15)' : 'rgba(255,255,255,0.05)',
            border: listening ? '1px solid rgba(232,93,47,0.5)' : '1px solid rgba(255,255,255,0.1)',
            color: listening ? '#E85D2F' : '#5A6270',
          }}
        >
          {listening
            ? <><span className="absolute inset-0 rounded-lg animate-ping opacity-20" style={{ background: '#E85D2F' }}/><MicOff size={16}/></>
            : <Mic size={16}/>
          }
        </button>
        <button type="button" onClick={() => addToList()}
          className="px-4 py-2 bg-[#E85D2F] hover:bg-[#FF6B3D] text-white rounded-lg text-sm font-bold transition-all">
          +
        </button>
      </div>
      {listening && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold text-[#E85D2F] uppercase tracking-wider"
          style={{ background: 'rgba(232,93,47,0.06)', border: '1px solid rgba(232,93,47,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#E85D2F] animate-pulse"/>
          Escuchando — cada frase se agrega automáticamente
        </div>
      )}
      {list.length > 0 && (
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto custom-scrollbar">
          {list.map((t, i) => (
            <div key={i} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2"
              style={{ borderColor: editingIdx === i ? 'rgba(232,93,47,0.4)' : undefined }}>
              {editingIdx === i ? (
                <input
                  autoFocus
                  className="flex-1 bg-transparent text-white text-sm outline-none"
                  value={editingVal}
                  onChange={e => setEditingVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { setList(prev => prev.map((x, idx) => idx === i ? editingVal.trim() || x : x)); setEditingIdx(null); }
                    if (e.key === 'Escape') setEditingIdx(null);
                  }}
                  onBlur={() => { setList(prev => prev.map((x, idx) => idx === i ? editingVal.trim() || x : x)); setEditingIdx(null); }}
                />
              ) : (
                <span className="flex-1 text-white text-sm cursor-text" onClick={() => { setEditingIdx(i); setEditingVal(t); }}>{t}</span>
              )}
              <button onClick={() => removeFromList(i)} className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"><Trash2 size={12}/></button>
            </div>
          ))}
        </div>
      )}
      <div className="flex justify-end gap-3 mt-2">
        <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
        <ButtonBase onClick={() => { if (list.length > 0) onSave(list); }} disabled={list.length === 0}>
          Guardar {list.length > 0 ? `(${list.length})` : ''}
        </ButtonBase>
      </div>
    </div>
  );
}
