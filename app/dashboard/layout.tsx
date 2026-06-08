"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, CheckSquare, Code, StickyNote, FolderOpen,
  Shield, Settings, LogOut, Sparkles
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
import SetupScreen from "@/app/dashboard/screens/SetupScreen";
import WhoAreYouScreen from "@/app/dashboard/screens/WhoAreYouScreen";

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV = [
  { href: "/dashboard/equipo",    icon: <Users size={13}/>,       label: "Equipo"   },
  { href: "/dashboard/tareas",    icon: <CheckSquare size={13}/>, label: "Tareas"   },
  { href: "/dashboard/snippets",  icon: <Code size={13}/>,        label: "Snippets" },
  { href: "/dashboard/pizarra",   icon: <StickyNote size={13}/>,  label: "Pizarra"  },
  { href: "/dashboard/archivos",  icon: <FolderOpen size={13}/>,  label: "Archivos" },
  { href: "/dashboard/boveda",    icon: <Shield size={13}/>,      label: "Bóveda"   },
  { href: "/dashboard/ajustes",   icon: <Settings size={13}/>,    label: "Ajustes"  },
];

const toasterProps = {
  position: "bottom-right" as const,
  theme: "dark" as const,
  toastOptions: {
    style: {
      background: "#0c0e1d", color: "#eef0fb",
      border: "1px solid rgba(37,99,235,0.18)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      borderRadius: 12,
      boxShadow: "0 12px 32px rgba(0,0,0,0.5), 0 0 20px rgba(37,99,235,0.06)",
    }
  }
};

// ─── Inner layout (needs context) ─────────────────────────────────────────────

function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isPizarra = pathname === "/dashboard/pizarra";

  const {
    members, currentUser, isLoading, isSetup, showWhoAreYou,
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
    handleDeleteNote, handleDeleteVaultProject,
    saveArchivos, archivos, saveVault, vaultProjects,
    isVaultUnlocked, setIsVaultUnlocked,
  } = useDashboard();

  if (isLoading) return null;

  if (isSetup) return (
    <>
      <Toaster {...toasterProps} />
      <SetupScreen members={members} handleAddMember={handleAddMember} onFinish={() => {}} toasterProps={toasterProps} />
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
      background: "#080a14", fontFamily: "'Plus Jakarta Sans', sans-serif",
      padding: isPizarra ? "0" : "18px 22px 22px",
    }}>
      <Toaster {...toasterProps} />

      {/* ── Header ── */}
      <header className={isPizarra ? "fixed top-4 right-4 z-[1000] w-auto" : "mb-4 flex-shrink-0"}>
        <div
          className={isPizarra ? "px-2 py-1.5 rounded-2xl shadow-2xl flex items-center gap-2" : "flex flex-col md:flex-row md:items-center justify-between gap-3 w-full"}
          style={isPizarra ? { background: "rgba(10,12,26,0.88)", backdropFilter: "blur(16px)", border: "1px solid rgba(37,99,235,0.20)" } : {}}
        >
          {/* Title — only when not pizarra */}
          {!isPizarra && (
            <div>
              <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 18, fontWeight: 800, color: "#eef0fb", margin: 0, letterSpacing: "-0.4px" }}>
                Equipo de{" "}
                <span style={{ background: "linear-gradient(135deg,#60a5fa,#93c5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  Programadores
                </span>
              </h1>
              <p style={{ fontSize: 11, color: "#6b7280", marginTop: 2, margin: 0 }}>
                Gestión de tareas, snippets y colaboración
              </p>
            </div>
          )}

          <div className="flex items-center gap-2">
            {/* User chip */}
            {currentUser && (
              <button
                onClick={() => setShowWhoAreYou(true)}
                title="Cambiar perfil"
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: isPizarra ? "3px 8px 3px 4px" : "4px 10px 4px 4px",
                  background: "rgba(37,99,235,0.07)",
                  border: "1px solid rgba(37,99,235,0.18)",
                  borderRadius: 9, cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,99,235,0.12)"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.30)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,99,235,0.07)"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.18)"; }}
              >
                <AvatarImg seed={currentUser.avatarSeed || currentUser.name} name={currentUser.name} color={currentUser.color} size={isPizarra ? 20 : 23} borderRadius={6} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd" }}>{currentUser.name}</span>
              </button>
            )}

            {/* Nav tabs */}
            <div style={{
              display: "flex", alignItems: "center", padding: isPizarra ? 2 : 4, borderRadius: 11,
              background: isPizarra ? "transparent" : "rgba(11,13,28,0.9)",
              border: isPizarra ? "none" : "1px solid rgba(37,99,235,0.15)",
              flexWrap: "wrap", gap: isPizarra ? 1 : 2,
            }}>
              {NAV.map(({ href, icon, label }) => {
                const active = pathname.startsWith(href);
                return (
                  <Link key={href} href={href} style={{
                    display: "flex", alignItems: "center", gap: isPizarra ? 4 : 6,
                    padding: isPizarra ? "4px 7px" : "6px 11px", borderRadius: 8,
                    fontSize: 12, fontWeight: active ? 700 : 500,
                    color: active ? "#eef0fb" : "#6b7280",
                    background: active ? "rgba(37,99,235,0.14)" : "transparent",
                    border: active ? "1px solid rgba(37,99,235,0.28)" : "1px solid transparent",
                    transition: "all 0.18s", textDecoration: "none", whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "#93c5fd";
                      (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.07)";
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.15)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      (e.currentTarget as HTMLElement).style.color = "#6b7280";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                    }
                  }}
                  >
                    <span style={{ display: "flex", color: active ? "#60a5fa" : "inherit", opacity: active ? 1 : 0.5 }}>
                      {icon}
                    </span>
                    <span>{label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Toolkit toggle — only outside pizarra */}
            {!isPizarra && (
              <button
                onClick={() => setIsToolkitVisible(!isToolkitVisible)}
                title={isToolkitVisible ? "Ocultar herramientas" : "Mostrar herramientas"}
                style={{
                  padding: "7px 9px",
                  background: isToolkitVisible ? "rgba(37,99,235,0.12)" : "rgba(37,99,235,0.04)",
                  border: isToolkitVisible ? "1px solid rgba(37,99,235,0.30)" : "1px solid rgba(37,99,235,0.12)",
                  borderRadius: 9, color: isToolkitVisible ? "#60a5fa" : "#4a5070",
                  cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s",
                }}
                onMouseEnter={e => { if (!isToolkitVisible) { e.currentTarget.style.color = "#93c5fd"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.25)"; } }}
                onMouseLeave={e => { if (!isToolkitVisible) { e.currentTarget.style.color = "#4a5070"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.12)"; } }}
              >
                <Sparkles size={15} />
              </button>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              style={{
                padding: "7px 9px", background: "rgba(37,99,235,0.04)",
                border: "1px solid rgba(37,99,235,0.12)", borderRadius: 9,
                color: "#4a5070", cursor: "pointer", display: "flex", alignItems: "center", transition: "all 0.15s",
              }}
              onMouseEnter={e => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.borderColor = "rgba(239,68,68,0.25)"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "#4a5070"; e.currentTarget.style.borderColor = "rgba(37,99,235,0.12)"; e.currentTarget.style.background = "rgba(37,99,235,0.04)"; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Content + Toolkit ── */}
      <div className={`flex-1 overflow-hidden ${isPizarra ? "" : "flex flex-col lg:flex-row gap-5"}`}>
        <div className="flex-1 h-full overflow-hidden">
          {children}
        </div>

        {!isPizarra && isToolkitVisible && (
          <div className="w-full lg:w-[400px] flex-shrink-0 animate-in slide-in-from-right duration-300 h-full">
            <div className="h-full">
              <DevToolkit members={members} currentUser={currentUser} />
            </div>
          </div>
        )}
      </div>

      {/* ── Global Modals ── */}
      <ModalBase open={openMemberModal} title="Agregar Miembro" onClose={() => setOpenMemberModal(false)}>
        <MemberForm onAdd={(n, r) => { handleAddMember(n, r); setOpenMemberModal(false); }} />
      </ModalBase>

      <ModalBase open={openTaskModal} title={editingTask ? "Editar Tarea" : "Nueva Tarea"} onClose={() => { setOpenTaskModal(false); setEditingTask(null); }}>
        <TaskForm members={members} initialData={editingTask || undefined} currentUser={currentUser} onSave={handleSaveTask} onCancel={() => { setOpenTaskModal(false); setEditingTask(null); }} />
      </ModalBase>

      <ModalBase open={!!assignModal} title="¿Quién se encarga?" onClose={() => setAssignModal(null)}>
        <div className="flex flex-col gap-5">
          <p style={{ color: "#8b91b8", fontSize: 13 }}>Selecciona al miembro que tomará esta tarea.</p>
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
          if (type === "archivo") saveArchivos(archivos.filter(a => a.id !== id));
          if (type === "vault")   handleDeleteVaultProject(id);
          setOpenDeleteModal(false);
        }}
        title={`Eliminar ${deleteConfig?.type === "member" ? "Miembro" : deleteConfig?.type === "task" ? "Tarea" : deleteConfig?.type === "snippet" ? "Snippet" : deleteConfig?.type === "archivo" ? "Archivo" : deleteConfig?.type === "vault" ? "Proyecto de Bóveda" : "Nota"}`}
        message={`¿Estás seguro de que deseas eliminar "${deleteConfig?.name}"? Esta acción no se puede deshacer.`}
      />
    </div>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <DashboardInner>{children}</DashboardInner>
    </DashboardProvider>
  );
}
