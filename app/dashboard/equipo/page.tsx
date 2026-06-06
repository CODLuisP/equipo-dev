"use client";

import { useDashboard } from "@/app/dashboard/DashboardContext";
import SectionEquipo from "@/app/dashboard/sections/SectionEquipo";

export default function EquipoPage() {
  const { members, tasks } = useDashboard();
  return (
    <div className="h-full overflow-y-auto custom-scrollbar pr-1">
      <SectionEquipo members={members} tasks={tasks} />
    </div>
  );
}
