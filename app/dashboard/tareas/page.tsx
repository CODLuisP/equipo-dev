"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionTareas from "@/app/dashboard/sections/SectionTareas";
import { CenteredLoader } from "@/components/ui/Spinner";

export default function TareasPage() {
  const {
    filteredTasks, members, taskFilterMember, setTaskFilterMember,
    currentUser, isLoadingSecondary,
    setOpenTaskModal, setEditingTask,
    handleChangeTaskStatus, handleStartTask, handleDeleteTask, handleClearCompleted,
    setDeleteConfig, setOpenDeleteModal,
  } = useDashboard();

  if (isLoadingSecondary) return <CenteredLoader />;

  return (
    <SectionTareas
      tasks={filteredTasks}
      members={members}
      filterMember={taskFilterMember}
      setFilterMember={setTaskFilterMember}
      currentUser={currentUser}
      onAddTask={() => { setEditingTask(null); setOpenTaskModal(true); }}
      onEditTask={t => { setEditingTask(t); setOpenTaskModal(true); }}
      onChangeStatus={handleChangeTaskStatus}
      onStartTask={handleStartTask}
      onDeleteTask={t => { setDeleteConfig({ type: "task", id: t.id, name: t.title }); setOpenDeleteModal(true); }}
      onClearCompleted={handleClearCompleted}
    />
  );
}
