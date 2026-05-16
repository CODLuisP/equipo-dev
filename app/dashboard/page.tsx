import type { Metadata } from "next";
import EquipoDevClient from "./EquipoDevClient";

export const metadata: Metadata = {
  title: "Equipo Dev · Dashboard",
};

export default function DashboardPage() {
  return <EquipoDevClient />;
}
