"use client";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 22, className = "" }: SpinnerProps) {
  return (
    <>
      <style>{`
        @keyframes equipo-dev-spin { to { transform: rotate(360deg); } }
        .equipo-dev-spinner {
          animation: equipo-dev-spin 0.7s linear infinite;
          will-change: transform;
          transform-origin: center;
        }
      `}</style>
      <span
        className={`equipo-dev-spinner inline-block rounded-full ${className}`}
        style={{
          width: size,
          height: size,
          border: `${Math.max(2, size / 10)}px solid #212529`,
          borderTopColor: "#f1f5f9",
        }}
      />
    </>
  );
}

export function FullscreenLoader() {
  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-[999]"
      style={{ background: "#161b22" }}
    >
      <Spinner size={32} />
    </div>
  );
}

export function SectionLoader({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Spinner size={26} />
      {label && <span style={{ color: "rgba(148,163,184,0.6)", fontSize: 13 }}>{label}</span>}
    </div>
  );
}

export function CenteredLoader() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <Spinner size={28} />
    </div>
  );
}
