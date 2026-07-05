"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { DashboardProvider, useDashboard } from "@/app/dashboard/DashboardContext";
import Navbar, { NAV } from "@/app/dashboard/components/Navbar";
import AppToaster, { toasterProps } from "@/app/dashboard/components/Toast";
import DevToolkit from "@/components/DevToolkit";
import ModalBase from "@/components/modal/ModalBase";
import ModalEliminar from "@/components/modal/ModalEliminar";
import { VaultProjectForm } from "@/components/VaultSection";
import MemberPicker from "@/app/dashboard/forms/MemberPicker";
import TaskForm from "@/app/dashboard/forms/TaskForm";
import SnippetForm from "@/app/dashboard/forms/SnippetForm";
import NoteForm from "@/app/dashboard/forms/NoteForm";
import ButtonBase from "@/components/ui/ButtonBase";
import { TooltipProvider } from "@/components/ui/tooltip";
import SetupScreen from "@/app/dashboard/screens/SetupScreen";
import WhoAreYouScreen from "@/app/dashboard/screens/WhoAreYouScreen";

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
      <AppToaster />
      <SetupScreen members={members} handleAddMember={handleAddMember} onFinish={() => { setIsSetup(false); setShowWhoAreYou(true); }} toasterProps={toasterProps} />
    </>
  );

  if (showWhoAreYou) return (
    <>
      <AppToaster />
      <WhoAreYouScreen members={members} onSelect={selectCurrentUser} onSkip={() => setShowWhoAreYou(false)} toasterProps={toasterProps} />
    </>
  );

  return (
    <div className={`flex flex-col h-screen overflow-hidden bg-(--bg-base) relative ${isPizarra ? '' : 'p-3 sm:p-4 lg:px-5.5 lg:py-2'}`}
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <AppToaster />

      <Navbar
        isPizarra={isPizarra}
        activeHref={activeHref}
        currentUser={currentUser}
        isToolkitVisible={isToolkitVisible}
        onNavigate={href => router.push(href)}
        onShowWhoAreYou={() => setShowWhoAreYou(true)}
        onToggleToolkit={() => setIsToolkitVisible(!isToolkitVisible)}
        onLogout={handleLogout}
      />

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
