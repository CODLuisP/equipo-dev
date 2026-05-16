"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, Globe, MessageSquare, Plus, Zap, Copy, ExternalLink
} from 'lucide-react';
import { toast } from 'sonner';

interface StagingLink {
  id: string;
  name: string;
  url: string;
  type: 'staging' | 'api' | 'branch' | 'prod';
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: string;
  text: string;
  timestamp: number;
}

export default function DevToolkit({ members = [], currentUser = null }: { members?: any[], currentUser?: any }) {
  const [activeTab, setActiveTab] = useState<'tools' | 'staging' | 'chat'>('chat');
  
  // DevTools State
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState('');
  const [toolType, setToolType] = useState<'json' | 'sql' | 'unit'>('json');

  // Staging State (Mock initial)
  const [links, setLinks] = useState<StagingLink[]>([
    { id: '1', name: 'Pruebas Cliente', url: 'https://staging.example.com', type: 'staging' },
    { id: '2', name: 'API Desarrollo', url: 'https://api-dev.example.com', type: 'api' }
  ]);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', senderId: 'bot', senderName: 'DevBot', senderColor: '#E85D2F', text: '¡Bienvenidos al chat del equipo! 🚀', timestamp: Date.now() - 100000 },
    { id: '2', senderId: 'bot', senderName: 'DevBot', senderColor: '#E85D2F', text: 'Aquí podemos coordinar tareas rápidas.', timestamp: Date.now() - 90000 }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat
  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeTab]);

  // -- LOGIC: Chat --
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newMessage.trim()) return;

    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: currentUser?.id || 'anon',
      senderName: currentUser?.name || 'Invitado',
      senderColor: currentUser?.color || '#3498DB',
      text: newMessage.trim(),
      timestamp: Date.now()
    };

    setMessages([...messages, msg]);
    setNewMessage('');
  };

  // -- LOGIC: DevTools --
  const handleFormatJSON = () => {
    try {
      const obj = JSON.parse(toolInput);
      setToolOutput(JSON.stringify(obj, null, 2));
      toast.success("JSON Formateado");
    } catch (e) {
      toast.error("JSON Inválido");
    }
  };

  const handleFormatSQL = () => {
    // Basic SQL beautifier logic
    const formatted = toolInput
      .replace(/\s+/g, ' ')
      .replace(/\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|JOIN|LEFT|RIGHT|ON|GROUP BY|ORDER BY|AND|OR|LIMIT|VALUES|SET|IN|AS)\b/gi, '\n$1')
      .trim();
    setToolOutput(formatted);
    toast.success("SQL Organizado");
  };

  const handleUnitConvert = () => {
    if (toolInput.includes('px')) {
      const val = parseFloat(toolInput);
      setToolOutput(`${val / 16}rem`);
    } else if (toolInput.includes('rem')) {
      const val = parseFloat(toolInput);
      setToolOutput(`${val * 16}px`);
    } else {
      toast.error("Usa 'px' o 'rem'");
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(toolOutput);
    toast.success("Copiado al portapapeles");
  };

  // -- RENDER HELPERS --
  const TabButton = ({ id, icon: Icon, label }: { id: any, icon: any, label: string }) => (
    <button 
      onClick={() => setActiveTab(id)}
      style={{
        flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        background: activeTab === id ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: 'none', borderBottom: activeTab === id ? '2px solid #3498DB' : '2px solid transparent',
        color: activeTab === id ? '#fff' : 'rgba(255,255,255,0.3)',
        fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
      }}
    >
      <Icon size={14} />
      <span className="hide-mobile">{label}</span>
    </button>
  );

  return (
    <div style={{ background: 'rgba(15,18,25,0.6)', backdropFilter: 'blur(10px)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)', height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.3)' }}>
      
      {/* Tabs Header */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)' }}>
        <TabButton id="chat" icon={MessageSquare} label="Team Chat" />
        <TabButton id="tools" icon={Terminal} label="DevTools" />
        <TabButton id="staging" icon={Globe} label="Entornos" />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: activeTab === 'chat' ? '0' : '20px', display: 'flex', flexDirection: 'column' }}>
        
        {/* TAB: DEV TOOLS */}
        {activeTab === 'tools' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setToolType('json')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid', borderColor: toolType === 'json' ? '#3498DB' : 'rgba(255,255,255,0.1)', background: toolType === 'json' ? 'rgba(52,152,219,0.1)' : 'transparent', color: toolType === 'json' ? '#3498DB' : '#fff', fontSize: 10, cursor: 'pointer' }}>JSON</button>
              <button onClick={() => setToolType('sql')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid', borderColor: toolType === 'sql' ? '#27AE60' : 'rgba(255,255,255,0.1)', background: toolType === 'sql' ? 'rgba(39,174,96,0.1)' : 'transparent', color: toolType === 'sql' ? '#27AE60' : '#fff', fontSize: 10, cursor: 'pointer' }}>SQL</button>
              <button onClick={() => setToolType('unit')} style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid', borderColor: toolType === 'unit' ? '#E67E22' : 'rgba(255,255,255,0.1)', background: toolType === 'unit' ? 'rgba(230,126,34,0.1)' : 'transparent', color: toolType === 'unit' ? '#E67E22' : '#fff', fontSize: 10, cursor: 'pointer' }}>Unit Conv</button>
            </div>

            <textarea 
              placeholder="Pega aquí tu código sucio..."
              value={toolInput}
              onChange={(e) => setToolInput(e.target.value)}
              style={{ width: '100%', height: '100px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px', color: '#fff', fontSize: 11, fontFamily: 'monospace', resize: 'none', outline: 'none' }}
            />

            <button 
              onClick={toolType === 'json' ? handleFormatJSON : toolType === 'sql' ? handleFormatSQL : handleUnitConvert}
              style={{ padding: '10px', borderRadius: '12px', background: '#3498DB', border: 'none', color: '#fff', fontWeight: 700, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              <Zap size={14} /> Procesar {toolType.toUpperCase()}
            </button>

            {toolOutput && (
              <div style={{ position: 'relative' }}>
                <pre style={{ margin: 0, padding: '12px', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', color: '#27AE60', fontSize: 10, overflowX: 'auto', maxHeight: '150px' }}>
                  {toolOutput}
                </pre>
                <button onClick={copyOutput} style={{ position: 'absolute', top: 8, right: 8, padding: '5px', background: 'rgba(255,255,255,0.05)', border: 'none', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>
                  <Copy size={12} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB: STAGING LINKS */}
        {activeTab === 'staging' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <h4 style={{ margin: 0, fontSize: 13, color: '#fff' }}>Entornos</h4>
              <button style={{ padding: '4px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: 10, cursor: 'pointer' }}>
                <Plus size={10} />
              </button>
            </div>
            {links.map(link => (
              <div key={link.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: link.type === 'prod' ? '#27AE60' : '#3498DB', boxShadow: `0 0 8px ${link.type === 'prod' ? '#27AE60' : '#3498DB'}` }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{link.name}</div>
                    <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{link.url.replace('https://', '')}</div>
                  </div>
                </div>
                <a href={link.url} target="_blank" rel="noreferrer" style={{ color: 'rgba(255,255,255,0.5)', hover: { color: '#fff' } } as any}>
                  <ExternalLink size={14} />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* TAB: TEAM CHAT (WhatsApp Style) */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'rgba(0,0,0,0.1)' }}>
            {/* Chat Body */}
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }} className="custom-scrollbar">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUser?.id;
                return (
                  <div key={msg.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '85%', display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {!isMe && (
                      <span style={{ fontSize: 10, fontWeight: 800, color: msg.senderColor, marginLeft: 8 }}>{msg.senderName}</span>
                    )}
                    <div style={{
                      padding: '10px 14px',
                      borderRadius: isMe ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
                      background: isMe ? '#E85D2F' : 'rgba(255,255,255,0.05)',
                      border: isMe ? 'none' : '1px solid rgba(255,255,255,0.08)',
                      color: '#fff',
                      fontSize: 12,
                      lineHeight: 1.5,
                      boxShadow: isMe ? '0 4px 15px rgba(232,93,47,0.2)' : 'none'
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 8, opacity: 0.5, textAlign: 'right', marginTop: 4 }}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} style={{ padding: '16px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: 10, alignItems: 'center' }}>
              <input 
                placeholder="Escribe un mensaje..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 16px', color: '#fff', fontSize: 12, outline: 'none' }}
              />
              <button type="submit" style={{ width: 38, height: 38, borderRadius: '12px', background: newMessage.trim() ? '#E85D2F' : 'rgba(255,255,255,0.05)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
                <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .hide-mobile { display: block; }
        @media (max-width: 600px) {
          .hide-mobile { display: none; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
}
