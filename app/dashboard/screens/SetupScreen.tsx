"use client";

import { Users, ListChecks, ArrowRight } from "lucide-react";
import { Toaster } from "sonner";
import ButtonBase from "@/components/ui/ButtonBase";
import SetupForm from "@/app/dashboard/forms/SetupForm";
import type { Member } from "@/app/dashboard/types";

interface SetupScreenProps {
  members: Member[];
  handleAddMember: (name: string, role: string) => void;
  onFinish: () => void;
  toasterProps: React.ComponentProps<typeof Toaster>;
}

export default function SetupScreen({ members, handleAddMember, onFinish, toasterProps }: SetupScreenProps) {
  return (
    <div className="min-h-screen w-full flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", background: "#08091c" }}>
      <Toaster {...toasterProps} />

      {/* ── Panel izquierdo: sólido, sin imagen ── */}
      <div className="relative flex flex-col justify-center w-full lg:w-[480px] xl:w-[540px] shrink-0 px-10 md:px-14 py-14">

        {/* Logo */}
        <div className="absolute top-10 left-10 md:left-14 flex items-center gap-2.5">
          <img src="/assets/codexa.png" alt="Codexa" className="h-6 w-6 object-contain" />
          <span className="text-white font-semibold text-[15px]">Codexa</span>
        </div>

        <div style={{ width: 60, height: 60, borderRadius: 17, background: "rgba(var(--blue-rgb),0.14)", border: "1px solid rgba(var(--blue-rgb),0.32)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
          <Users size={26} color="var(--blue-light)" />
        </div>

        <h1 className="text-white text-[32px] font-extrabold tracking-tight m-0 leading-tight">
          Bienvenido al<br/>Equipo Dev
        </h1>
        <p className="text-white/45 text-[13.5px] mt-3 mb-9 leading-relaxed max-w-[380px]">
          Agrega los miembros de tu equipo para comenzar a colaborar en un solo lugar.
        </p>

        <SetupForm onAddMember={handleAddMember} />

        {members.length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(255,255,255,0.35)" }}>
              <ListChecks size={12} /> Miembros ({members.length})
            </p>
            <div className="flex flex-col gap-2 mb-6" style={{ maxHeight: 208, overflowY: "auto" }}>
              {members.map(m => (
                <div key={m.id} className="flex items-center gap-3" style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: "9px 12px",
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 9, flexShrink: 0,
                    background: `${m.color}22`, border: `1px solid ${m.color}55`, color: m.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 800,
                  }}>
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <div className="text-white text-[13px] font-semibold truncate">{m.name}</div>
                    <div className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.4)" }}>{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
            <ButtonBase className="w-full flex items-center justify-center gap-2" onClick={onFinish}>
              Comenzar ahora <ArrowRight size={15} />
            </ButtonBase>
          </div>
        )}
      </div>

      {/* ── Panel derecho: imagen a pantalla completa ── */}
      <div className="relative hidden lg:block flex-1 overflow-hidden">
        <img
          src="/assets/registerfondo.jpg"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div aria-hidden className="absolute inset-0" style={{ background: "rgba(8,9,28,0.35)" }} />
        <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,9,28,0.45) 0%, transparent 25%)" }} />
      </div>
    </div>
  );
}
