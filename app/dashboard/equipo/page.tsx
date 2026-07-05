"use client";

import { useState } from "react";
import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionEquipo from "@/app/dashboard/sections/SectionEquipo";
import AgregarMiembroModal from "@/app/dashboard/components/AgregarMiembroModal";

export default function EquipoPage() {
  const {
    members, tasks,
    handleAddMember,
    handleDeleteMember, handleChangeAvatar,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  const [openMemberModal, setOpenMemberModal] = useState(false);

  return (
    <div className="h-full overflow-hidden">
      <SectionEquipo
        members={members}
        tasks={tasks}
        onAddMember={() => setOpenMemberModal(true)}
        onDeleteMember={m => { setDeleteConfig({ type: "member", id: m.id, name: m.name }); setOpenDeleteModal(true); }}
        onChangeAvatar={handleChangeAvatar}
      />
      <AgregarMiembroModal open={openMemberModal} onClose={() => setOpenMemberModal(false)} onAdd={handleAddMember} />
    </div>
  );
}
