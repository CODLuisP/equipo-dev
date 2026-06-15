"use client";

import { useState, useRef, useCallback } from "react";
import { Trash2, Mic, MicOff, Plus, CheckSquare, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import MemberPicker from "@/app/dashboard/forms/MemberPicker";
import InputBase1 from "@/components/ui/InputBase1";
import ButtonBase from "@/components/ui/ButtonBase";
import type { Member, Task, TaskBlock } from "@/app/dashboard/types";

function initBlocks(data?: Task): TaskBlock[] {
  if (data?.blocks && data.blocks.length > 0) return data.blocks;
  const result: TaskBlock[] = [{ id: crypto.randomUUID(), type: 'text', content: data?.description || '' }];
  for (const att of (data?.attachments ?? [])) {
    if (att.type === 'image') {
      result.push({ id: att.id, type: 'image', url: att.url, name: att.name });
      result.push({ id: crypto.randomUUID(), type: 'text', content: '' });
    }
  }
  return result;
}

export default function TaskForm({ members, initialData, currentUser, onSave, onCancel }: {
  members: Member[];
  initialData?: Task;
  currentUser: Member | null;
  onSave: (payload: string[] | Partial<Task>) => void;
  onCancel: () => void;
}) {
  const [title,      setTitle]      = useState(initialData?.title || '');
  const [assignedTo, setAssignedTo] = useState(initialData?.assignedTo || '');
  const [blocks,     setBlocks]     = useState<TaskBlock[]>(() => initBlocks(initialData));
  const [list,       setList]       = useState<string[]>([]);
  const [input,      setInput]      = useState('');
  const [listening,  setListening]  = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [editingVal, setEditingVal] = useState('');
  const recogRef     = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const focusedIdRef = useRef<string | null>(null);

  const updateBlockText = (id: string, content: string) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));

  const removeBlock = (id: string) =>
    setBlocks(prev => {
      const next = prev.filter(b => b.id !== id);
      return next.length > 0 ? next : [{ id: crypto.randomUUID(), type: 'text', content: '' }];
    });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) { toast.error(`${file.name} demasiado grande (máx 5 MB)`); continue; }
      const url = await new Promise<string>(res => {
        const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file);
      });
      const imgBlock: TaskBlock = { id: crypto.randomUUID(), type: 'image', url, name: file.name };
      const textBlock: TaskBlock = { id: crypto.randomUUID(), type: 'text', content: '' };
      setBlocks(prev => {
        const focusedIdx = focusedIdRef.current ? prev.findIndex(b => b.id === focusedIdRef.current) : -1;
        const insertAt = focusedIdx >= 0 ? focusedIdx + 1 : prev.length;
        const next = [...prev];
        if (focusedIdx >= 0 && next[focusedIdx].type === 'text') {
          next[focusedIdx] = { ...next[focusedIdx], content: (next[focusedIdx].content || '').trimEnd() };
        }
        next.splice(insertAt, 0, imgBlock, textBlock);
        return next;
      });
      setTimeout(() => document.getElementById(`block-${textBlock.id}`)?.focus(), 50);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(i => i.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Imagen demasiado grande (máx 5 MB)'); return; }
    const url = await new Promise<string>(res => {
      const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file);
    });
    const imgBlock: TaskBlock = { id: crypto.randomUUID(), type: 'image', url, name: `imagen-${Date.now()}.png` };
    const textBlock: TaskBlock = { id: crypto.randomUUID(), type: 'text', content: '' };
    setBlocks(prev => {
      const focusedIdx = focusedIdRef.current ? prev.findIndex(b => b.id === focusedIdRef.current) : -1;
      const insertAt = focusedIdx >= 0 ? focusedIdx + 1 : prev.length;
      const next = [...prev];
      if (focusedIdx >= 0 && next[focusedIdx].type === 'text') {
        next[focusedIdx] = { ...next[focusedIdx], content: (next[focusedIdx].content || '').trimEnd() };
      }
      next.splice(insertAt, 0, imgBlock, textBlock);
      return next;
    });
    setTimeout(() => document.getElementById(`block-${textBlock.id}`)?.focus(), 50);
  };

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
    const imgCount = blocks.filter(b => b.type === 'image').length;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <InputBase1 label="Nombre de la tarea" value={title} onChange={e => setTitle(e.target.value)} />
        <MemberPicker members={members} value={assignedTo} currentUser={currentUser} onChange={setAssignedTo} />

        {/* Editor de bloques */}
        <input ref={fileInputRef} type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <div style={{
          background: 'rgba(0,0,0,0.25)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 340,
        }}>
          {/* Bloques scrollables */}
          <div onPaste={handlePaste} style={{ flex: 1, overflowY: 'auto', minHeight: 0, padding: '10px 12px 8px' }} className="custom-scrollbar">
            {blocks.map((block, idx) => block.type === 'text' ? (
              <textarea
                key={block.id}
                id={`block-${block.id}`}
                value={block.content || ''}
                ref={el => {
                  if (el) { el.style.height = 'auto'; el.style.height = el.scrollHeight + 'px'; }
                }}
                onChange={e => {
                  updateBlockText(block.id, e.target.value);
                  const el = e.target;
                  el.style.height = 'auto';
                  el.style.height = el.scrollHeight + 'px';
                }}
                onFocus={() => { focusedIdRef.current = block.id; }}
                placeholder=""
                rows={1}
                style={{
                  width: '100%', boxSizing: 'border-box', resize: 'none',
                  background: 'transparent', border: 'none', outline: 'none',
                  padding: 0,
                  color: '#e2e8f0', fontSize: 13, lineHeight: 1.6,
                  fontFamily: 'Arial, sans-serif',
                  display: 'block',
                  overflow: 'hidden',
                  margin: 0,
                }}
              />
            ) : (
              <div key={block.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#000', marginBottom: 8 }}>
                <img src={block.url} alt={block.name} style={{ width: '100%', display: 'block', maxHeight: 220, objectFit: 'contain' }} />
                <button type="button" onClick={() => removeBlock(block.id)}
                  style={{ position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,0.7)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <X size={10} />
                </button>
              </div>
            ))}
          </div>

          {/* Barra inferior fija */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, padding: '2px 4px', fontFamily: 'inherit', transition: 'color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#60a5fa'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
              <ImagePlus size={13} /> Imagen
            </button>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)' }}>
              {imgCount > 0 ? `${imgCount} imagen${imgCount > 1 ? 'es' : ''}` : ''}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <ButtonBase variant="secondary" onClick={onCancel}>Cancelar</ButtonBase>
          <ButtonBase onClick={() => onSave({ title, assignedTo, blocks })}>Actualizar</ButtonBase>
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
            onFocus={e => { if (!listening) e.currentTarget.style.borderColor = 'rgba(var(--blue-rgb),0.5)'; }}
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
            background: input.trim() ? 'var(--blue)' : 'rgba(var(--blue-rgb),0.08)',
            border: `1px solid ${input.trim() ? 'rgba(72,149,239,0.4)' : 'rgba(var(--blue-rgb),0.15)'}`,
            borderRadius: 10, cursor: input.trim() ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: input.trim() ? '#fff' : 'rgba(var(--blue-rgb),0.35)',
            transition: 'all 0.15s',
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
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
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
              background: editingIdx === i ? 'rgba(var(--blue-rgb),0.07)' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${editingIdx === i ? 'rgba(var(--blue-rgb),0.35)' : 'rgba(255,255,255,0.06)'}`,
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
