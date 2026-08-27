import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Coffee Log",
  description: "Osobní deník ochutnávek kávy a kalkulačka espressa.",
};

const NAV = [
  { href: "/brew/new", label: "Připravit" },
  { href: "/beans", label: "Zrnka" },
  { href: "/settings", label: "Vybavení" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-stone-950 text-stone-100">
        <header className="border-b border-stone-800 bg-stone-900/80 backdrop-blur">
          <nav className="mx-auto flex max-w-2xl items-center gap-5 px-4 py-3">
            <Link href="/" className="font-semibold text-amber-500">
              Coffee Log
            </Link>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-stone-400 transition hover:text-stone-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
