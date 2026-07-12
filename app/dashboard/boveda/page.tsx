"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import { SectionBoveda } from "@/components/VaultSection";
import { CenteredLoader } from "@/components/ui/Spinner";

export default function BovedaPage() {
  const {
    vaultProjects, isVaultUnlocked, setIsVaultUnlocked, saveVault,
    setOpenVaultModal, setEditingVaultProject,
    handleDeleteVaultProject,
    setDeleteConfig, setOpenDeleteModal, isLoadingSecondary,
  } = useDashboard();

  if (isLoadingSecondary) return <CenteredLoader />;

  return (
    <SectionBoveda
      projects={vaultProjects}
      isUnlocked={isVaultUnlocked}
      onUnlock={setIsVaultUnlocked}
      onSaveVault={saveVault}
      onAddProject={() => { setEditingVaultProject(null); setOpenVaultModal(true); }}
      onEditProject={p => { setEditingVaultProject(p); setOpenVaultModal(true); }}
      onDeleteProject={p => { setDeleteConfig({ type: "vault", id: p.id, name: p.name }); setOpenDeleteModal(true); }}
    />
  );
}
