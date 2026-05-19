"use client";

// ─── Tab Button ───────────────────────────────────────────────────────────────

export default function TabBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${active ? 'bg-[#E85D2F] text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
      {icon}<span>{label}</span>
    </button>
  );
}
