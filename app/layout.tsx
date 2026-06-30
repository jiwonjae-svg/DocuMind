import type { Metadata } from "next";
import { getCurrentLocale } from "@/lib/i18n/server";
import "./globals.css";

export const metadata: Metadata = {
  title: "DocuMind",
  description:
    "Agent-ready internal knowledge search for Japanese and Korean teams.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getCurrentLocale();

  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
