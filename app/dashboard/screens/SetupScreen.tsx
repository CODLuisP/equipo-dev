"use client";

import { Users } from "lucide-react";
import { Toaster } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import SetupForm from "@/app/dashboard/forms/SetupForm";
import type { Member } from "@/app/dashboard/types";

// ─── Setup Screen ─────────────────────────────────────────────────────────────

interface SetupScreenProps {
  members: Member[];
  handleAddMember: (name: string, role: string) => void;
  onFinish: () => void;
  toasterProps: React.ComponentProps<typeof Toaster>;
}

export default function SetupScreen({ members, handleAddMember, onFinish, toasterProps }: SetupScreenProps) {
  return (
    <div className="h-screen flex items-center justify-center p-4" style={{ background: "#0A0C0F" }}>
      <Toaster {...toasterProps} />
      <div style={{ background: "#1C1F26", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: 40 }} className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[#E85D2F]/20 rounded-full flex items-center justify-center mx-auto mb-6"><Users size={32} className="text-[#E85D2F]" /></div>
        <h2 className="text-2xl font-bold text-white mb-2">Bienvenido al Equipo Dev</h2>
        <p className="text-gray-400 mb-8">Agrega los miembros de tu equipo para comenzar.</p>
        <SetupForm onAddMember={handleAddMember} />
        {members.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Miembros ({members.length})</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {members.map(m => <span key={m.id} style={{ background:`${m.color}20`, border:`1px solid ${m.color}40`, color:m.color }} className="px-3 py-1 rounded-full text-xs font-medium">{m.name}</span>)}
            </div>
            <ButtonBase className="w-full mt-6" onClick={onFinish}>Comenzar ahora</ButtonBase>
          </div>
        )}
      </div>
    </div>
  );
}
