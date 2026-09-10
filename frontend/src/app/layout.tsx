import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { RefreshLifecycleReset } from "@/components/RefreshLifecycleReset";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "InvisibleDogs Predict | IA para adopción responsable",
  description: "Tecnología, modelado multimodal y búsqueda visual para mejorar la visibilidad de perros con riesgo de larga estancia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} antialiased`}>
      <body>
        <RefreshLifecycleReset />
        {children}
      </body>
    </html>
  );
}
