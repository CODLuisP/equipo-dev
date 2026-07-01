"use client";

import { Toaster } from "sonner";
import { CheckCircle2, AlertTriangle, AlertOctagon, Bell } from "lucide-react";

const customIcons = {
  success: <CheckCircle2 className="w-4 h-4 text-white" />,
  error: <AlertTriangle className="w-4 h-4 text-white" />,
  warning: <AlertOctagon className="w-4 h-4 text-white" />,
  info: <Bell className="w-4 h-4 text-white" />
};

export const toasterProps = {
  position: "bottom-left" as const,
  icons: customIcons,
  toastOptions: {
    unstyled: true,
    classNames: {
      toast: "flex items-center gap-3 px-2 py-1.5 w-full max-w-[300px] rounded-[16px] font-sans transition-all",
      success: "bg-gradient-to-br from-[#064e3b] to-[#022c22] text-white",
      error: "bg-gradient-to-br from-[#7f1d1d] to-[#450a0a] text-white",
      warning: "bg-gradient-to-br from-[#7c2d12] to-[#431407] text-white",
      info: "bg-gradient-to-br from-[#1e3a8a] to-[#172554] text-white",
      default: "bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-white",
      title: "text-[13px] font-semibold tracking-tight mb-[1px]",
      description: "text-[11.5px] font-medium text-white/70",
      icon: "w-8 h-8 flex items-center justify-center flex-shrink-0",
    }
  }
};

export default function AppToaster() {
  return <Toaster {...toasterProps} />;
}