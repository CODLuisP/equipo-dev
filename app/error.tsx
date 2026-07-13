"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6"
      style={{ background: "#141417", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div
        className="w-full max-w-[380px] rounded-2xl p-6 text-center"
        style={{ background: "#212529", border: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div
          className="mx-auto mb-4 w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <h1 className="text-white font-bold text-lg mb-1.5">Algo salió mal</h1>
        <p className="text-white/50 text-[13px] mb-6 leading-relaxed">
          Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={reset}
            className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-bold flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reintentar
          </button>
          <button
            onClick={() => { window.location.href = "/"; }}
            className="h-10 px-4 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[13px] font-bold transition-colors"
          >
            Ir al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
