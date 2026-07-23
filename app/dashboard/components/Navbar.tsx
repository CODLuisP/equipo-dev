"use client";

import { useEffect, useRef, useState } from "react";
import { Users, CheckSquare, Code, Shield, LogOut, Sparkles, Globe, Menu, X, FolderOpen } from "lucide-react";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { Member } from "@/app/dashboard/types";

// ─── Nav items ────────────────────────────────────────────────────────────────

export const NAV = [
  { href: "/dashboard/equipo",    icon: <Users size={12}/>,       label: "Equipo"    },
  { href: "/dashboard/tareas",    icon: <CheckSquare size={12}/>, label: "Tareas"    },
  { href: "/dashboard/snippets",  icon: <Code size={12}/>,        label: "Snippets"  },
  { href: "/dashboard/archivos",  icon: <FolderOpen size={12}/>,  label: "Archivos"  },
  { href: "/dashboard/web-sites", icon: <Globe size={12}/>,       label: "Web Sites" },
  { href: "/dashboard/boveda",    icon: <Shield size={12}/>,      label: "Bóveda"    },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const activeNav = NAV.find(n => n.href === activeHref);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [mobileMenuOpen]);

  useEffect(() => { setMobileMenuOpen(false); }, [activeHref]);

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

        <div className="flex items-center gap-1.5 sm:gap-2 ml-auto min-w-0 pointer-events-auto">

          {currentUser && (
            <button
              onClick={onShowWhoAreYou}
              className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full transition-all shrink-0"
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

          {/* Navegación — pill horizontal en pantallas >= sm */}
          <div className="hidden sm:block">
            <Tabs value={activeHref} onValueChange={val => onNavigate(val as string)}>
              <TabsList
                className="h-10 gap-1 rounded-full p-1"
                style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.06)" }}
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
                    <span className="hidden md:inline">{label}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Navegación — menú desplegable en pantallas < sm */}
          <div ref={menuRef} className="relative sm:hidden shrink-0">
            <button
              onClick={() => setMobileMenuOpen(o => !o)}
              className="h-9 gap-1.5 px-3 flex items-center rounded-full transition-all"
              style={{
                background: mobileMenuOpen ? "rgba(var(--blue-rgb),0.14)" : "#161b22",
                border: `1px solid ${mobileMenuOpen ? "rgba(var(--blue-rgb),0.32)" : "rgba(255,255,255,0.06)"}`,
                color: "var(--blue-light)",
              }}
            >
              {mobileMenuOpen ? <X size={14} /> : (activeNav?.icon ?? <Menu size={14} />)}
              <span className="text-xs font-semibold">{activeNav?.label ?? "Menú"}</span>
            </button>

            {mobileMenuOpen && (
              <div
                className="absolute top-full right-0 mt-2 z-[200] w-48 rounded-2xl p-1.5 flex flex-col gap-0.5"
                style={{ background: "#161b22", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 12px 32px -8px rgba(0,0,0,0.5)" }}
              >
                {NAV.map(({ href, icon, label }) => (
                  <button
                    key={href}
                    onClick={() => { onNavigate(href); setMobileMenuOpen(false); }}
                    className="flex items-center gap-2.5 h-9 px-3 rounded-xl text-xs font-semibold transition-all text-left"
                    style={activeHref === href ? {
                      background: "linear-gradient(135deg, rgba(var(--blue-rgb),0.9), rgba(var(--blue-rgb),0.55))",
                      color: "#fff",
                    } : { color: "var(--text-3)" }}
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

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
