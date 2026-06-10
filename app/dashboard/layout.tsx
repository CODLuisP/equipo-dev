"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Users, CheckSquare, Code, StickyNote, FolderOpen,
  Shield, LogOut, Sparkles
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

const toasterProps = {
  position: "bottom-right" as const,
  theme: "dark" as const,
  toastOptions: {
    style: {
      background: "var(--bg-surface)", color: "var(--text)",
      border: "1px solid rgba(var(--blue-rgb),0.18)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      borderRadius: 12,
    }
  }
};

// ─── Inner layout ─────────────────────────────────────────────────────────────

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isPizarra = pathname === "/dashboard/pizarra";

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
    <div style={{
      display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden",
      background: "var(--bg-base)", fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: isPizarra ? "0" : "16px 22px 22px",
    }}>
      <Toaster {...toasterProps} />

      {/* ── Header ── */}
      {isPizarra ? (
        <header className="fixed top-4 right-4 z-[1000]">
          <div
            className="flex items-center gap-1.5 px-2 py-1.5 rounded-2xl"
            style={{ background: "rgba(var(--surface-rgb),0.92)", backdropFilter: "blur(16px)", border: "1px solid rgba(var(--blue-rgb),0.20)" }}
          >
            {currentUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWhoAreYou(true)}
                className="h-7 gap-1.5 px-2 text-[var(--blue-light)] hover:text-[var(--blue-light)] hover:bg-[rgba(var(--blue-rgb),0.12)] rounded-lg"
                style={{ border: "1px solid rgba(var(--blue-rgb),0.18)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={18} borderRadius={5} />
                <span className="text-[11px] font-semibold">{currentUser.name}</span>
              </Button>
            )}
            <Tabs value={activeHref} onValueChange={val => router.push(val as string)}>
              <TabsList className="h-8 gap-0.5 p-1 rounded-xl" style={{ border: "none" }}>
                {NAV.map(({ href, icon }) => (
                  <TabsTrigger
                    key={href} value={href}
                    className="h-6 gap-1 px-2 text-[11px] font-medium rounded-lg [&]:text-[var(--text-3)] [&]:bg-transparent [&]:border-transparent [&]:shadow-none data-active:text-white data-active:bg-[rgba(var(--blue-rgb),0.16)] data-active:border-[rgba(var(--blue-rgb),0.28)] [&_svg]:size-3!"
                  >
                    {icon}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </header>
      ) : (
        <header className="mb-4 shrink-0">
          <div className="flex items-center justify-between gap-3">

            <div className="hidden md:block shrink-0">
              <h1 style={{ fontSize: 17, fontWeight: 800, color: "var(--text)", margin: 0, letterSpacing: "-0.4px", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Equipo de{" "}
                <span style={{ background: "linear-gradient(135deg,var(--blue),var(--blue-soft))", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Programadores
                </span>
              </h1>
              <p style={{ fontSize: 11, color: "var(--text-3)", margin: 0, marginTop: 2 }}>
                Gestión de tareas, snippets y colaboración
              </p>
            </div>

            <div className="flex items-center gap-2 ml-auto">

              {currentUser && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWhoAreYou(true)}
                  className="h-8 gap-2 px-2 text-[var(--blue-light)] hover:text-[var(--blue-light)] hover:bg-[rgba(var(--blue-rgb),0.10)] rounded-[9px]"
                  style={{ border: "1px solid rgba(var(--blue-rgb),0.18)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={22} borderRadius={6} />
                  <span className="text-xs font-semibold">{currentUser.name}</span>
                </Button>
              )}

              <Separator orientation="vertical" className="h-5 !bg-[rgba(var(--blue-rgb),0.18)]" />

              <Tabs value={activeHref} onValueChange={val => router.push(val as string)}>
                <TabsList
                  className="h-9 gap-0.5 p-1 rounded-[11px]"
                  style={{ background: "rgba(var(--surface-rgb),0.9)", border: "1px solid rgba(var(--blue-rgb),0.14)" }}
                >
                  {NAV.map(({ href, icon, label }) => (
                    <TabsTrigger
                      key={href} value={href}
                      className="h-7 gap-1.5 px-3 text-xs font-medium rounded-lg transition-all [&]:text-[var(--text-3)] [&]:bg-transparent [&]:border-transparent [&]:shadow-none [&:hover]:text-[var(--blue-light)] [&[data-active]]:!text-white [&[data-active]]:!bg-[rgba(var(--blue-rgb),0.16)] [&[data-active]]:!border-[rgba(var(--blue-rgb),0.32)] [&[data-active]]:!shadow-none [&_svg]:!size-3"
                    >
                      {icon}
                      <span className="hidden sm:inline">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <Separator orientation="vertical" className="h-5 !bg-[rgba(var(--blue-rgb),0.18)]" />

              <Button
                variant="ghost" size="icon"
                onClick={() => setIsToolkitVisible(!isToolkitVisible)}
                className={["h-8 w-8 rounded-[9px] transition-all", isToolkitVisible ? "text-[var(--blue-soft)] !bg-[rgba(var(--blue-rgb),0.12)] !border-[rgba(var(--blue-rgb),0.30)]" : "text-[var(--text-dim)] hover:text-[var(--blue-light)] !border-[rgba(var(--blue-rgb),0.12)]"].join(" ")}
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
      )}

      {/* ── Content + Toolkit ── */}
      <div className={`flex-1 overflow-hidden ${isPizarra ? "" : "flex flex-col lg:flex-row gap-5"}`}>
        <div className="flex-1 h-full overflow-hidden">{children}</div>
        {!isPizarra && isToolkitVisible && (
          <div className="w-full lg:w-[400px] flex-shrink-0 animate-in slide-in-from-right duration-300 h-full">
            <div className="h-full"><DevToolkit members={members} currentUser={currentUser} /></div>
          </div>
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
