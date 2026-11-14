import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { BottomNav, TopNav } from "@/components/layout/NavLinks";
import { CupIcon } from "@/components/ui/icons";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Patkové písmo pro nadpisy — dává appce trochu charakteru kavárny,
// zatímco čísla a formuláře zůstávají v čitelném bezpatkovém Geistu.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Coffee Log",
  description: "Osobní deník ochutnávek kávy a kalkulačka espressa.",
  // Soukromý deník za PINem — vyhledávače tu nemají co indexovat.
  robots: { index: false, follow: false },
  appleWebApp: { capable: true, title: "Coffee Log", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: "#110e0c",
  // Obsah smí pod výřez a domovskou lištu iPhonu; odsazení si řeší
  // sama lišta přes safe-area-inset.
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="cs"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-[#14110f]/80 pt-[env(safe-area-inset-top)] backdrop-blur-lg">
          <nav className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2 text-amber-500">
              <CupIcon className="h-6 w-6" />
              <span className="font-display text-lg font-semibold tracking-tight">Coffee Log</span>
            </Link>
            <TopNav />
          </nav>
        </header>
        {/* Spodní odsazení na mobilu dělá místo pevné navigační liště. */}
        <main className="rise-in mx-auto w-full max-w-2xl flex-1 px-4 pt-6 pb-28 sm:pb-10">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
