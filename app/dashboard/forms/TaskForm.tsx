"use client";

import { useState, useRef } from "react";
import { Trash2, Mic, MicOff, Plus, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import MemberPicker from "@/app/dashboard/forms/MemberPicker";
import InputBase1 from "@/components/ui/InputBase1";
import ButtonBase from "@/components/ui/ButtonBase";
import type { Member, Task } from "@/app/dashboard/types";

export default function TaskForm({ members, initialData, currentUser, onSave, onCancel }: {
  members: Member[];
  initialData?: Task;
  currentUser: Member | null;
  onSave: (payload: string[] | Partial<Task>) => void;
  onCancel: () => void;
}) {
  const [title,      setTitle]      = useState(initialData?.title || '');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [list,       setList]       = useState<string[]>([]);
  const [input,      setInput]      = useState('');
  const [listening,  setListening]  = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState('');
  const recogRef = useRef<any>(null);

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  const addToList = (val?: string) => {
    const t = capitalize((val ?? input).trim());
    if (!t) return;
    setList(prev => [...prev, t]);
    setInput('');
  };

  const toggleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Tu navegador no soporta reconocimiento de voz"); return; }
    if (listening) { recogRef.current?.stop(); return; }
    const recog = new SR();
    recog.lang = 'es-ES'; recog.interimResults = true; recog.continuous = true;
    recog.onstart  = () => setListening(true);
    recog.onend    = () => { setListening(false); setInput(''); };
    recog.onerror  = () => { setListening(false); setInput(''); };
    recog.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) { if (t.trim()) setList(prev => [...prev, capitalize(t.trim().toLowerCase())]); setInput(''); }
        else interim += t;
      }
      if (interim) setInput(interim);
    };
    recogRef.current = recog;
    recog.start();
  };

  /* ── Modo edición ─────────────────────────────────────────────── */
  if (initialData) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <InputBase1 label="Nombre de la tarea" value={title} onChange={e => setTitle(e.target.value)} />
        <MemberPicker members={members} value={assignedTo} currentUser={currentUser} onChange={setAssignedTo} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
          <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
          <ButtonBase onClick={() => onSave({ title, assignedTo })}>Actualizar</ButtonBase>
        </div>
      </div>
    );
  }

  /* ── Modo nueva tarea ─────────────────────────────────────────── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addToList(); } }}
            placeholder={listening ? 'Escuchando…' : 'Nombre de la tarea…'}
            style={{
              width: '100%', boxSizing: 'border-box',
              background: 'rgba(0,0,0,0.35)',
              border: `1px solid ${listening ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.09)'}`,
              borderRadius: 10, padding: '11px 14px',
              color: '#f0f4ff', fontSize: 13, fontWeight: 500, outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => { if (!listening) e.currentTarget.style.borderColor = 'rgba(37,99,235,0.5)'; }}
            onBlur={e  => { if (!listening) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          />
        </div>

        {/* Mic */}
        <button
          type="button"
          onClick={toggleMic}
          title={listening ? 'Detener' : 'Dictar tarea'}
          style={{
            width: 42, height: 42, flexShrink: 0,
            background: listening ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${listening ? 'rgba(34,197,94,0.45)' : 'rgba(255,255,255,0.09)'}`,
            borderRadius: 10, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: listening ? '#22c55e' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.15s', position: 'relative', overflow: 'hidden',
          }}
        >
          {listening && (
            <span style={{
              position: 'absolute', inset: 0, borderRadius: 10,
              background: 'rgba(34,197,94,0.08)',
              animation: 'ping 1.2s cubic-bezier(0,0,0.2,1) infinite',
            }} />
          )}
          {listening ? <MicOff size={15} /> : <Mic size={15} />}
        </button>

        {/* Add */}
        <button
          type="button"
          onClick={() => addToList()}
          disabled={!input.trim()}
          style={{
            width: 42, height: 42, flexShrink: 0,
            background: input.trim() ? '#2563eb' : 'rgba(37,99,235,0.08)',
            border: `1px solid ${input.trim() ? 'rgba(96,165,250,0.4)' : 'rgba(37,99,235,0.15)'}`,
            borderRadius: 10, cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: input.trim() ? '#fff' : 'rgba(37,99,235,0.35)',
            transition: 'all 0.15s',
            boxShadow: input.trim() ? '0 0 16px rgba(37,99,235,0.3)' : 'none',
          }}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Mic indicator */}
      {listening && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '8px 12px', borderRadius: 9,
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.18)',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Escuchando — cada frase se agrega automáticamente
          </span>
        </div>
      )}

      {/* Task list */}
      {list.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }} className="custom-scrollbar">
          {list.map((t, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px',
              background: editingIdx === i ? 'rgba(37,99,235,0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${editingIdx === i ? 'rgba(37,99,235,0.35)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 9, transition: 'border-color 0.15s',
            }}>
              <CheckSquare size={12} style={{ color: '#3b82f6', flexShrink: 0 }} />
              {editingIdx === i ? (
                <input
                  autoFocus
                  value={editingVal}
                  onChange={e => setEditingVal(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') { setList(p => p.map((x, idx) => idx === i ? editingVal.trim() || x : x)); setEditingIdx(null); }
                    if (e.key === 'Escape') setEditingIdx(null);
                  }}
                  onBlur={() => { setList(p => p.map((x, idx) => idx === i ? editingVal.trim() || x : x)); setEditingIdx(null); }}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#f0f4ff', fontSize: 13 }}
                />
              ) : (
                <span
                  onClick={() => { setEditingIdx(i); setEditingVal(t); }}
                  style={{ flex: 1, color: '#d1d5db', fontSize: 13, cursor: 'text' }}
                >
                  {t}
                </span>
              )}
              <button
                onClick={() => setList(p => p.filter((_, idx) => idx !== i))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.18)', padding: 2, display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.18)'}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
          {list.length > 0 ? `${list.length} tarea${list.length > 1 ? 's' : ''} para crear` : 'Escribe y presiona Enter o +'}
        </span>
        <div style={{ display: 'flex', gap: 8 }}>
          <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
          <ButtonBase
            onClick={() => { if (list.length > 0) onSave(list); }}
            disabled={list.length === 0}
          >
            Crear {list.length > 0 ? `(${list.length})` : ''}
          </ButtonBase>
        </div>
      </div>
    </div>
  );
}
