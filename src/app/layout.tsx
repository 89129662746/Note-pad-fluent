import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "NotepadFluent — Современный блокнот для Windows 11",
  description:
    "Лёгкий, быстрый и красивый блокнот для Windows 11 с вкладками, подсветкой синтаксиса для 10+ языков, тёмной темой и дизайном Fluent. Скачать бесплатно или купить Pro за 990 ₽.",
  keywords: [
    "блокнот", "Notepad", "Windows 11", "Fluent Design", "редактор кода",
    "подсветка синтаксиса", "вкладки", "C#", "WPF", "JSON", "Markdown",
  ],
  authors: [{ name: "NotepadFluent Software" }],
  openGraph: {
    title: "NotepadFluent — Современный блокнот для Windows 11",
    description:
      "Лёгкий, быстрый и красивый блокнот для Windows 11 с вкладками и подсветкой синтаксиса.",
    url: "https://notepadfluent.app",
    siteName: "NotepadFluent",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
