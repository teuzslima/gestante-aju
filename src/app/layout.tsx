import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gestante Aju — Acompanhamento pré-natal",
  description:
    "App de acompanhamento pré-natal para gestantes atendidas pela Prefeitura de Aracaju. Projeto vencedor do DemoDay (Unit).",
  manifest: "/manifest.webmanifest",
  applicationName: "Gestante Aju",
};

export const viewport: Viewport = {
  themeColor: "#d1577e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body>{children}</body>
    </html>
  );
}
