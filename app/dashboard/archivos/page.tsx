"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionArchivos from "@/app/dashboard/sections/SectionArchivos";
import { CenteredLoader } from "@/components/ui/Spinner";

export default function ArchivosPage() {
  const { archivos, members, currentUser, saveArchivos, isLoadingSecondary } = useDashboard();
  if (isLoadingSecondary) return <CenteredLoader />;
  return (
    <SectionArchivos
      archivos={archivos}
      members={members}
      currentUser={currentUser}
      onSave={saveArchivos}
    />
  );
}
