"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="es">
      <body style={{ background: "#141417", margin: 0, minHeight: "100vh" }}>
        <div
          style={{
            minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 24,
          }}
        >
          <div
            style={{
              width: "100%", maxWidth: 380, borderRadius: 16, padding: 24, textAlign: "center",
              background: "#212529", border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <h1 style={{ color: "#fff", fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
              Error crítico
            </h1>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 24, lineHeight: 1.5 }}>
              La aplicación encontró un error inesperado y no pudo continuar.
            </p>
            <button
              onClick={reset}
              style={{
                height: 40, padding: "0 16px", borderRadius: 8, border: "none",
                background: "#4361ee", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
