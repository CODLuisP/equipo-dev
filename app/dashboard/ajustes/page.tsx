"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionAjustes from "@/app/dashboard/sections/SectionAjustes";

export default function AjustesPage() {
  const {
    members, setOpenMemberModal,
    handleDeleteMember, handleChangeAvatar,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-1">
      <SectionAjustes
        members={members}
        onAddMember={() => setOpenMemberModal(true)}
        onDeleteMember={m => { setDeleteConfig({ type: "member", id: m.id, name: m.name }); setOpenDeleteModal(true); }}
        onChangeAvatar={handleChangeAvatar}
      />
    </div>
  );
}
