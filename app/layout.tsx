import type { Metadata } from "next";
import "./globals.css";
import AppShell from "../components/layout/AppShell";

export const metadata: Metadata = {
  title: "Ukil - Legal Advice & Financial Solutions Platform",
  description: "Ask legal advice, anti-corruption guidance, and financial solutions without signing up. Verified lawyers & CPAs answer for public interest.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col gradient-bg antialiased text-stone-900">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
