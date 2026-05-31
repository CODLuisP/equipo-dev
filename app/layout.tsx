import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Equipo Dev · Velsat",
  description: "Panel de gestión interna del equipo de programadores",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body style={{ background: "#05070E", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
