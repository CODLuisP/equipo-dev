"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionArchivos from "@/app/dashboard/sections/SectionArchivos";

export default function ArchivosPage() {
  const { archivos, members, currentUser, saveArchivos } = useDashboard();
  return (
    <SectionArchivos
      archivos={archivos}
      members={members}
      currentUser={currentUser}
      onSave={saveArchivos}
    />
  );
}
