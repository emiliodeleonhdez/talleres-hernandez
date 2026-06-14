import type { Metadata } from "next";
import { Archivo, Geist_Mono, Inter } from "next/font/google";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "@/components/ui/sonner";
import { MockDataProvider } from "@/lib/mock-data/store";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FiloGes — Talleres Hernández",
  description: "Sistema de gestión interna del taller de afilado",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${archivo.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full">
        <MockDataProvider>
          <AppLayout>{children}</AppLayout>
          <Toaster position="top-center" />
        </MockDataProvider>
      </body>
    </html>
  );
}
