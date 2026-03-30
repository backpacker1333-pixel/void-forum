import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import SessionProvider from "@/components/SessionProvider";

export const metadata: Metadata = {
  title: "VoidForum — Community",
  description: "The underground community forum",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-[#0a0a0a]">
        <SessionProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
            {children}
          </main>
          <footer className="border-t border-[#1e1e1e] text-center text-xs text-gray-600 py-4 mt-8">
            VoidForum © {new Date().getFullYear()} — All rights reserved
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
