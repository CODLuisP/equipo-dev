"use client";

function pulseStyle(delay = 0): React.CSSProperties {
  return {
    background: "linear-gradient(90deg, #212529 0%, #2a2f35 50%, #212529 100%)",
    backgroundSize: "200% 100%",
    animation: `skeleton-pulse 1.4s ease-in-out ${delay}s infinite`,
    borderRadius: 14,
  };
}

function Keyframes() {
  return (
    <style>{`
      @keyframes skeleton-pulse {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
  );
}

/** Grid de tarjetas placeholder — usar mientras carga una sección con layout tipo grid (equipo, snippets, sitios, etc.) */
export function CardGridSkeleton({ count = 8, minWidth = 195, height = 160 }: { count?: number; minWidth?: number; height?: number }) {
  return (
    <div style={{ width: "100%", height: "100%", overflow: "hidden", padding: "0 2px 24px" }}>
      <Keyframes />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`, gap: 10 }}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ height, ...pulseStyle((i % 6) * 0.08) }} />
        ))}
      </div>
    </div>
  );
}

/** Filas placeholder — usar para listas (tareas, archivos) */
export function ListSkeleton({ count = 6, height = 56 }: { count?: number; height?: number }) {
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
      <Keyframes />
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ height, ...pulseStyle((i % 6) * 0.08) }} />
      ))}
    </div>
  );
}

/** Esqueleto de layout completo del dashboard (navbar + grid de cards) — usar durante la carga inicial en vez de tapar toda la pantalla. */
export function DashboardShellSkeleton() {
  return (
    <div
      className="flex flex-col h-screen overflow-hidden p-3 sm:p-4 lg:px-5.5 lg:py-2"
      style={{ background: "#161b22" }}
    >
      <Keyframes />
      {/* Navbar placeholder */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 4px", marginBottom: 14 }}>
        <div style={{ width: 36, height: 36, borderRadius: 10, ...pulseStyle(0) }} />
        <div style={{ width: 120, height: 16, ...pulseStyle(0.1) }} />
        <div style={{ flex: 1 }} />
        <div style={{ width: 90, height: 32, borderRadius: 8, ...pulseStyle(0.2) }} />
        <div style={{ width: 32, height: 32, borderRadius: "50%", ...pulseStyle(0.3) }} />
      </div>

      {/* Content grid placeholder */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <CardGridSkeleton count={10} />
      </div>
    </div>
  );
}
