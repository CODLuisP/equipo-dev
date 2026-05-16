import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equipo Dev · Velsat",
  description: "Panel de gestión interna del equipo de programadores",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body style={{ background: "#0A0C0F", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
