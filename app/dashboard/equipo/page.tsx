"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionEquipo from "@/app/dashboard/sections/SectionEquipo";

export default function EquipoPage() {
  const {
    members, tasks,
    setOpenMemberModal,
    handleDeleteMember, handleChangeAvatar,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  return (
    <div className="h-full overflow-hidden">
      <SectionEquipo
        members={members}
        tasks={tasks}
        onAddMember={() => setOpenMemberModal(true)}
        onDeleteMember={m => { setDeleteConfig({ type: "member", id: m.id, name: m.name }); setOpenDeleteModal(true); }}
        onChangeAvatar={handleChangeAvatar}
      />
    </div>
  );
}
