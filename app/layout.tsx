import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist, Plus_Jakarta_Sans, JetBrains_Mono, Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

// Autohospedados vía next/font (en vez de @import a fonts.googleapis.com desde CSS):
// elimina las peticiones externas que bloqueaban el primer render en cada página.
const plusJakartaSans = Plus_Jakarta_Sans({ subsets:['latin'], weight:['300','400','500','600','700','800'], variable:'--font-plus-jakarta' });
const jetbrainsMono   = JetBrains_Mono({ subsets:['latin'], weight:['400','500'], variable:'--font-jetbrains-mono' });
const inter           = Inter({ subsets:['latin'], weight:['400','500','600','700'], variable:'--font-inter' });

export const metadata: Metadata = {
  title: "Codexa · Panel de equipo",
  description: "Gestión de tareas, snippets y colaboración para equipos de desarrollo",
};

export const viewport: Viewport = {
  themeColor: "#141417",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable, plusJakartaSans.variable, jetbrainsMono.variable, inter.variable)}>
      <body style={{ background: "#141417", minHeight: "100vh" }}>
        {children}
      </body>
    </html>
  );
}
