"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Users, CheckSquare, Code, StickyNote, FolderOpen,
  Shield, LogOut, Sparkles, CheckCircle2, AlertTriangle, AlertOctagon, Info, Bell
} from "lucide-react";
import { Toaster } from "sonner";
import { DashboardProvider, useDashboard } from "@/app/dashboard/DashboardContext";
import AvatarImg from "@/app/dashboard/components/AvatarImg";
import DevToolkit from "@/components/DevToolkit";
import ModalBase from "@/components/modal/ModalBase";
import ModalEliminar from "@/components/modal/ModalEliminar";
import { SectionBoveda, VaultProjectForm } from "@/components/VaultSection";
import MemberForm from "@/app/dashboard/forms/MemberForm";
import MemberPicker from "@/app/dashboard/forms/MemberPicker";
import TaskForm from "@/app/dashboard/forms/TaskForm";
import SnippetForm from "@/app/dashboard/forms/SnippetForm";
import NoteForm from "@/app/dashboard/forms/NoteForm";
import ButtonBase from "@/components/ui/ButtonBase";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import SetupScreen from "@/app/dashboard/screens/SetupScreen";
import WhoAreYouScreen from "@/app/dashboard/screens/WhoAreYouScreen";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/dashboard/equipo",   icon: <Users size={12}/>,       label: "Equipo"   },
  { href: "/dashboard/tareas",   icon: <CheckSquare size={12}/>, label: "Tareas"   },
  { href: "/dashboard/snippets", icon: <Code size={12}/>,        label: "Snippets" },
  { href: "/dashboard/pizarra",  icon: <StickyNote size={12}/>,  label: "Pizarra"  },
  { href: "/dashboard/archivos", icon: <FolderOpen size={12}/>,  label: "Archivos" },
  { href: "/dashboard/boveda",   icon: <Shield size={12}/>,      label: "Bóveda"   },
];

const customIcons = {
  success: <CheckCircle2 className="w-4 h-4 text-white" />,
  error: <AlertTriangle className="w-4 h-4 text-white" />,
  warning: <AlertOctagon className="w-4 h-4 text-white" />,
  info: <Bell className="w-4 h-4 text-white" />
};

const toasterProps = {
  position: "bottom-left" as const,
  icons: customIcons,
  toastOptions: {
    unstyled: true,
    classNames: {
      toast: "flex items-center gap-3 px-3 py-2.5 w-full max-w-[300px] rounded-[16px] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] font-sans transition-all",
      success: "bg-gradient-to-br from-[#064e3b] to-[#022c22] text-white [&_[data-icon]]:bg-[#059669]",
      error: "bg-gradient-to-br from-[#7f1d1d] to-[#450a0a] text-white [&_[data-icon]]:bg-[#dc2626]",
      warning: "bg-gradient-to-br from-[#7c2d12] to-[#431407] text-white [&_[data-icon]]:bg-[#ea580c]",
      info: "bg-gradient-to-br from-[#1e3a8a] to-[#172554] text-white [&_[data-icon]]:bg-[#2563eb]",
      default: "bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white [&_[data-icon]]:bg-[#475569]",
      title: "text-[13px] font-bold tracking-tight mb-[1px]",
      description: "text-[11.5px] font-medium text-white/70",
      icon: "w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 shadow-inner",
    }
  }
};

// ─── Inner layout ─────────────────────────────────────────────────────────────

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isPizarra = pathname === "/dashboard/pizarra";
  const [isWide, setIsWide] = useState(false);

  const activeHref = NAV.find(n => pathname.startsWith(n.href))?.href ?? "";

  const {
    members, currentUser, isLoading, isSetup, setIsSetup, showWhoAreYou,
    isToolkitVisible, setIsToolkitVisible,
    setShowWhoAreYou, handleAddMember, selectCurrentUser, handleLogout,
    openMemberModal, setOpenMemberModal,
    openTaskModal, setOpenTaskModal, editingTask, setEditingTask,
    openSnippetModal, setOpenSnippetModal, editingSnippet, setEditingSnippet,
    openNoteModal, setOpenNoteModal,
    openVaultModal, setOpenVaultModal, editingVaultProject, setEditingVaultProject,
    openDeleteModal, setOpenDeleteModal, deleteConfig, setDeleteConfig,
    assignModal, setAssignModal,
    handleSaveTask, handleAssignAndStart,
    handleSaveSnippet, handleAddNote,
    handleSaveVaultProject,
    handleDeleteMember, handleDeleteTask, handleDeleteSnippet,
    handleDeleteNote, handleDeleteVaultProject, handleDeleteArchivo,
    saveVault, vaultProjects,
    isVaultUnlocked, setIsVaultUnlocked,
  } = useDashboard();

  useEffect(() => {
    const check = () => {
      const wide = window.innerWidth >= 1320;
      setIsWide(wide);
      if (!wide) setIsToolkitVisible(false);
      else setIsToolkitVisible(true);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [setIsToolkitVisible]);

  if (isLoading) return null;

  if (isSetup) return (
    <>
      <Toaster {...toasterProps} />
      <SetupScreen members={members} handleAddMember={handleAddMember} onFinish={() => { setIsSetup(false); setShowWhoAreYou(true); }} toasterProps={toasterProps} />
    </>
  );

  if (showWhoAreYou) return (
    <>
      <Toaster {...toasterProps} />
      <WhoAreYouScreen members={members} onSelect={selectCurrentUser} onSkip={() => setShowWhoAreYou(false)} toasterProps={toasterProps} />
    </>
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-(--bg-base) relative ${isPizarra ? '' : 'p-3 sm:p-4 lg:px-5.5 lg:py-4'}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <Toaster {...toasterProps} />

      {/* ── Header ── */}
      <header
        className={isPizarra ? "shrink-0" : "mb-4 shrink-0"}
        style={isPizarra ? { position: "absolute", top: 16, left: 22, right: 22, zIndex: 100, pointerEvents: "none" } : undefined}
      >
          <div className="flex items-center justify-between gap-2 flex-wrap">

            {!isPizarra && <div className="hidden md:block shrink-0">
  <h1 style={{ fontSize: 18, fontWeight: 800, color: "#97c0ea", margin: 0, letterSpacing: "-0.5px", fontFamily: "JetBrains Mono, monospace" }}>
  CODEXA
</h1>
             
            </div>}

            <div className="flex items-center gap-1.5 sm:gap-2 ml-auto min-w-0 overflow-x-auto overflow-y-hidden pointer-events-auto">

              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWhoAreYou(true)}
                  className="h-8 gap-2 px-2 text-(--blue-light) hover:text-(--blue-light) hover:bg-[rgba(var(--blue-rgb),0.10)] rounded-[9px]"
                >
                  <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={22} borderRadius={6} />
                  <span className="text-xs font-semibold">{currentUser.name}</span>
                </Button>
              )}

              <Separator orientation="vertical" className="h-5 bg-[rgba(var(--blue-rgb),0.18)]!" />

              <Tabs value={activeHref} onValueChange={val => router.push(val as string)}>
                <TabsList
                  className="h-9 gap-0.5  rounded-[11px]"
                >
                  {NAV.map(({ href, icon, label }) => (
                    <TabsTrigger
                      key={href} value={href}
                      className="h-7 gap-1.5 px-3 text-xs font-medium rounded-lg transition-all [&]:text-(--text-3) [&]:bg-transparent [&]:border-transparent [&]:shadow-none [&:hover]:text-(--blue-light) data-active:text-white! data-active:bg-[rgba(var(--blue-rgb),0.16)]! data-active:border-[rgba(var(--blue-rgb),0.32)]! data-active:shadow-none! [&_svg]:size-3!"
                    >
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Separator orientation="vertical" className="h-5 bg-[rgba(var(--blue-rgb),0.18)]!" />

              <Button
                variant="ghost" size="icon"
                onClick={() => setIsToolkitVisible(!isToolkitVisible)}
                className={["h-8 w-8 rounded-[9px] transition-all", isToolkitVisible ? "text-(--blue-soft) !bg-[rgba(var(--blue-rgb),0.12)] !border-[rgba(var(--blue-rgb),0.30)]" : "text-[var(--text-dim)] hover:text-[var(--blue-light)] !border-[rgba(var(--blue-rgb),0.12)]"].join(" ")}
                style={{ border: "1px solid" }}
              >
                <Sparkles size={14} />
              </Button>

              <Button
                variant="ghost" size="icon"
                onClick={handleLogout}
                className="h-8 w-8 rounded-[9px] text-[var(--text-dim)] hover:text-[#f87171] hover:!bg-[rgba(239,68,68,0.06)] hover:!border-[rgba(239,68,68,0.25)]"
                style={{ border: "1px solid rgba(var(--blue-rgb),0.12)" }}
              >
                <LogOut size={14} />
              </Button>

            </div>
          </div>
      </header>

      {/* ── Content + Toolkit ── */}
      <div className={`flex-1 min-h-0 overflow-hidden relative ${isPizarra ? "" : "flex flex-col wide:flex-row gap-3 wide:gap-5"}`}>
        <div className={`min-w-0 overflow-hidden ${isPizarra ? 'h-full' : 'flex-1 min-h-0'}`}>{children}</div>

        {isToolkitVisible && !isPizarra && (
          <>
            {/* Overlay backdrop — solo en < 1320px */}
            <div
              className="wide:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setIsToolkitVisible(false)}
            />
            {/* Sidebar — inline en wide, overlay en móvil/tablet */}
            <div className={`
              ${isWide ? 'relative block w-80 h-full shrink-0' : 'fixed top-0 right-0 h-full w-80 max-w-[90vw] z-50'}
              animate-in slide-in-from-right duration-300
            `}>
              <div className="h-full">
                <DevToolkit
                  members={members}
                  currentUser={currentUser}
                  borderRadius={isWide ? 24 : '24px 0 0 24px'}
                />
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Global Modals ── */}
      <ModalBase open={openMemberModal} title="Agregar Miembro" onClose={() => setOpenMemberModal(false)}>
        <MemberForm onAdd={(n, r, seed) => { handleAddMember(n, r, seed); setOpenMemberModal(false); }} />
      </ModalBase>
      <ModalBase open={openTaskModal} title={editingTask ? "Editar Tarea" : "Nueva Tarea"} onClose={() => { setOpenTaskModal(false); setEditingTask(null); }}>
        <TaskForm members={members} initialData={editingTask || undefined} currentUser={currentUser} onSave={handleSaveTask} onCancel={() => { setOpenTaskModal(false); setEditingTask(null); }} />
      </ModalBase>
      <ModalBase open={!!assignModal} title="¿Quién se encarga?" onClose={() => setAssignModal(null)}>
        <div className="flex flex-col gap-5">
          <p style={{ color: "var(--text-2)", fontSize: 13 }}>Selecciona al miembro que tomará esta tarea.</p>
          <MemberPicker members={members} value="" currentUser={currentUser} onChange={handleAssignAndStart} />
          <div className="flex justify-end"><ButtonBase variant="secondary" onClick={() => setAssignModal(null)}>Cancelar</ButtonBase></div>
        </div>
      </ModalBase>
      <ModalBase open={openSnippetModal} title={editingSnippet ? "Editar Snippet" : "Nuevo Snippet"} onClose={() => { setOpenSnippetModal(false); setEditingSnippet(null); }}>
        <SnippetForm members={members} initialData={editingSnippet || undefined} onSave={handleSaveSnippet} onCancel={() => setOpenSnippetModal(false)} />
      </ModalBase>
      <ModalBase open={openNoteModal} title="Nueva Nota" onClose={() => setOpenNoteModal(false)}>
        <NoteForm members={members} onSave={handleAddNote} onCancel={() => setOpenNoteModal(false)} />
      </ModalBase>
      <ModalBase open={openVaultModal} title={editingVaultProject ? "Editar Proyecto" : "Nuevo Proyecto en Bóveda"} onClose={() => { setOpenVaultModal(false); setEditingVaultProject(null); }}>
        <VaultProjectForm initialData={editingVaultProject || undefined} onSave={handleSaveVaultProject} onCancel={() => setOpenVaultModal(false)} />
      </ModalBase>
      <ModalEliminar
        open={openDeleteModal}
        onClose={() => setOpenDeleteModal(false)}
        onConfirm={() => {
          if (!deleteConfig) return;
          const { type, id } = deleteConfig;
          if (type === "member")  handleDeleteMember(id);
          if (type === "task")    handleDeleteTask(id);
          if (type === "snippet") handleDeleteSnippet(id);
          if (type === "note")    handleDeleteNote(id);
          if (type === "archivo") handleDeleteArchivo(id);
          if (type === "vault")   handleDeleteVaultProject(id);
          setOpenDeleteModal(false);
        }}
        title={`Eliminar ${deleteConfig?.type === "member" ? "Miembro" : deleteConfig?.type === "task" ? "Tarea" : deleteConfig?.type === "snippet" ? "Snippet" : deleteConfig?.type === "archivo" ? "Archivo" : deleteConfig?.type === "vault" ? "Proyecto de Bóveda" : "Nota"}`}
        message={`¿Estás seguro de que deseas eliminar "${deleteConfig?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <TooltipProvider>
        <DashboardInner>{children}</DashboardInner>
      </TooltipProvider>
    </DashboardProvider>
  );
}
