"use client";

import { Users, CheckSquare, Code, StickyNote, FolderOpen, Shield, LogOut, Sparkles, Globe } from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import type { Member } from "@/app/dashboard/types";

// ─── Nav items ────────────────────────────────────────────────────────────────

export const NAV = [
  { href: "/dashboard/equipo",   icon: <Users size={12}/>,       label: "Equipo"   },
  { href: "/dashboard/tareas",   icon: <CheckSquare size={12}/>, label: "Tareas"   },
  { href: "/dashboard/snippets", icon: <Code size={12}/>,        label: "Snippets" },
  { href: "/dashboard/pizarra",  icon: <StickyNote size={12}/>,  label: "Pizarra"  },
  { href: "/dashboard/archivos", icon: <FolderOpen size={12}/>,  label: "Archivos" },
  { href: "/dashboard/web-sites", icon: <Globe size={12}/>,      label: "Web Sites" },
  { href: "/dashboard/boveda",   icon: <Shield size={12}/>,      label: "Bóveda"   },
];

interface NavbarProps {
  isPizarra: boolean;
  activeHref: string;
  currentUser: Member | null;
  isToolkitVisible: boolean;
  onNavigate: (href: string) => void;
  onShowWhoAreYou: () => void;
  onToggleToolkit: () => void;
  onLogout: () => void;
}

export default function Navbar({
  isPizarra, activeHref, currentUser, isToolkitVisible,
  onNavigate, onShowWhoAreYou, onToggleToolkit, onLogout,
}: NavbarProps) {
  return (
    <header
      className={isPizarra ? "shrink-0" : "mb-2 shrink-0 "}
      style={isPizarra ? { position: "absolute", top: 12, left: 22, right: 22, zIndex: 100, pointerEvents: "none" } : undefined}
    >
      <div
        className="flex items-center justify-between gap-2 flex-wrap"
        style={isPizarra ? undefined : { padding: "4px 2px" }}
      >

        {!isPizarra && (
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <img src="/assets/codexa.webp" alt="Codexa" className="h-6 w-6 object-contain" />
            <h1 style={{ fontSize: 15, fontWeight: 700, color: "var(--text)", margin: 0, letterSpacing: "-0.2px" }}>
              Codexa
            </h1>
          </div>
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto min-w-0 overflow-x-auto overflow-y-hidden pointer-events-auto">

          {currentUser && (
            <button
              onClick={onShowWhoAreYou}
              className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full transition-all"
              style={{
                background: "rgba(var(--blue-rgb),0.08)",
                border: "1px solid rgba(var(--blue-rgb),0.18)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(var(--blue-rgb),0.14)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(var(--blue-rgb),0.08)"; }}
            >
              <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={24} borderRadius={20} />
              <span className="text-xs font-semibold hidden sm:inline" style={{ color: "var(--blue-light)" }}>{currentUser.name}</span>
            </button>
          )}


          <Tabs value={activeHref} onValueChange={val => onNavigate(val as string)}>
            <TabsList
              className="h-10 gap-1 rounded-full p-1"
              style={{ background: "rgba(0,0,0,0.20)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              {NAV.map(({ href, icon, label }) => (
                <TabsTrigger
                  key={href} value={href}
                  className="h-8 gap-1.5 px-3 text-xs font-semibold rounded-full transition-all [&]:text-(--text-3) [&]:bg-transparent [&]:border-transparent [&]:shadow-none [&:hover]:text-(--blue-light) data-active:text-white! data-active:shadow-none! [&_svg]:size-3!"
                  style={activeHref === href ? {
                    background: "linear-gradient(135deg, rgba(var(--blue-rgb),0.9), rgba(var(--blue-rgb),0.55))",
                    boxShadow: "0 4px 14px -4px rgba(var(--blue-rgb),0.55)",
                  } : undefined}
                >
                  {icon}
                  <span className="hidden sm:inline">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>


          <button
            onClick={onToggleToolkit}
            className="h-9 w-9 rounded-full flex items-center justify-center transition-all"
            style={{
              color: isToolkitVisible ? "var(--blue-soft)" : "var(--text-dim)",
              background: isToolkitVisible ? "rgba(var(--blue-rgb),0.14)" : "transparent",
              border: `1px solid ${isToolkitVisible ? "rgba(var(--blue-rgb),0.32)" : "rgba(255,255,255,0.07)"}`,
            }}
          >
            <Sparkles size={14} />
          </button>

          <button
            onClick={onLogout}
            className="h-9 w-9 rounded-full flex items-center justify-center transition-all"
            style={{ color: "var(--text-dim)", border: "1px solid rgba(255,255,255,0.07)" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.28)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = "var(--text-dim)"; e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; }}
          >
            <LogOut size={14} />
          </button>

        </div>
      </div>
    </header>
  );
}
