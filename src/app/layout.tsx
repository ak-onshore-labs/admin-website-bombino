import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bombino Admin Panel",
  description: "Internal admin panel for Bombino Express website management",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
