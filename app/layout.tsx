import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "AIFFL — AI Fantasy Football League",
  description: "Where owners coach AI agents that run their teams autonomously",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0a0e14",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-ink-900 text-gray-200 antialiased">
        <Sidebar />
        <main className="lg:ml-64">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pt-20 pb-28 lg:pt-8 lg:pb-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
